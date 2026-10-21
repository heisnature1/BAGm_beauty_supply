import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, signToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { randomUUID } from 'crypto';
import { syncUserToSupabase, syncSubscriberToSupabase } from '@/lib/supabase';
import { sendAccountWelcomeEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, first_name, last_name, phone, newsletter } = body;

    if (!email || !password || !first_name || !last_name) {
      return NextResponse.json({ success: false, error: 'All required fields must be filled.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = getDb();

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail) as any;
    if (existing) {
      return NextResponse.json({ success: false, error: 'An active account with this email already exists. Please log in.' }, { status: 400 });
    }

    const userId = randomUUID();
    const passwordHash = hashPassword(password);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, is_verified, verification_token, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      cleanEmail,
      passwordHash,
      first_name.trim(),
      last_name.trim(),
      phone ? phone.trim() : null,
      'customer',
      1,
      null,
      now,
      now
    );

    const user = {
      id: userId,
      email: cleanEmail,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      phone: phone ? phone.trim() : '',
      role: 'customer',
      is_verified: 1,
      created_at: now,
      updated_at: now,
    };

    // Sync to Supabase Auth & PostgreSQL
    syncUserToSupabase({
      id: userId,
      email: cleanEmail,
      password_hash: passwordHash,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      phone: phone ? phone.trim() : null,
      role: 'customer',
      password,
    }).catch((err) => console.error('Supabase sync background notice:', err));

    if (newsletter) {
      const subId = randomUUID();
      db.prepare(`
        INSERT INTO subscribers (id, email, status, created_at)
        VALUES (?, ?, ?, ?)
      `).run(subId, cleanEmail, 'subscribed', now);

      syncSubscriberToSupabase({
        id: subId,
        email: cleanEmail,
        status: 'subscribed',
      }).catch((err) => console.error('Supabase subscriber background notice:', err));
    }

    // Send luxury welcome email
    sendAccountWelcomeEmail(cleanEmail, first_name.trim()).catch((err) =>
      console.error('Welcome email error:', err)
    );

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: 'customer',
      name: `${user.first_name} ${user.last_name}`,
    });

    const response = NextResponse.json({
      success: true,
      user,
      message: 'Account created successfully! Welcome to BAGm Beauty Supply.',
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
