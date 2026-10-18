import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const rows = db.prepare(`
      SELECT m.*, p.name as product_name, p.sku as product_sku
      FROM stock_movements m
      JOIN products p ON m.product_id = p.id
      ORDER BY m.created_at DESC
      LIMIT 100
    `).all();

    return NextResponse.json({ success: true, movements: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
