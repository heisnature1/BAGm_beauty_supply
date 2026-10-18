import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyPaystackPayment } from '@/lib/paystack';
import { sendPaymentConfirmedEmail } from '@/lib/email';
import { recordAuditLog } from '@/lib/audit';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get('reference');
    const orderId = searchParams.get('orderId');

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (!reference) {
      return NextResponse.redirect(`${appUrl}/shop`);
    }

    const db = getDb();
    const order = orderId
      ? (db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any)
      : (db.prepare('SELECT * FROM orders WHERE payment_reference = ?').get(reference) as any);

    if (!order) {
      return NextResponse.redirect(`${appUrl}/shop`);
    }

    // Call Paystack verify API on server
    const verifyRes = await verifyPaystackPayment(reference);

    if (verifyRes.status && verifyRes.data?.status === 'success') {
      const data = verifyRes.data;
      const now = new Date().toISOString();

      if (order.payment_status !== 'paid') {
        const payTx = db.transaction(() => {
          db.prepare(`
            UPDATE orders SET
              payment_status = 'paid',
              order_status = CASE WHEN order_status = 'awaiting_payment' OR order_status = 'order_placed' THEN 'payment_confirmed' ELSE order_status END,
              payment_reference = ?,
              payment_channel = ?,
              updated_at = ?
            WHERE id = ?
          `).run(reference, data.channel || 'Paystack', now, order.id);

          db.prepare(`
            INSERT INTO payments (id, order_id, reference, gateway, amount, currency, status, raw_response, verified_at, created_at)
            VALUES (?, ?, ?, 'paystack', ?, 'GHS', 'success', ?, ?, ?)
          `).run(
            crypto.randomUUID(),
            order.id,
            reference,
            data.amount / 100,
            JSON.stringify(data),
            now,
            now
          );
        });

        payTx();

        recordAuditLog({
          action: 'paystack_server_verified_success',
          targetType: 'order',
          targetId: order.id,
          details: { reference, channel: data.channel },
        });

        sendPaymentConfirmedEmail({ ...order, payment_reference: reference }).catch(console.error);
      }
    }

    return NextResponse.redirect(`${appUrl}/order-confirmation/${order.id}`);
  } catch (error: any) {
    console.error('Paystack verify callback error:', error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${appUrl}/shop`);
  }
}
