import { getDb } from './db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export function seedDatabase() {
  const db = getDb();

  console.log('🌱 Starting database seeding for BAGm Beauty Supply...');

  // 1. Store Settings
  const existingSettings = db.prepare('SELECT id FROM store_settings WHERE id = ?').get('default');
  if (!existingSettings) {
    db.prepare(`
      INSERT INTO store_settings (
        id, store_name, store_tagline, contact_email, contact_phone, whatsapp_number, address_line, store_hours,
        announcement_enabled, announcement_text, announcement_link,
        hero_headline, hero_subtitle, hero_primary_cta_text, hero_primary_cta_link, hero_secondary_cta_text, hero_secondary_cta_link, hero_image_url,
        currency_code, currency_symbol, paystack_public_key, paystack_secret_key, paystack_enabled,
        bank_transfer_enabled, bank_name, bank_account_name, bank_account_number, bank_branch,
        cod_enabled, return_window_days, created_at, updated_at
      ) VALUES (
        'default',
        'BAGm Beauty Supply',
        'Your Beauty. Your Ritual. Your Glow.',
        'support@bagmbeauty.com',
        '+233 24 123 4567',
        '+233 55 987 6543',
        'Lagos Avenue, East Legon, Accra, Ghana',
        'Monday – Saturday: 9:00 AM – 7:00 PM GMT',
        1,
        '✨ Fast & Reliable Express Delivery across Greater Accra & Nationwide Courier Service across Ghana',
        '/shop',
        'Your Beauty. Your Ritual. Your Glow.',
        'Discover beauty and skincare essentials selected to help you build a routine that feels right for you.',
        'Shop Beauty',
        '/shop',
        'Skincare Routine Finder',
        '/routine-finder',
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1600',
        'GHS',
        'GH₵',
        '${process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || ''}',
        '${process.env.PAYSTACK_SECRET_KEY || ''}',
        1,
        1,
        'Ghana Commercial Bank (GCB)',
        'BAGM BEAUTY SUPPLY LTD',
        '1021134567890',
        'East Legon Branch, Accra',
        1,
        7,
        '${new Date().toISOString()}',
        '${new Date().toISOString()}'
      )
    `).run();
  }

  // 2. Admin & Demo Customer
  const adminPasswordHash = bcrypt.hashSync('AdminPassword2026!', 10);
  const customerPasswordHash = bcrypt.hashSync('Password123!', 10);
  const now = new Date().toISOString();

  const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@bagmbeauty.com');
  if (!existingAdmin) {
    db.prepare(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, is_verified, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'admin-001',
      'admin@bagmbeauty.com',
      adminPasswordHash,
      'BAGm',
      'Administrator',
      '+233 24 123 4567',
      'admin',
      1,
      now,
      now
    );
  }

  const existingCustomer = db.prepare('SELECT id FROM users WHERE email = ?').get('customer@example.com');
  let customerId = 'cust-001';
  if (!existingCustomer) {
    db.prepare(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, is_verified, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      customerId,
      'customer@example.com',
      customerPasswordHash,
      'Akosua',
      'Mensah',
      '+233 24 987 6543',
      'customer',
      1,
      now,
      now
    );

    // Add address for demo customer
    db.prepare(`
      INSERT INTO addresses (id, user_id, title, first_name, last_name, phone, street_address, landmark_or_gps, city, region, is_default, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'addr-001',
      customerId,
      'Home',
      'Akosua',
      'Mensah',
      '+233 24 987 6543',
      'House 14, Boundary Road',
      'Near A&C Mall, GA-183-9022',
      'East Legon, Accra',
      'Greater Accra',
      1,
      now
    );
  }

  // 3. Delivery Zones
  const zones = [
    { id: 'zone-accra-central', name: 'Greater Accra Central (Airport, Osu, Cantonments, Ridge, Labone)', region: 'Greater Accra', fee: 35.0, est: 'Same-day or 24 Hours' },
    { id: 'zone-accra-outskirts', name: 'Greater Accra Outskirts (East Legon, Spintex, Tema, Madina, Dansoman)', region: 'Greater Accra', fee: 45.0, est: '24–48 Hours' },
    { id: 'zone-accra-extended', name: 'Greater Accra Extended (Kasoa, Amasaman, Dawhenya, Prampram)', region: 'Greater Accra', fee: 60.0, est: '48 Hours' },
    { id: 'zone-ashanti', name: 'Ashanti Region (Kumasi Metro, KNUST, Ahodwo, Bantama)', region: 'Ashanti', fee: 65.0, est: '48–72 Hours Express Courier' },
    { id: 'zone-western-central', name: 'Western & Central (Takoradi, Cape Coast, Tarkwa)', region: 'Western & Central', fee: 65.0, est: '48–72 Hours Express Courier' },
    { id: 'zone-northern-volta', name: 'Eastern, Volta & Northern Regions (Koforidua, Ho, Tamale, Sunyani)', region: 'Nationwide', fee: 80.0, est: '3–4 Business Days Courier' },
  ];

  for (const z of zones) {
    const exists = db.prepare('SELECT id FROM delivery_zones WHERE id = ?').get(z.id);
    if (!exists) {
      db.prepare(`
        INSERT INTO delivery_zones (id, name, region, fee, estimated_delivery_time, cod_available, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, 1, 1, ?)
      `).run(z.id, z.name, z.region, z.fee, z.est, now);
    }
  }

  // 4. Pickup Locations
  const pickups = [
    {
      id: 'pickup-east-legon',
      name: 'BAGm Beauty Hub — East Legon Flagship',
      address: 'Plot 42 Lagos Avenue, East Legon, Accra (Near Mensvic Grand Hotel)',
      phone: '+233 24 123 4567',
      hours: 'Mon – Sat: 9:00 AM – 7:00 PM',
      instructions: 'Please present your Order Confirmation email or Order Number along with a valid ID upon collection.',
    },
    {
      id: 'pickup-osu',
      name: 'BAGm Collection Partner — Osu Oxford Street',
      address: 'Oxford Street Mall, 1st Floor, Osu, Accra',
      phone: '+233 55 987 6543',
      hours: 'Mon – Sat: 10:00 AM – 8:00 PM, Sun: 1:00 PM – 7:00 PM',
      instructions: 'Ready orders are held securely at our customer service desk for up to 7 business days.',
    },
  ];

  for (const p of pickups) {
    const exists = db.prepare('SELECT id FROM pickup_locations WHERE id = ?').get(p.id);
    if (!exists) {
      db.prepare(`
        INSERT INTO pickup_locations (id, name, address, phone, operating_hours, instructions, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 1, ?)
      `).run(p.id, p.name, p.address, p.phone, p.hours, p.instructions, now);
    }
  }

  // 5. Categories
  const categories = [
    {
      id: 'cat-skincare',
      name: 'Skincare',
      slug: 'skincare',
      description: 'Comprehensive solutions for radiant, resilient, and well-nourished skin.',
      image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800',
      display_order: 1,
    },
    {
      id: 'cat-facial-care',
      name: 'Facial Care',
      slug: 'facial-care',
      description: 'Cleansers, toners, hydration essences, and advanced facial treatments.',
      image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800',
      display_order: 2,
    },
    {
      id: 'cat-makeup',
      name: 'Makeup',
      slug: 'makeup',
      description: 'High-performance complexion makeup, lip glosses, and precision application accessories.',
      image_url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=800',
      display_order: 3,
    },
    {
      id: 'cat-body-care',
      name: 'Body Care',
      slug: 'body-care',
      description: 'Deeply moisturizing body creams, raw unrefined shea butters, and restorative body oils.',
      image_url: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&q=80&w=800',
      display_order: 4,
    },
    {
      id: 'cat-body-lotions',
      name: 'Body Lotions and Creams',
      slug: 'body-lotions-and-creams',
      description: 'Silky, hydrating creams and rich body butter soufflés for long-lasting glow.',
      image_url: 'https://images.unsplash.com/photo-1608248597359-07eb7ebc4391?auto=format&fit=crop&q=80&w=800',
      display_order: 5,
    },
    {
      id: 'cat-body-splashes',
      name: 'Body Splashes and Sprays',
      slug: 'body-splashes-and-sprays',
      description: 'Enchanting scented mists, hydrating face & body splashes, and delicate fragrances.',
      image_url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800',
      display_order: 6,
    },
    {
      id: 'cat-serums',
      name: 'Serums and Treatments',
      slug: 'serums-and-treatments',
      description: 'Targeted actives, antioxidant serums, exfoliating solutions, and barrier support.',
      image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800',
      display_order: 7,
    },
    {
      id: 'cat-sun-protection',
      name: 'Sun Protection',
      slug: 'sun-protection',
      description: 'Broad-spectrum invisible sunscreens formulated to leave zero white cast on melanin-rich skin.',
      image_url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=800',
      display_order: 8,
    },
  ];

  for (const c of categories) {
    const exists = db.prepare('SELECT id FROM categories WHERE id = ?').get(c.id);
    if (!exists) {
      db.prepare(`
        INSERT INTO categories (id, name, slug, description, image_url, display_order, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 1, ?)
      `).run(c.id, c.name, c.slug, c.description, c.image_url, c.display_order, now);
    }
  }

  // 6. Brands
  const brands = [
    {
      id: 'brand-bagm',
      name: 'BAGm Signature',
      slug: 'bagm-signature',
      origin: 'BAGm',
      description: 'BAGm Beauty’s in-house luxury line, pairing potent active ingredients with sustainably sourced Ghanaian botanicals.',
      logo_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=300',
      website_url: 'https://bagmbeauty.com',
      is_featured: 1,
    },
    {
      id: 'brand-nokware',
      name: 'Nokware Skincare',
      slug: 'nokware-skincare',
      origin: 'Ghanaian',
      description: '100% natural, ethical skincare handcrafted in Ghana using organic shea butter, herbs, and cold-pressed African oils.',
      logo_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=300',
      website_url: 'https://nokwareskincare.com',
      is_featured: 1,
    },
    {
      id: 'brand-skin-gourmet',
      name: 'Skin Gourmet',
      slug: 'skin-gourmet',
      origin: 'Ghanaian',
      description: 'Raw, handmade, organic skincare sourced from sustainable Ghanaian farmers. Free from synthetic chemicals and preservatives.',
      logo_url: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&q=80&w=300',
      website_url: 'https://skingourmet.com',
      is_featured: 1,
    },
    {
      id: 'brand-kaeme',
      name: 'Kaeme',
      slug: 'kaeme',
      origin: 'Ghanaian',
      description: 'Luxurious handmade shea butter soufflés and liquid black soaps infused with irresistible signature scents from Accra.',
      logo_url: 'https://images.unsplash.com/photo-1608248597359-07eb7ebc4391?auto=format&fit=crop&q=80&w=300',
      website_url: 'https://kaeme.com',
      is_featured: 1,
    },
    {
      id: 'brand-the-ordinary',
      name: 'The Ordinary',
      slug: 'the-ordinary',
      origin: 'International',
      description: 'Clinical skincare formulations with integrity, providing targeted active ingredients at transparent price points.',
      logo_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=300',
      website_url: 'https://theordinary.com',
      is_featured: 1,
    },
    {
      id: 'brand-cerave',
      name: 'CeraVe',
      slug: 'cerave',
      origin: 'International',
      description: 'Dermatologist-developed skincare formulated with 3 essential ceramides (1, 3, 6-II) to restore the natural skin barrier.',
      logo_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=300',
      website_url: 'https://cerave.com',
      is_featured: 1,
    },
    {
      id: 'brand-laroche',
      name: 'La Roche-Posay',
      slug: 'la-roche-posay',
      origin: 'International',
      description: 'French dermatological skincare enriched with antioxidant Thermal Spring Water, recommended by over 90,000 dermatologists.',
      logo_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=300',
      website_url: 'https://laroche-posay.com',
      is_featured: 1,
    },
    {
      id: 'brand-cosrx',
      name: 'COSRX',
      slug: 'cosrx',
      origin: 'International',
      description: 'High-efficacy Korean skincare utilizing gentle yet potent ingredients like snail mucin, propolis, and centella asiatica.',
      logo_url: 'https://images.unsplash.com/photo-1608248597359-07eb7ebc4391?auto=format&fit=crop&q=80&w=300',
      website_url: 'https://cosrx.com',
      is_featured: 1,
    },
    {
      id: 'brand-fenty-skin',
      name: 'Fenty Skin',
      slug: 'fenty-skin',
      origin: 'International',
      description: 'Clean, multi-tasking, earth-conscious skincare designed to prep and brighten every skin tone seamlessly.',
      logo_url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=300',
      website_url: 'https://fentybeauty.com',
      is_featured: 1,
    },
    {
      id: 'brand-paulas-choice',
      name: 'Paula’s Choice',
      slug: 'paulas-choice',
      origin: 'International',
      description: 'Smart, safe, and science-backed skincare formulations focusing on chemical exfoliation and visible pore refinement.',
      logo_url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=300',
      website_url: 'https://paulaschoice.com',
      is_featured: 0,
    },
  ];

  for (const b of brands) {
    const exists = db.prepare('SELECT id FROM brands WHERE id = ?').get(b.id);
    if (!exists) {
      db.prepare(`
        INSERT INTO brands (id, name, slug, origin, description, logo_url, website_url, is_featured, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(b.id, b.name, b.slug, b.origin, b.description, b.logo_url, b.website_url, b.is_featured, now);
    }
  }

  // 7. Products
  const products = [
    {
      id: 'prod-bagm-peptide-cream',
      sku: 'BAGM-CR-001',
      name: 'BAGm Silk Barrier Peptide Cream 50ml',
      slug: 'bagm-silk-barrier-peptide-cream-50ml',
      brand_id: 'brand-bagm',
      category_id: 'cat-skincare',
      description: 'An ultra-nourishing, lightweight barrier restorative cream enriched with multi-peptides, Ghanaian baobab seed oil, and plant ceramides. Delivers 24-hour deep hydration while soothing sensitivity and reinforcing skin elasticity.',
      price: 340.0,
      cost_price: 180.0,
      images: [
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800',
      ],
      ingredients: 'Water/Aqua, Adansonia Digitata (Baobab) Seed Oil, Butyrospermum Parkii (Shea) Butter, Caprylic/Capric Triglyceride, Palmitoyl Tripeptide-1, Palmitoyl Tetrapeptide-7, Ceramide NP, Squalane, Niacinamide, Sodium Hyaluronate, Tocopherol (Vitamin E), Phenoxyethanol, Ethylhexylglycerin.',
      benefits: [
        'Deeply restores compromised lipid skin barriers',
        'Improves elasticity and smooths fine texture',
        'Non-greasy, velvety finish suitable for humid climates',
        'Rich in antioxidant baobab oil and calming ceramides',
      ],
      directions_for_use: 'Warm a dime-sized amount between fingertips and gently press into cleansed face and neck every morning and evening after applying serums.',
      suitable_skin_types: ['dry', 'combination', 'normal', 'sensitive', 'all'],
      relevant_concerns: ['dryness', 'aging', 'hydration', 'uneven_tone'],
      stock_quantity: 45,
      low_stock_threshold: 8,
      stock_status: 'in_stock',
      is_published: 1,
      is_featured: 1,
      is_bestseller: 1,
      is_new_arrival: 1,
    },
    {
      id: 'prod-bagm-radiance-essence',
      sku: 'BAGM-ES-002',
      name: 'BAGm Botanical Radiance Glow Essence 120ml',
      slug: 'bagm-botanical-radiance-glow-essence-120ml',
      brand_id: 'brand-bagm',
      category_id: 'cat-facial-care',
      description: 'A dual-action hydration essence formulated with fermented rice filtrate, hibiscus flower extract, licorice root, and 3% niacinamide. Refines pores and imparts an unmistakable luminous Ghanaian glow.',
      price: 280.0,
      cost_price: 140.0,
      images: [
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800',
      ],
      ingredients: 'Saccharomyces/Rice Ferment Filtrate, Aqua, Glycerin, Niacinamide, Hibiscus Sabdariffa Flower Extract, Glycyrrhiza Glabra (Licorice) Root Extract, Sodium Hyaluronate, Panthenol, Allantoin, Citric Acid.',
      benefits: [
        'Boosts cellular hydration and immediate suppleness',
        'Target hyperpigmentation and uneven complexion',
        'Preps skin to absorb moisturizers and serums more efficiently',
      ],
      directions_for_use: 'Pour 4–5 drops onto palms and pat evenly over clean face and neck until absorbed. Use daily morning and night.',
      suitable_skin_types: ['oily', 'dry', 'combination', 'normal', 'sensitive', 'all'],
      relevant_concerns: ['uneven_tone', 'dryness', 'hydration', 'pores'],
      stock_quantity: 60,
      low_stock_threshold: 10,
      stock_status: 'in_stock',
      is_published: 1,
      is_featured: 1,
      is_bestseller: 1,
      is_new_arrival: 0,
    },
    {
      id: 'prod-cerave-hydrating-cleanser',
      sku: 'CER-CL-001',
      name: 'CeraVe Hydrating Facial Cleanser (Normal to Dry Skin)',
      slug: 'cerave-hydrating-facial-cleanser',
      brand_id: 'brand-cerave',
      category_id: 'cat-facial-care',
      description: 'A gentle, non-foaming lotion cleanser formulated with 3 essential ceramides and hyaluronic acid that cleanses without disrupting the skin’s natural protective barrier.',
      price: 220.0,
      cost_price: 135.0,
      images: [
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800',
      ],
      ingredients: 'Aqua/Water, Glycerin, Cetearyl Alcohol, Peg-40 Stearate, Stearyl Alcohol, Potassium Phosphate, Ceramide NP, Ceramide AP, Ceramide EOP, Carbomer, Glyceryl Stearate, Behentrimonium Methosulfate, Sodium Lauroyl Lactylate, Sodium Hyaluronate, Cholesterol, Phenoxyethanol, Disodium Edta, Dipotassium Phosphate, Tocopherol, Phytosphingosine, Xanthan Gum, Ethylhexylglycerin.',
      benefits: [
        'MVE Delivery Technology for controlled, all-day hydration',
        'Non-comedogenic, non-irritating and fragrance-free',
        'Removes dirt, light makeup and impurities without tight after-feel',
      ],
      directions_for_use: 'Wet skin with lukewarm water. Massage cleanser into skin in a gentle, circular motion. Rinse thoroughly.',
      suitable_skin_types: ['dry', 'normal', 'sensitive'],
      relevant_concerns: ['dryness', 'hydration'],
      stock_quantity: 32,
      low_stock_threshold: 6,
      stock_status: 'in_stock',
      is_published: 1,
      is_featured: 1,
      is_bestseller: 1,
      is_new_arrival: 0,
    },
    {
      id: 'prod-cerave-foaming-cleanser',
      sku: 'CER-CL-002',
      name: 'CeraVe Foaming Facial Cleanser (Normal to Oily Skin)',
      slug: 'cerave-foaming-facial-cleanser',
      brand_id: 'brand-cerave',
      category_id: 'cat-facial-care',
      description: 'A refreshing gel-to-foam cleanser with niacinamide and ceramides that effectively purifies pores, clears excess sebum, and refreshes skin without overdrying.',
      price: 230.0,
      cost_price: 140.0,
      images: [
        'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800',
      ],
      ingredients: 'Aqua/Water, Cocamidopropyl Hydroxysultaine, Glycerin, Sodium Lauroyl Sarcosinate, Peg-150 Pentaerythrityl Tetrastearate, Niacinamide, Peg-6 Caprylic/Capric Glycerides, Sodium Methyl Cocoyl Taurate, Propylene Glycol, Ceramide NP, Ceramide AP, Ceramide EOP, Carbomer, Methylparaben, Sodium Chloride, Sodium Lauroyl Lactylate, Cholesterol, Disodium Edta, Propylparaben, Citric Acid, Tetrasodium Edta, Hydrolyzed Hyaluronic Acid, Phytosphingosine, Xanthan Gum.',
      benefits: [
        'Dispels excess sebum and shine without stripping skin moisture',
        'Contains niacinamide to soothe and comfort reactive skin',
        'Fragrance-free and non-comedogenic',
      ],
      directions_for_use: 'Dispense one pump into damp hands, lather gently over wet face, and rinse cleanly with water.',
      suitable_skin_types: ['oily', 'combination', 'normal'],
      relevant_concerns: ['excess_oil', 'blemishes', 'pores'],
      stock_quantity: 28,
      low_stock_threshold: 5,
      stock_status: 'in_stock',
      is_published: 1,
      is_featured: 0,
      is_bestseller: 1,
      is_new_arrival: 0,
    },
    {
      id: 'prod-ordinary-niacinamide',
      sku: 'ORD-SR-001',
      name: 'The Ordinary Niacinamide 10% + Zinc 1% 30ml',
      slug: 'the-ordinary-niacinamide-10-zinc-1-30ml',
      brand_id: 'brand-the-ordinary',
      category_id: 'cat-serums',
      description: 'A high-strength vitamin and mineral blemish formula that visibly regulates sebum activity, reduces the look of enlarged pores, and enhances overall skin clarity.',
      price: 160.0,
      cost_price: 90.0,
      images: [
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800',
      ],
      ingredients: 'Aqua (Water), Niacinamide, Pentylene Glycol, Zinc PCA, Dimethyl Isosorbide, Tamarindus Indica Seed Gum, Xanthan Gum, Isoceteth-20, Ethoxydiglycol, Phenoxyethanol, Chlorphenesin.',
      benefits: [
        'Visibly reduces surface shine and controls excess sebum',
        'Improves uneven skin tone and appearance of pores',
        'Lightweight, fast-absorbing water-based serum',
      ],
      directions_for_use: 'Apply a few drops to entire face morning and evening before heavier creams. Do not combine in the same routine with pure Vitamin C (L-Ascorbic Acid).',
      suitable_skin_types: ['oily', 'combination', 'normal', 'sensitive'],
      relevant_concerns: ['excess_oil', 'blemishes', 'uneven_tone', 'pores'],
      stock_quantity: 50,
      low_stock_threshold: 10,
      stock_status: 'in_stock',
      is_published: 1,
      is_featured: 1,
      is_bestseller: 1,
      is_new_arrival: 0,
    },
    {
      id: 'prod-ordinary-hyaluronic',
      sku: 'ORD-SR-002',
      name: 'The Ordinary Hyaluronic Acid 2% + B5 30ml',
      slug: 'the-ordinary-hyaluronic-acid-2-b5-30ml',
      brand_id: 'brand-the-ordinary',
      category_id: 'cat-serums',
      description: 'A water-based hydration formula combining low, medium, and high-molecular-weight hyaluronic acid with vitamin B5 for multi-depth plumping hydration.',
      price: 175.0,
      cost_price: 95.0,
      images: [
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800',
      ],
      ingredients: 'Aqua (Water), Sodium Hyaluronate, Propanediol, Panthenol, Ahnfeltia Concinna Extract, Glycerin, Trisodium Ethylenediamine Disuccinate, Citric Acid, Isoceteth-20, Ethoxydiglycol, Ethylhexylglycerin, Hexylene Glycol, 1,2-Hexanediol, Phenoxyethanol, Caprylyl Glycol.',
      benefits: [
        'Instantly quenches dehydrated skin layers',
        'Enhances skin barrier resilience with Pro-Vitamin B5',
        'Leaves skin feeling soft, supple, and comfortably plump',
      ],
      directions_for_use: 'Apply a few drops to clean, slightly damp skin in the morning and evening prior to applying oils and moisturizers.',
      suitable_skin_types: ['dry', 'combination', 'normal', 'sensitive', 'all'],
      relevant_concerns: ['dryness', 'hydration'],
      stock_quantity: 40,
      low_stock_threshold: 8,
      stock_status: 'in_stock',
      is_published: 1,
      is_featured: 0,
      is_bestseller: 1,
      is_new_arrival: 0,
    },
    {
      id: 'prod-ordinary-glycolic',
      sku: 'ORD-TN-003',
      name: 'The Ordinary Glycolic Acid 7% Exfoliating Toner 240ml',
      slug: 'the-ordinary-glycolic-acid-7-exfoliating-toner-240ml',
      brand_id: 'brand-the-ordinary',
      category_id: 'cat-facial-care',
      description: 'An alpha hydroxy acid (AHA) toner that gently exfoliates skin surface to boost clarity, even out textural irregularities, and promote luminous skin tone.',
      price: 210.0,
      cost_price: 120.0,
      images: [
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800',
      ],
      ingredients: 'Aqua (Water), Glycolic Acid, Rosa Damascena Flower Water, Centaurea Cyanus Flower Water, Aloe Barbadensis Leaf Water, Propanediol, Glycerin, Triethanolamine, Aminomethyl Propanol, Panax Ginseng Root Extract, Tasmannia Lanceolata Fruit/Leaf Extract, Aspartic Acid, Alanine, Glycine, Serine, Valine, Isoleucine, Proline, Threonine, Histidine, Phenylalanine, Glutamic Acid, Arginine, Pca, Sodium Pca, Sodium Lactate, Fructose, Glucose, Sucrose, Urea, Hexyl Nicotinate, Dextrin, Citric Acid, Polysorbate 20, Gellan Gum, Trisodium Ethylenediamine Disuccinate, Sodium Chloride, Potassium Sorbate, Sodium Benzoate, 1,2-Hexanediol, Caprylyl Glycol.',
      benefits: [
        'Improves visible skin radiance and smooth texture',
        'Contains Tasmanian Pepperberry derivative to soothe post-exfoliation',
        'Versatile for facial use and body exfoliation (underarms, knees, elbows)',
      ],
      directions_for_use: 'Use ideally in the evening, no more frequently than once daily. After cleaning, saturate a cotton pad and sweep across face and neck avoiding eye contour. Always use sunscreen during the day.',
      suitable_skin_types: ['oily', 'combination', 'normal'],
      relevant_concerns: ['uneven_tone', 'blemishes', 'pores'],
      stock_quantity: 25,
      low_stock_threshold: 5,
      stock_status: 'in_stock',
      is_published: 1,
      is_featured: 0,
      is_bestseller: 1,
      is_new_arrival: 0,
    },
    {
      id: 'prod-laroche-anthelios',
      sku: 'LRP-SPF-001',
      name: 'La Roche-Posay Anthelios UVMune 400 Invisible Fluid SPF 50+ 50ml',
      slug: 'la-roche-posay-anthelios-uvmune-400-invisible-fluid-spf-50',
      brand_id: 'brand-laroche',
      category_id: 'cat-sun-protection',
      description: 'The gold standard in broad-spectrum sun protection featuring the breakthrough Mexoryl 400 filter. Ultra-light, invisible texture that absorbs completely with zero white cast or greasy residue on dark and melanin-rich skin tones.',
      price: 320.0,
      cost_price: 190.0,
      images: [
        'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=800',
      ],
      ingredients: 'Aqua/Water, Alcohol Denat., Triethyl Citrate, Diisopropyl Sebacate, Silica, Ethylhexyl Salicylate, Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine, Ethylhexyl Triazone, Butyl Methoxydibenzoylmethane, Glycerin, Propanediol, C12-22 Alkyl Acrylate/Hydroxyethylacrylate Copolymer, Methoxypropylamino Cyclohexenylidene Ethoxyethylcyanoacetate, Perlite, Tocopherol, Caprylic/Capric Triglyceride, Acrylates/C10-30 Alkyl Acrylate Crosspolymer, Caprylyl Glycol, Hydroxyethylcellulose, Terephthalylidene Dicamphor Sulfonic Acid, Triethanolamine, Trisodium Ethylenediamine Disuccinate.',
      benefits: [
        'Complete protection against ultra-long UVA rays (up to 400nm)',
        'Very high water, sweat, and sand resistance',
        '100% invisible on brown and black skin with no white cast',
      ],
      directions_for_use: 'Shake vigorously before use. Apply liberally to face and neck 15 minutes before sun exposure. Reapply at least every 2 hours or after 80 minutes of swimming/sweating.',
      suitable_skin_types: ['oily', 'dry', 'combination', 'normal', 'sensitive', 'all'],
      relevant_concerns: ['uneven_tone', 'aging', 'hydration'],
      stock_quantity: 35,
      low_stock_threshold: 7,
      stock_status: 'in_stock',
      is_published: 1,
      is_featured: 1,
      is_bestseller: 1,
      is_new_arrival: 0,
    },
    {
      id: 'prod-cosrx-snail-essence',
      sku: 'COS-ES-001',
      name: 'COSRX Advanced Snail 96 Mucin Power Essence 100ml',
      slug: 'cosrx-advanced-snail-96-mucin-power-essence-100ml',
      brand_id: 'brand-cosrx',
      category_id: 'cat-facial-care',
      description: 'Formulated with 96.3% snail secretion filtrate, this lightweight essence deeply hydrates, repairs compromised skin barriers, and soothes irritation for a bouncy, supple glass-skin finish.',
      price: 260.0,
      cost_price: 145.0,
      images: [
        'https://images.unsplash.com/photo-1608248597359-07eb7ebc4391?auto=format&fit=crop&q=80&w=800',
      ],
      ingredients: 'Snail Secretion Filtrate, Betaine, Butylene Glycol, 1,2-Hexanediol, Sodium Polyacrylate, Phenoxyethanol, Sodium Hyaluronate, Allantoin, Ethyl Hexanediol, Carbomer, Panthenol, Arginine.',
      benefits: [
        '96.3% Snail Mucin soothes redness and repairs damaged skin',
        'Restores healthy moisture levels without clogging pores',
        'Softens dry patches and reduces post-acne dark marks',
      ],
      directions_for_use: 'After cleansing and toning, apply a dime-sized amount to entire face. Gently pat using fingertips to aid absorption, then follow with your moisturizer.',
      suitable_skin_types: ['dry', 'combination', 'normal', 'sensitive', 'oily', 'all'],
      relevant_concerns: ['dryness', 'hydration', 'blemishes', 'uneven_tone'],
      stock_quantity: 42,
      low_stock_threshold: 8,
      stock_status: 'in_stock',
      is_published: 1,
      is_featured: 1,
      is_bestseller: 1,
      is_new_arrival: 0,
    },
    {
      id: 'prod-nokware-body-butter',
      sku: 'NOK-BB-001',
      name: 'Nokware Shea & Baobab Nourishing Body Butter 200g',
      slug: 'nokware-shea-baobab-nourishing-body-butter-200g',
      brand_id: 'brand-nokware',
      category_id: 'cat-body-care',
      description: 'Ethically crafted in Ghana using 100% pure organic Northern shea butter whipped with cold-pressed baobab oil and calming sweet almond essence. Melts effortlessly into the skin for 48-hour velvety softness.',
      price: 150.0,
      cost_price: 75.0,
      images: [
        'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&q=80&w=800',
      ],
      ingredients: 'Unrefined Butyrospermum Parkii (Shea) Butter, Adansonia Digitata (Baobab) Seed Oil, Prunus Amygdalus Dulcis (Sweet Almond) Oil, Cocos Nucifera (Coconut) Oil, Tocopherol (Vitamin E), Natural Essential Oil Fragrance Blend.',
      benefits: [
        'Whipped airy texture that absorbs quickly without sticky residue',
        'Soothes dry, cracked, or ashy skin in all weather conditions',
        'Supports Ghanaian women shea cooperatives with fair wages',
      ],
      directions_for_use: 'Scoop a generous amount and massage lovingly into warm, damp skin straight after your bath or shower.',
      suitable_skin_types: ['dry', 'combination', 'normal', 'sensitive', 'all'],
      relevant_concerns: ['dryness', 'hydration'],
      stock_quantity: 55,
      low_stock_threshold: 10,
      stock_status: 'in_stock',
      is_published: 1,
      is_featured: 1,
      is_bestseller: 1,
      is_new_arrival: 1,
    },
    {
      id: 'prod-kaeme-shea-souffle',
      sku: 'KAE-BB-001',
      name: 'Kaeme Eternal Glow Scented Shea Butter Soufflé 250ml',
      slug: 'kaeme-eternal-glow-scented-shea-butter-souffle-250ml',
      brand_id: 'brand-kaeme',
      category_id: 'cat-body-lotions',
      description: 'Handmade in Accra, Kaeme’s signature whipped shea butter soufflé is infused with unrefined coconut oil and a luminous amber vanilla fragrance that lingers enchantingly all day long.',
      price: 190.0,
      cost_price: 95.0,
      images: [
        'https://images.unsplash.com/photo-1608248597359-07eb7ebc4391?auto=format&fit=crop&q=80&w=800',
      ],
      ingredients: 'Pure Ghanaian Butyrospermum Parkii (Shea Butter), Cocos Nucifera (Coconut Oil), Helianthus Annuus (Sunflower Seed Oil), Kaeme Signature Fragrance Blend, Tocopherol.',
      benefits: [
        'Air-whipped soufflé consistency that melts instantly on contact',
        'Intensely hydrates and locks in body moisture',
        'Signature luxury long-lasting fragrance notes',
      ],
      directions_for_use: 'Massage thoroughly over entire body, focusing on dry areas like elbows, heels, and arms.',
      suitable_skin_types: ['dry', 'normal', 'combination'],
      relevant_concerns: ['dryness', 'hydration'],
      stock_quantity: 30,
      low_stock_threshold: 5,
      stock_status: 'in_stock',
      is_published: 1,
      is_featured: 1,
      is_bestseller: 1,
      is_new_arrival: 0,
    },
    {
      id: 'prod-bagm-golden-nectar-mist',
      sku: 'BAGM-SP-003',
      name: 'BAGm Golden Nectar Shimmering Body Mist 150ml',
      slug: 'bagm-golden-nectar-shimmering-body-mist-150ml',
      brand_id: 'brand-bagm',
      category_id: 'cat-body-splashes',
      description: 'A decadent body splash and fragrance mist featuring sparkling golden shimmer pearls with notes of warm vanilla, wild honey blossom, and toasted coconut.',
      price: 210.0,
      cost_price: 95.0,
      images: [
        'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800',
      ],
      ingredients: 'Alcohol Denat., Aqua (Water), Glycerin, Fragrance (Parfum), Mica, Titanium Dioxide, Iron Oxides, Aloe Barbadensis Leaf Juice, Ethylhexylglycerin.',
      benefits: [
        'Imparts a sun-kissed luminous bronze shimmer to collarbones and legs',
        'Long-lasting sweet warm botanical aroma',
        'Formulated with soothing aloe and glycerin',
      ],
      directions_for_use: 'Shake well to disperse the golden pearl pigments. Mist generously over body, arms, and décolletage from 6 inches away.',
      suitable_skin_types: ['all', 'normal', 'dry', 'combination', 'oily'],
      relevant_concerns: ['dryness'],
      stock_quantity: 48,
      low_stock_threshold: 8,
      stock_status: 'in_stock',
      is_published: 1,
      is_featured: 1,
      is_bestseller: 0,
      is_new_arrival: 1,
    },
    {
      id: 'prod-bagm-rosewater-splash',
      sku: 'BAGM-SP-004',
      name: 'BAGm Rosewater Hydrating Face & Body Splash 200ml',
      slug: 'bagm-rosewater-hydrating-face-body-splash-200ml',
      brand_id: 'brand-bagm',
      category_id: 'cat-body-splashes',
      description: 'Pure distilled Damask rose water infused with hydrating glycerin and cucumber fruit extract. An invigorating cooling mist to refresh skin throughout warm sunny days.',
      price: 180.0,
      cost_price: 80.0,
      images: [
        'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800',
      ],
      ingredients: 'Rosa Damascena Flower Water, Aqua, Cucumis Sativus (Cucumber) Fruit Extract, Glycerin, Sodium PCA, Panthenol, Phenoxyethanol, Ethylhexylglycerin.',
      benefits: [
        'Instantly revives tired, dehydrated skin',
        'Can be used as a makeup setting spray or post-sun soother',
        '100% alcohol-free and soothing for sensitive skin',
      ],
      directions_for_use: 'Close eyes and mist evenly over face and neck anytime skin needs hydration or a refreshing sensory lift.',
      suitable_skin_types: ['all', 'dry', 'sensitive', 'oily', 'combination', 'normal'],
      relevant_concerns: ['hydration', 'dryness'],
      stock_quantity: 40,
      low_stock_threshold: 6,
      stock_status: 'in_stock',
      is_published: 1,
      is_featured: 0,
      is_bestseller: 0,
      is_new_arrival: 1,
    },
    {
      id: 'prod-fenty-hydra-vizor',
      sku: 'FEN-SPF-001',
      name: 'Fenty Skin Hydra Vizor Invisible Moisturizer Broad Spectrum SPF 30 50ml',
      slug: 'fenty-skin-hydra-vizor-invisible-moisturizer-spf-30',
      brand_id: 'brand-fenty-skin',
      category_id: 'cat-sun-protection',
      description: 'A 2-in-1 daily moisturizer with broad-spectrum SPF 30 sun protection that is completely invisible on all skin tones, plays flawlessly under makeup, and delivers juicy hydration.',
      price: 460.0,
      cost_price: 290.0,
      images: [
        'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=800',
      ],
      ingredients: 'Avobenzone 3%, Homosalate 9%, Octisalate 4.5%, Water, Glycerin, Carthamus Tinctorius (Safflower) Oleosomes, Pentylene Glycol, Niacinamide, Butylene Glycol, Kalahari Melon Seed Oil, Sodium Hyaluronate, Aloe Barbadensis Leaf Juice, Fragrance.',
      benefits: [
        'Kalahari Melon seed oil delivers rich antioxidants',
        'Niacinamide fights dark spots and shine',
        'Refillable packaging designed for eco-conscious beauty',
      ],
      directions_for_use: 'Apply 1-2 pumps onto clean face and neck in the morning before sun exposure and makeup application.',
      suitable_skin_types: ['dry', 'combination', 'normal', 'oily', 'all'],
      relevant_concerns: ['hydration', 'uneven_tone', 'dryness', 'pores'],
      stock_quantity: 18,
      low_stock_threshold: 4,
      stock_status: 'in_stock',
      is_published: 1,
      is_featured: 1,
      is_bestseller: 1,
      is_new_arrival: 0,
    },
    {
      id: 'prod-paulas-choice-bha',
      sku: 'PC-EX-001',
      name: 'Paula’s Choice Skin Perfecting 2% BHA Liquid Exfoliant 118ml',
      slug: 'paulas-choice-skin-perfecting-2-bha-liquid-exfoliant-118ml',
      brand_id: 'brand-paulas-choice',
      category_id: 'cat-serums',
      description: 'A global cult-favorite gentle leave-on exfoliant with 2% Salicylic Acid that unclogs pores, smooths wrinkles, and evens skin tone.',
      price: 390.0,
      cost_price: 240.0,
      images: [
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800',
      ],
      ingredients: 'Water (Aqua), Methylpropanediol, Butylene Glycol, Salicylic Acid, Polysorbate 20, Camellia Oleifera (Green Tea) Leaf Extract, Sodium Hydroxide, Tetrasodium EDTA.',
      benefits: [
        'Dissolves dead skin cell buildup inside pore lining',
        'Dramatically reduces blackheads and breakout frequency',
        'Green tea extract delivers antioxidant defense',
      ],
      directions_for_use: 'Gently apply using fingers or a cotton pad over entire face and neck after cleansing and toning. Do not rinse. Start using 2–3 nights per week.',
      suitable_skin_types: ['oily', 'combination', 'normal'],
      relevant_concerns: ['blemishes', 'pores', 'excess_oil', 'uneven_tone'],
      stock_quantity: 22,
      low_stock_threshold: 5,
      stock_status: 'in_stock',
      is_published: 1,
      is_featured: 1,
      is_bestseller: 1,
      is_new_arrival: 0,
    },
    {
      id: 'prod-bagm-blending-sponges',
      sku: 'BAGM-AC-005',
      name: 'BAGm Precision Velvet Dual-Ended Beauty Sponge Duo',
      slug: 'bagm-precision-velvet-dual-ended-beauty-sponge-duo',
      brand_id: 'brand-bagm',
      category_id: 'cat-makeup',
      description: 'Ultra-soft, latex-free beauty blending sponges designed with precision flat edges and rounded contours for seamless liquid foundation, concealer, and powder application.',
      price: 85.0,
      cost_price: 35.0,
      images: [
        'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=800',
      ],
      ingredients: 'Hydrophilic Polyurethane (Latex-Free, Cruelty-Free, Hypoallergenic).',
      benefits: [
        'Expands to double its size when wet for an airbrushed finish',
        'Absorbs minimal product to prevent foundation waste',
        'Precision tip reaches crevices around eyes and nose effortlessly',
      ],
      directions_for_use: 'Wet thoroughly with water and squeeze out excess in a towel. Bounce gently across skin to blend complexion makeup.',
      suitable_skin_types: ['all', 'dry', 'oily', 'combination', 'normal', 'sensitive'],
      relevant_concerns: [],
      stock_quantity: 75,
      low_stock_threshold: 15,
      stock_status: 'in_stock',
      is_published: 1,
      is_featured: 0,
      is_bestseller: 0,
      is_new_arrival: 1,
    },
  ];

  for (const p of products) {
    const exists = db.prepare('SELECT id FROM products WHERE id = ?').get(p.id);
    if (!exists) {
      db.prepare(`
        INSERT INTO products (
          id, sku, name, slug, brand_id, category_id, description, price, cost_price, images, ingredients, benefits,
          directions_for_use, suitable_skin_types, relevant_concerns, stock_quantity, low_stock_threshold,
          stock_status, is_published, is_featured, is_bestseller, is_new_arrival, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?
        )
      `).run(
        p.id,
        p.sku,
        p.name,
        p.slug,
        p.brand_id,
        p.category_id,
        p.description,
        p.price,
        p.cost_price,
        JSON.stringify(p.images),
        p.ingredients,
        JSON.stringify(p.benefits),
        p.directions_for_use,
        JSON.stringify(p.suitable_skin_types),
        JSON.stringify(p.relevant_concerns),
        p.stock_quantity,
        p.low_stock_threshold,
        p.stock_status,
        p.is_published,
        p.is_featured,
        p.is_bestseller,
        p.is_new_arrival,
        now,
        now
      );

      // Record initial stock movement
      db.prepare(`
        INSERT INTO stock_movements (id, product_id, quantity_change, type, performed_by, stock_before, stock_after, reason, created_at)
        VALUES (?, ?, ?, 'restock', 'admin-001', 0, ?, 'Initial inventory stock setup', ?)
      `).run(crypto.randomUUID(), p.id, p.stock_quantity, p.stock_quantity, now);
    }
  }

  // 8. Suppliers
  const suppliers = [
    { id: 'sup-bagm-lab', name: 'BAGm Botanical Labs Ghana', contact_person: 'Nana Yaa Boateng', email: 'lab@bagmbeauty.com', phone: '+233 24 445 5667', address: 'Spintex Road, Accra' },
    { id: 'sup-nokware', name: 'Nokware Skincare Ghana Ltd', contact_person: 'Thutu', email: 'sales@nokwareskincare.com', phone: '+233 50 123 4567', address: 'North Dzorwulu, Accra' },
    { id: 'sup-intl-beauty', name: 'Atlantic Beauty Logistics International', contact_person: 'David Cole', email: 'orders@atlanticbeautylogistics.com', phone: '+44 20 7946 0991', address: 'London, UK' },
  ];

  for (const s of suppliers) {
    const exists = db.prepare('SELECT id FROM suppliers WHERE id = ?').get(s.id);
    if (!exists) {
      db.prepare(`
        INSERT INTO suppliers (id, name, contact_person, email, phone, address, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'Approved primary supplier', ?)
      `).run(s.id, s.name, s.contact_person, s.email, s.phone, s.address, now);
    }
  }

  // 9. Editorial Articles
  const articles = [
    {
      id: 'art-morning-routine',
      title: 'How to Build a Consistent Morning Skincare Routine in Ghana’s Climate',
      slug: 'how-to-build-a-consistent-morning-skincare-routine-in-ghanas-climate',
      excerpt: 'Mastering lightweight hydration and broad-spectrum sun protection designed specifically for West Africa’s warm and humid weather.',
      category: 'Skincare Rituals',
      cover_image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=1200',
      author: 'BAGm Beauty Editorial',
      read_time: '4 min read',
      content: `
Living in Ghana means our skin faces intense sunshine, humidity, and atmospheric dust. Building an effective morning routine doesn't require ten complicated steps — it requires targeted, lightweight formulations that protect and nourish without feeling heavy.

### Step 1: Gentle Cleansing
Start with a non-stripping cleanser like CeraVe Hydrating Cleanser or a mild foaming gel. The goal in the morning is to remove overnight sebum and sweat without compromising your natural moisture mantle.

### Step 2: Hydrating Botanical Essence
Before your skin dries completely, pat in a water-based essence like the **BAGm Botanical Radiance Glow Essence**. Hyaluronic acid and fermented botanical extracts bind moisture directly into skin cells, preventing dehydration caused by air conditioning.

### Step 3: Targeted Active Serums
If your goal is evening out tone or managing daytime shine, apply 3–4 drops of **The Ordinary Niacinamide 10% + Zinc 1%**. Niacinamide strengthens skin barriers while regulating sebum production.

### Step 4: Lightweight Barrier Moisturizer
Seal in the hydration with a lightweight gel cream or peptide lotion. Our **BAGm Silk Barrier Peptide Cream** absorbs instantly with zero greasiness.

### Step 5: High-Factor Broad-Spectrum SPF (Non-Negotiable!)
Never skip sunscreen! Opt for invisible chemical or hybrid formulations like **La Roche-Posay Anthelios Invisible Fluid SPF 50+** that leave no white cast on dark skin.
      `,
    },
    {
      id: 'art-shea-butter-benefits',
      title: 'The Power of Ghanaian Shea Butter & Baobab Oil in Modern Skincare',
      slug: 'the-power-of-ghanaian-shea-butter-and-baobab-oil-in-modern-skincare',
      excerpt: 'Why century-old Ghanaian botanical traditions remain the world’s most potent secret for resilient, supple skin.',
      category: 'Ghanaian Botanicals',
      cover_image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&q=80&w=1200',
      author: 'Akosua Darko, Botanical Specialist',
      read_time: '5 min read',
      content: `
Ghanaian shea butter (*Butyrospermum parkii*) sourced from the northern savannah regions is globally celebrated for its unmatched emollient profile, rich in cinnamic acid, vitamins A and E, and essential fatty acids.

### Why Whipped Shea Soufflés are Revolutionary
Traditional raw shea butter is dense and rich, but modern whipping techniques — pioneered by Ghanaian artisans at **Kaeme** and **Nokware** — incorporate cold-pressed baobab and sweet almond oils. This transforms dense shea into an airy cloud that melts on contact and absorbs without residue.

### Baobab Oil: The Tree of Life
Extracted from the seeds of the iconic African Baobab tree, this golden elixir contains nine times more Vitamin C than oranges and is rich in Omegas 3, 6, and 9. It protects against environmental stressors while keeping skin elastic and radiant.
      `,
    },
    {
      id: 'art-sunscreen-melanin',
      title: 'Sunscreen Guide: Choosing the Right SPF for Melanin-Rich Skin',
      slug: 'sunscreen-guide-choosing-the-right-spf-for-melanin-rich-skin',
      excerpt: 'Busting myths about SPF on dark skin and how to choose formulas with zero white cast.',
      category: 'Beauty Education',
      cover_image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=1200',
      author: 'BAGm Beauty Editorial',
      read_time: '3 min read',
      content: `
One of the most persistent beauty myths is that melanin-rich skin doesn't need sunscreen. While darker skin tones have natural protection equivalent to roughly SPF 4, UVA rays penetrate deeply into the dermis, accelerating hyperpigmentation, melasma, and collagen breakdown.

### What to Look for in Dark-Skin Friendly Sunscreen:
1. **Chemical & Invisible Fluid Formulations:** Modern organic filters (such as Mexoryl 400 and Avobenzone) dissolve transparently.
2. **Niacinamide Additions:** Helps inhibit transfer of pigment granules, accelerating the fading of dark spots.
3. **Sweat & Humidity Resistance:** Ensures your SPF doesn't run into your eyes in warm Ghanaian weather.
      `,
    },
  ];

  for (const a of articles) {
    const exists = db.prepare('SELECT id FROM editorial_articles WHERE id = ?').get(a.id);
    if (!exists) {
      db.prepare(`
        INSERT INTO editorial_articles (id, title, slug, excerpt, content, cover_image, category, author, read_time, is_published, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
      `).run(a.id, a.title, a.slug, a.excerpt, a.content, a.cover_image, a.category, a.author, a.read_time, now, now);
    }
  }

  // 10. Sample Verified Customer Review & Completed Demo Order (so customer can review orders & see history)
  const existingOrder = db.prepare('SELECT id FROM orders WHERE id = ?').get('ord-demo-001');
  if (!existingOrder) {
    db.prepare(`
      INSERT INTO orders (
        id, order_number, user_id, customer_name, customer_email, customer_phone,
        fulfilment_type, delivery_zone_id, delivery_address,
        subtotal, delivery_fee, total_amount, currency, payment_method, payment_status, payment_reference, payment_channel,
        order_status, courier_name, tracking_reference, is_guest, created_at, updated_at
      ) VALUES (
        'ord-demo-001', 'BAGM-2026-1082', 'cust-001', 'Akosua Mensah', 'customer@example.com', '+233 24 987 6543',
        'delivery', 'zone-accra-outskirts', ?,
        340.0, 45.0, 385.0, 'GHS', 'paystack_momo', 'paid', 'PAY_DEMO_REF_88192', 'MTN Mobile Money',
        'delivered', 'BAGm Express Courier', 'BAGM-EXP-4491', 0,
        '${new Date(Date.now() - 4 * 86400000).toISOString()}',
        '${new Date(Date.now() - 2 * 86400000).toISOString()}'
      )
    `).run(
      JSON.stringify({
        street: 'House 14, Boundary Road',
        landmark: 'Near A&C Mall',
        city: 'East Legon, Accra',
        region: 'Greater Accra',
        digital_address: 'GA-183-9022',
      })
    );

    // Order item
    db.prepare(`
      INSERT INTO order_items (id, order_id, product_id, product_name, sku, unit_price, cost_price, quantity, total_price, image_url, created_at)
      VALUES (
        'item-demo-001', 'ord-demo-001', 'prod-bagm-peptide-cream',
        'BAGm Silk Barrier Peptide Cream 50ml', 'BAGM-CR-001', 340.0, 180.0, 1, 340.0,
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800',
        '${new Date(Date.now() - 4 * 86400000).toISOString()}'
      )
    `).run();

    // Verified review
    db.prepare(`
      INSERT INTO reviews (
        id, product_id, user_id, order_id, rating, title, comment, skin_type, skin_concern, is_verified_purchase, status, created_at
      ) VALUES (
        'rev-demo-001', 'prod-bagm-peptide-cream', 'cust-001', 'ord-demo-001', 5,
        'The most luxurious moisturizer I have used in Accra!',
        'This cream is perfection. It gives a silky glow without feeling heavy or oily during humid afternoons. Highly recommended for combination skin!',
        'combination', 'dryness', 1, 'approved',
        '${new Date(Date.now() - 1 * 86400000).toISOString()}'
      )
    `).run();
  }

  console.log('✅ Database seeded successfully!');
}
