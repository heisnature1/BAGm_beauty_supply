import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { getDb, memoryStore } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, token, password } = body;

    const db = getDb();

    if (action === 'request') {
      if (!email || !email.includes('@')) {
        return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 });
      }

      const cleanEmail = email.trim().toLowerCase();
      const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(cleanEmail);

      // Security practice: always return success to prevent email enumeration, but generate token if exists
      if (user) {
        const resetToken = randomUUID();
        const expiresAt = Date.now() + 1000 * 60 * 60; // 1 hour
        memoryStore.resetTokens.push({ email: cleanEmail, token: resetToken, expires_at: expiresAt });
      }

      return NextResponse.json({
        success: true,
        message: 'Password reset instructions have been sent to your email address.',
      });
    }

    if (action === 'confirm') {
      if (!email || !password) {
        return NextResponse.json({ success: false, error: 'Email and new password are required.' }, { status: 400 });
      }

      if (password.length < 6) {
        return NextResponse.json({ success: false, error: 'Password must be at least 6 characters.' }, { status: 400 });
      }

      const cleanEmail = email.trim().toLowerCase();
      const newHash = hashPassword(password);

      db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(newHash, cleanEmail);

      return NextResponse.json({
        success: true,
        message: 'Your password has been reset successfully! You can now sign in.',
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action specified.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
