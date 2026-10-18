import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, consent } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (!consent) {
      return NextResponse.json({ success: false, error: 'Please accept privacy and communication consent.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = getDb();

    db.prepare(`
      INSERT INTO subscribers (id, email, status, created_at)
      VALUES (?, ?, ?, ?)
    `).run(
      randomUUID(),
      cleanEmail,
      'subscribed',
      new Date().toISOString()
    );

    return NextResponse.json({
      success: true,
      message: 'Thank you for subscribing to BAGm Beauty updates and VIP alerts!',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to subscribe. Please try again.' }, { status: 500 });
  }
}
