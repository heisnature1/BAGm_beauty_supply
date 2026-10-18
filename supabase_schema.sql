-- =========================================================================
-- BAGm Beauty Supply - Supabase PostgreSQL Schema & Seed Migration
-- Run this script in your Supabase SQL Editor (supabase.com -> SQL Editor -> New Query)
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer',
  is_verified INTEGER DEFAULT 1,
  verification_token TEXT,
  reset_token TEXT,
  reset_token_expiry TIMESTAMPTZ,
  newsletter_subscribed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS public.addresses (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id TEXT,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. BRANDS TABLE
CREATE TABLE IF NOT EXISTS public.brands (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  origin TEXT DEFAULT 'Ghanaian',
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  is_featured INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  brand_id TEXT REFERENCES public.brands(id) ON DELETE SET NULL,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  cost_price NUMERIC(10, 2) DEFAULT 0,
  images JSONB NOT NULL DEFAULT '[]'::JSONB,
  video_url TEXT,
  ingredients TEXT,
  benefits TEXT,
  directions_for_use TEXT,
  suitable_skin_types JSONB DEFAULT '[]'::JSONB,
  relevant_concerns JSONB DEFAULT '[]'::JSONB,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  stock_status TEXT NOT NULL DEFAULT 'in_stock',
  is_published INTEGER NOT NULL DEFAULT 1,
  is_featured INTEGER NOT NULL DEFAULT 0,
  is_bestseller INTEGER NOT NULL DEFAULT 0,
  is_new_arrival INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. PRODUCT VARIANTS TABLE
CREATE TABLE IF NOT EXISTS public.product_variants (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  cost_price NUMERIC(10, 2) DEFAULT 0,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  attributes JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. STOCK MOVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id TEXT,
  quantity_change INTEGER NOT NULL,
  type TEXT NOT NULL,
  reference_id TEXT,
  reason TEXT,
  performed_by TEXT,
  stock_before INTEGER NOT NULL,
  stock_after INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. SUPPLIERS TABLE
CREATE TABLE IF NOT EXISTS public.suppliers (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. PURCHASE ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  po_number TEXT UNIQUE NOT NULL,
  supplier_id TEXT REFERENCES public.suppliers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  total_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  items JSONB NOT NULL DEFAULT '[]'::JSONB,
  received_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. DELIVERY ZONES TABLE
CREATE TABLE IF NOT EXISTS public.delivery_zones (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  fee NUMERIC(10, 2) NOT NULL,
  estimated_delivery_time TEXT NOT NULL,
  cod_available INTEGER DEFAULT 1,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. PICKUP LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS public.pickup_locations (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  operating_hours TEXT NOT NULL,
  instructions TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  order_number TEXT UNIQUE NOT NULL,
  user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  fulfilment_type TEXT NOT NULL,
  delivery_zone_id TEXT,
  delivery_address JSONB,
  pickup_location_id TEXT,
  subtotal NUMERIC(10, 2) NOT NULL,
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL,
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  variant_id TEXT,
  product_name TEXT NOT NULL,
  variant_name TEXT,
  sku TEXT NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  cost_price NUMERIC(10, 2) DEFAULT 0,
  quantity INTEGER NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  reference TEXT UNIQUE NOT NULL,
  gateway TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GHS',
  status TEXT NOT NULL DEFAULT 'pending',
  raw_response JSONB,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. WISHLISTS TABLE
CREATE TABLE IF NOT EXISTS public.wishlists (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 16. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  order_id TEXT REFERENCES public.orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL,
  title TEXT,
  comment TEXT NOT NULL,
  skin_type TEXT,
  skin_concern TEXT,
  is_verified_purchase INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'approved',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. RETURNS TABLE
CREATE TABLE IF NOT EXISTS public.returns (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  return_number TEXT UNIQUE NOT NULL,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_item_id TEXT NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  reason TEXT NOT NULL,
  explanation TEXT NOT NULL,
  images JSONB,
  status TEXT NOT NULL DEFAULT 'requested',
  inspection_notes TEXT,
  is_resellable INTEGER DEFAULT 0,
  refund_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  refund_method TEXT,
  refund_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. ENQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.enquiries (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. SUBSCRIBERS TABLE
CREATE TABLE IF NOT EXISTS public.subscribers (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  email TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'subscribed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. EDITORIAL ARTICLES TABLE
CREATE TABLE IF NOT EXISTS public.editorial_articles (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  category TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'BAGm Beauty Editorial',
  read_time TEXT NOT NULL DEFAULT '4 min read',
  is_published INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 21. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  category TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'Mobile Money',
  recorded_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 22. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.store_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  key TEXT UNIQUE,
  value TEXT,
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
  bank_transfer_enabled INTEGER NOT NULL DEFAULT 1,
  bank_name TEXT DEFAULT 'Ghana Commercial Bank (GCB)',
  bank_account_name TEXT DEFAULT 'BAGM BEAUTY SUPPLY LTD',
  bank_account_number TEXT DEFAULT '1021134567890',
  bank_branch TEXT DEFAULT 'East Legon Branch, Accra',
  cod_enabled INTEGER NOT NULL DEFAULT 1,
  return_window_days INTEGER NOT NULL DEFAULT 7,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 23. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT,
  user_email TEXT,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 24. EMAIL LOGS TABLE
CREATE TABLE IF NOT EXISTS public.email_logs (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  template TEXT NOT NULL,
  status TEXT NOT NULL,
  error_message TEXT,
  body_preview TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================================
-- SEED INITIAL STORE DATA
-- =========================================================================

-- Admin User: admin@bagmbeauty.com / AdminPassword2026!
-- Demo Customer: customer@example.com / Password123!
INSERT INTO public.users (id, email, password_hash, first_name, last_name, phone, role, is_verified, created_at, updated_at)
VALUES 
  ('usr-admin-001', 'admin@bagmbeauty.com', '$2a$10$Wq3iP4Gq3MvP2cNuYp8Y9On6qRkY0R9/0eSj0T2nF4S3bV6mZ2gOu', 'BAGm', 'Administrator', '+233 24 123 4567', 'admin', 1, NOW(), NOW()),
  ('cust-001', 'customer@example.com', '$2a$10$uWk7zHw3P3kU7xJ1fF2uYe8I9K0aN7qV1bM3xY5zW7eT9pQ2rL4sK', 'Akosua', 'Mensah', '+233 24 987 6543', 'customer', 1, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Store Settings
INSERT INTO public.store_settings (id, store_name, store_tagline, contact_email, contact_phone, whatsapp_number, address_line, store_hours, announcement_enabled, announcement_text, announcement_link, hero_headline, hero_subtitle, hero_primary_cta_text, hero_primary_cta_link, hero_secondary_cta_text, hero_secondary_cta_link, hero_image_url, currency_code, currency_symbol, paystack_enabled, bank_transfer_enabled, bank_name, bank_account_name, bank_account_number, bank_branch, cod_enabled, return_window_days, created_at, updated_at)
VALUES (
  'default', 'BAGm Beauty Supply', 'Your Beauty. Your Ritual. Your Glow.', 'support@bagmbeauty.com', '+233 24 123 4567', '+233 55 987 6543', 'Lagos Avenue, East Legon, Accra, Ghana', 'Monday – Saturday: 9:00 AM – 7:00 PM GMT', 1, '✨ Fast & Reliable Express Delivery across Greater Accra & Nationwide Courier Service across Ghana', '/shop', 'Your Beauty. Your Ritual. Your Glow.', 'Discover curated beauty and skincare essentials selected to help you build a routine that feels right for you.', 'Shop Beauty', '/shop', 'Skincare Routine Finder', '/routine-finder', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1600', 'GHS', 'GH₵', 1, 1, 'Ghana Commercial Bank (GCB)', 'BAGM BEAUTY SUPPLY LTD', '1021134567890', 'East Legon Branch, Accra', 1, 7, NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

-- Categories
INSERT INTO public.categories (id, name, slug, description, image_url, display_order, is_active, created_at)
VALUES
  ('cat-cleansers', 'Cleansers', 'cleansers', 'Gentle foaming, gel, and hydrating cream cleansers for daily pore purification.', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800', 1, 1, NOW()),
  ('cat-toners-essences', 'Toners & Essences', 'toners-essences', 'Hydrating, balancing, and exfoliating liquid treatments.', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800', 2, 1, NOW()),
  ('cat-serums-treatments', 'Serums & Treatments', 'serums-treatments', 'Potent active formulations targeting hyperpigmentation, uneven texture, and acne.', 'https://images.unsplash.com/photo-1608248597359-216259021419?auto=format&fit=crop&q=80&w=800', 3, 1, NOW()),
  ('cat-moisturizers', 'Moisturizers & Creams', 'moisturizers', 'Barrier-repairing, nourishing creams, whipped body butters, and lightweight gel hydrators.', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800', 4, 1, NOW()),
  ('cat-sun-protection', 'Sun Protection (SPF)', 'sun-protection', 'Invisible, non-greasy sunscreens leaving zero white cast on melanin-rich skin.', 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=800', 5, 1, NOW()),
  ('cat-body-care', 'Body Care & Butters', 'body-care', 'Authentic raw Ghanaian shea butters, botanical oils, and glowing body mists.', 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=800', 6, 1, NOW()),
  ('cat-beauty-tools', 'Beauty Tools & Accessories', 'beauty-tools', 'Precision dual-ended blending sponges, cosmetic accessories, and cleansing brushes.', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800', 7, 1, NOW())
ON CONFLICT (id) DO NOTHING;

-- Brands
INSERT INTO public.brands (id, name, slug, origin, description, logo_url, is_featured, created_at)
VALUES
  ('brand-bagm', 'BAGm Signature', 'bagm', 'BAGm', 'Exclusive in-house formulations tailored specifically for melanin-rich skin in tropical climates.', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=200', 1, NOW()),
  ('brand-nokware', 'Nokware Skincare', 'nokware', 'Ghanaian', '100% natural, handcrafted African skincare made with organic raw Ghanaian shea butter and botanical herbs.', 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=200', 1, NOW()),
  ('brand-kaeme', 'Kaeme', 'kaeme', 'Ghanaian', 'Handmade Ghanaian luxury shea butter soufflés and artisanal soaps.', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=200', 1, NOW()),
  ('brand-cerave', 'CeraVe', 'cerave', 'International', 'Dermatologist-developed skincare infused with three essential ceramides to restore skin barrier.', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=200', 1, NOW()),
  ('brand-ordinary', 'The Ordinary', 'the-ordinary', 'International', 'Clinical formulations with integrity, featuring high-potency active single ingredients.', 'https://images.unsplash.com/photo-1608248597359-216259021419?auto=format&fit=crop&q=80&w=200', 1, NOW()),
  ('brand-laroche', 'La Roche-Posay', 'la-roche-posay', 'International', 'Advanced French dermatological skincare recommended by skincare experts worldwide.', 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=200', 1, NOW()),
  ('brand-cosrx', 'COSRX', 'cosrx', 'International', 'Iconic Korean skincare formulating minimalist solutions for troubled and sensitive skin.', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=200', 1, NOW()),
  ('brand-fenty', 'Fenty Skin', 'fenty-skin', 'International', 'Rihanna’s clean, multitasking skincare designed for every skin tone.', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=200', 1, NOW()),
  ('brand-paulas-choice', 'Paula’s Choice', 'paulas-choice', 'International', 'Smart, science-backed skincare formulations without fragrance.', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=200', 1, NOW())
ON CONFLICT (id) DO NOTHING;

-- Delivery Zones
INSERT INTO public.delivery_zones (id, name, region, fee, estimated_delivery_time, cod_available, is_active, created_at)
VALUES
  ('zone-accra-central', 'Accra Central & East Legon Express', 'Greater Accra', 35.00, 'Same-Day / Within 24 Hours', 1, 1, NOW()),
  ('zone-accra-outskirts', 'Greater Accra Outskirts (Tema, Kasoa, Pokuase)', 'Greater Accra', 55.00, '24 – 48 Hours', 1, 1, NOW()),
  ('zone-kumasi-takoradi', 'Kumasi & Takoradi Express Parcel', 'Ashanti / Western', 65.00, '1 – 2 Business Days', 0, 1, NOW()),
  ('zone-nationwide-ghana', 'Nationwide Intercity VIP Courier (All Regions)', 'Nationwide Ghana', 75.00, '2 – 3 Business Days', 0, 1, NOW())
ON CONFLICT (id) DO NOTHING;

-- Pickup Location
INSERT INTO public.pickup_locations (id, name, address, phone, operating_hours, instructions, is_active, created_at)
VALUES
  ('pickup-east-legon', 'BAGm East Legon Flagship Boutique', 'Lagos Avenue (Near A&C Mall), East Legon, Accra', '+233 24 123 4567', 'Mon – Sat: 9:00 AM – 7:00 PM GMT', 'Collect free of charge with your order confirmation number.', 1, NOW())
ON CONFLICT (id) DO NOTHING;
