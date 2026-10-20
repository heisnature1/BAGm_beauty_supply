import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { generateOrderNumber } from '@/lib/utils';
import { initializeMoolrePayment, getMoolreBaseUrl } from '@/lib/moolre';
import { initializePaystackPayment, getPaystackSecretKey } from '@/lib/paystack';
import { sendOrderConfirmationEmail, sendAdminNewOrderAlert, sendLowStockAlert } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      items,
      fulfilmentType,
      customerName,
      customerEmail,
      customerPhone,
      deliveryZoneId,
      deliveryAddress,
      pickupLocationId,
      paymentMethod,
      customerNotes,
      momoNetwork,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Shopping bag is empty' }, { status: 400 });
    }

    if (!customerName || !customerEmail || !customerPhone) {
      return NextResponse.json({ success: false, error: 'Missing required customer contact details' }, { status: 400 });
    }

    const db = getDb();
    const sessionUser = getUserFromRequest(req);
    const userId = sessionUser ? sessionUser.id : null;
    const isGuest = sessionUser ? 0 : 1;

    // Execute atomic transaction for inventory & order creation
    const orderId = crypto.randomUUID();
    const orderNumber = generateOrderNumber();
    const guestAccessToken = crypto.randomBytes(24).toString('hex');
    const now = new Date().toISOString();

    let calculatedSubtotal = 0;
    let deliveryFee = 0;
    const validatedItems: any[] = [];
    const lowStockAlerts: any[] = [];

    const checkoutTransaction = db.transaction(() => {
      // 1. Calculate Delivery Fee
      if (fulfilmentType === 'delivery') {
        if (!deliveryZoneId) {
          throw new Error('Please select a delivery zone for home delivery.');
        }
        const zone = db.prepare('SELECT fee FROM delivery_zones WHERE id = ? AND is_active = 1').get(deliveryZoneId) as any;
        if (!zone) {
          throw new Error('Selected delivery zone is invalid or inactive.');
        }
        deliveryFee = Number(zone.fee);
      } else {
        if (!pickupLocationId) {
          throw new Error('Please select a store pickup location.');
        }
        deliveryFee = 0;
      }

      // 2. Validate products and stock
      for (const item of items) {
        const product = db.prepare('SELECT * FROM products WHERE id = ? AND is_published = 1').get(item.productId) as any;
        if (!product) {
          throw new Error(`Product "${item.name}" is no longer available.`);
        }

        let variant: any = null;
        let unitPrice = Number(product.price);
        let costPrice = Number(product.cost_price || 0);
        let availableStock = Number(product.stock_quantity);
        let sku = product.sku;

        if (item.variantId) {
          variant = db.prepare('SELECT * FROM product_variants WHERE id = ? AND product_id = ?').get(item.variantId, product.id) as any;
          if (variant) {
            unitPrice = Number(variant.price);
            costPrice = Number(variant.cost_price || costPrice);
            availableStock = Number(variant.stock_quantity);
            sku = variant.sku;
          }
        }

        const quantity = parseInt(item.quantity, 10);
        if (isNaN(quantity) || quantity <= 0) {
          throw new Error('Invalid item quantity.');
        }

        if (availableStock < quantity) {
          throw new Error(`Insufficient stock for "${product.name}". Only ${availableStock} units remaining.`);
        }

        const itemTotal = unitPrice * quantity;
        calculatedSubtotal += itemTotal;

        let itemImage = item.image;
        if (!itemImage) {
          if (Array.isArray(product.images)) {
            itemImage = product.images[0];
          } else if (typeof product.images === 'string') {
            try {
              itemImage = JSON.parse(product.images)[0];
            } catch {
              itemImage = product.images;
            }
          }
        }

        validatedItems.push({
          itemId: crypto.randomUUID(),
          productId: product.id,
          variantId: variant ? variant.id : null,
          productName: product.name,
          variantName: variant ? variant.name : null,
          sku,
          unitPrice,
          costPrice,
          quantity,
          totalPrice: itemTotal,
          image: itemImage,
        });

        // Atomic Stock Deduction
        const newStock = availableStock - quantity;
        const newStockStatus = newStock <= 0 ? 'out_of_stock' : newStock <= product.low_stock_threshold ? 'low_stock' : 'in_stock';

        if (variant) {
          db.prepare('UPDATE product_variants SET stock_quantity = ? WHERE id = ?').run(newStock, variant.id);
        } else {
          db.prepare(`
            UPDATE products
            SET stock_quantity = ?, stock_status = ?, updated_at = ?
            WHERE id = ?
          `).run(newStock, newStockStatus, now, product.id);
        }

        // Record stock movement
        db.prepare(`
          INSERT INTO stock_movements (
            id, product_id, variant_id, quantity_change, type, reference_id, reason, performed_by, stock_before, stock_after, created_at
          ) VALUES (?, ?, ?, ?, 'sale', ?, 'Order Placed', ?, ?, ?, ?)
        `).run(
          crypto.randomUUID(),
          product.id,
          variant ? variant.id : null,
          -quantity,
          orderId,
          userId || 'guest_checkout',
          availableStock,
          newStock,
          now
        );

        if (newStock <= product.low_stock_threshold) {
          lowStockAlerts.push({ name: product.name, sku, stock: newStock });
        }
      }

      const totalAmount = calculatedSubtotal + deliveryFee;

      // 3. Insert Master Order Record
      const insertOrderStmt = db.prepare(`
        INSERT INTO orders (
          id, order_number, user_id, customer_name, customer_email, customer_phone,
          fulfilment_type, delivery_zone_id, delivery_address, pickup_location_id,
          subtotal, delivery_fee, total_amount, currency, payment_method, payment_status,
          order_status, customer_notes, is_guest, guest_access_token, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, 'GHS', ?, 'pending',
          'order_placed', ?, ?, ?, ?, ?
        )
      `);

      insertOrderStmt.run(
        orderId,
        orderNumber,
        userId,
        customerName.trim(),
        customerEmail.trim().toLowerCase(),
        customerPhone.trim(),
        fulfilmentType,
        fulfilmentType === 'delivery' ? deliveryZoneId : null,
        fulfilmentType === 'delivery' ? JSON.stringify(deliveryAddress) : null,
        fulfilmentType === 'pickup' ? pickupLocationId : null,
        calculatedSubtotal,
        deliveryFee,
        totalAmount,
        paymentMethod,
        customerNotes ? customerNotes.trim() : null,
        isGuest,
        guestAccessToken,
        now,
        now
      );

      // 4. Insert Order Items
      const insertItemStmt = db.prepare(`
        INSERT INTO order_items (
          id, order_id, product_id, variant_id, product_name, variant_name,
          sku, unit_price, cost_price, quantity, total_price, image_url, created_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?
        )
      `);

      for (const item of validatedItems) {
        insertItemStmt.run(
          item.itemId,
          orderId,
          item.productId,
          item.variantId,
          item.productName,
          item.variantName,
          item.sku,
          item.unitPrice,
          item.costPrice,
          item.quantity,
          item.totalPrice,
          item.image,
          now
        );
      }
    });

    // Run transaction
    checkoutTransaction();

    const orderRow = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.headers.get('origin') || 'http://localhost:3000';

    let authorizationUrl: string | null = null;
    let paymentGateway = 'moolre';

    // 1. Process Moolre Payment (Default primary payment gateway)
    if (
      paymentMethod === 'moolre_momo' ||
      paymentMethod === 'moolre_card' ||
      paymentMethod === 'moolre_bank' ||
      paymentMethod === 'paystack_momo' ||
      paymentMethod === 'paystack_card'
    ) {
      const reference = `BAGM-${orderNumber}-${Date.now().toString(36).toUpperCase()}`;
      const callbackUrl = `${appUrl}/api/payments/moolre/verify?orderId=${encodeURIComponent(orderId)}&reference=${encodeURIComponent(reference)}`;

      const moolreChannel =
        paymentMethod.includes('card')
          ? 'card'
          : paymentMethod.includes('bank')
          ? 'bank'
          : 'momo';

      const moolreRes = await initializeMoolrePayment({
        amount: orderRow.total_amount,
        currency: 'GHS',
        email: customerEmail,
        phone: customerPhone,
        customerName,
        reference,
        callback_url: callbackUrl,
        channel: moolreChannel,
        network: momoNetwork || 'ALL',
        metadata: {
          orderId,
          orderNumber,
          customerName,
          customerPhone,
        },
      });

      if (moolreRes.status && moolreRes.data?.authorization_url) {
        authorizationUrl = moolreRes.data.authorization_url;
        db.prepare('UPDATE orders SET payment_reference = ? WHERE id = ?').run(reference, orderId);
      }
    }

    // Trigger Transactional Emails (asynchronously)
    try {
      sendOrderConfirmationEmail(orderRow, validatedItems).catch(console.error);
      sendAdminNewOrderAlert(orderRow, validatedItems.length).catch(console.error);
      lowStockAlerts.forEach((l) => sendLowStockAlert(l.name, l.sku, l.stock).catch(console.error));
    } catch (e) {
      console.error('Email notification trigger error:', e);
    }

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
      authorization_url: authorizationUrl,
      gateway: paymentGateway,
      guestAccessToken,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Checkout failed due to server error' },
      { status: 400 }
    );
  }
}
