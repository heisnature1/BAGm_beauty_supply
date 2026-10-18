import { getDb } from './db';
import { Product, Category, Brand, StoreSettings } from '@/types';

export function getStoreSettings(): StoreSettings {
  const db = getDb();
  const row = db.prepare('SELECT * FROM store_settings WHERE id = ?').get('default') as any;
  if (!row) {
    return {
      id: 'default',
      store_name: 'BAGm Beauty Supply',
      store_tagline: 'Your Beauty. Your Ritual. Your Glow.',
      contact_email: 'support@bagmbeauty.com',
      contact_phone: '+233 24 123 4567',
      address_line: 'East Legon, Accra, Ghana',
      store_hours: 'Monday – Saturday: 9:00 AM – 7:00 PM GMT',
      announcement_enabled: 1,
      announcement_text: '✨ Fast & Reliable Express Delivery across Greater Accra & Nationwide Courier Service across Ghana',
      hero_headline: 'Your Beauty. Your Ritual. Your Glow.',
      hero_subtitle: 'Discover curated beauty and skincare essentials selected to help you build a routine that feels right for you.',
      hero_primary_cta_text: 'Shop Beauty',
      hero_primary_cta_link: '/shop',
      hero_secondary_cta_text: 'Routine Finder',
      hero_secondary_cta_link: '/routine-finder',
      hero_image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1600',
      currency_code: 'GHS',
      currency_symbol: 'GH₵',
      paystack_enabled: 1,
      bank_transfer_enabled: 1,
      bank_name: 'Ghana Commercial Bank (GCB)',
      bank_account_name: 'BAGM BEAUTY SUPPLY LTD',
      bank_account_number: '1021134567890',
      bank_branch: 'East Legon Branch, Accra',
      cod_enabled: 1,
      return_window_days: 7,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
  return row;
}

export function parseProductRow(row: any): Product {
  let images: string[] = [];
  if (Array.isArray(row.images)) {
    images = row.images;
  } else if (typeof row.images === 'string') {
    try {
      images = JSON.parse(row.images || '[]');
    } catch {
      images = row.images ? [row.images] : [];
    }
  }

  let benefits: string[] = [];
  if (Array.isArray(row.benefits)) {
    benefits = row.benefits;
  } else if (typeof row.benefits === 'string') {
    try {
      benefits = JSON.parse(row.benefits || '[]');
    } catch {
      benefits = [];
    }
  }

  let suitable_skin_types: string[] = [];
  if (Array.isArray(row.suitable_skin_types)) {
    suitable_skin_types = row.suitable_skin_types;
  } else if (typeof row.suitable_skin_types === 'string') {
    try {
      suitable_skin_types = JSON.parse(row.suitable_skin_types || '[]');
    } catch {
      suitable_skin_types = [];
    }
  }

  let relevant_concerns: string[] = [];
  if (Array.isArray(row.relevant_concerns)) {
    relevant_concerns = row.relevant_concerns;
  } else if (typeof row.relevant_concerns === 'string') {
    try {
      relevant_concerns = JSON.parse(row.relevant_concerns || '[]');
    } catch {
      relevant_concerns = [];
    }
  }

  return {
    ...row,
    images,
    benefits,
    suitable_skin_types,
    relevant_concerns,
    average_rating: row.avg_rating ? Number(row.avg_rating.toFixed(1)) : 5.0,
    review_count: row.review_count ? Number(row.review_count) : 0,
  };
}

export function getCategories(): Category[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT c.*, COUNT(p.id) as product_count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id AND p.is_published = 1
    WHERE c.is_active = 1
    GROUP BY c.id
    ORDER BY c.display_order ASC
  `).all() as any[];
  return rows;
}

export function getCategoryBySlug(slug: string): Category | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM categories WHERE slug = ?').get(slug) as any;
  return row || null;
}

export function getBrands(): Brand[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT b.*, COUNT(p.id) as product_count
    FROM brands b
    LEFT JOIN products p ON p.brand_id = b.id AND p.is_published = 1
    GROUP BY b.id
    ORDER BY b.name ASC
  `).all() as any[];
  return rows;
}

export function getBrandBySlug(slug: string): Brand | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM brands WHERE slug = ?').get(slug) as any;
  return row || null;
}

export interface ProductFilters {
  categorySlug?: string;
  brandSlug?: string;
  brandOrigin?: string;
  skinType?: string;
  concern?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  search?: string;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'name_asc' | 'rating' | 'popular';
  limit?: number;
  offset?: number;
  isFeatured?: boolean;
  isBestseller?: boolean;
  isNewArrival?: boolean;
}

export function getProducts(filters: ProductFilters = {}): { products: Product[]; total: number } {
  const db = getDb();
  const conditions: string[] = ['p.is_published = 1'];
  const params: any[] = [];

  if (filters.categorySlug) {
    conditions.push('c.slug = ?');
    params.push(filters.categorySlug);
  }

  if (filters.brandSlug) {
    conditions.push('b.slug = ?');
    params.push(filters.brandSlug);
  }

  if (filters.brandOrigin) {
    conditions.push('b.origin = ?');
    params.push(filters.brandOrigin);
  }

  if (filters.minPrice !== undefined && !isNaN(filters.minPrice)) {
    conditions.push('p.price >= ?');
    params.push(filters.minPrice);
  }

  if (filters.maxPrice !== undefined && !isNaN(filters.maxPrice)) {
    conditions.push('p.price <= ?');
    params.push(filters.maxPrice);
  }

  if (filters.inStockOnly) {
    conditions.push("p.stock_status != 'out_of_stock' AND p.stock_quantity > 0");
  }

  if (filters.isFeatured) {
    conditions.push('p.is_featured = 1');
  }

  if (filters.isBestseller) {
    conditions.push('p.is_bestseller = 1');
  }

  if (filters.isNewArrival) {
    conditions.push('p.is_new_arrival = 1');
  }

  if (filters.skinType) {
    conditions.push("p.suitable_skin_types LIKE ? OR p.suitable_skin_types LIKE '%\"all\"%'");
    params.push(`%"${filters.skinType}"%`);
  }

  if (filters.concern) {
    conditions.push('p.relevant_concerns LIKE ?');
    params.push(`%"${filters.concern}"%`);
  }

  if (filters.search && filters.search.trim()) {
    const q = `%${filters.search.trim()}%`;
    conditions.push('(p.name LIKE ? OR p.description LIKE ? OR b.name LIKE ? OR c.name LIKE ? OR p.ingredients LIKE ?)');
    params.push(q, q, q, q, q);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Sorting
  let orderBy = 'ORDER BY p.is_bestseller DESC, p.created_at DESC';
  if (filters.sort === 'price_asc') {
    orderBy = 'ORDER BY p.price ASC';
  } else if (filters.sort === 'price_desc') {
    orderBy = 'ORDER BY p.price DESC';
  } else if (filters.sort === 'newest') {
    orderBy = 'ORDER BY p.created_at DESC';
  } else if (filters.sort === 'name_asc') {
    orderBy = 'ORDER BY p.name ASC';
  } else if (filters.sort === 'rating') {
    orderBy = 'ORDER BY avg_rating DESC NULLS LAST';
  } else if (filters.sort === 'popular') {
    orderBy = 'ORDER BY p.is_bestseller DESC, p.created_at DESC';
  }

  // Count
  const countSql = `
    SELECT COUNT(DISTINCT p.id) as count
    FROM products p
    JOIN categories c ON p.category_id = c.id
    JOIN brands b ON p.brand_id = b.id
    ${whereClause}
  `;
  const totalRow = db.prepare(countSql).get(...params) as { count: number };
  const total = totalRow?.count || 0;

  // Query
  const limit = filters.limit || 24;
  const offset = filters.offset || 0;

  const dataSql = `
    SELECT p.*,
           b.name as brand_name, b.slug as brand_slug, b.origin as brand_origin,
           c.name as category_name, c.slug as category_slug,
           AVG(r.rating) as avg_rating,
           COUNT(r.id) as review_count
    FROM products p
    JOIN categories c ON p.category_id = c.id
    JOIN brands b ON p.brand_id = b.id
    LEFT JOIN reviews r ON r.product_id = p.id AND r.status = 'approved'
    ${whereClause}
    GROUP BY p.id
    ${orderBy}
    LIMIT ? OFFSET ?
  `;

  const rows = db.prepare(dataSql).all(...params, limit, offset) as any[];
  const products = rows.map(parseProductRow);

  return { products, total };
}

export function getProductBySlug(slug: string): Product | null {
  const db = getDb();
  const row = db.prepare(`
    SELECT p.*,
           b.name as brand_name, b.slug as brand_slug, b.origin as brand_origin, b.description as brand_desc,
           c.name as category_name, c.slug as category_slug,
           AVG(r.rating) as avg_rating,
           COUNT(r.id) as review_count
    FROM products p
    JOIN categories c ON p.category_id = c.id
    JOIN brands b ON p.brand_id = b.id
    LEFT JOIN reviews r ON r.product_id = p.id AND r.status = 'approved'
    WHERE p.slug = ?
    GROUP BY p.id
  `).get(slug) as any;

  if (!row) return null;
  const product = parseProductRow(row);

  // Get variants
  const variants = db.prepare('SELECT * FROM product_variants WHERE product_id = ?').all(product.id) as any[];
  product.variants = variants;

  return product;
}

export function getProductById(id: string): Product | null {
  const db = getDb();
  const row = db.prepare(`
    SELECT p.*,
           b.name as brand_name, b.slug as brand_slug, b.origin as brand_origin,
           c.name as category_name, c.slug as category_slug,
           AVG(r.rating) as avg_rating,
           COUNT(r.id) as review_count
    FROM products p
    JOIN categories c ON p.category_id = c.id
    JOIN brands b ON p.brand_id = b.id
    LEFT JOIN reviews r ON r.product_id = p.id AND r.status = 'approved'
    WHERE p.id = ?
    GROUP BY p.id
  `).get(id) as any;

  if (!row) return null;
  const product = parseProductRow(row);

  const variants = db.prepare('SELECT * FROM product_variants WHERE product_id = ?').all(product.id) as any[];
  product.variants = variants;

  return product;
}

export function getRelatedProducts(productId: string, categoryId: string, limit = 4): Product[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT p.*,
           b.name as brand_name, b.slug as brand_slug, b.origin as brand_origin,
           c.name as category_name, c.slug as category_slug,
           AVG(r.rating) as avg_rating,
           COUNT(r.id) as review_count
    FROM products p
    JOIN categories c ON p.category_id = c.id
    JOIN brands b ON p.brand_id = b.id
    LEFT JOIN reviews r ON r.product_id = p.id AND r.status = 'approved'
    WHERE p.category_id = ? AND p.id != ? AND p.is_published = 1
    GROUP BY p.id
    ORDER BY p.is_bestseller DESC
    LIMIT ?
  `).all(categoryId, productId, limit) as any[];

  return rows.map(parseProductRow);
}
