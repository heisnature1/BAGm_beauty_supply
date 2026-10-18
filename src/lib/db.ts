import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { seedDatabase } from './seed';

const DB_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = process.env.DATABASE_PATH || path.join(DB_DIR, 'bagm_beauty.db');

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH);
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');
    initSchema(dbInstance);

    // Auto-seed if empty
    const productCount = dbInstance.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
    if (productCount.count === 0) {
      try {
        seedDatabase();
      } catch (e) {
        console.error('Error auto-seeding database:', e);
      }
    }
  }
  return dbInstance;
}

function initSchema(db: Database.Database) {
  db.exec(`
    -- Users Table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'customer',
      is_verified INTEGER DEFAULT 1,
      verification_token TEXT,
      reset_token TEXT,
      reset_token_expiry TEXT,
      newsletter_subscribed INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Addresses Table
    CREATE TABLE IF NOT EXISTS addresses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT DEFAULT 'Home',
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      street_address TEXT NOT NULL,
      landmark_or_gps TEXT,
      city TEXT NOT NULL,
      region TEXT NOT NULL,
      delivery_zone_id TEXT,
      is_default INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Categories Table
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image_url TEXT,
      parent_id TEXT,
      display_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );

    -- Brands Table
    CREATE TABLE IF NOT EXISTS brands (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      origin TEXT DEFAULT 'Ghanaian',
      description TEXT,
      logo_url TEXT,
      website_url TEXT,
      is_featured INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    -- Products Table
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      sku TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      brand_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      cost_price REAL DEFAULT 0,
      images TEXT NOT NULL,
      video_url TEXT,
      ingredients TEXT,
      benefits TEXT,
      directions_for_use TEXT,
      suitable_skin_types TEXT,
      relevant_concerns TEXT,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      low_stock_threshold INTEGER NOT NULL DEFAULT 5,
      stock_status TEXT NOT NULL DEFAULT 'in_stock',
      is_published INTEGER NOT NULL DEFAULT 1,
      is_featured INTEGER NOT NULL DEFAULT 0,
      is_bestseller INTEGER NOT NULL DEFAULT 0,
      is_new_arrival INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (brand_id) REFERENCES brands(id),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    -- Product Variants Table
    CREATE TABLE IF NOT EXISTS product_variants (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      name TEXT NOT NULL,
      sku TEXT UNIQUE NOT NULL,
      price REAL NOT NULL,
      cost_price REAL DEFAULT 0,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      attributes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- Stock Movements Table (Audit Trail)
    CREATE TABLE IF NOT EXISTS stock_movements (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      variant_id TEXT,
      quantity_change INTEGER NOT NULL,
      type TEXT NOT NULL,
      reference_id TEXT,
      reason TEXT,
      performed_by TEXT,
      stock_before INTEGER NOT NULL,
      stock_after INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    -- Suppliers Table
    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      contact_person TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      notes TEXT,
      created_at TEXT NOT NULL
    );

    -- Purchase Orders Table
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id TEXT PRIMARY KEY,
      po_number TEXT UNIQUE NOT NULL,
      supplier_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      total_cost REAL NOT NULL DEFAULT 0,
      items TEXT NOT NULL,
      received_date TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    );

    -- Delivery Zones Table
    CREATE TABLE IF NOT EXISTS delivery_zones (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      region TEXT NOT NULL,
      fee REAL NOT NULL,
      estimated_delivery_time TEXT NOT NULL,
      cod_available INTEGER DEFAULT 1,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );

    -- Pickup Locations Table
    CREATE TABLE IF NOT EXISTS pickup_locations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT NOT NULL,
      operating_hours TEXT NOT NULL,
      instructions TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );

    -- Orders Table
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      user_id TEXT,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      fulfilment_type TEXT NOT NULL,
      delivery_zone_id TEXT,
      delivery_address TEXT,
      pickup_location_id TEXT,
      subtotal REAL NOT NULL,
      delivery_fee REAL NOT NULL DEFAULT 0,
      total_amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'GHS',
      payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'pending',
      payment_reference TEXT,
      payment_channel TEXT,
      order_status TEXT NOT NULL DEFAULT 'order_placed',
      courier_name TEXT,
      tracking_reference TEXT,
      scheduled_delivery_date TEXT,
      customer_notes TEXT,
      admin_notes TEXT,
      is_guest INTEGER DEFAULT 0,
      guest_access_token TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Order Items Table
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      variant_id TEXT,
      product_name TEXT NOT NULL,
      variant_name TEXT,
      sku TEXT NOT NULL,
      unit_price REAL NOT NULL,
      cost_price REAL DEFAULT 0,
      quantity INTEGER NOT NULL,
      total_price REAL NOT NULL,
      image_url TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    -- Payments Table
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      reference TEXT UNIQUE NOT NULL,
      gateway TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'GHS',
      status TEXT NOT NULL DEFAULT 'pending',
      raw_response TEXT,
      verified_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    );

    -- Wishlists Table
    CREATE TABLE IF NOT EXISTS wishlists (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE(user_id, product_id)
    );

    -- Reviews Table (Verified Purchases Only)
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      order_id TEXT NOT NULL,
      rating INTEGER NOT NULL,
      title TEXT,
      comment TEXT NOT NULL,
      skin_type TEXT,
      skin_concern TEXT,
      is_verified_purchase INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'approved',
      admin_notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    );

    -- Returns Table
    CREATE TABLE IF NOT EXISTS returns (
      id TEXT PRIMARY KEY,
      return_number TEXT UNIQUE NOT NULL,
      order_id TEXT NOT NULL,
      order_item_id TEXT NOT NULL,
      user_id TEXT,
      quantity INTEGER NOT NULL,
      reason TEXT NOT NULL,
      explanation TEXT NOT NULL,
      images TEXT,
      status TEXT NOT NULL DEFAULT 'requested',
      inspection_notes TEXT,
      is_resellable INTEGER DEFAULT 0,
      refund_amount REAL NOT NULL DEFAULT 0,
      refund_method TEXT,
      refund_reference TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (order_item_id) REFERENCES order_items(id)
    );

    -- Contact Enquiries Table
    CREATE TABLE IF NOT EXISTS contact_enquiries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT NOT NULL,
      category TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      admin_reply TEXT,
      created_at TEXT NOT NULL
    );

    -- Newsletter Subscribers Table
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'subscribed',
      subscribed_at TEXT NOT NULL,
      unsubscribed_at TEXT,
      source TEXT DEFAULT 'footer'
    );

    -- Editorial Articles Table
    CREATE TABLE IF NOT EXISTS editorial_articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      cover_image TEXT NOT NULL,
      category TEXT NOT NULL,
      author TEXT NOT NULL DEFAULT 'BAGm Beauty Editorial',
      read_time TEXT NOT NULL DEFAULT '4 min read',
      is_published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Financial Expenses Table
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      reference_number TEXT,
      description TEXT,
      receipt_url TEXT,
      created_at TEXT NOT NULL
    );

    -- Store Settings Table
    CREATE TABLE IF NOT EXISTS store_settings (
      id TEXT PRIMARY KEY,
      store_name TEXT NOT NULL DEFAULT 'BAGm Beauty Supply',
      store_tagline TEXT NOT NULL DEFAULT 'Your Beauty. Your Ritual. Your Glow.',
      contact_email TEXT NOT NULL DEFAULT 'support@bagmbeauty.com',
      contact_phone TEXT NOT NULL DEFAULT '+233 24 123 4567',
      whatsapp_number TEXT,
      address_line TEXT NOT NULL DEFAULT 'East Legon, Greater Accra, Ghana',
      store_hours TEXT NOT NULL DEFAULT 'Monday – Saturday: 9:00 AM – 7:00 PM GMT',
      announcement_enabled INTEGER NOT NULL DEFAULT 1,
      announcement_text TEXT NOT NULL DEFAULT '✨ Fast & Reliable Express Delivery across Greater Accra & Nationwide Courier Service across Ghana',
      announcement_link TEXT DEFAULT '/shop',
      hero_headline TEXT NOT NULL DEFAULT 'Your Beauty. Your Ritual. Your Glow.',
      hero_subtitle TEXT NOT NULL DEFAULT 'Discover curated beauty and skincare essentials selected to help you build a routine that feels right for you.',
      hero_primary_cta_text TEXT NOT NULL DEFAULT 'Shop Beauty',
      hero_primary_cta_link TEXT NOT NULL DEFAULT '/shop',
      hero_secondary_cta_text TEXT NOT NULL DEFAULT 'Routine Finder',
      hero_secondary_cta_link TEXT NOT NULL DEFAULT '/routine-finder',
      hero_image_url TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1600',
      currency_code TEXT NOT NULL DEFAULT 'GHS',
      currency_symbol TEXT NOT NULL DEFAULT 'GH₵',
      paystack_public_key TEXT,
      paystack_secret_key TEXT,
      paystack_enabled INTEGER NOT NULL DEFAULT 1,
      flutterwave_public_key TEXT,
      flutterwave_secret_key TEXT,
      flutterwave_enabled INTEGER NOT NULL DEFAULT 0,
      bank_transfer_enabled INTEGER NOT NULL DEFAULT 1,
      bank_name TEXT DEFAULT 'Ghana Commercial Bank (GCB)',
      bank_account_name TEXT DEFAULT 'BAGM BEAUTY SUPPLY LTD',
      bank_account_number TEXT DEFAULT '1021134567890',
      bank_branch TEXT DEFAULT 'East Legon Branch, Accra',
      cod_enabled INTEGER NOT NULL DEFAULT 1,
      return_window_days INTEGER NOT NULL DEFAULT 7,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Administrative Audit Logs Table
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_email TEXT,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL
    );

    -- Email Logs Table
    CREATE TABLE IF NOT EXISTS email_logs (
      id TEXT PRIMARY KEY,
      recipient TEXT NOT NULL,
      subject TEXT NOT NULL,
      template TEXT NOT NULL,
      status TEXT NOT NULL,
      error_message TEXT,
      body_preview TEXT,
      created_at TEXT NOT NULL
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
    CREATE INDEX IF NOT EXISTS idx_products_status ON products(is_published, stock_status);
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
    CREATE INDEX IF NOT EXISTS idx_stock_movements_prod ON stock_movements(product_id);
  `);
}
