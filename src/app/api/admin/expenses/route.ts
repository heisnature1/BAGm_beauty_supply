import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const expenses = db.prepare('SELECT * FROM expenses ORDER BY date DESC, created_at DESC').all();

    // Calculate revenue from paid orders
    const revRow = db.prepare(`
      SELECT SUM(total_amount) as total_revenue
      FROM orders
      WHERE payment_status = 'paid'
    `).get() as any;
    const totalRevenue = revRow?.total_revenue || 0;

    // Calculate COGS from paid orders items
    const cogsRow = db.prepare(`
      SELECT SUM(oi.cost_price * oi.quantity) as total_cogs
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.payment_status = 'paid'
    `).get() as any;
    const totalCogs = cogsRow?.total_cogs || 0;

    // Calculate sum of operating expenses
    const expRow = db.prepare('SELECT SUM(amount) as total_exp FROM expenses').get() as any;
    const totalExpenses = expRow?.total_exp || 0;

    const grossProfit = totalRevenue - totalCogs;
    const netProfit = grossProfit - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return NextResponse.json({
      success: true,
      expenses,
      summary: {
        totalRevenue,
        totalCogs,
        grossProfit,
        totalExpenses,
        netProfit,
        profitMargin,
      },
    });
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

    const { category, amount, description, date, payment_method } = await req.json();

    const db = getDb();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO expenses (id, category, amount, description, date, payment_method, recorded_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, category, Number(amount), description, date, payment_method || 'Mobile Money', user.id, now);

    recordAuditLog({
      userId: user.id,
      userEmail: user.email,
      action: 'expense_recorded',
      targetType: 'expense',
      targetId: id,
      details: { category, amount, description },
    });

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const db = getDb();
    db.prepare('DELETE FROM expenses WHERE id = ?').run(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
