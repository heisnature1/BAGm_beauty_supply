import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';
import { sendPaymentConfirmedEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized administrative access' }, { status: 401 });
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const db = getDb();
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any;
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const paymentRef = `MANUAL_CONFIRM_${Date.now()}`;

    const updateTx = db.transaction(() => {
      // Update order status
      db.prepare(`
        UPDATE orders SET
          payment_status = 'paid',
          order_status = CASE WHEN order_status = 'awaiting_payment' OR order_status = 'order_placed' THEN 'payment_confirmed' ELSE order_status END,
          payment_reference = COALESCE(payment_reference, ?),
          updated_at = ?
        WHERE id = ?
      `).run(paymentRef, now, orderId);

      // Insert or update payment record
      db.prepare(`
        INSERT INTO payments (id, order_id, reference, gateway, amount, currency, status, raw_response, verified_at, created_at)
        VALUES (?, ?, ?, ?, ?, 'GHS', 'success', ?, ?, ?)
      `).run(
        crypto.randomUUID(),
        orderId,
        paymentRef,
        order.payment_method === 'bank_transfer' ? 'manual_bank' : 'cash_on_delivery',
        order.total_amount,
        JSON.stringify({ confirmedBy: user.email, confirmedAt: now }),
        now,
        now
      );
    });

    updateTx();

    recordAuditLog({
      userId: user.id,
      userEmail: user.email,
      action: 'manual_payment_confirmed',
      targetType: 'order',
      targetId: orderId,
      details: {
        orderNumber: order.order_number,
        amount: order.total_amount,
        paymentMethod: order.payment_method,
      },
    });

    // Send Payment Confirmation Email
    sendPaymentConfirmedEmail({ ...order, payment_reference: paymentRef }).catch(console.error);

    return NextResponse.json({ success: true, message: 'Payment confirmed successfully.' });
  } catch (error: any) {
    console.error('Manual payment confirmation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
