import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const productId = req.nextUrl.searchParams.get('productId');
    const db = getDb();

    let reviews;
    if (productId) {
      reviews = db.prepare('SELECT * FROM reviews WHERE product_id = ? AND status = ? ORDER BY created_at DESC').all(productId, 'approved');
    } else {
      reviews = db.prepare('SELECT * FROM reviews ORDER BY created_at DESC').all();
    }

    return NextResponse.json({ reviews });
  } catch (error) {
    return NextResponse.json({ reviews: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'You must be signed in to submit a product review.' }, { status: 401 });
    }

    const body = await req.json();
    const { productId, rating, title, comment, skinType, skinConcern } = body;

    if (!productId || !rating || !comment) {
      return NextResponse.json({ success: false, error: 'Product, rating, and feedback are required.' }, { status: 400 });
    }

    const db = getDb();
    const reviewId = randomUUID();
    const now = new Date().toISOString();

    const reviewRecord = {
      id: reviewId,
      product_id: productId,
      user_id: user.id,
      user_name: `${user.first_name} ${user.last_name[0]}.`,
      order_id: null,
      rating: Math.max(1, Math.min(5, Number(rating) || 5)),
      title: title ? title.trim() : 'Verified Review',
      comment: comment.trim(),
      skin_type: skinType || null,
      skin_concern: skinConcern || null,
      is_verified_purchase: 1,
      status: 'approved',
      created_at: now,
    };

    db.prepare(`
      INSERT INTO reviews (id, product_id, user_id, order_id, rating, title, comment, skin_type, skin_concern, is_verified_purchase, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      reviewRecord.id,
      reviewRecord.product_id,
      reviewRecord.user_id,
      reviewRecord.order_id,
      reviewRecord.rating,
      reviewRecord.title,
      reviewRecord.comment,
      reviewRecord.skin_type,
      reviewRecord.skin_concern,
      reviewRecord.is_verified_purchase,
      reviewRecord.status,
      reviewRecord.created_at
    );

    return NextResponse.json({
      success: true,
      review: reviewRecord,
      message: 'Thank you! Your verified review has been submitted.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to submit review. Please try again.' }, { status: 500 });
  }
}
