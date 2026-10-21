import { NextRequest, NextResponse } from 'next/server';
import { signToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { sendAccountWelcomeEmail } from '@/lib/email';
import { syncUserToSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json({ success: false, error: 'Email and 6-digit verification code are required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.toString().trim();
    const db = getDb();

    const userRow = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail) as any;

    if (!userRow) {
      return NextResponse.json({ success: false, error: 'Account not found. Please register first.' }, { status: 404 });
    }

    // Check exact code match against database record
    const expectedCode = userRow.verification_token ? String(userRow.verification_token).trim() : null;
    const isCodeValid = Boolean(expectedCode && expectedCode === cleanCode);

    if (!isCodeValid) {
      return NextResponse.json({ success: false, error: 'Invalid verification code. Please check your email and try again.' }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Mark user as verified
    db.prepare(`
      UPDATE users
      SET is_verified = 1, verification_token = NULL, updated_at = ?
      WHERE email = ?
    `).run(now, cleanEmail);

    const user = {
      id: userRow.id,
      email: userRow.email,
      first_name: userRow.first_name,
      last_name: userRow.last_name,
      phone: userRow.phone || '',
      role: userRow.role,
      is_verified: 1,
      newsletter_subscribed: userRow.newsletter_subscribed,
      created_at: userRow.created_at,
      updated_at: now,
    };

    // Sync verified state to Supabase
    syncUserToSupabase({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      role: user.role,
    }).catch((err) => console.error('Supabase sync notice:', err));

    // Send warm luxury welcome email
    sendAccountWelcomeEmail(user.email, user.first_name).catch((err) =>
      console.error('Welcome email error:', err)
    );

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: `${user.first_name} ${user.last_name}`,
    });

    const response = NextResponse.json({
      success: true,
      user,
      message: 'Account successfully verified! Welcome to BAGm Beauty Supply.',
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json({ success: false, error: 'Verification failed. Please try again.' }, { status: 500 });
  }
}
