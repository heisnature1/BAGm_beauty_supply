import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized administrative access' }, { status: 401 });
    }

    const db = getDb();
    const rows = db.prepare(`
      SELECT * FROM orders
      ORDER BY created_at DESC
    `).all();

    return NextResponse.json({ success: true, orders: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
