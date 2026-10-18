import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare(`
      SELECT p.sku, p.name, b.name as brand, c.name as category,
             p.price, p.cost_price, p.stock_quantity, p.stock_status,
             p.is_published, p.created_at
      FROM products p
      JOIN brands b ON p.brand_id = b.id
      JOIN categories c ON p.category_id = c.id
      ORDER BY p.name ASC
    `).all() as any[];

    const headers = ['SKU', 'Product Name', 'Brand', 'Category', 'Price (GHS)', 'Cost (GHS)', 'Stock Quantity', 'Stock Status', 'Is Published', 'Created At'];
    
    const csvRows = [headers.join(',')];

    for (const r of rows) {
      const escapedName = `"${(r.name || '').replace(/"/g, '""')}"`;
      const rowData = [
        r.sku,
        escapedName,
        `"${r.brand}"`,
        `"${r.category}"`,
        r.price,
        r.cost_price,
        r.stock_quantity,
        r.stock_status,
        r.is_published,
        r.created_at,
      ];
      csvRows.push(rowData.join(','));
    }

    const csvContent = csvRows.join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="bagm_beauty_products_${Date.now()}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
