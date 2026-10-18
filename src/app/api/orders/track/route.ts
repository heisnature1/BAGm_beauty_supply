import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ref = searchParams.get('ref');
    const contact = searchParams.get('contact');

    if (!ref || !contact) {
      return NextResponse.json({ success: false, error: 'Missing order reference or contact info' }, { status: 400 });
    }

    const cleanRef = ref.trim().toUpperCase();
    const cleanContact = contact.trim().toLowerCase();

    const db = getDb();
    const order = db.prepare(`
      SELECT * FROM orders
      WHERE UPPER(order_number) = ?
        AND (LOWER(customer_email) = ? OR customer_phone LIKE ?)
    `).get(cleanRef, cleanContact, `%${cleanContact}%`) as any;

    if (!order) {
      return NextResponse.json({ success: false, error: 'No matching order found for this reference and contact.' }, { status: 404 });
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id) as any[];

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
