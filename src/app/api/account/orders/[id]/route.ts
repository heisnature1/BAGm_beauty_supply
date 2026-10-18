import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    const orderId = params.id;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const db = getDb();
    const order = db.prepare('SELECT * FROM orders WHERE id = ? OR order_number = ?').get(orderId, orderId) as any;

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check authorization: if logged in user is neither admin nor the owner, and not matching email
    if (user && user.role !== 'admin' && order.user_id && order.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id) || [];
    const returns = db.prepare('SELECT * FROM returns WHERE order_id = ?').all(order.id) || [];

    return NextResponse.json({
      order: {
        ...order,
        items,
        returns,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch order details' }, { status: 500 });
  }
}
