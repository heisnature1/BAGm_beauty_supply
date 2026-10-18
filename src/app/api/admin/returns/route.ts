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
    const rows = db.prepare(`
      SELECT r.*,
             o.order_number, o.customer_name, o.customer_email,
             oi.product_name
      FROM returns r
      JOIN orders o ON r.order_id = o.id
      JOIN order_items oi ON r.order_item_id = oi.id
      ORDER BY r.created_at DESC
    `).all();

    return NextResponse.json({ success: true, returns: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id, status, inspection_notes, is_resellable, refund_amount, refund_method, refund_reference } = await req.json();

    const db = getDb();
    const ret = db.prepare('SELECT * FROM returns WHERE id = ?').get(id) as any;
    if (!ret) {
      return NextResponse.json({ success: false, error: 'Return request not found' }, { status: 404 });
    }

    const now = new Date().toISOString();

    const returnTx = db.transaction(() => {
      // If marked resellable and not previously restocked
      if (is_resellable && ret.is_resellable !== 1) {
        const item = db.prepare('SELECT product_id, quantity FROM order_items WHERE id = ?').get(ret.order_item_id) as any;
        if (item) {
          const prod = db.prepare('SELECT stock_quantity, low_stock_threshold FROM products WHERE id = ?').get(item.product_id) as any;
          if (prod) {
            const beforeStock = prod.stock_quantity;
            const afterStock = beforeStock + ret.quantity;
            const newStatus = afterStock <= 0 ? 'out_of_stock' : afterStock <= prod.low_stock_threshold ? 'low_stock' : 'in_stock';

            db.prepare('UPDATE products SET stock_quantity = ?, stock_status = ?, updated_at = ? WHERE id = ?').run(
              afterStock,
              newStatus,
              now,
              item.product_id
            );

            // Record movement
            db.prepare(`
              INSERT INTO stock_movements (id, product_id, quantity_change, type, reference_id, reason, performed_by, stock_before, stock_after, created_at)
              VALUES (?, ?, ?, 'return_restock', ?, 'Approved Resellable Return Restock', ?, ?, ?, ?)
            `).run(
              crypto.randomUUID(),
              item.product_id,
              ret.quantity,
              ret.id,
              user.id,
              beforeStock,
              afterStock,
              now
            );
          }
        }
      }

      db.prepare(`
        UPDATE returns SET
          status = ?, inspection_notes = ?, is_resellable = ?,
          refund_amount = ?, refund_method = ?, refund_reference = ?, updated_at = ?
        WHERE id = ?
      `).run(
        status,
        inspection_notes || null,
        is_resellable ? 1 : 0,
        Number(refund_amount || 0),
        refund_method || null,
        refund_reference || null,
        now,
        id
      );
    });

    returnTx();

    recordAuditLog({
      userId: user.id,
      userEmail: user.email,
      action: 'return_request_updated',
      targetType: 'return',
      targetId: id,
      details: {
        returnNumber: ret.return_number,
        status,
        refundAmount: refund_amount,
        isResellable: is_resellable,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update return error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
