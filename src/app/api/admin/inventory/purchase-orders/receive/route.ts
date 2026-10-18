import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'PO ID required' }, { status: 400 });
    }

    const db = getDb();
    const po = db.prepare('SELECT * FROM purchase_orders WHERE id = ?').get(id) as any;
    if (!po) {
      return NextResponse.json({ success: false, error: 'PO not found' }, { status: 404 });
    }

    if (po.status === 'received') {
      return NextResponse.json({ success: false, error: 'PO already received' }, { status: 400 });
    }

    const now = new Date().toISOString();
    let itemsList: any[] = [];
    try {
      itemsList = typeof po.items === 'string' ? JSON.parse(po.items) : po.items;
    } catch {}

    const receiveTx = db.transaction(() => {
      // 1. Update PO status
      db.prepare("UPDATE purchase_orders SET status = 'received', received_date = ? WHERE id = ?").run(now, id);

      // 2. Increment stock for every item
      for (const item of itemsList) {
        const product = db.prepare('SELECT stock_quantity, low_stock_threshold, name FROM products WHERE id = ?').get(item.product_id) as any;
        if (product) {
          const beforeStock = product.stock_quantity;
          const afterStock = beforeStock + parseInt(item.quantity, 10);
          const newStatus = afterStock <= 0 ? 'out_of_stock' : afterStock <= product.low_stock_threshold ? 'low_stock' : 'in_stock';

          db.prepare('UPDATE products SET stock_quantity = ?, stock_status = ?, updated_at = ? WHERE id = ?').run(
            afterStock,
            newStatus,
            now,
            item.product_id
          );

          // Stock movement audit
          db.prepare(`
            INSERT INTO stock_movements (id, product_id, quantity_change, type, reference_id, reason, performed_by, stock_before, stock_after, created_at)
            VALUES (?, ?, ?, 'restock', ?, ?, ?, ?, ?, ?)
          `).run(
            crypto.randomUUID(),
            item.product_id,
            item.quantity,
            id,
            `Received Supplier PO #${po.po_number}`,
            user.id,
            beforeStock,
            afterStock,
            now
          );
        }
      }
    });

    receiveTx();

    recordAuditLog({
      userId: user.id,
      userEmail: user.email,
      action: 'purchase_order_received',
      targetType: 'purchase_order',
      targetId: id,
      details: { poNumber: po.po_number, totalCost: po.total_cost },
    });

    return NextResponse.json({ success: true, message: 'PO marked received and inventory restocked.' });
  } catch (error: any) {
    console.error('PO receive error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
