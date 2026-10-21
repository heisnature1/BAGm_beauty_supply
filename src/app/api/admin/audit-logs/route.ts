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

    const db = getDb();
    const rows = db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100').all();
    let emailRows = db.prepare('SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 100').all();

    // Supabase email logs sync
    try {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data } = await supabase.from('email_logs').select('*').order('created_at', { ascending: false }).limit(50);
        if (data && data.length > 0) {
          const combined = [...data, ...emailRows];
          const uniqueMap = new Map();
          for (const item of combined) {
            if (!uniqueMap.has(item.id)) {
              uniqueMap.set(item.id, item);
            }
          }
          emailRows = Array.from(uniqueMap.values());
        }
      }
    } catch {}

    return NextResponse.json({ success: true, logs: rows, emails: emailRows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
