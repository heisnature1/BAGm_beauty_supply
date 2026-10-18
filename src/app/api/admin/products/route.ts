import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { parseProductRow } from '@/lib/products';
import { recordAuditLog } from '@/lib/audit';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const db = getDb();
    if (id) {
      const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as any;
      if (!row) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, product: parseProductRow(row) });
    }

    const rows = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all() as any[];
    return NextResponse.json({ success: true, products: rows.map(parseProductRow) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized administrative access' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      sku,
      brand_id,
      category_id,
      price,
      cost_price,
      stock_quantity,
      low_stock_threshold,
      description,
      ingredients,
      benefits,
      directions_for_use,
      images,
      suitable_skin_types,
      relevant_concerns,
      is_published,
      is_featured,
      is_bestseller,
      is_new_arrival,
    } = body;

    if (!name || !sku || !brand_id || !category_id || isNaN(price)) {
      return NextResponse.json({ success: false, error: 'Missing required product fields' }, { status: 400 });
    }

    const db = getDb();
    const id = crypto.randomUUID();
    const slug = `${slugify(name)}-${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    const stockStatus = stock_quantity <= 0 ? 'out_of_stock' : stock_quantity <= (low_stock_threshold || 5) ? 'low_stock' : 'in_stock';

    db.prepare(`
      INSERT INTO products (
        id, sku, name, slug, brand_id, category_id, description, price, cost_price,
        images, ingredients, benefits, directions_for_use, suitable_skin_types, relevant_concerns,
        stock_quantity, low_stock_threshold, stock_status, is_published, is_featured, is_bestseller, is_new_arrival,
        created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?
      )
    `).run(
      id,
      sku.trim().toUpperCase(),
      name.trim(),
      slug,
      brand_id,
      category_id,
      description.trim(),
      Number(price),
      Number(cost_price || 0),
      JSON.stringify(images || []),
      ingredients ? ingredients.trim() : null,
      JSON.stringify(benefits || []),
      directions_for_use ? directions_for_use.trim() : null,
      JSON.stringify(suitable_skin_types || ['all']),
      JSON.stringify(relevant_concerns || []),
      parseInt(stock_quantity, 10) || 0,
      parseInt(low_stock_threshold, 10) || 5,
      stockStatus,
      is_published ?? 1,
      is_featured ?? 0,
      is_bestseller ?? 0,
      is_new_arrival ?? 1,
      now,
      now
    );

    // Initial stock movement record
    db.prepare(`
      INSERT INTO stock_movements (id, product_id, quantity_change, type, performed_by, stock_before, stock_after, reason, created_at)
      VALUES (?, ?, ?, 'restock', ?, 0, ?, 'Product Initial Setup', ?)
    `).run(crypto.randomUUID(), id, stock_quantity, user.id, stock_quantity, now);

    recordAuditLog({
      userId: user.id,
      userEmail: user.email,
      action: 'product_created',
      targetType: 'product',
      targetId: id,
      details: { name, sku, price, stock: stock_quantity },
    });

    return NextResponse.json({ success: true, id, slug });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized administrative access' }, { status: 401 });
    }

    const body = await req.json();
    const {
      id,
      name,
      sku,
      brand_id,
      category_id,
      price,
      cost_price,
      stock_quantity,
      low_stock_threshold,
      description,
      ingredients,
      benefits,
      directions_for_use,
      images,
      suitable_skin_types,
      relevant_concerns,
      is_published,
      is_featured,
      is_bestseller,
      is_new_arrival,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required for updates' }, { status: 400 });
    }

    const db = getDb();
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as any;
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const stockStatus = stock_quantity <= 0 ? 'out_of_stock' : stock_quantity <= (low_stock_threshold || 5) ? 'low_stock' : 'in_stock';

    db.prepare(`
      UPDATE products SET
        sku = ?, name = ?, brand_id = ?, category_id = ?, description = ?,
        price = ?, cost_price = ?, images = ?, ingredients = ?, benefits = ?,
        directions_for_use = ?, suitable_skin_types = ?, relevant_concerns = ?,
        stock_quantity = ?, low_stock_threshold = ?, stock_status = ?,
        is_published = ?, is_featured = ?, is_bestseller = ?, is_new_arrival = ?,
        updated_at = ?
      WHERE id = ?
    `).run(
      sku.trim().toUpperCase(),
      name.trim(),
      brand_id,
      category_id,
      description.trim(),
      Number(price),
      Number(cost_price || 0),
      JSON.stringify(images || []),
      ingredients ? ingredients.trim() : null,
      JSON.stringify(benefits || []),
      directions_for_use ? directions_for_use.trim() : null,
      JSON.stringify(suitable_skin_types || ['all']),
      JSON.stringify(relevant_concerns || []),
      parseInt(stock_quantity, 10) || 0,
      parseInt(low_stock_threshold, 10) || 5,
      stockStatus,
      is_published ?? 1,
      is_featured ?? 0,
      is_bestseller ?? 0,
      is_new_arrival ?? 0,
      now,
      id
    );

    // If stock changed, record adjustment
    if (existing.stock_quantity !== parseInt(stock_quantity, 10)) {
      const diff = parseInt(stock_quantity, 10) - existing.stock_quantity;
      db.prepare(`
        INSERT INTO stock_movements (id, product_id, quantity_change, type, performed_by, stock_before, stock_after, reason, created_at)
        VALUES (?, ?, ?, 'adjustment', ?, ?, ?, 'Admin Product Edit Adjustment', ?)
      `).run(crypto.randomUUID(), id, diff, user.id, existing.stock_quantity, stock_quantity, now);
    }

    recordAuditLog({
      userId: user.id,
      userEmail: user.email,
      action: 'product_updated',
      targetType: 'product',
      targetId: id,
      details: { name, price, stock: stock_quantity },
    });

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
