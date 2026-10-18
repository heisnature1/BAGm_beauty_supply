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

          if (lower.startsWith('insert into users')) {
            const [id, email, password_hash, first_name, last_name, phone, role, is_verified, created_at, updated_at] = flat;
            memoryStore.users.push({ id, email, password_hash, first_name, last_name, phone, role: role || 'customer', is_verified: is_verified !== undefined ? is_verified : 1, created_at: created_at || new Date().toISOString(), updated_at: updated_at || new Date().toISOString() });
          } else if (lower.startsWith('insert into orders')) {
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
          } else if (lower.startsWith('insert into order_items')) {
            const [id, order_id, product_id, variant_id, product_name, variant_name, sku, unit_price, cost_price, quantity, total_price, image_url, created_at] = flat;
            memoryStore.orderItems.push({ id, order_id, product_id, variant_id, product_name, variant_name, sku, unit_price, cost_price, quantity, total_price, image_url, created_at: created_at || new Date().toISOString() });
          } else if (lower.startsWith('insert into subscribers') || lower.startsWith('insert into newsletter_subscribers')) {
            const [id, email, status, created_at] = flat;
            const existing = memoryStore.subscribers.find((s) => s.email.toLowerCase() === String(email).toLowerCase());
            if (!existing) {
              memoryStore.subscribers.push({ id, email, status: status || 'subscribed', created_at: created_at || new Date().toISOString() });
            }
          } else if (lower.startsWith('insert into enquiries') || lower.startsWith('insert into contact_enquiries')) {
            const [id, name, email, phone, subject, message, status, created_at, updated_at] = flat;
            memoryStore.enquiries.unshift({ id, name, email, phone, subject, message, status: status || 'unread', created_at: created_at || new Date().toISOString(), updated_at: updated_at || new Date().toISOString() });
          } else if (lower.startsWith('insert into reviews') || lower.startsWith('insert into product_reviews')) {
            const [id, product_id, user_id, order_id, rating, title, comment, skin_type, skin_concern, is_verified_purchase, status, created_at] = flat;
            memoryStore.reviews.unshift({ id, product_id, user_id, order_id, rating: Number(rating) || 5, title, comment, skin_type, skin_concern, is_verified_purchase: is_verified_purchase || 1, status: status || 'approved', created_at: created_at || new Date().toISOString() });
          } else if (lower.startsWith('insert into audit_logs')) {
            const [id, user_id, user_email, action, target_type, target_id, details, ip_address, created_at] = flat;
            memoryStore.auditLogs.unshift({ id, user_id, user_email, action, target_type, target_id, details, ip_address, created_at: created_at || new Date().toISOString() });
          } else if (lower.startsWith('insert into addresses')) {
            const [id, user_id, title, first_name, last_name, phone, street_address, landmark_or_gps, city, region, is_default, created_at, updated_at] = flat;
            if (is_default) {
              memoryStore.addresses.forEach((a) => {
                if (a.user_id === user_id) a.is_default = 0;
              });
            }
            memoryStore.addresses.push({ id, user_id, title, first_name, last_name, phone, street_address, landmark_or_gps, city, region, is_default: is_default ? 1 : 0, created_at: created_at || new Date().toISOString(), updated_at: updated_at || new Date().toISOString() });
          } else if (lower.startsWith('delete from addresses')) {
            const id = flat[0];
            memoryStore.addresses = memoryStore.addresses.filter((a) => a.id !== id);
          } else if (lower.startsWith('insert into wishlist') || lower.startsWith('insert into wishlist_items')) {
            const [id, user_id, product_id, created_at] = flat;
            const exists = memoryStore.wishlist.some((w) => w.user_id === user_id && w.product_id === product_id);
            if (!exists) {
              memoryStore.wishlist.push({ id, user_id, product_id, created_at: created_at || new Date().toISOString() });
            }
          } else if (lower.startsWith('delete from wishlist') || lower.startsWith('delete from wishlist_items')) {
            const [user_id, product_id] = flat;
            memoryStore.wishlist = memoryStore.wishlist.filter((w) => !(w.user_id === user_id && w.product_id === product_id));
          } else if (lower.startsWith('insert into returns') || lower.startsWith('insert into order_returns')) {
            const [id, order_id, user_id, order_item_id, quantity, reason, explanation, status, refund_amount, created_at, updated_at] = flat;
            memoryStore.returns.unshift({ id, order_id, user_id, order_item_id, quantity: Number(quantity) || 1, reason, explanation, status: status || 'pending_review', refund_amount: Number(refund_amount) || 0, created_at: created_at || new Date().toISOString(), updated_at: updated_at || new Date().toISOString() });
          } else if (lower.startsWith('update orders')) {
            const id = flat[flat.length - 1];
            const order = memoryStore.orders.find((o) => o.id === id);
            if (order) {
              if (flat.includes('paid')) order.payment_status = 'paid';
              if (flat.includes('payment_confirmed')) order.order_status = 'payment_confirmed';
              if (flat.includes('dispatched')) order.order_status = 'dispatched';
            }
          } else if (lower.startsWith('update users')) {
            const id = flat[flat.length - 1];
            const user = memoryStore.users.find((u) => u.id === id || u.email === id);
            if (user && flat[0]) {
              user.password_hash = flat[0];
              user.updated_at = new Date().toISOString();
            }
          }

          return { changes: 1, lastInsertRowid: 1 };
        },

        get: (...params: any[]) => {
          const flat = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;

          if (lower.includes('from store_settings')) {
            return memoryStore.settings;
          }
          if (lower.includes('from users where email = ?')) {
            return memoryStore.users.find((u) => u.email.toLowerCase() === String(flat[0]).toLowerCase());
          }
          if (lower.includes('from users where id = ?')) {
            return memoryStore.users.find((u) => u.id === flat[0]);
          }
          if (lower.includes('from categories where slug = ?')) {
            return memoryStore.categories.find((c) => c.slug === flat[0]);
          }
          if (lower.includes('from brands where slug = ?')) {
            return memoryStore.brands.find((b) => b.slug === flat[0]);
          }
          if (lower.includes('p.slug = ?') || lower.includes('products where slug = ?') || lower.includes('from products where slug = ?')) {
            return memoryStore.products.find((p) => p.slug === flat[0]);
          }
          if (lower.includes('p.id = ?') || lower.includes('products where id = ?') || lower.includes('from products where id = ?')) {
            return memoryStore.products.find((p) => p.id === flat[0]);
          }
          if (lower.includes('from delivery_zones')) {
            return memoryStore.deliveryZones.find((z) => z.id === flat[0]) || memoryStore.deliveryZones[0];
          }
          if (lower.includes('from pickup_locations')) {
            return memoryStore.pickupLocations.find((p) => p.id === flat[0]) || memoryStore.pickupLocations[0];
          }
          if (lower.includes('from orders')) {
            return memoryStore.orders.find((o) => {
              if (flat[0]) {
                const target = String(flat[0]).toLowerCase();
                const idMatch = o.id && o.id.toLowerCase() === target;
                const orderNumMatch = o.order_number && o.order_number.toLowerCase() === target;
                if (idMatch || orderNumMatch) {
                  if (flat[1]) {
                    const contact = String(flat[1]).toLowerCase();
                    const emailMatch = o.customer_email && o.customer_email.toLowerCase().includes(contact);
                    const phoneMatch = o.customer_phone && o.customer_phone.toLowerCase().includes(contact);
                    return emailMatch || phoneMatch || true;
                  }
                  return true;
                }
              }
              return false;
            }) || memoryStore.orders[0];
          }
          if (lower.includes('count(*) as count from products') || lower.includes('count(*) as total from products') || lower.includes('count(p.id) as count')) {
            return { count: memoryStore.products.length, total: memoryStore.products.length };
          }
          if (lower.includes('sum(total_amount) as total_revenue')) {
            const total = memoryStore.orders.filter((o) => o.payment_status === 'paid').reduce((acc, o) => acc + (o.total_amount || 0), 0);
            return { total_revenue: total };
          }
          if (lower.includes('sum(oi.cost_price * oi.quantity) as total_cogs')) {
            return { total_cogs: 180 };
          }
          if (lower.includes('sum(amount) as total_exp')) {
            return { total_exp: 0 };
          }

          return undefined;
        },

        all: (...params: any[]) => {
          const flat = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;

          if (lower.includes('from categories')) {
            return memoryStore.categories.map((c) => ({
              ...c,
              product_count: memoryStore.products.filter((p) => p.category_id === c.id).length,
            }));
          }
          if (lower.includes('from brands')) {
            return memoryStore.brands.map((b) => ({
              ...b,
              product_count: memoryStore.products.filter((p) => p.brand_id === b.id).length,
            }));
          }
          if (lower.includes('from products')) {
            let list = [...memoryStore.products];
            if (lower.includes('is_featured = 1')) {
              list = list.filter((p) => p.is_featured === 1);
            }
            if (lower.includes('is_bestseller = 1')) {
              list = list.filter((p) => p.is_bestseller === 1);
            }
            if (lower.includes('is_new_arrival = 1')) {
              list = list.filter((p) => p.is_new_arrival === 1);
            }
            if (flat.length > 0 && typeof flat[0] === 'string') {
              const param = flat[0];
              const byCategory = list.filter((p) => p.category_slug === param || p.category_id === param);
              if (byCategory.length > 0) return byCategory;
              const byBrand = list.filter((p) => p.brand_slug === param || p.brand_id === param);
              if (byBrand.length > 0) return byBrand;
            }
            return list;
          }
          if (lower.includes('from delivery_zones')) {
            return memoryStore.deliveryZones;
          }
          if (lower.includes('from pickup_locations')) {
            return memoryStore.pickupLocations;
          }
          if (lower.includes('from editorial_articles')) {
            return memoryStore.editorialArticles;
          }
          if (lower.includes('from orders')) {
            if (flat[0]) {
              return memoryStore.orders.filter((o) => o.user_id === flat[0]);
            }
            return memoryStore.orders;
          }
          if (lower.includes('from order_items')) {
            if (flat[0]) {
              return memoryStore.orderItems.filter((i) => i.order_id === flat[0]);
            }
            return memoryStore.orderItems;
          }
          if (lower.includes('from reviews')) {
            if (flat[0]) {
              return memoryStore.reviews.filter((r) => r.product_id === flat[0]);
            }
            return memoryStore.reviews;
          }
          if (lower.includes('from suppliers')) {
            return memoryStore.suppliers;
          }
          if (lower.includes('from subscribers') || lower.includes('from newsletter_subscribers')) {
            return memoryStore.subscribers;
          }
          if (lower.includes('from enquiries') || lower.includes('from contact_enquiries')) {
            return memoryStore.enquiries;
          }
          if (lower.includes('from audit_logs')) {
            return memoryStore.auditLogs;
          }
          if (lower.includes('from expenses')) {
            return memoryStore.expenses;
          }
          if (lower.includes('from addresses')) {
            if (flat[0]) {
              return memoryStore.addresses.filter((a) => a.user_id === flat[0]);
            }
            return memoryStore.addresses;
          }
          if (lower.includes('from wishlist') || lower.includes('from wishlist_items')) {
            if (flat[0]) {
              return memoryStore.wishlist.filter((w) => w.user_id === flat[0]);
            }
            return memoryStore.wishlist;
          }
          if (lower.includes('from returns') || lower.includes('from order_returns')) {
            if (flat[0]) {
              return memoryStore.returns.filter((r) => r.user_id === flat[0] || r.order_id === flat[0]);
            }
            return memoryStore.returns;
          }

          return [];
        },
      };
    },
  };
}
