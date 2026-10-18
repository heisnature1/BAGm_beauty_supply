import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { getDb } from './db';
import { User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'bagm_beauty_jwt_secret_key_prod_2026';
const TOKEN_EXPIRY = '7d';
export const AUTH_COOKIE_NAME = 'bagm_auth_token';

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'customer' | 'admin';
  name: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (err) {
    return null;
  }
}

export async function getSessionUser(): Promise<User | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload || !payload.userId) return null;

    const db = getDb();
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.userId) as any;
    if (!row) return null;

    return {
      id: row.id,
      email: row.email,
      first_name: row.first_name,
      last_name: row.last_name,
      phone: row.phone,
      role: row.role,
      is_verified: row.is_verified,
      newsletter_subscribed: row.newsletter_subscribed,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  } catch (error) {
    return null;
  }
}

export function getUserFromRequest(req: NextRequest): User | null {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value || req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload || !payload.userId) return null;

    const db = getDb();
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.userId) as any;
    if (!row) return null;

    return {
      id: row.id,
      email: row.email,
      first_name: row.first_name,
      last_name: row.last_name,
      phone: row.phone,
      role: row.role,
      is_verified: row.is_verified,
      newsletter_subscribed: row.newsletter_subscribed,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  } catch (error) {
    return null;
  }
}
