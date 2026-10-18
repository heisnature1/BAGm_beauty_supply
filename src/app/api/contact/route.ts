import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: 'Name, email, and message are required' }, { status: 400 });
    }

    const db = getDb();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO enquiries (id, name, email, phone, subject, message, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'unread', ?, ?)
    `).run(id, name, email, phone || null, subject || 'General Customer Inquiry', message, now, now);

    return NextResponse.json({
      success: true,
      message: 'Thank you for reaching out to BAGm Beauty Supply. Our beauty care specialists will respond shortly.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
