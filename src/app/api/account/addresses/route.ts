import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ addresses: [] });
    }

    const db = getDb();
    const addresses = db.prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC').all(user.id);
    return NextResponse.json({ addresses: addresses || [] });
  } catch (error) {
    return NextResponse.json({ addresses: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, first_name, last_name, phone, street_address, landmark_or_gps, city, region, is_default } = body;

    if (!street_address) {
      return NextResponse.json({ success: false, error: 'Street address is required' }, { status: 400 });
    }

    const db = getDb();
    const addressId = randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO addresses (id, user_id, title, first_name, last_name, phone, street_address, landmark_or_gps, city, region, is_default, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      addressId,
      user.id,
      title || 'Home',
      first_name || user.first_name,
      last_name || user.last_name,
      phone || user.phone || '',
      street_address,
      landmark_or_gps || '',
      city || 'Accra',
      region || 'Greater Accra',
      is_default ? 1 : 0,
      now,
      now
    );

    return NextResponse.json({ success: true, message: 'Address saved successfully.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to save address.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Address ID required' }, { status: 400 });
    }

    const db = getDb();
    db.prepare('DELETE FROM addresses WHERE id = ? AND user_id = ?').run(id, user.id);

    return NextResponse.json({ success: true, message: 'Address deleted.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to delete address.' }, { status: 500 });
  }
}
