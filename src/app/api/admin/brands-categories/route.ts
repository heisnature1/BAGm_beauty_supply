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
    const type = searchParams.get('type');
    const body = await req.json();
    const db = getDb();

    if (type === 'category') {
      const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const id = crypto.randomUUID();
      db.prepare(`
        INSERT INTO categories (id, name, slug, description, image_url, sort_order, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 0, datetime('now'), datetime('now'))
      `).run(id, body.name, slug, body.description || null, body.image_url || null);

      recordAuditLog({
        userId: user.id,
        userEmail: user.email,
        action: 'category_created',
        targetType: 'category',
        targetId: id,
        details: { name: body.name },
      });

      return NextResponse.json({ success: true, id });
    }

    if (type === 'brand') {
      const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const id = crypto.randomUUID();
      db.prepare(`
        INSERT INTO brands (id, name, slug, origin, description, logo_url, website_url, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(
        id,
        body.name,
        slug,
        body.origin || 'Ghanaian',
        body.description || null,
        body.logo_url || null,
        body.website_url || null
      );

      recordAuditLog({
        userId: user.id,
        userEmail: user.email,
        action: 'brand_created',
        targetType: 'brand',
        targetId: id,
        details: { name: body.name, origin: body.origin },
      });

      return NextResponse.json({ success: true, id });
    }

    return NextResponse.json({ success: false, error: 'Invalid type parameter' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
