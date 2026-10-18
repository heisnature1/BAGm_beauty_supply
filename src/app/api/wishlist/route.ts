import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ items: [] });
    }

    const db = getDb();
    const items = db.prepare('SELECT * FROM wishlist WHERE user_id = ?').all(user.id);
    return NextResponse.json({ items: items || [] });
  } catch (error) {
    return NextResponse.json({ items: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { productId } = body;
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const db = getDb();
    db.prepare('INSERT INTO wishlist (id, user_id, product_id, created_at) VALUES (?, ?, ?, ?)').run(
      randomUUID(),
      user.id,
      productId,
      new Date().toISOString()
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let productId = req.nextUrl.searchParams.get('productId');
    if (!productId) {
      try {
        const body = await req.json();
        productId = body?.productId;
      } catch {}
    }

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const db = getDb();
    db.prepare('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?').run(user.id, productId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  }
}
