import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ user: null, orders: [], addresses: [], returns: [] });
    }

    const db = getDb();
    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(user.id) || [];
    const addresses = db.prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC').all(user.id) || [];
    const returns = db.prepare('SELECT * FROM returns WHERE user_id = ? ORDER BY created_at DESC').all(user.id) || [];

    // Attach items to orders
    const ordersWithItems = orders.map((order: any) => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id) || [];
      return {
        ...order,
        items,
      };
    });

    return NextResponse.json({
      user,
      orders: ordersWithItems,
      addresses,
      returns,
    });
  } catch (error) {
    return NextResponse.json({ user: null, orders: [], addresses: [], returns: [] });
  }
}
