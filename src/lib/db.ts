import { INITIAL_STORE_DATA } from './storeData';

let dbInstance: any = null;

// Global in-memory persistent store
export const memoryStore = {
  settings: { ...INITIAL_STORE_DATA.settings },
  users: [...INITIAL_STORE_DATA.users],
  addresses: [...INITIAL_STORE_DATA.addresses],
  categories: [...INITIAL_STORE_DATA.categories],
  brands: [...INITIAL_STORE_DATA.brands],
  products: [...INITIAL_STORE_DATA.products],
  deliveryZones: [...INITIAL_STORE_DATA.deliveryZones],
  pickupLocations: [...INITIAL_STORE_DATA.pickupLocations],
  suppliers: [...INITIAL_STORE_DATA.suppliers],
  editorialArticles: [...INITIAL_STORE_DATA.editorialArticles],
  orders: [...INITIAL_STORE_DATA.orders],
  orderItems: [...INITIAL_STORE_DATA.orderItems],
  reviews: [...INITIAL_STORE_DATA.reviews],
  expenses: [...INITIAL_STORE_DATA.expenses],
  subscribers: [...INITIAL_STORE_DATA.subscribers],
  enquiries: [...INITIAL_STORE_DATA.enquiries],
  auditLogs: [] as any[],
  emailLogs: [] as any[],
  stockMovements: [] as any[],
  purchaseOrders: [] as any[],
  returns: [] as any[],
  wishlist: [] as any[],
  resetTokens: [] as { email: string; token: string; expires_at: number }[],
};

export function getDb(): any {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = createUniversalDbClient();
  return dbInstance;
}

export function getMemoryStore() {
  return memoryStore;
}

function getEnrichedProducts() {
  return memoryStore.products.map((p) => {
    const brand = memoryStore.brands.find((b) => b.id === p.brand_id);
    const category = memoryStore.categories.find((c) => c.id === p.category_id);
    const approvedReviews = memoryStore.reviews.filter((r) => r.product_id === p.id && (r.status === 'approved' || !r.status));
    const avg_rating = approvedReviews.length > 0
      ? Number((approvedReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / approvedReviews.length).toFixed(1))
      : (p.average_rating || p.avg_rating || 5.0);
    const review_count = approvedReviews.length > 0 ? approvedReviews.length : (p.review_count || 0);

    return {
      ...p,
      brand_name: brand?.name || p.brand_name || 'BAGm Beauty',
      brand_slug: brand?.slug || p.brand_slug || 'bagm-beauty',
      brand_origin: brand?.origin || p.brand_origin || 'Ghanaian',
      category_name: category?.name || p.category_name || 'Skincare',
      category_slug: category?.slug || p.category_slug || 'skincare',
      avg_rating,
      average_rating: avg_rating,
      review_count,
    };
  });
}

function createUniversalDbClient() {
  return {
    pragma: () => {},
    exec: (sql: string) => {},
    transaction: (fn: any) => (...args: any[]) => fn(...args),
    prepare: (sql: string) => {
      const lower = sql.toLowerCase().trim();

      return {
        run: (...params: any[]) => {
          const flat = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;

          // 1. Store Settings mutations
          if (lower.startsWith('insert into store_settings') || lower.startsWith('replace into store_settings')) {
            if (flat.length === 2 && typeof flat[0] === 'string') {
              const [key, val] = flat;
              memoryStore.settings[key] = val;
              if (key === 'announcement_text') memoryStore.settings.announcement_text = val;
              if (key === 'announcement_active') memoryStore.settings.announcement_enabled = (val === 'true' || val === '1') ? 1 : 0;
              if (key === 'hero_headline') memoryStore.settings.hero_headline = val;
              if (key === 'hero_subheadline') memoryStore.settings.hero_subtitle = val;
              if (key === 'hero_cta_text') memoryStore.settings.hero_primary_cta_text = val;
              if (key === 'store_address') memoryStore.settings.address_line = val;
              if (key === 'store_phone') memoryStore.settings.contact_phone = val;
              if (key === 'store_hours') memoryStore.settings.store_hours = val;
              if (key === 'admin_notification_email') memoryStore.settings.contact_email = val;
              if (key === 'bank_name') memoryStore.settings.bank_name = val;
              if (key === 'bank_account_name') memoryStore.settings.bank_account_name = val;
              if (key === 'bank_account_number') memoryStore.settings.bank_account_number = val;
              if (key === 'bank_branch') memoryStore.settings.bank_branch = val;
              if (key === 'cod_enabled') memoryStore.settings.cod_enabled = (val === 'true' || val === '1') ? 1 : 0;
              if (key === 'paystack_secret_key') memoryStore.settings.paystack_secret_key = val;
              if (key === 'paystack_public_key') memoryStore.settings.paystack_public_key = val;
            } else if (flat.length > 2) {
              const [id, store_name, store_tagline, contact_email, contact_phone, address_line, store_hours, announcement_enabled, announcement_text, hero_headline, hero_subtitle, hero_primary_cta_text, hero_primary_cta_link, hero_secondary_cta_text, hero_secondary_cta_link, hero_image_url, currency_code, currency_symbol, paystack_enabled, bank_transfer_enabled, bank_name, bank_account_name, bank_account_number, bank_branch, cod_enabled, return_window_days] = flat;
              Object.assign(memoryStore.settings, {
                id: id || 'default',
                store_name: store_name || memoryStore.settings.store_name,
                store_tagline: store_tagline || memoryStore.settings.store_tagline,
                contact_email: contact_email || memoryStore.settings.contact_email,
                contact_phone: contact_phone || memoryStore.settings.contact_phone,
                address_line: address_line || memoryStore.settings.address_line,
                store_hours: store_hours || memoryStore.settings.store_hours,
                announcement_enabled: announcement_enabled !== undefined ? announcement_enabled : memoryStore.settings.announcement_enabled,
                announcement_text: announcement_text || memoryStore.settings.announcement_text,
                hero_headline: hero_headline || memoryStore.settings.hero_headline,
                hero_subtitle: hero_subtitle || memoryStore.settings.hero_subtitle,
                hero_primary_cta_text: hero_primary_cta_text || memoryStore.settings.hero_primary_cta_text,
                hero_primary_cta_link: hero_primary_cta_link || memoryStore.settings.hero_primary_cta_link,
                hero_secondary_cta_text: hero_secondary_cta_text || memoryStore.settings.hero_secondary_cta_text,
                hero_secondary_cta_link: hero_secondary_cta_link || memoryStore.settings.hero_secondary_cta_link,
                hero_image_url: hero_image_url || memoryStore.settings.hero_image_url,
                currency_code: currency_code || 'GHS',
                currency_symbol: currency_symbol || 'GH₵',
                paystack_enabled: paystack_enabled !== undefined ? paystack_enabled : 1,
                bank_transfer_enabled: bank_transfer_enabled !== undefined ? bank_transfer_enabled : 1,
                bank_name: bank_name || memoryStore.settings.bank_name,
                bank_account_name: bank_account_name || memoryStore.settings.bank_account_name,
                bank_account_number: bank_account_number || memoryStore.settings.bank_account_number,
                bank_branch: bank_branch || memoryStore.settings.bank_branch,
                cod_enabled: cod_enabled !== undefined ? cod_enabled : 1,
                return_window_days: return_window_days !== undefined ? return_window_days : 7,
                updated_at: new Date().toISOString(),
              });
            }
          }

          // 2. Products mutations
          else if (lower.startsWith('insert into products')) {
            const [
              id, sku, name, slug, brand_id, category_id, description, price, cost_price,
              images, ingredients, benefits, directions_for_use, suitable_skin_types, relevant_concerns,
              stock_quantity, low_stock_threshold, stock_status, is_published, is_featured, is_bestseller, is_new_arrival,
              created_at, updated_at
            ] = flat;

            const newProduct = {
              id,
              sku,
              name,
              slug,
              brand_id,
              category_id,
              description,
              price: Number(price) || 0,
              cost_price: Number(cost_price || 0),
              images: typeof images === 'string' ? images : JSON.stringify(images || []),
              ingredients: ingredients || null,
              benefits: typeof benefits === 'string' ? benefits : JSON.stringify(benefits || []),
              directions_for_use: directions_for_use || null,
              suitable_skin_types: typeof suitable_skin_types === 'string' ? suitable_skin_types : JSON.stringify(suitable_skin_types || ['all']),
              relevant_concerns: typeof relevant_concerns === 'string' ? relevant_concerns : JSON.stringify(relevant_concerns || []),
              stock_quantity: parseInt(stock_quantity, 10) || 0,
              low_stock_threshold: parseInt(low_stock_threshold, 10) || 5,
              stock_status: stock_status || (stock_quantity <= 0 ? 'out_of_stock' : stock_quantity <= (low_stock_threshold || 5) ? 'low_stock' : 'in_stock'),
              is_published: is_published !== undefined ? is_published : 1,
              is_featured: is_featured !== undefined ? is_featured : 0,
              is_bestseller: is_bestseller !== undefined ? is_bestseller : 0,
              is_new_arrival: is_new_arrival !== undefined ? is_new_arrival : 1,
              created_at: created_at || new Date().toISOString(),
              updated_at: updated_at || new Date().toISOString(),
            };

            const existingIdx = memoryStore.products.findIndex((p) => p.id === id);
            if (existingIdx >= 0) {
              memoryStore.products[existingIdx] = newProduct;
            } else {
              memoryStore.products.unshift(newProduct);
            }
          } else if (lower.startsWith('update products')) {
            const id = flat[flat.length - 1];
            const product = memoryStore.products.find((p) => p.id === id);
            if (product) {
              if (lower.includes('sku = ?') && lower.includes('price = ?')) {
                const [
                  sku, name, brand_id, category_id, description,
                  price, cost_price, images, ingredients, benefits,
                  directions_for_use, suitable_skin_types, relevant_concerns,
                  stock_quantity, low_stock_threshold, stock_status,
                  is_published, is_featured, is_bestseller, is_new_arrival,
                  updated_at
                ] = flat;

                Object.assign(product, {
                  sku,
                  name,
                  brand_id,
                  category_id,
                  description,
                  price: Number(price) || product.price,
                  cost_price: Number(cost_price !== undefined ? cost_price : product.cost_price),
                  images: typeof images === 'string' ? images : JSON.stringify(images || []),
                  ingredients: ingredients !== undefined ? ingredients : product.ingredients,
                  benefits: typeof benefits === 'string' ? benefits : JSON.stringify(benefits || []),
                  directions_for_use: directions_for_use !== undefined ? directions_for_use : product.directions_for_use,
                  suitable_skin_types: typeof suitable_skin_types === 'string' ? suitable_skin_types : JSON.stringify(suitable_skin_types || ['all']),
                  relevant_concerns: typeof relevant_concerns === 'string' ? relevant_concerns : JSON.stringify(relevant_concerns || []),
                  stock_quantity: parseInt(stock_quantity, 10) || 0,
                  low_stock_threshold: parseInt(low_stock_threshold, 10) || 5,
                  stock_status,
                  is_published: is_published !== undefined ? is_published : product.is_published,
                  is_featured: is_featured !== undefined ? is_featured : product.is_featured,
                  is_bestseller: is_bestseller !== undefined ? is_bestseller : product.is_bestseller,
                  is_new_arrival: is_new_arrival !== undefined ? is_new_arrival : product.is_new_arrival,
                  updated_at: updated_at || new Date().toISOString(),
                });
              } else if (lower.includes('stock_quantity = ?')) {
                const [stock_quantity, stock_status, updated_at] = flat;
                product.stock_quantity = parseInt(stock_quantity, 10) || 0;
                product.stock_status = stock_status || (product.stock_quantity <= 0 ? 'out_of_stock' : product.stock_quantity <= product.low_stock_threshold ? 'low_stock' : 'in_stock');
                product.updated_at = updated_at || new Date().toISOString();
              }
            }
          } else if (lower.startsWith('delete from products')) {
            const id = flat[0];
            memoryStore.products = memoryStore.products.filter((p) => p.id !== id);
          }

          // 3. Categories mutations
          else if (lower.startsWith('insert into categories')) {
            const [id, name, slug, description, image_url, sort_order, created_at, updated_at] = flat;
            memoryStore.categories.push({
              id,
              name,
              slug,
              description: description || null,
              image_url: image_url || null,
              display_order: sort_order || memoryStore.categories.length + 1,
              is_active: 1,
              created_at: created_at || new Date().toISOString(),
              updated_at: updated_at || new Date().toISOString(),
            });
          } else if (lower.startsWith('update categories')) {
            const id = flat[flat.length - 1];
            const cat = memoryStore.categories.find((c) => c.id === id);
            if (cat) {
              if (flat[0]) cat.name = flat[0];
              cat.updated_at = new Date().toISOString();
            }
          } else if (lower.startsWith('delete from categories')) {
            const id = flat[0];
            memoryStore.categories = memoryStore.categories.filter((c) => c.id !== id);
          }

          // 4. Brands mutations
          else if (lower.startsWith('insert into brands')) {
            const [id, name, slug, origin, description, logo_url, website_url, created_at, updated_at] = flat;
            memoryStore.brands.push({
              id,
              name,
              slug,
              origin: origin || 'Ghanaian',
              description: description || null,
              logo_url: logo_url || null,
              website_url: website_url || null,
              is_featured: 1,
              is_active: 1,
              created_at: created_at || new Date().toISOString(),
              updated_at: updated_at || new Date().toISOString(),
            });
          } else if (lower.startsWith('update brands')) {
            const id = flat[flat.length - 1];
            const brand = memoryStore.brands.find((b) => b.id === id);
            if (brand) {
              if (flat[0]) brand.name = flat[0];
              brand.updated_at = new Date().toISOString();
            }
          } else if (lower.startsWith('delete from brands')) {
            const id = flat[0];
            memoryStore.brands = memoryStore.brands.filter((b) => b.id !== id);
          }

          // 5. Suppliers mutations
          else if (lower.startsWith('insert into suppliers')) {
            const [id, name, contact_person, email, phone, address, notes, created_at] = flat;
            memoryStore.suppliers.push({
              id,
              name,
              contact_person: contact_person || null,
              email: email || null,
              phone: phone || null,
              address: address || null,
              notes: notes || null,
              created_at: created_at || new Date().toISOString(),
            });
          }

          // 6. Purchase Orders mutations
          else if (lower.startsWith('insert into purchase_orders')) {
            const [id, po_number, supplier_id, status, total_cost, items, notes, created_at] = flat;
            memoryStore.purchaseOrders.unshift({
              id,
              po_number,
              supplier_id,
              status: status || 'ordered',
              total_cost: Number(total_cost || 0),
              items: typeof items === 'string' ? items : JSON.stringify(items || []),
              notes: notes || null,
              created_at: created_at || new Date().toISOString(),
            });
          } else if (lower.startsWith('update purchase_orders')) {
            const id = flat[flat.length - 1];
            const po = memoryStore.purchaseOrders.find((p) => p.id === id);
            if (po) {
              po.status = 'received';
              po.received_date = flat[0] || new Date().toISOString();
            }
          }

          // 7. Stock movements mutations
          else if (lower.startsWith('insert into stock_movements')) {
            const id = flat[0];
            const product_id = flat[1];
            memoryStore.stockMovements.unshift({
              id,
              product_id,
              quantity_change: flat[2],
              type: flat[3] || 'adjustment',
              performed_by: flat[4] || null,
              stock_before: flat[5] || 0,
              stock_after: flat[6] || 0,
              reason: flat[7] || 'Stock Movement',
              created_at: flat[8] || new Date().toISOString(),
            });
          }

          // 8. Expenses mutations
          else if (lower.startsWith('insert into expenses')) {
            const [id, category, amount, description, date, payment_method, recorded_by, created_at] = flat;
            memoryStore.expenses.unshift({
              id,
              category,
              amount: Number(amount) || 0,
              description,
              date: date || new Date().toISOString().split('T')[0],
              payment_method: payment_method || 'Mobile Money',
              recorded_by: recorded_by || 'admin-001',
              created_at: created_at || new Date().toISOString(),
            });
          } else if (lower.startsWith('delete from expenses')) {
            const id = flat[0];
            memoryStore.expenses = memoryStore.expenses.filter((e) => e.id !== id);
          }

          // 9. Users mutations
          else if (lower.startsWith('insert into users')) {
            const [id, email, password_hash, first_name, last_name, phone, role, is_verified, created_at, updated_at] = flat;
            memoryStore.users.push({
              id,
              email,
              password_hash,
              first_name,
              last_name,
              phone,
              role: role || 'customer',
              is_verified: is_verified !== undefined ? is_verified : 1,
              created_at: created_at || new Date().toISOString(),
              updated_at: updated_at || new Date().toISOString(),
            });
          } else if (lower.startsWith('update users')) {
            const id = flat[flat.length - 1];
            const user = memoryStore.users.find((u) => u.id === id || u.email === id);
            if (user && flat[0]) {
              user.password_hash = flat[0];
              user.updated_at = new Date().toISOString();
            }
          }

          // 10. Orders mutations
          else if (lower.startsWith('insert into orders')) {
            const obj: any = {};
            if (sql.includes('(') && sql.includes('VALUES')) {
              const colPart = sql.slice(sql.indexOf('(') + 1, sql.indexOf(')'));
              const cols = colPart.split(',').map((c: string) => c.trim().toLowerCase());
              cols.forEach((col: string, idx: number) => {
                obj[col] = flat[idx];
              });
            }
            const orderRecord = {
              id: obj.id || flat[0],
              order_number: obj.order_number || flat[1],
              user_id: obj.user_id !== undefined ? obj.user_id : flat[2],
              customer_name: obj.customer_name || flat[3],
              customer_email: obj.customer_email || flat[4],
              customer_phone: obj.customer_phone || flat[5],
              fulfilment_type: obj.fulfilment_type || flat[6] || 'delivery',
              delivery_zone_id: obj.delivery_zone_id !== undefined ? obj.delivery_zone_id : flat[7],
              delivery_address: obj.delivery_address !== undefined ? obj.delivery_address : flat[8],
              pickup_location_id: obj.pickup_location_id !== undefined ? obj.pickup_location_id : flat[9],
              subtotal: Number(obj.subtotal !== undefined ? obj.subtotal : flat[10]) || 0,
              delivery_fee: Number(obj.delivery_fee !== undefined ? obj.delivery_fee : flat[11]) || 0,
              total_amount: Number(obj.total_amount !== undefined ? obj.total_amount : flat[12]) || 0,
              currency: obj.currency || 'GHS',
              payment_method: obj.payment_method || flat[13] || 'momo',
              payment_status: obj.payment_status || flat[14] || 'pending',
              payment_reference: obj.payment_reference || null,
              payment_channel: obj.payment_channel || null,
              order_status: obj.order_status || flat[15] || 'order_placed',
              courier_name: obj.courier_name || null,
              tracking_reference: obj.tracking_reference || null,
              scheduled_delivery_date: obj.scheduled_delivery_date || null,
              customer_notes: obj.customer_notes || null,
              admin_notes: obj.admin_notes || null,
              is_guest: obj.is_guest !== undefined ? obj.is_guest : 1,
              guest_access_token: obj.guest_access_token || null,
              created_at: obj.created_at || new Date().toISOString(),
              updated_at: obj.updated_at || new Date().toISOString(),
            };
            memoryStore.orders.unshift(orderRecord);
          } else if (lower.startsWith('update orders')) {
            const id = flat[flat.length - 1];
            const order = memoryStore.orders.find((o) => o.id === id || o.order_number === id);
            if (order) {
              if (lower.includes('payment_reference = ?')) {
                order.payment_reference = flat[0];
              }
              if (lower.includes('payment_status = ?') || flat.includes('paid')) {
                order.payment_status = 'paid';
              }
              if (lower.includes('order_status = ?')) {
                order.order_status = flat[0] || order.order_status;
                if (flat.length >= 4) {
                  order.courier_name = flat[1] || order.courier_name;
                  order.tracking_reference = flat[2] || order.tracking_reference;
                  order.admin_notes = flat[3] || order.admin_notes;
                }
              }
              if (flat.includes('payment_confirmed')) order.order_status = 'payment_confirmed';
              if (flat.includes('dispatched')) order.order_status = 'dispatched';
              if (flat.includes('delivered')) order.order_status = 'delivered';
              if (flat.includes('cancelled')) order.order_status = 'cancelled';
              order.updated_at = new Date().toISOString();
            }
          }

          // 11. Order items mutations
          else if (lower.startsWith('insert into order_items')) {
            const [id, order_id, product_id, variant_id, product_name, variant_name, sku, unit_price, cost_price, quantity, total_price, image_url, created_at] = flat;
            memoryStore.orderItems.push({
              id,
              order_id,
              product_id,
              variant_id,
              product_name,
              variant_name,
              sku,
              unit_price: Number(unit_price) || 0,
              cost_price: Number(cost_price) || 0,
              quantity: Number(quantity) || 1,
              total_price: Number(total_price) || 0,
              image_url,
              created_at: created_at || new Date().toISOString(),
            });
          }

          // 12. Reviews mutations
          else if (lower.startsWith('insert into reviews') || lower.startsWith('insert into product_reviews')) {
            const [id, product_id, user_id, order_id, rating, title, comment, skin_type, skin_concern, is_verified_purchase, status, created_at] = flat;
            memoryStore.reviews.unshift({
              id,
              product_id,
              user_id,
              order_id,
              rating: Number(rating) || 5,
              title,
              comment,
              skin_type,
              skin_concern,
              is_verified_purchase: is_verified_purchase !== undefined ? is_verified_purchase : 1,
              status: status || 'approved',
              created_at: created_at || new Date().toISOString(),
            });
          } else if (lower.startsWith('update reviews') || lower.startsWith('update product_reviews')) {
            const id = flat[flat.length - 1];
            const rev = memoryStore.reviews.find((r) => r.id === id);
            if (rev) {
              rev.status = flat[0];
            }
          } else if (lower.startsWith('delete from reviews') || lower.startsWith('delete from product_reviews')) {
            const id = flat[0];
            memoryStore.reviews = memoryStore.reviews.filter((r) => r.id !== id);
          }

          // 13. Enquiries mutations
          else if (lower.startsWith('insert into enquiries') || lower.startsWith('insert into contact_enquiries')) {
            const [id, name, email, phone, subject, message, status, created_at, updated_at] = flat;
            memoryStore.enquiries.unshift({
              id,
              name,
              email,
              phone,
              subject,
              message,
              status: status || 'new',
              created_at: created_at || new Date().toISOString(),
              updated_at: updated_at || new Date().toISOString(),
            });
          } else if (lower.startsWith('update enquiries') || lower.startsWith('update contact_enquiries')) {
            const id = flat[flat.length - 1];
            const enq = memoryStore.enquiries.find((e) => e.id === id);
            if (enq) {
              enq.status = flat[0];
              enq.updated_at = new Date().toISOString();
            }
          }

          // 14. Returns mutations
          else if (lower.startsWith('insert into returns') || lower.startsWith('insert into order_returns')) {
            const [id, order_id, user_id, order_item_id, quantity, reason, explanation, status, refund_amount, created_at, updated_at] = flat;
            memoryStore.returns.unshift({
              id,
              order_id,
              user_id,
              order_item_id,
              quantity: Number(quantity) || 1,
              reason,
              explanation,
              status: status || 'requested',
              refund_amount: Number(refund_amount) || 0,
              created_at: created_at || new Date().toISOString(),
              updated_at: updated_at || new Date().toISOString(),
            });
          } else if (lower.startsWith('update returns') || lower.startsWith('update order_returns')) {
            const id = flat[flat.length - 1];
            const ret = memoryStore.returns.find((r) => r.id === id);
            if (ret) {
              if (flat.length >= 6) {
                ret.status = flat[0];
                ret.inspection_notes = flat[1];
                ret.is_resellable = flat[2] ? 1 : 0;
                ret.refund_amount = Number(flat[3] || 0);
                ret.refund_method = flat[4];
                ret.refund_reference = flat[5];
              } else {
                ret.status = flat[0];
              }
              ret.updated_at = new Date().toISOString();
            }
          }

          // 15. Subscribers mutations
          else if (lower.startsWith('insert into subscribers') || lower.startsWith('insert into newsletter_subscribers')) {
            const [id, email, status, created_at] = flat;
            const existing = memoryStore.subscribers.find((s) => s.email.toLowerCase() === String(email).toLowerCase());
            if (!existing) {
              memoryStore.subscribers.push({
                id,
                email,
                status: status || 'subscribed',
                created_at: created_at || new Date().toISOString(),
              });
            }
          }

          // 16. Audit logs mutations
          else if (lower.startsWith('insert into audit_logs')) {
            const [id, user_id, user_email, action, target_type, target_id, details, ip_address, created_at] = flat;
            memoryStore.auditLogs.unshift({
              id,
              user_id,
              user_email,
              action,
              target_type,
              target_id,
              details,
              ip_address,
              created_at: created_at || new Date().toISOString(),
            });
          }

          // 17. Addresses mutations
          else if (lower.startsWith('insert into addresses')) {
            const [id, user_id, title, first_name, last_name, phone, street_address, landmark_or_gps, city, region, is_default, created_at, updated_at] = flat;
            if (is_default) {
              memoryStore.addresses.forEach((a) => {
                if (a.user_id === user_id) a.is_default = 0;
              });
            }
            memoryStore.addresses.push({
              id,
              user_id,
              title,
              first_name,
              last_name,
              phone,
              street_address,
              landmark_or_gps,
              city,
              region,
              is_default: is_default ? 1 : 0,
              created_at: created_at || new Date().toISOString(),
              updated_at: updated_at || new Date().toISOString(),
            });
          } else if (lower.startsWith('delete from addresses')) {
            const id = flat[0];
            memoryStore.addresses = memoryStore.addresses.filter((a) => a.id !== id);
          }

          // 18. Wishlist mutations
          else if (lower.startsWith('insert into wishlist') || lower.startsWith('insert into wishlist_items')) {
            const [id, user_id, product_id, created_at] = flat;
            const exists = memoryStore.wishlist.some((w) => w.user_id === user_id && w.product_id === product_id);
            if (!exists) {
              memoryStore.wishlist.push({ id, user_id, product_id, created_at: created_at || new Date().toISOString() });
            }
          } else if (lower.startsWith('delete from wishlist') || lower.startsWith('delete from wishlist_items')) {
            const [user_id, product_id] = flat;
            memoryStore.wishlist = memoryStore.wishlist.filter((w) => !(w.user_id === user_id && w.product_id === product_id));
          }

          return { changes: 1, lastInsertRowid: 1 };
        },

        get: (...params: any[]) => {
          const flat = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;

          // Store Settings
          if (lower.includes('from store_settings')) {
            if (lower.includes('paystack_secret_key')) {
              return { paystack_secret_key: memoryStore.settings.paystack_secret_key || '' };
            }
            if (lower.includes('paystack_public_key')) {
              return { paystack_public_key: memoryStore.settings.paystack_public_key || '' };
            }
            return memoryStore.settings;
          }

          // Admin Dashboard Sales & Revenue Telemetry
          if (lower.includes('confirmed_revenue') || (lower.includes('sum(case when payment_status') && lower.includes('from orders'))) {
            const paidOrders = memoryStore.orders.filter((o) => o.payment_status === 'paid');
            const pendingOrders = memoryStore.orders.filter((o) => o.payment_status === 'pending');
            const completedOrders = memoryStore.orders.filter((o) => o.order_status === 'delivered' || o.order_status === 'collected');
            const cancelledOrders = memoryStore.orders.filter((o) => o.order_status === 'cancelled');

            return {
              confirmed_revenue: paidOrders.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0),
              pending_revenue: pendingOrders.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0),
              total_orders: memoryStore.orders.length,
              paid_orders_count: paidOrders.length,
              pending_orders_count: pendingOrders.length,
              completed_orders_count: completedOrders.length,
              cancelled_orders_count: cancelledOrders.length,
            };
          }

          // Admin Dashboard Inventory Telemetry
          if (lower.includes('total_products') && lower.includes('from products')) {
            const published = memoryStore.products.filter((p) => p.is_published === 1);
            return {
              total_products: published.length,
              low_stock_count: published.filter((p) => p.stock_status === 'low_stock' || (p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold)).length,
              out_of_stock_count: published.filter((p) => p.stock_status === 'out_of_stock' || p.stock_quantity <= 0).length,
            };
          }

          // Admin Dashboard Single Count aggregations
          if (lower.includes('from returns where status =')) {
            const status = lower.includes("'requested'") ? 'requested' : 'pending_review';
            return { count: memoryStore.returns.filter((r) => r.status === status || r.status === 'requested').length };
          }
          if (lower.includes('from contact_enquiries where status =') || lower.includes('from enquiries where status =')) {
            return { count: memoryStore.enquiries.filter((e) => e.status === 'new' || e.status === 'unread').length };
          }
          if (lower.includes('from newsletter_subscribers where status =') || lower.includes('from subscribers where status =')) {
            return { count: memoryStore.subscribers.filter((s) => s.status === 'subscribed').length };
          }
          if (lower.includes('sum(amount) as total_expenses') || lower.includes('sum(amount) as total_exp')) {
            const sum = memoryStore.expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
            return { total_expenses: sum, total_exp: sum };
          }
          if (lower.includes('sum(total_amount) as total_revenue')) {
            const total = memoryStore.orders.filter((o) => o.payment_status === 'paid').reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);
            return { total_revenue: total };
          }
          if (lower.includes('sum(oi.cost_price * oi.quantity) as total_cogs')) {
            const paidOrderIds = new Set(memoryStore.orders.filter((o) => o.payment_status === 'paid').map((o) => o.id));
            const cogs = memoryStore.orderItems.filter((i) => paidOrderIds.has(i.order_id)).reduce((acc, i) => acc + ((Number(i.cost_price) || 0) * (Number(i.quantity) || 1)), 0);
            return { total_cogs: cogs };
          }

          // Count Products
          if (lower.includes('count(*) as count from products') || lower.includes('count(*) as total from products') || lower.includes('count(p.id) as count') || lower.includes('count(distinct p.id) as count')) {
            let list = memoryStore.products.filter((p) => p.is_published === 1);
            if (flat.length > 0 && typeof flat[0] === 'string' && flat[0].startsWith('%"')) {
              const tag = flat[0].replace(/[%"]/g, '');
              list = list.filter((p) => {
                const types = typeof p.suitable_skin_types === 'string' ? p.suitable_skin_types : JSON.stringify(p.suitable_skin_types || []);
                const concerns = typeof p.relevant_concerns === 'string' ? p.relevant_concerns : JSON.stringify(p.relevant_concerns || []);
                return types.includes(tag) || concerns.includes(tag);
              });
            }
            return { count: list.length, total: list.length };
          }

          // Single Users
          if (lower.includes('from users where email = ?')) {
            return memoryStore.users.find((u) => u.email.toLowerCase() === String(flat[0]).toLowerCase());
          }
          if (lower.includes('from users where id = ?')) {
            return memoryStore.users.find((u) => u.id === flat[0]);
          }

          // Single Category & Brand
          if (lower.includes('from categories where slug = ?')) {
            return memoryStore.categories.find((c) => c.slug === flat[0]);
          }
          if (lower.includes('from categories where id = ?')) {
            return memoryStore.categories.find((c) => c.id === flat[0]);
          }
          if (lower.includes('from brands where slug = ?')) {
            return memoryStore.brands.find((b) => b.slug === flat[0]);
          }
          if (lower.includes('from brands where id = ?')) {
            return memoryStore.brands.find((b) => b.id === flat[0]);
          }

          // Single Products
          if (lower.includes('p.slug = ?') || lower.includes('products where slug = ?') || lower.includes('from products where slug = ?')) {
            return getEnrichedProducts().find((p) => p.slug === flat[0]);
          }
          if (lower.includes('p.id = ?') || lower.includes('products where id = ?') || lower.includes('from products where id = ?')) {
            return getEnrichedProducts().find((p) => p.id === flat[0]);
          }

          // Single Zones & Pickups
          if (lower.includes('from delivery_zones')) {
            return memoryStore.deliveryZones.find((z) => z.id === flat[0]) || memoryStore.deliveryZones[0];
          }
          if (lower.includes('from pickup_locations')) {
            return memoryStore.pickupLocations.find((p) => p.id === flat[0]) || memoryStore.pickupLocations[0];
          }

          // Single Orders
          if (lower.includes('from orders')) {
            if (flat[0]) {
              const target = String(flat[0]).toLowerCase();
              return memoryStore.orders.find((o) => (o.id && o.id.toLowerCase() === target) || (o.order_number && o.order_number.toLowerCase() === target) || (o.payment_reference && o.payment_reference.toLowerCase() === target));
            }
            return memoryStore.orders[0];
          }

          // Single Editorial Article
          if (lower.includes('from editorial_articles where slug = ?')) {
            return memoryStore.editorialArticles.find((a) => a.slug === flat[0]);
          }

          // Single Purchase Order
          if (lower.includes('from purchase_orders where id = ?')) {
            return memoryStore.purchaseOrders.find((p) => p.id === flat[0]);
          }

          // Single Return
          if (lower.includes('from returns where id = ?') || lower.includes('from order_returns where id = ?')) {
            return memoryStore.returns.find((r) => r.id === flat[0]);
          }

          return undefined;
        },

        all: (...params: any[]) => {
          const flat = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;

          // Store Settings as key-value pairs
          if (lower.includes('from store_settings')) {
            return Object.entries(memoryStore.settings).map(([k, v]) => ({ key: k, value: String(v) }));
          }

          // Categories with dynamic product count
          if (lower.includes('from categories')) {
            return memoryStore.categories.map((c) => ({
              ...c,
              product_count: memoryStore.products.filter((p) => p.category_id === c.id && p.is_published === 1).length,
            }));
          }

          // Brands with dynamic product count
          if (lower.includes('from brands')) {
            return memoryStore.brands.map((b) => ({
              ...b,
              product_count: memoryStore.products.filter((p) => p.brand_id === b.id && p.is_published === 1).length,
            }));
          }

          // Products query with enriched data and filtering
          if (lower.includes('from products')) {
            let list = getEnrichedProducts();

            if (lower.includes('is_published = 1')) {
              list = list.filter((p) => p.is_published === 1);
            }
            if (lower.includes('is_featured = 1')) {
              list = list.filter((p) => p.is_featured === 1);
            }
            if (lower.includes('is_bestseller = 1')) {
              list = list.filter((p) => p.is_bestseller === 1);
            }
            if (lower.includes('is_new_arrival = 1')) {
              list = list.filter((p) => p.is_new_arrival === 1);
            }
            if (lower.includes('stock_quantity <= low_stock_threshold') || lower.includes("stock_status = 'low_stock'")) {
              list = list.filter((p) => p.stock_quantity <= p.low_stock_threshold || p.stock_status === 'low_stock' || p.stock_status === 'out_of_stock');
            }

            if (flat.length > 0 && typeof flat[0] === 'string') {
              const param = flat[0];
              if (!param.startsWith('%')) {
                const byCategory = list.filter((p) => p.category_slug === param || p.category_id === param);
                if (byCategory.length > 0) return byCategory;
                const byBrand = list.filter((p) => p.brand_slug === param || p.brand_id === param);
                if (byBrand.length > 0) return byBrand;
              }
            }

            if (lower.includes('order by created_at desc')) {
              list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            }

            return list;
          }

          // Delivery Zones & Pickup Locations
          if (lower.includes('from delivery_zones')) {
            return memoryStore.deliveryZones;
          }
          if (lower.includes('from pickup_locations')) {
            return memoryStore.pickupLocations;
          }

          // Editorial Articles
          if (lower.includes('from editorial_articles')) {
            if (flat.length > 0 && flat[0]) {
              return memoryStore.editorialArticles.filter((a) => a.slug !== flat[0]);
            }
            return memoryStore.editorialArticles;
          }

          // Orders
          if (lower.includes('from orders')) {
            if (flat[0] && typeof flat[0] === 'string' && flat[0].startsWith('usr-')) {
              return memoryStore.orders.filter((o) => o.user_id === flat[0]);
            }
            return memoryStore.orders;
          }

          // Order Items
          if (lower.includes('from order_items')) {
            if (flat[0]) {
              return memoryStore.orderItems.filter((i) => i.order_id === flat[0]);
            }
            return memoryStore.orderItems;
          }

          // Reviews
          if (lower.includes('from reviews') || lower.includes('from product_reviews')) {
            const enrichedReviews = memoryStore.reviews.map((r) => {
              const prod = memoryStore.products.find((p) => p.id === r.product_id);
              const usr = memoryStore.users.find((u) => u.id === r.user_id);
              return {
                ...r,
                product_name: prod?.name || 'Skincare Essential',
                first_name: usr?.first_name || 'Verified',
                last_name: usr?.last_name || 'Customer',
              };
            });

            if (flat[0]) {
              return enrichedReviews.filter((r) => r.product_id === flat[0] && (flat[1] ? r.status === flat[1] : true));
            }
            return enrichedReviews;
          }

          // Suppliers
          if (lower.includes('from suppliers')) {
            return memoryStore.suppliers;
          }

          // Purchase Orders
          if (lower.includes('from purchase_orders')) {
            return memoryStore.purchaseOrders.map((po) => {
              const sup = memoryStore.suppliers.find((s) => s.id === po.supplier_id);
              return {
                ...po,
                supplier_name: sup?.name || 'Global Beauty Supplier',
              };
            });
          }

          // Stock Movements
          if (lower.includes('from stock_movements')) {
            return memoryStore.stockMovements.map((sm) => {
              const prod = memoryStore.products.find((p) => p.id === sm.product_id);
              return {
                ...sm,
                product_name: prod?.name || 'Product',
                product_sku: prod?.sku || 'SKU',
              };
            });
          }

          // Subscribers
          if (lower.includes('from subscribers') || lower.includes('from newsletter_subscribers')) {
            return memoryStore.subscribers;
          }

          // Enquiries
          if (lower.includes('from enquiries') || lower.includes('from contact_enquiries')) {
            return memoryStore.enquiries;
          }

          // Audit Logs
          if (lower.includes('from audit_logs')) {
            return memoryStore.auditLogs;
          }

          // Expenses
          if (lower.includes('from expenses')) {
            return memoryStore.expenses;
          }

          // Addresses
          if (lower.includes('from addresses')) {
            if (flat[0]) {
              return memoryStore.addresses.filter((a) => a.user_id === flat[0]);
            }
            return memoryStore.addresses;
          }

          // Wishlist
          if (lower.includes('from wishlist') || lower.includes('from wishlist_items')) {
            if (flat[0]) {
              return memoryStore.wishlist.filter((w) => w.user_id === flat[0]);
            }
            return memoryStore.wishlist;
          }

          // Returns
          if (lower.includes('from returns') || lower.includes('from order_returns')) {
            const enrichedReturns = memoryStore.returns.map((ret) => {
              const ord = memoryStore.orders.find((o) => o.id === ret.order_id);
              const item = memoryStore.orderItems.find((i) => i.id === ret.order_item_id);
              return {
                ...ret,
                order_number: ord?.order_number || 'BAGM-ORD',
                customer_name: ord?.customer_name || 'Customer',
                customer_email: ord?.customer_email || 'customer@example.com',
                product_name: item?.product_name || 'Product Item',
              };
            });

            if (flat[0]) {
              return enrichedReturns.filter((r) => r.user_id === flat[0] || r.order_id === flat[0]);
            }
            return enrichedReturns;
          }

          // Customers CRM query
          if (lower.includes('from users u') && lower.includes('order_count')) {
            return memoryStore.users
              .filter((u) => u.role === 'customer')
              .map((u) => {
                const userOrders = memoryStore.orders.filter((o) => o.user_id === u.id);
                const totalSpent = userOrders.filter((o) => o.payment_status === 'paid').reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);
                return {
                  ...u,
                  order_count: userOrders.length,
                  total_spent: totalSpent,
                };
              });
          }

          return [];
        },
      };
    },
  };
}
