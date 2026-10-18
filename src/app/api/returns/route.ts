import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    const body = await req.json();
    const { orderId, orderItemId, quantity, reason, explanation } = body;

    if (!orderId || !reason) {
      return NextResponse.json({ success: false, error: 'Order ID and return reason are required.' }, { status: 400 });
    }

    const db = getDb();
    const returnId = randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO returns (id, order_id, user_id, order_item_id, quantity, reason, explanation, status, refund_amount, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      returnId,
      orderId,
      user?.id || null,
      orderItemId || null,
      Number(quantity) || 1,
      reason,
      explanation ? explanation.trim() : '',
      'pending_review',
      0,
      now,
      now
    );

    return NextResponse.json({
      success: true,
      message: 'Return request submitted successfully. Our beauty support team will review within 24 hours.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to submit return request.' }, { status: 500 });
  }
}
