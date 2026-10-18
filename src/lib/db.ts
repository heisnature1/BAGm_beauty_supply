import { INITIAL_STORE_DATA } from './storeData';

let dbInstance: any = null;

// Global in-memory persistent store
const memoryStore = {
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
};

export function getDb(): any {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = createUniversalDbClient();
  return dbInstance;
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
            memoryStore.users.push({ id, email, password_hash, first_name, last_name, phone, role, is_verified: is_verified || 1, created_at, updated_at });
          } else if (lower.startsWith('insert into orders')) {
            const [id, order_number, user_id, customer_name, customer_email, customer_phone, fulfilment_type, delivery_zone_id, delivery_address, pickup_location_id, subtotal, delivery_fee, total_amount, currency, payment_method, payment_status, payment_reference, payment_channel, order_status, courier_name, tracking_reference, scheduled_delivery_date, customer_notes, admin_notes, is_guest, guest_access_token, created_at, updated_at] = flat;
            memoryStore.orders.unshift({ id, order_number, user_id, customer_name, customer_email, customer_phone, fulfilment_type, delivery_zone_id, delivery_address, pickup_location_id, subtotal, delivery_fee, total_amount, currency, payment_method, payment_status, payment_reference, payment_channel, order_status, courier_name, tracking_reference, scheduled_delivery_date, customer_notes, admin_notes, is_guest, guest_access_token, created_at, updated_at });
          } else if (lower.startsWith('insert into order_items')) {
            const [id, order_id, product_id, variant_id, product_name, variant_name, sku, unit_price, cost_price, quantity, total_price, image_url, created_at] = flat;
            memoryStore.orderItems.push({ id, order_id, product_id, variant_id, product_name, variant_name, sku, unit_price, cost_price, quantity, total_price, image_url, created_at });
          } else if (lower.startsWith('insert into subscribers')) {
            const [id, email, status, created_at] = flat;
            memoryStore.subscribers.push({ id, email, status: status || 'subscribed', created_at });
          } else if (lower.startsWith('insert into enquiries')) {
            const [id, name, email, phone, subject, message, status, created_at, updated_at] = flat;
            memoryStore.enquiries.unshift({ id, name, email, phone, subject, message, status: status || 'unread', created_at, updated_at });
          } else if (lower.startsWith('insert into reviews')) {
            const [id, product_id, user_id, order_id, rating, title, comment, skin_type, skin_concern, is_verified_purchase, status, created_at] = flat;
            memoryStore.reviews.unshift({ id, product_id, user_id, order_id, rating, title, comment, skin_type, skin_concern, is_verified_purchase, status, created_at });
          } else if (lower.startsWith('insert into audit_logs')) {
            const [id, user_id, user_email, action, target_type, target_id, details, ip_address, created_at] = flat;
            memoryStore.auditLogs.unshift({ id, user_id, user_email, action, target_type, target_id, details, ip_address, created_at });
          } else if (lower.startsWith('update orders')) {
            const id = flat[flat.length - 1];
            const order = memoryStore.orders.find((o) => o.id === id);
            if (order) {
              if (flat.includes('paid')) order.payment_status = 'paid';
              if (flat.includes('payment_confirmed')) order.order_status = 'payment_confirmed';
              if (flat.includes('dispatched')) order.order_status = 'dispatched';
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
          if (lower.includes('from products where slug = ?')) {
            return memoryStore.products.find((p) => p.slug === flat[0]);
          }
          if (lower.includes('from products where id = ?')) {
            return memoryStore.products.find((p) => p.id === flat[0]);
          }
          if (lower.includes('from orders where id = ? or order_number = ?') || lower.includes('from orders where id = ?')) {
            return memoryStore.orders.find((o) => o.id === flat[0] || o.order_number === flat[0] || (flat[1] && o.order_number === flat[1]));
          }
          if (lower.includes('count(*) as count from products')) {
            return { count: memoryStore.products.length };
          }
          if (lower.includes('count(*) as total from products')) {
            return { total: memoryStore.products.length };
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
          if (lower.includes('from subscribers')) {
            return memoryStore.subscribers;
          }
          if (lower.includes('from enquiries')) {
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

          return [];
        },
      };
    },
  };
}
