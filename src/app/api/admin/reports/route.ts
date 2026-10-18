import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'sales';
    const db = getDb();

    let csv = '';

    if (type === 'sales') {
      const orders = db.prepare(`
        SELECT order_number, created_at, customer_name, customer_email, customer_phone,
               payment_method, payment_status, fulfilment_type, subtotal, delivery_fee, total_amount, order_status
        FROM orders
        ORDER BY created_at DESC
      `).all() as any[];

      csv = 'Order Number,Date,Customer Name,Customer Email,Customer Phone,Payment Method,Payment Status,Fulfilment Type,Subtotal (GHS),Delivery Fee (GHS),Total Amount (GHS),Order Status\n';
      csv += orders
        .map((o) =>
          `"${o.order_number}","${o.created_at}","${o.customer_name}","${o.customer_email}","${o.customer_phone || ''}","${o.payment_method}","${o.payment_status}","${o.fulfilment_type}",${o.subtotal},${o.delivery_fee},${o.total_amount},"${o.order_status}"`
        )
        .join('\n');
    } else if (type === 'inventory_valuation') {
      const products = db.prepare(`
        SELECT p.sku, p.name, c.name as category, b.name as brand,
               p.stock_quantity, p.cost_price, p.price,
               (p.stock_quantity * p.cost_price) as total_cost_value,
               (p.stock_quantity * p.price) as total_retail_value
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        ORDER BY p.name ASC
      `).all() as any[];

      csv = 'SKU,Product Name,Category,Brand,Stock Quantity,Unit Cost (GHS),Unit Retail Price (GHS),Total Inventory Cost (GHS),Total Potential Retail (GHS)\n';
      csv += products
        .map((p) =>
          `"${p.sku}","${p.name}","${p.category || ''}","${p.brand || ''}",${p.stock_quantity},${p.cost_price},${p.price},${p.total_cost_value},${p.total_retail_value}`
        )
        .join('\n');
    } else if (type === 'stock_movements') {
      const movements = db.prepare(`
        SELECT sm.created_at, p.sku, p.name as product_name, sm.quantity_change,
               sm.type, sm.stock_before, sm.stock_after, sm.reason, u.email as performed_by
        FROM stock_movements sm
        JOIN products p ON sm.product_id = p.id
        LEFT JOIN users u ON sm.performed_by = u.id
        ORDER BY sm.created_at DESC
      `).all() as any[];

      csv = 'Date,SKU,Product Name,Quantity Change,Movement Type,Stock Before,Stock After,Reason,Performed By\n';
      csv += movements
        .map((m) =>
          `"${m.created_at}","${m.sku}","${m.product_name}",${m.quantity_change},"${m.type}",${m.stock_before},${m.stock_after},"${m.reason || ''}","${m.performed_by || 'System'}"`
        )
        .join('\n');
    } else if (type === 'customers') {
      const customers = db.prepare(`
        SELECT u.first_name, u.last_name, u.email, u.phone, u.created_at,
               COUNT(o.id) as order_count,
               COALESCE(SUM(CASE WHEN o.payment_status = 'paid' THEN o.total_amount ELSE 0 END), 0) as total_spend
        FROM users u
        LEFT JOIN orders o ON o.user_id = u.id
        GROUP BY u.id
        ORDER BY total_spend DESC
      `).all() as any[];

      csv = 'First Name,Last Name,Email,Phone,Joined Date,Order Count,Lifetime Spend (GHS)\n';
      csv += customers
        .map((c) =>
          `"${c.first_name}","${c.last_name}","${c.email}","${c.phone || ''}","${c.created_at}",${c.order_count},${c.total_spend}`
        )
        .join('\n');
    } else if (type === 'expenses') {
      const expenses = db.prepare(`
        SELECT date, category, description, amount, payment_method, created_at
        FROM expenses
        ORDER BY date DESC
      `).all() as any[];

      csv = 'Date,Category,Description,Amount (GHS),Payment Method,Recorded At\n';
      csv += expenses
        .map((e) =>
          `"${e.date}","${e.category}","${e.description}",${e.amount},"${e.payment_method}","${e.created_at}"`
        )
        .join('\n');
    }

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="bagm_${type}_report.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
