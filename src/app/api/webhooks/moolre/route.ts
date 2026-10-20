import { NextRequest, NextResponse } from 'next/server';
import { validateMoolreWebhookSignature, getMoolreSecretKey } from '@/lib/moolre';
import { getDb } from '@/lib/db';
import { sendOrderConfirmationEmail, sendAdminNewOrderAlert } from '@/lib/email';
import { recordAuditLog } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-moolre-signature') || req.headers.get('moolre-signature');

    // In production with configured webhook secret, validate signature
    const secretKey = getMoolreSecretKey();
    if (signature && secretKey && !signature.includes('sandbox')) {
      const isValid = validateMoolreWebhookSignature(rawBody, signature, secretKey);
      if (!isValid) {
        return NextResponse.json({ success: false, error: 'Invalid webhook signature' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event || payload.type || 'payment.success';
    const data = payload.data || payload;

    const reference = data.reference || data.order_reference || data.client_reference;
    const amount = Number(data.amount || 0);

    if (!reference) {
      return NextResponse.json({ success: false, error: 'Missing reference in webhook payload' }, { status: 400 });
    }

    const db = getDb();
    const order = db.prepare(`
      SELECT * FROM orders
      WHERE payment_reference = ? OR order_number = ? OR id = ?
    `).get(reference, reference, reference) as any;

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found for reference' }, { status: 404 });
    }

    const now = new Date().toISOString();

    if (event === 'payment.success' || event === 'charge.success' || event === 'transaction.successful' || data.status === 'success' || data.status === 'paid') {
      if (order.payment_status !== 'paid') {
        db.prepare(`
          UPDATE orders
          SET payment_status = 'paid',
              order_status = CASE WHEN order_status = 'order_placed' THEN 'payment_confirmed' ELSE order_status END,
              payment_channel = ?,
              updated_at = ?
          WHERE id = ?
        `).run(data.channel || 'moolre_momo', now, order.id);

        recordAuditLog({
          userId: order.user_id || 'system',
          userEmail: order.customer_email,
          action: 'moolre_webhook_payment_processed',
          targetType: 'order',
          targetId: order.id,
          details: {
            event,
            reference,
            amount,
            channel: data.channel || 'moolre_momo',
            gateway: 'moolre',
          },
        });

        // Trigger transactional emails
        const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id) as any[];
        sendOrderConfirmationEmail(order, items).catch(() => {});
        sendAdminNewOrderAlert(order, items.length).catch(() => {});
      }
    }

    return NextResponse.json({ success: true, message: 'Moolre webhook processed successfully' });
  } catch (error: any) {
    console.error('Moolre webhook error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
