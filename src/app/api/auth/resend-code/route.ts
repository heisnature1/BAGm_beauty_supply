import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { sendVerificationCodeEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email address is required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = getDb();

    const userRow = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail) as any;

    if (!userRow) {
      return NextResponse.json({ success: false, error: 'Account not found with this email.' }, { status: 404 });
    }

    if (userRow.is_verified === 1) {
      return NextResponse.json({ success: true, message: 'Account is already verified. You can log in directly.' });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE users
      SET verification_token = ?, updated_at = ?
      WHERE email = ?
    `).run(verificationCode, now, cleanEmail);

    // Send the fresh code
    sendVerificationCodeEmail(cleanEmail, verificationCode, userRow.first_name || 'Customer').catch((err) =>
      console.error('Email verification error:', err)
    );

    return NextResponse.json({
      success: true,
      code: verificationCode,
      message: 'A fresh 6-digit verification code has been dispatched to your email.',
    });
  } catch (error: any) {
    console.error('Resend code error:', error);
    return NextResponse.json({ success: false, error: 'Failed to resend code. Please try again.' }, { status: 500 });
  }
}
