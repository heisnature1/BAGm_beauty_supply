import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';
import { sendOrderDispatchedEmail } from '@/lib/email';
import crypto from 'crypto';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const order = db.prepare('SELECT * FROM orders WHERE id = ? OR order_number = ?').get(params.id, params.id) as any;
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        items,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized administrative access' }, { status: 401 });
    }

    const { order_status, courier_name, tracking_reference, admin_notes } = await req.json();

    const db = getDb();
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(params.id) as any;
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const oldStatus = order.order_status;

    // Handle atomic stock restoration if transitioning to cancelled
    if (order_status === 'cancelled' && oldStatus !== 'cancelled') {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id) as any[];
      const cancelTx = db.transaction(() => {
        for (const item of items) {
          const prod = db.prepare('SELECT stock_quantity, low_stock_threshold FROM products WHERE id = ?').get(item.product_id) as any;
          if (prod) {
            const beforeStock = prod.stock_quantity;
            const afterStock = beforeStock + item.quantity;
            const newStatus = afterStock <= 0 ? 'out_of_stock' : afterStock <= prod.low_stock_threshold ? 'low_stock' : 'in_stock';

            db.prepare('UPDATE products SET stock_quantity = ?, stock_status = ?, updated_at = ? WHERE id = ?').run(
              afterStock,
              newStatus,
              now,
              item.product_id
            );

            // Record movement
            db.prepare(`
              INSERT INTO stock_movements (id, product_id, variant_id, quantity_change, type, reference_id, reason, performed_by, stock_before, stock_after, created_at)
              VALUES (?, ?, ?, ?, 'cancellation_restock', ?, 'Order Cancellation Stock Restored', ?, ?, ?, ?)
            `).run(
              crypto.randomUUID(),
              item.product_id,
              item.variant_id || null,
              item.quantity,
              order.id,
              user.id,
              beforeStock,
              afterStock,
              now
            );
          }
        }
      });
      cancelTx();
    }

    db.prepare(`
      UPDATE orders SET
        order_status = ?, courier_name = ?, tracking_reference = ?, admin_notes = ?, updated_at = ?
      WHERE id = ?
    `).run(
      order_status,
      courier_name || null,
      tracking_reference || null,
      admin_notes || null,
      now,
      params.id
    );

    // If transitioned to dispatched, dispatch notification email
    if (order_status === 'dispatched' && oldStatus !== 'dispatched') {
      sendOrderDispatchedEmail(order, courier_name, tracking_reference).catch(console.error);
    }

    recordAuditLog({
      userId: user.id,
      userEmail: user.email,
      action: 'order_status_updated',
      targetType: 'order',
      targetId: params.id,
      details: {
        oldStatus,
        newStatus: order_status,
        courier_name,
        tracking_reference,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update order error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
