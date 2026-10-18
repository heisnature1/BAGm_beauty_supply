import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyPaystackWebhookSignature } from '@/lib/paystack';
import { sendPaymentConfirmedEmail } from '@/lib/email';
import { recordAuditLog } from '@/lib/audit';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');

    // Verify cryptographic HMAC SHA512 signature
    if (!verifyPaystackWebhookSignature(rawBody, signature)) {
      console.warn('Paystack webhook signature verification failed.');
      return NextResponse.json({ success: false, error: 'Invalid webhook signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const data = payload.data;

    const db = getDb();

    if (event === 'charge.success') {
      const reference = data.reference;
      const amountInPesewas = data.amount;
      const expectedAmountGHS = amountInPesewas / 100;
      const currency = data.currency;

      // Find order by payment reference or metadata
      const orderId = data.metadata?.order_id;
      const order = orderId
        ? (db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any)
        : (db.prepare('SELECT * FROM orders WHERE payment_reference = ?').get(reference) as any);

      if (!order) {
        console.warn(`Order not found for Paystack reference: ${reference}`);
        return NextResponse.json({ success: true, message: 'Order not found, logged.' });
      }

      // Check for currency mismatch
      if (currency !== 'GHS') {
        console.warn(`Currency mismatch: expected GHS, got ${currency}`);
        return NextResponse.json({ success: true, message: 'Currency mismatch logged.' });
      }

      // Check if already paid to prevent duplicate processing
      if (order.payment_status === 'paid') {
        return NextResponse.json({ success: true, message: 'Payment already processed.' });
      }

      const now = new Date().toISOString();

      const payTx = db.transaction(() => {
        // Update Order
        db.prepare(`
          UPDATE orders SET
            payment_status = 'paid',
            order_status = CASE WHEN order_status = 'awaiting_payment' OR order_status = 'order_placed' THEN 'payment_confirmed' ELSE order_status END,
            payment_reference = ?,
            payment_channel = ?,
            updated_at = ?
          WHERE id = ?
        `).run(reference, data.channel || 'Mobile Money / Card', now, order.id);

        // Record or Update Payment Entry
        db.prepare(`
          INSERT INTO payments (id, order_id, reference, gateway, amount, currency, status, raw_response, verified_at, created_at)
          VALUES (?, ?, ?, 'paystack', ?, 'GHS', 'success', ?, ?, ?)
        `).run(
          crypto.randomUUID(),
          order.id,
          reference,
          expectedAmountGHS,
          JSON.stringify(data),
          now,
          now
        );
      });

      payTx();

      recordAuditLog({
        action: 'paystack_webhook_payment_success',
        targetType: 'order',
        targetId: order.id,
        details: { reference, amount: expectedAmountGHS, channel: data.channel },
      });

      // Send payment email
      sendPaymentConfirmedEmail({ ...order, payment_reference: reference }).catch(console.error);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Paystack webhook error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
