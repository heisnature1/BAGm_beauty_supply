import { getDb } from './db';
import crypto from 'crypto';
import { formatGHS, formatDate } from './utils';

export interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  html: string;
  previewText?: string;
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const db = getDb();
  const logId = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  // In production, integration with Resend / SendGrid / Postmark / SMTP can be configured via RESEND_API_KEY / SMTP_HOST
  // If an external key is set, we attempt provider dispatch; otherwise we log and persist to database for full traceability.
  let isDelivered = true;
  let errorMessage: string | null = null;

  try {
    if (process.env.RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'BAGm Beauty Supply <orders@bagmbeauty.com>',
          to: options.to,
          subject: options.subject,
          html: options.html,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        isDelivered = false;
        errorMessage = JSON.stringify(err);
      }
    } else {
      // Development & Sandbox logger
      console.log(`[Transactional Email] TO: ${options.to} | SUBJECT: ${options.subject} | TEMPLATE: ${options.template}`);
    }

    // Persist to email_logs table for audit & inspection
    db.prepare(`
      INSERT INTO email_logs (id, recipient, subject, template, status, error_message, body_preview, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      logId,
      options.to,
      options.subject,
      options.template,
      isDelivered ? 'sent' : 'failed',
      errorMessage,
      options.html.substring(0, 500) + '...',
      createdAt
    );

    return {
      success: isDelivered,
      messageId: logId,
      error: errorMessage || undefined,
    };
  } catch (error: any) {
    console.error('Email delivery error:', error);
    db.prepare(`
      INSERT INTO email_logs (id, recipient, subject, template, status, error_message, body_preview, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      logId,
      options.to,
      options.subject,
      options.template,
      'failed',
      error?.message || 'Unknown error',
      options.html.substring(0, 500) + '...',
      createdAt
    );
    return { success: false, error: error?.message };
  }
}

// Branded Email Template Builder
function wrapEmailTemplate(content: string, previewText: string = ''): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BAGm Beauty Supply</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF9F6; margin: 0; padding: 0; color: #1F2937; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #FCE7EC; }
    .header { background: linear-gradient(135deg, #FFF5F7 0%, #FDF2F4 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #FCE7EC; }
    .logo { font-size: 24px; font-weight: 700; letter-spacing: 2px; color: #9D174D; text-transform: uppercase; margin: 0; }
    .tagline { font-size: 11px; letter-spacing: 3px; color: #C5A059; text-transform: uppercase; margin-top: 4px; font-weight: 600; }
    .content { padding: 36px 32px; }
    .heading { font-size: 22px; font-weight: 700; color: #111827; margin-top: 0; margin-bottom: 16px; }
    .text { font-size: 15px; line-height: 1.6; color: #4B5563; margin-bottom: 20px; }
    .button { display: inline-block; background-color: #BE185D; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; text-align: center; letter-spacing: 0.5px; }
    .card { background-color: #FFF9FA; border: 1px solid #FCE7EC; border-radius: 8px; padding: 20px; margin: 24px 0; }
    .footer { background-color: #FAF9F6; padding: 24px; text-align: center; font-size: 12px; color: #9CA3AF; border-top: 1px solid #F3F4F6; }
    .footer a { color: #BE185D; text-decoration: none; }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${previewText}
  </div>
  <div class="container">
    <div class="header">
      <div class="logo">BAGM BEAUTY SUPPLY</div>
      <div class="tagline">Your Beauty • Your Ritual • Your Glow</div>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p style="margin: 0 0 8px 0;"><strong>BAGm Beauty Supply</strong> — East Legon, Accra, Ghana</p>
      <p style="margin: 0 0 8px 0;">Quality Skincare, Facial Treatments & Fragrances</p>
      <p style="margin: 0;">Have questions? Contact us at <a href="mailto:support@bagmbeauty.com">support@bagmbeauty.com</a> or +233 24 123 4567</p>
    </div>
  </div>
</body>
</html>
  `;
}

export async function sendOrderConfirmationEmail(order: any, items: any[]) {
  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #FCE7EC;">
          <strong>${item.product_name}</strong> ${item.variant_name ? `<span style="color:#6B7280;font-size:12px;">(${item.variant_name})</span>` : ''}
          <br><span style="font-size:12px;color:#9CA3AF;">Qty: ${item.quantity} × ${formatGHS(item.unit_price)}</span>
        </td>
        <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #FCE7EC; font-weight: 600;">
          ${formatGHS(item.total_price)}
        </td>
      </tr>
    `
    )
    .join('');

  const content = `
    <h1 class="heading">Thank you for your order, ${order.customer_name}! ✨</h1>
    <p class="text">We have received your order <strong>#${order.order_number}</strong> and our team is preparing it with care.</p>
    
    <div class="card">
      <h3 style="margin-top:0;margin-bottom:12px;color:#9D174D;font-size:16px;">Order Summary</h3>
      <table style="width: 100%; border-collapse: collapse;">
        ${itemsHtml}
        <tr>
          <td style="padding: 12px 0 6px 0; color: #4B5563;">Subtotal</td>
          <td style="padding: 12px 0 6px 0; text-align: right; font-weight: 600;">${formatGHS(order.subtotal)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #4B5563;">Delivery Fee</td>
          <td style="padding: 6px 0; text-align: right; font-weight: 600;">${formatGHS(order.delivery_fee)}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; font-size: 16px; font-weight: 700; color: #111827; border-top: 2px solid #FCE7EC;">Total</td>
          <td style="padding: 12px 0; text-align: right; font-size: 18px; font-weight: 700; color: #BE185D; border-top: 2px solid #FCE7EC;">${formatGHS(order.total_amount)}</td>
        </tr>
      </table>
    </div>

    <div style="margin: 24px 0;">
      <p style="margin: 0 0 6px 0; font-weight: 600; color: #111827;">Fulfilment Details:</p>
      <p style="margin: 0; color: #4B5563; font-size: 14px;">
        ${order.fulfilment_type === 'delivery' ? '🚚 <strong>Home / Office Delivery</strong>' : '🏬 <strong>Store Pickup</strong>'}<br>
        Payment Method: <strong>${order.payment_method}</strong> (${order.payment_status === 'paid' ? 'Paid ✅' : 'Pending'})
      </p>
    </div>

    <div style="text-align: center; margin-top: 32px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track-order?ref=${order.order_number}&email=${encodeURIComponent(order.customer_email)}" class="button">Track Your Order Status</a>
    </div>
  `;

  return sendEmail({
    to: order.customer_email,
    subject: `Order Confirmed #${order.order_number} — BAGm Beauty Supply`,
    template: 'order_confirmation',
    html: wrapEmailTemplate(content, `Your BAGm Beauty Supply order #${order.order_number} has been placed.`),
  });
}

export async function sendPaymentConfirmedEmail(order: any) {
  const content = `
    <h1 class="heading">Payment Confirmed! 💳✨</h1>
    <p class="text">We have successfully verified your payment of <strong>${formatGHS(order.total_amount)}</strong> for order <strong>#${order.order_number}</strong>.</p>
    <div class="card">
      <p style="margin:0 0 6px 0;"><strong>Payment Reference:</strong> ${order.payment_reference || 'N/A'}</p>
      <p style="margin:0 0 6px 0;"><strong>Date:</strong> ${formatDate(new Date().toISOString())}</p>
      <p style="margin:0;"><strong>Status:</strong> <span style="color:#059669;font-weight:600;">Confirmed & Paid</span></p>
    </div>
    <p class="text">Your order is now being processed for dispatch. You will receive another notification when your package is on its way.</p>
  `;

  return sendEmail({
    to: order.customer_email,
    subject: `Payment Receipt: Order #${order.order_number} — BAGm Beauty Supply`,
    template: 'payment_confirmed',
    html: wrapEmailTemplate(content, `Payment received for order #${order.order_number}`),
  });
}

export async function sendOrderDispatchedEmail(order: any, courierName?: string, trackingRef?: string) {
  const content = `
    <h1 class="heading">Your Beauty Essentials are on their way! 🚚✨</h1>
    <p class="text">Great news, ${order.customer_name}! Your order <strong>#${order.order_number}</strong> has been packaged and handed over for delivery.</p>
    <div class="card">
      <p style="margin:0 0 8px 0;"><strong>Courier / Delivery Service:</strong> ${courierName || 'BAGm Express Delivery'}</p>
      ${trackingRef ? `<p style="margin:0 0 8px 0;"><strong>Tracking / Contact Ref:</strong> ${trackingRef}</p>` : ''}
      <p style="margin:0;"><strong>Estimated Delivery:</strong> 24–48 Hours</p>
    </div>
    <div style="text-align: center; margin-top: 24px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track-order?ref=${order.order_number}&email=${encodeURIComponent(order.customer_email)}" class="button">Track Package</a>
    </div>
  `;

  return sendEmail({
    to: order.customer_email,
    subject: `Your order #${order.order_number} is on the way! — BAGm Beauty Supply`,
    template: 'order_dispatched',
    html: wrapEmailTemplate(content, `Your BAGm Beauty Supply package is on its way!`),
  });
}

export async function sendPasswordResetEmail(email: string, resetToken: string, name: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/account/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
  const content = `
    <h1 class="heading">Reset Your Password</h1>
    <p class="text">Hello ${name},</p>
    <p class="text">We received a request to reset the password for your BAGm Beauty Supply customer account. Click the button below to choose a new password.</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${resetUrl}" class="button">Reset Password</a>
    </div>
    <p class="text" style="font-size: 13px; color: #9CA3AF;">This link will expire in 2 hours. If you did not request a password reset, you can safely ignore this email.</p>
  `;

  return sendEmail({
    to: email,
    subject: `Reset Your Password — BAGm Beauty Supply`,
    template: 'password_reset',
    html: wrapEmailTemplate(content, `Password reset link for your BAGm Beauty Supply account`),
  });
}

export async function sendAdminNewOrderAlert(order: any, totalItems: number) {
  const content = `
    <h1 class="heading">🔔 New Store Order Received!</h1>
    <p class="text">A new customer order has just been placed on BAGm Beauty Supply.</p>
    <div class="card">
      <p style="margin:0 0 6px 0;"><strong>Order Number:</strong> #${order.order_number}</p>
      <p style="margin:0 0 6px 0;"><strong>Customer:</strong> ${order.customer_name} (${order.customer_phone})</p>
      <p style="margin:0 0 6px 0;"><strong>Total Amount:</strong> ${formatGHS(order.total_amount)}</p>
      <p style="margin:0 0 6px 0;"><strong>Payment Method:</strong> ${order.payment_method}</p>
      <p style="margin:0;"><strong>Fulfilment:</strong> ${order.fulfilment_type.toUpperCase()}</p>
    </div>
    <div style="text-align: center; margin-top: 24px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/orders/${order.id}" class="button">View Order in Dashboard</a>
    </div>
  `;

  return sendEmail({
    to: process.env.ADMIN_EMAIL || 'admin@bagmbeauty.com',
    subject: `🚨 New Order #${order.order_number} (${formatGHS(order.total_amount)})`,
    template: 'admin_order_alert',
    html: wrapEmailTemplate(content, `New order received #${order.order_number}`),
  });
}

export async function sendLowStockAlert(productName: string, sku: string, currentStock: number) {
  const content = `
    <h1 class="heading" style="color:#DC2626;">⚠️ Low Stock Alert</h1>
    <p class="text">The following product has reached its low stock threshold:</p>
    <div class="card">
      <p style="margin:0 0 6px 0;"><strong>Product:</strong> ${productName}</p>
      <p style="margin:0 0 6px 0;"><strong>SKU:</strong> ${sku}</p>
      <p style="margin:0;"><strong>Current Available Stock:</strong> <span style="color:#DC2626;font-weight:700;">${currentStock} units</span></p>
    </div>
    <p class="text">Please create a purchase order or restock to avoid stockout.</p>
  `;

  return sendEmail({
    to: process.env.ADMIN_EMAIL || 'admin@bagmbeauty.com',
    subject: `⚠️ Low Stock Alert: ${productName} (${currentStock} left)`,
    template: 'low_stock_alert',
    html: wrapEmailTemplate(content, `Low stock alert for ${productName}`),
  });
}
