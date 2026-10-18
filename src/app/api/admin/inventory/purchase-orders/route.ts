import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { generatePONumber } from '@/lib/utils';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const rows = db.prepare(`
      SELECT po.*, s.name as supplier_name
      FROM purchase_orders po
      JOIN suppliers s ON po.supplier_id = s.id
      ORDER BY po.created_at DESC
    `).all();

    return NextResponse.json({ success: true, orders: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { supplier_id, items, total_cost, notes } = await req.json();

    const db = getDb();
    const id = crypto.randomUUID();
    const poNumber = generatePONumber();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO purchase_orders (id, po_number, supplier_id, status, total_cost, items, notes, created_at)
      VALUES (?, ?, ?, 'ordered', ?, ?, ?, ?)
    `).run(id, poNumber, supplier_id, Number(total_cost || 0), JSON.stringify(items || []), notes || null, now);

    return NextResponse.json({ success: true, id, poNumber });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
