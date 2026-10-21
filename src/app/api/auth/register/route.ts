import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { randomUUID } from 'crypto';
import { syncUserToSupabase, syncSubscriberToSupabase } from '@/lib/supabase';
import { sendVerificationCodeEmail } from '@/lib/email';

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

    const existing = db.prepare('SELECT id, is_verified FROM users WHERE email = ?').get(cleanEmail) as any;
    if (existing) {
      if (existing.is_verified === 1) {
        return NextResponse.json({ success: false, error: 'An active account with this email already exists. Please log in.' }, { status: 400 });
      }
      // If user exists but is unverified, regenerate code and allow them to verify
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const passwordHash = hashPassword(password);
      const now = new Date().toISOString();

      db.prepare(`
        UPDATE users
        SET password_hash = ?, first_name = ?, last_name = ?, phone = ?, verification_token = ?, updated_at = ?
        WHERE email = ?
      `).run(passwordHash, first_name.trim(), last_name.trim(), phone ? phone.trim() : null, verificationCode, now, cleanEmail);

      sendVerificationCodeEmail(cleanEmail, verificationCode, first_name.trim()).catch((err) =>
        console.error('Email verification error:', err)
      );

      return NextResponse.json({
        success: true,
        requires_verification: true,
        email: cleanEmail,
        message: 'A fresh 6-digit verification code has been sent to your email.',
        debugCode: verificationCode,
      });
    }

    const userId = randomUUID();
    const passwordHash = hashPassword(password);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
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
      0,
      verificationCode,
      now,
      now
    );

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

    // Send the 6-digit OTP email
    sendVerificationCodeEmail(cleanEmail, verificationCode, first_name.trim()).catch((err) =>
      console.error('Email verification error:', err)
    );

    return NextResponse.json({
      success: true,
      requires_verification: true,
      email: cleanEmail,
      message: 'We sent a 6-digit verification code to your email address.',
      debugCode: verificationCode,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
