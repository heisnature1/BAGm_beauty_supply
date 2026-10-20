import { NextRequest, NextResponse } from 'next/server';
import { initializeMoolrePayment, getMoolreBaseUrl } from '@/lib/moolre';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, amount, email, phone, customerName, channel, network } = body;

    if (!orderId || !amount || !email) {
      return NextResponse.json({ success: false, error: 'Missing required payment parameters' }, { status: 400 });
    }

    const db = getDb();
    const order = db.prepare('SELECT * FROM orders WHERE id = ? OR order_number = ?').get(orderId, orderId) as any;
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const reference = order.payment_reference || `BAGM-MLR-${order.order_number}-${Date.now().toString(36).toUpperCase()}`;

    // Update payment reference on order
    db.prepare('UPDATE orders SET payment_reference = ?, updated_at = datetime(\'now\') WHERE id = ?').run(reference, order.id);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.headers.get('origin') || 'http://localhost:3000';
    const callbackUrl = `${baseUrl}/api/payments/moolre/verify?orderId=${encodeURIComponent(order.id)}&reference=${encodeURIComponent(reference)}`;

    const moolreResult = await initializeMoolrePayment({
      amount: Number(amount),
      currency: 'GHS',
      email,
      phone: phone || order.customer_phone,
      customerName: customerName || order.customer_name,
      reference,
      callback_url: callbackUrl,
      channel: channel || 'all',
      network: network || 'ALL',
      metadata: {
        orderId: order.id,
        orderNumber: order.order_number,
        customerName: order.customer_name,
      },
    });

    return NextResponse.json({
      success: true,
      authorization_url: moolreResult.data?.authorization_url,
      checkout_url: moolreResult.data?.checkout_url,
      reference,
      gateway: 'moolre',
      environment: getMoolreBaseUrl().includes('sandbox') ? 'sandbox' : 'live',
    });
  } catch (error: any) {
    console.error('Moolre initialize error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Payment initialization failed' }, { status: 500 });
  }
}
