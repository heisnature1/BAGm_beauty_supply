export interface User {
  id: string;
  email: string;
  password_hash?: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  role: 'customer' | 'admin';
  is_verified: number;
  newsletter_subscribed: number;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  title: string;
  first_name: string;
  last_name: string;
  phone: string;
  street_address: string;
  landmark_or_gps?: string | null;
  city: string;
  region: string;
  delivery_zone_id?: string | null;
  is_default: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  parent_id?: string | null;
  display_order: number;
  is_active: number;
  created_at: string;
  product_count?: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  origin: 'Ghanaian' | 'International' | 'BAGm';
  description?: string | null;
  logo_url?: string | null;
  website_url?: string | null;
  is_featured: number;
  created_at: string;
  product_count?: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  price: number;
  cost_price: number;
  stock_quantity: number;
  attributes?: Record<string, string> | null;
  created_at: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  brand_id: string;
  category_id: string;
  description: string;
  price: number;
  cost_price: number;
  images: string[]; // parsed from JSON array
  video_url?: string | null;
  ingredients?: string | null;
  benefits?: string[]; // parsed from JSON array
  directions_for_use?: string | null;
  suitable_skin_types: string[]; // parsed from JSON
  relevant_concerns: string[]; // parsed from JSON
  stock_quantity: number;
  low_stock_threshold: number;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  is_published: number;
  is_featured: number;
  is_bestseller: number;
  is_new_arrival: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  brand_name?: string;
  brand_slug?: string;
  brand_origin?: string;
  category_name?: string;
  category_slug?: string;
  variants?: ProductVariant[];
  average_rating?: number;
  review_count?: number;
}

export interface StockMovement {
  id: string;
  product_id: string;
  variant_id?: string | null;
  quantity_change: number;
  type: 'restock' | 'sale' | 'cancellation_restock' | 'return_restock' | 'adjustment' | 'damaged' | 'audit_correction';
  reference_id?: string | null;
  reason?: string | null;
  performed_by: string;
  stock_before: number;
  stock_after: number;
  created_at: string;
  product_name?: string;
  product_sku?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  supplier_name?: string;
  status: 'draft' | 'ordered' | 'received' | 'cancelled';
  total_cost: number;
  items: Array<{
    product_id: string;
    product_name: string;
    variant_id?: string | null;
    quantity: number;
    unit_cost: number;
  }>;
  received_date?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  region: string;
  fee: number;
  estimated_delivery_time: string;
  cod_available: number;
  is_active: number;
  created_at: string;
}

export interface PickupLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  operating_hours: string;
  instructions?: string | null;
  is_active: number;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string | null;
  product_name: string;
  variant_name?: string | null;
  sku: string;
  unit_price: number;
  cost_price: number;
  quantity: number;
  total_price: number;
  image_url?: string | null;
  created_at: string;
}

export type OrderStatus =
  | 'order_placed'
  | 'awaiting_payment'
  | 'payment_confirmed'
  | 'processing'
  | 'ready_for_dispatch'
  | 'dispatched'
  | 'out_for_delivery'
  | 'delivered'
  | 'ready_for_pickup'
  | 'collected'
  | 'cancelled'
  | 'return_requested'
  | 'returned'
  | 'refund_pending'
  | 'refunded';

export type PaymentMethod =
  | 'moolre_momo'
  | 'moolre_card'
  | 'moolre_bank'
  | 'paystack_momo'
  | 'paystack_card'
  | 'bank_transfer'
  | 'cash_on_delivery'
  | 'flutterwave';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export interface Order {
  id: string;
  order_number: string;
  user_id?: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  fulfilment_type: 'delivery' | 'pickup';
  delivery_zone_id?: string | null;
  delivery_address?: {
    street: string;
    landmark?: string;
    city: string;
    region: string;
    digital_address?: string;
  } | null;
  pickup_location_id?: string | null;
  pickup_location_name?: string | null;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_reference?: string | null;
  payment_channel?: string | null;
  order_status: OrderStatus;
  courier_name?: string | null;
  tracking_reference?: string | null;
  scheduled_delivery_date?: string | null;
  customer_notes?: string | null;
  admin_notes?: string | null;
  is_guest: number;
  guest_access_token?: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  order_id: string;
  rating: number;
  title?: string | null;
  comment: string;
  skin_type?: string | null;
  skin_concern?: string | null;
  is_verified_purchase: number;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string | null;
  created_at: string;
  user_name?: string;
  product_name?: string;
}

export interface ReturnRequest {
  id: string;
  return_number: string;
  order_id: string;
  order_item_id: string;
  user_id?: string | null;
  quantity: number;
  reason: 'damaged' | 'defective' | 'wrong_item_received' | 'allergic_reaction' | 'policy_allowed_other';
  explanation: string;
  images?: string[];
  status: 'requested' | 'approved' | 'rejected' | 'item_received' | 'inspected' | 'refund_approved' | 'refunded' | 'closed';
  inspection_notes?: string | null;
  is_resellable: number;
  refund_amount: number;
  refund_method?: string | null;
  refund_reference?: string | null;
  created_at: string;
  updated_at: string;
  order_number?: string;
  product_name?: string;
  customer_name?: string;
  customer_email?: string;
}

export interface ContactEnquiry {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  category: 'order_inquiry' | 'product_advice' | 'delivery' | 'general';
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'archived';
  admin_reply?: string | null;
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: 'subscribed' | 'unsubscribed';
  subscribed_at: string;
  unsubscribed_at?: string | null;
  source: string;
}

export interface EditorialArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: string;
  author: string;
  read_time: string;
  is_published: number;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  title: string;
  category: 'inventory' | 'logistics_delivery' | 'packaging' | 'marketing' | 'utilities_rent' | 'software_tools' | 'other';
  amount: number;
  date: string;
  reference_number?: string | null;
  description?: string | null;
  receipt_url?: string | null;
  created_at: string;
}

export interface StoreSettings {
  id: string;
  store_name: string;
  store_tagline: string;
  contact_email: string;
  contact_phone: string;
  whatsapp_number?: string | null;
  address_line: string;
  store_hours: string;
  announcement_enabled: number;
  announcement_text: string;
  announcement_link?: string | null;
  hero_headline: string;
  hero_subtitle: string;
  hero_primary_cta_text: string;
  hero_primary_cta_link: string;
  hero_secondary_cta_text: string;
  hero_secondary_cta_link: string;
  hero_image_url: string;
  currency_code: string;
  currency_symbol: string;
  moolre_enabled?: number;
  moolre_environment?: 'sandbox' | 'production';
  moolre_public_key?: string | null;
  moolre_secret_key?: string | null;
  moolre_account_number?: string | null;
  moolre_merchant_id?: string | null;
  paystack_public_key?: string | null;
  paystack_secret_key?: string | null;
  paystack_enabled: number;
  flutterwave_public_key?: string | null;
  flutterwave_secret_key?: string | null;
  flutterwave_enabled?: number;
  bank_transfer_enabled: number;
  bank_name: string;
  bank_account_name: string;
  bank_account_number: string;
  bank_branch: string;
  cod_enabled: number;
  return_window_days: number;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string | null;
  user_email?: string | null;
  action: string;
  target_type: string;
  target_id: string;
  details?: Record<string, any> | null;
  ip_address?: string | null;
  created_at: string;
}

export interface CartItem {
  productId: string;
  variantId?: string | null;
  name: string;
  variantName?: string | null;
  sku: string;
  price: number;
  quantity: number;
  image: string;
  maxStock: number;
  brandName?: string;
}
