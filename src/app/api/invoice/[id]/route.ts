import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { formatGHS, formatDate } from '@/lib/utils';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const order = db.prepare('SELECT * FROM orders WHERE id = ? OR order_number = ?').get(params.id, params.id) as any;

    if (!order) {
      return new NextResponse('Order not found', { status: 404 });
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id) as any[];

    let deliveryAddress: any = null;
    if (order.delivery_address) {
      try {
        deliveryAddress = typeof order.delivery_address === 'string' ? JSON.parse(order.delivery_address) : order.delivery_address;
      } catch {}
    }

    const paymentStatus = (order.payment_status || 'pending').toUpperCase();
    const paymentMethod = (order.payment_method || 'momo').toUpperCase().replace(/_/g, ' ');
    const fulfilmentType = (order.fulfilment_type || 'delivery').toUpperCase();

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice #${order.order_number || order.id} - BAGm Beauty Supply</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      color: #1a1a1a;
      background: #ffffff;
      padding: 40px;
      font-size: 13px;
      line-height: 1.5;
    }
    .invoice-card {
      max-width: 800px;
      margin: 0 auto;
      border: 1px solid #e5e5e5;
      padding: 48px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #f2e1df;
      padding-bottom: 24px;
      margin-bottom: 32px;
    }
    .brand-title {
      font-family: 'Playfair Display', serif;
      font-size: 26px;
      font-weight: 700;
      color: #922244;
      letter-spacing: -0.5px;
    }
    .brand-sub {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #888;
      margin-top: 2px;
    }
    .invoice-meta {
      text-align: right;
    }
    .invoice-title {
      font-family: 'Playfair Display', serif;
      font-size: 22px;
      color: #1a1a1a;
      font-weight: 700;
    }
    .meta-text {
      font-size: 12px;
      color: #555;
      margin-top: 2px;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      margin-top: 6px;
    }
    .badge-paid { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
    .badge-unpaid { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
    
    .addresses {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-bottom: 32px;
    }
    .addr-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #922244;
      margin-bottom: 8px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 32px;
    }
    th {
      background: #fbf7f7;
      text-align: left;
      padding: 12px 16px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #555;
      border-bottom: 2px solid #e5e5e5;
    }
    td {
      padding: 14px 16px;
      border-bottom: 1px solid #eee;
    }
    .text-right {
      text-align: right;
    }
    
    .totals {
      margin-left: auto;
      width: 320px;
      border-top: 2px solid #f2e1df;
      padding-top: 16px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 13px;
      color: #555;
    }
    .grand-total {
      font-size: 18px;
      font-weight: 700;
      color: #922244;
      border-top: 1px solid #e5e5e5;
      padding-top: 12px;
      margin-top: 8px;
    }
    
    .footer {
      margin-top: 48px;
      border-top: 1px solid #eee;
      padding-top: 24px;
      text-align: center;
      font-size: 11px;
      color: #777;
    }

    @media print {
      body { padding: 0; background: none; }
      .invoice-card { border: none; box-shadow: none; padding: 0; max-width: 100%; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="max-width: 800px; margin: 0 auto 20px auto; display: flex; justify-content: flex-end; gap: 12px;">
    <button onclick="window.print()" style="background: #922244; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer;">
      🖨️ Print / Save PDF
    </button>
  </div>

  <div class="invoice-card">
    <div class="header">
      <div>
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
          <img src="/logo.png" alt="BAGm Beauty Supply" style="height: 48px; border-radius: 6px; background: #000; padding: 2px;" />
          <div>
            <div class="brand-title" style="margin-bottom: 0;">BAGm Beauty Supply</div>
            <div class="brand-sub">Luxury Skincare & Authenticity Hub</div>
          </div>
        </div>
        <p class="meta-text" style="margin-top: 8px;">
          Lagos Avenue, East Legon, Accra, Ghana<br/>
          Tel: +233 24 123 4567 • Web: bagmbeauty.com<br/>
          TIN: C0028918237
        </p>
      </div>

      <div class="invoice-meta">
        <div class="invoice-title">OFFICIAL INVOICE</div>
        <div class="meta-text"><strong>Invoice #:</strong> ${order.order_number || order.id}</div>
        <div class="meta-text"><strong>Issue Date:</strong> ${formatDate(order.created_at)}</div>
        <span class="badge ${order.payment_status === 'paid' ? 'badge-paid' : 'badge-unpaid'}">
          Payment: ${paymentStatus}
        </span>
      </div>
    </div>

    <div class="addresses">
      <div>
        <div class="addr-title">Billed &amp; Delivered To:</div>
        <p><strong>${order.customer_name}</strong></p>
        <p>${order.customer_email}</p>
        <p>${order.customer_phone || ''}</p>
        ${
          order.fulfilment_type === 'delivery' && deliveryAddress
            ? `<p style="margin-top: 4px;">${deliveryAddress.street_address || deliveryAddress.street || ''}<br/>${deliveryAddress.city || 'Accra'}, ${deliveryAddress.region || 'Greater Accra'}</p>`
            : '<p style="margin-top: 4px;">Store Pickup at East Legon Flagship</p>'
        }
      </div>

      <div>
        <div class="addr-title">Payment &amp; Logistics Details:</div>
        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
        <p><strong>Fulfilment Mode:</strong> ${fulfilmentType}</p>
        ${order.payment_reference ? `<p><strong>Reference:</strong> ${order.payment_reference}</p>` : ''}
        ${order.courier_name ? `<p><strong>Courier:</strong> ${order.courier_name}</p>` : ''}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Item Description</th>
          <th>SKU</th>
          <th class="text-right">Unit Price</th>
          <th class="text-right">Qty</th>
          <th class="text-right">Total Amount</th>
        </tr>
      </thead>
      <tbody>
        ${(items || [])
          .map(
            (i) => `
          <tr>
            <td><strong>${i.product_name}</strong></td>
            <td style="font-family: monospace; font-size: 11px;">${i.sku}</td>
            <td class="text-right">${formatGHS(i.unit_price)}</td>
            <td class="text-right">${i.quantity}</td>
            <td class="text-right"><strong>${formatGHS(i.total_price)}</strong></td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-row">
        <span>Items Subtotal:</span>
        <span>${formatGHS(order.subtotal)}</span>
      </div>
      <div class="totals-row">
        <span>Ghana Delivery Fee:</span>
        <span>${formatGHS(order.delivery_fee)}</span>
      </div>
      <div class="totals-row grand-total">
        <span>Grand Total Due:</span>
        <span>${formatGHS(order.total_amount)}</span>
      </div>
    </div>

    <div class="footer">
      <p>Thank you for choosing BAGm Beauty Supply. 100% Genuine Skincare & Melanin Formulations.</p>
      <p style="margin-top: 4px; color: #999;">For inquiries or routine consultations, contact support@bagmbeauty.com or visit our East Legon store.</p>
    </div>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
