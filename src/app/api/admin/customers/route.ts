import { NextRequest, NextResponse } from 'next/server';
import { getDb, memoryStore } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data } = await supabase.from('users').select('*');
        if (data && data.length > 0) {
          for (const u of data) {
            if (!memoryStore.users.some((mu: any) => mu.id === u.id || mu.email === u.email)) {
              memoryStore.users.push(u);
            }
          }
        }
      }
    } catch (e) {
      console.error('Supabase customer list sync error:', e);
    }

    const db = getDb();
    const rows = db.prepare(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.role, u.is_verified, u.created_at,
             COUNT(o.id) as order_count,
             SUM(CASE WHEN o.payment_status = 'paid' THEN o.total_amount ELSE 0 END) as total_spend
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `).all();

    return NextResponse.json({ success: true, customers: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
