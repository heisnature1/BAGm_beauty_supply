import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://utzcuhcavnduthotgrjr.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0emN1aGNhdm5kdXRob3RncmpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyNzUwMDMsImV4cCI6MjEwNzg1MTAwM30.TZCdGNIVX-ZY8WQyC-DQj4KwP-zKpFXZ3hfYJZD1lDY';

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0emN1aGNhdm5kdXRob3RncmpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjI3NTAwMywiZXhwIjoyMTA3ODUxMDAzfQ.qwhh0NRNX_ixrFLLF7NSqrUOX9GALTo3fufWRdbZjsU';

let supabaseClient: SupabaseClient | null = null;
let supabaseAdminClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && (supabaseAnonKey || supabaseServiceRoleKey));
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });
  }
  return supabaseClient;
}

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!supabaseAdminClient) {
    supabaseAdminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });
  }
  return supabaseAdminClient;
}

/**
 * Synchronize user registration to Supabase database and Supabase Auth
 */
export async function syncUserToSupabase(user: {
  id: string;
  email: string;
  password_hash?: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  role?: string;
  password?: string;
}) {
  const client = getSupabaseAdmin();
  if (!client) return null;

  try {
    // 1. Sync to public.users table
    await client.from('users').upsert({
      id: user.id,
      email: user.email.toLowerCase().trim(),
      password_hash: user.password_hash || '',
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone || null,
      role: user.role || 'customer',
      is_verified: 1,
      updated_at: new Date().toISOString(),
    });

    // 2. Optionally create or sync Supabase Auth user if password is provided
    if (user.password && user.password.length >= 6) {
      await client.auth.admin.createUser({
        email: user.email.toLowerCase().trim(),
        password: user.password,
        email_confirm: true,
        user_metadata: {
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone || '',
          role: user.role || 'customer',
        },
      });
    }
  } catch (error) {
    console.error('Supabase user sync notice:', error);
  }
}

/**
 * Synchronize checkout order and line items to Supabase
 */
export async function syncOrderToSupabase(order: any, items: any[] = []) {
  const client = getSupabaseAdmin();
  if (!client) return null;

  try {
    await client.from('orders').upsert({
      id: order.id,
      order_number: order.order_number,
      customer_id: order.customer_id || null,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      delivery_method: order.delivery_method,
      delivery_zone_id: order.delivery_zone_id || null,
      delivery_address: order.delivery_address || null,
      pickup_location_id: order.pickup_location_id || null,
      subtotal: order.subtotal,
      delivery_fee: order.delivery_fee,
      total_amount: order.total_amount,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      payment_reference: order.payment_reference || null,
      order_status: order.order_status,
      customer_notes: order.customer_notes || null,
      admin_notes: order.admin_notes || null,
      created_at: order.created_at || new Date().toISOString(),
      updated_at: order.updated_at || new Date().toISOString(),
    });

    if (items.length > 0) {
      const dbItems = items.map((it) => ({
        id: it.id,
        order_id: order.id,
        product_id: it.product_id,
        product_name: it.product_name,
        variant_id: it.variant_id || null,
        variant_name: it.variant_name || null,
        sku: it.sku || '',
        price: it.price,
        quantity: it.quantity,
        total: it.total || it.price * it.quantity,
      }));
      await client.from('order_items').upsert(dbItems);
    }
  } catch (error) {
    console.error('Supabase order sync notice:', error);
  }
}

/**
 * Synchronize newsletter subscriber to Supabase
 */
export async function syncSubscriberToSupabase(sub: { id: string; email: string; status: string }) {
  const client = getSupabaseAdmin();
  if (!client) return null;

  try {
    await client.from('subscribers').upsert({
      id: sub.id,
      email: sub.email.toLowerCase().trim(),
      status: sub.status || 'subscribed',
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Supabase subscriber sync notice:', error);
  }
}

/**
 * Synchronize customer review to Supabase
 */
export async function syncReviewToSupabase(rev: any) {
  const client = getSupabaseAdmin();
  if (!client) return null;

  try {
    await client.from('reviews').upsert({
      id: rev.id,
      product_id: rev.product_id,
      user_id: rev.user_id || null,
      author_name: rev.author_name,
      rating: rev.rating,
      title: rev.title || null,
      comment: rev.comment,
      skin_type: rev.skin_type || null,
      skin_concern: rev.skin_concern || null,
      is_verified_purchase: rev.is_verified_purchase ? 1 : 0,
      status: rev.status || 'approved',
      created_at: rev.created_at || new Date().toISOString(),
    });
  } catch (error) {
    console.error('Supabase review sync notice:', error);
  }
}

/**
 * Synchronize contact message / enquiry to Supabase
 */
export async function syncEnquiryToSupabase(enq: any) {
  const client = getSupabaseAdmin();
  if (!client) return null;

  try {
    await client.from('enquiries').upsert({
      id: enq.id,
      name: enq.name,
      email: enq.email,
      phone: enq.phone || null,
      subject: enq.subject || 'General Enquiry',
      message: enq.message,
      status: enq.status || 'new',
      created_at: enq.created_at || new Date().toISOString(),
    });
  } catch (error) {
    console.error('Supabase enquiry sync notice:', error);
  }
}
