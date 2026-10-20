import { NextRequest, NextResponse } from 'next/server';
import { verifyMoolrePayment } from '@/lib/moolre';
import { getDb } from '@/lib/db';
import { sendOrderConfirmationEmail, sendAdminNewOrderAlert } from '@/lib/email';
import { recordAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get('reference') || searchParams.get('ref') || searchParams.get('order_id');
    const orderId = searchParams.get('orderId');

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.headers.get('origin') || '';

    if (!reference && !orderId) {
      return NextResponse.redirect(`${appUrl}/cart?payment_error=missing_reference`);
    }

    const db = getDb();
    const targetRef = reference || orderId || '';
    const order = (orderId
      ? db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId)
      : db.prepare('SELECT * FROM orders WHERE payment_reference = ? OR order_number = ? OR id = ?').get(targetRef, targetRef, targetRef)) as any;

    if (!order) {
      return NextResponse.redirect(`${appUrl}/cart?payment_error=order_not_found`);
    }

    // Verify payment with Moolre gateway
    const verifyResult = await verifyMoolrePayment(order.payment_reference || targetRef);

    if (verifyResult.status && verifyResult.data?.status === 'paid') {
      const now = new Date().toISOString();

      if (order.payment_status !== 'paid') {
        db.prepare(`
          UPDATE orders
          SET payment_status = 'paid',
              order_status = CASE WHEN order_status = 'order_placed' THEN 'payment_confirmed' ELSE order_status END,
              payment_channel = ?,
              updated_at = ?
          WHERE id = ?
        `).run(verifyResult.data.channel || 'moolre_momo', now, order.id);

        recordAuditLog({
          userId: order.user_id || 'system',
          userEmail: order.customer_email,
          action: 'moolre_payment_verified',
          targetType: 'order',
          targetId: order.id,
          details: {
            reference: verifyResult.data.reference,
            amount: verifyResult.data.amount,
            channel: verifyResult.data.channel,
            gateway: 'moolre',
          },
        });

        // Trigger transactional emails
        const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id) as any[];
        sendOrderConfirmationEmail(order, items).catch(() => {});
        sendAdminNewOrderAlert(order, items.length).catch(() => {});
      }

      return NextResponse.redirect(`${appUrl}/order-confirmation/${order.id}?payment=success&gateway=moolre`);
    }

    return NextResponse.redirect(`${appUrl}/order-confirmation/${order.id}?payment=pending&gateway=moolre`);
  } catch (error: any) {
    console.error('Moolre redirect verification error:', error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.headers.get('origin') || '';
    return NextResponse.redirect(`${appUrl}/cart?payment_error=verification_failed`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reference, orderId } = body;

    if (!reference && !orderId) {
      return NextResponse.json({ success: false, error: 'Reference or order ID required' }, { status: 400 });
    }

    const db = getDb();
    const targetRef = reference || orderId;
    const order = (orderId
      ? db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId)
      : db.prepare('SELECT * FROM orders WHERE payment_reference = ? OR order_number = ? OR id = ?').get(targetRef, targetRef, targetRef)) as any;

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const verifyResult = await verifyMoolrePayment(order.payment_reference || targetRef);

    if (verifyResult.status && verifyResult.data?.status === 'paid') {
      const now = new Date().toISOString();

      if (order.payment_status !== 'paid') {
        db.prepare(`
          UPDATE orders
          SET payment_status = 'paid',
              order_status = CASE WHEN order_status = 'order_placed' THEN 'payment_confirmed' ELSE order_status END,
              payment_channel = ?,
              updated_at = ?
          WHERE id = ?
        `).run(verifyResult.data.channel || 'moolre_momo', now, order.id);

        const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id) as any[];
        sendOrderConfirmationEmail(order, items).catch(() => {});
        sendAdminNewOrderAlert(order, items.length).catch(() => {});
      }

      return NextResponse.json({
        success: true,
        orderId: order.id,
        orderNumber: order.order_number,
        paymentStatus: 'paid',
        paymentMethod: 'moolre',
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Payment could not be verified by Moolre gateway',
      data: verifyResult.data,
    });
  } catch (error: any) {
    console.error('Moolre POST verify error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
