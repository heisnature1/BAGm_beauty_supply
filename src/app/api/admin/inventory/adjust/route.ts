import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized administrative access' }, { status: 401 });
    }

    const { productId, quantityChange, type, reason } = await req.json();

    if (!productId || isNaN(quantityChange)) {
      return NextResponse.json({ success: false, error: 'Product ID and valid quantity change required' }, { status: 400 });
    }

    const db = getDb();
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId) as any;
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const beforeStock = product.stock_quantity;
    const afterStock = Math.max(0, beforeStock + parseInt(quantityChange, 10));
    const now = new Date().toISOString();
    const newStatus = afterStock <= 0 ? 'out_of_stock' : afterStock <= product.low_stock_threshold ? 'low_stock' : 'in_stock';

    // Update Product Stock
    db.prepare(`
      UPDATE products
      SET stock_quantity = ?, stock_status = ?, updated_at = ?
      WHERE id = ?
    `).run(afterStock, newStatus, now, productId);

    // Record Stock Movement
    const movementId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO stock_movements (id, product_id, quantity_change, type, performed_by, stock_before, stock_after, reason, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      movementId,
      productId,
      quantityChange,
      type || 'adjustment',
      user.id,
      beforeStock,
      afterStock,
      reason || 'Admin Manual Adjustment',
      now
    );

    recordAuditLog({
      userId: user.id,
      userEmail: user.email,
      action: 'stock_adjusted',
      targetType: 'inventory',
      targetId: productId,
      details: {
        productName: product.name,
        beforeStock,
        afterStock,
        quantityChange,
        reason,
      },
    });

    return NextResponse.json({
      success: true,
      productId,
      stock_quantity: afterStock,
      stock_status: newStatus,
    });
  } catch (error: any) {
    console.error('Inventory adjust error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
