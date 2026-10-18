import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const zones = db.prepare('SELECT * FROM delivery_zones WHERE is_active = 1 ORDER BY fee ASC').all();
    const pickups = db.prepare('SELECT * FROM pickup_locations WHERE is_active = 1 ORDER BY name ASC').all();

    return NextResponse.json({
      success: true,
      zones,
      pickups,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
