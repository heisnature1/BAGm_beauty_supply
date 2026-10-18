# BAGm Beauty Supply — Ghana Premier Luxury Beauty Destination

BAGm Beauty Supply is a modern, full-stack e-commerce web application tailored specifically for the Ghanaian beauty market with prices denominated in Ghanaian Cedi (`GH₵`).

---

## ✨ Features & Architecture

### 1. **Storefront & Catalog**
- **Brand Palette:** Blush pink (`#FAF2F2`), soft rose (`#922244`), elegant white, and subtle warm gold accents with Playfair Display serif headings and clean sans body typography.
- **Dynamic Announcement Bar:** Real-time store notices and regional shipping alerts.
- **Interactive Skincare Routine Finder:** 4-step diagnostic questionnaire tailored for melanin-rich skin and tropical Ghanaian humidity (oily, dry, combination, hyperpigmentation, blemishes).
- **Product Catalog:** Multi-faceted filtering by brand, category, price range, skin type, and concerns, with instant live search and stock levels.
- **Genuine Reviews:** Verified customer purchase reviews with skin type and concern badges.

### 2. **Ghana-First Logistics & Checkout**
- **Delivery Zones:** Greater Accra Central (GH₵ 35), Outskirts / East Legon / Spintex (GH₵ 45), Extended (GH₵ 60), Ashanti (GH₵ 65), Western & Central (GH₵ 65), and Northern / Volta / Eastern courier (GH₵ 80).
- **Flagship Pickups:** East Legon Flagship and Osu Oxford Street pickup locations.
- **Payment Methods:** Paystack integration (Mobile Money — MTN MoMo, Telecel Cash, AT Money, Bank Cards), Manual Bank Transfer (GCB Account), and Cash on Delivery (COD).
- **Atomic Stock Management:** Prevents overselling with atomic server-side inventory verification and deductions.

### 3. **Customer Accounts & Order Tracking**
- **Authentication:** JWT HTTP-only cookie-based authentication and secure session management.
- **Account Dashboard:** Real-time order history, delivery timeline tracking, saved Ghanaian addresses, return/refund requests, and beauty wishlist.
- **Guest Tracking:** Public order tracking by Order Number and phone number / email at `/track-order`.

### 4. **Protected Administration Dashboard (`/admin`)**
- **Executive Analytics:** Live Revenue, Net Margin, COGS, Active Orders, and Stock alerts.
- **Inventory & Purchase Orders:** Stock adjustment ledger, suppliers management, PO creation, and receipt workflows.
- **Orders & Fulfilment:** Status management, payment confirmation, courier assignment, and tracking references.
- **Invoices:** Printable official HTML invoice / PDF receipts with Ghanaian TIN.
- **Financial Expenses:** Tracking operational expenses and net margins.
- **Audit Logs:** Immutable audit log trail for all admin actions.

---

## 🚀 Default Credentials

- **Admin Account:** `admin@bagmbeauty.com` / `admin123`
- **Customer Account:** `customer@bagmbeauty.com` / `customer123`

---

## 🗄️ Database Setup

- PostgreSQL schema with initial seed data is available in `supabase_schema.sql` for one-click setup in Supabase SQL Editor.
