import crypto from 'crypto';
import { getDb } from './db';

export interface PaystackInitParams {
  email: string;
  amount: number; // in GHS (will be converted to pesewas)
  reference: string;
  callback_url: string;
  metadata?: Record<string, any>;
  channels?: string[];
}

export interface PaystackInitResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    id: number;
    status: string;
    reference: string;
    amount: number; // in pesewas
    currency: string;
    channel: string;
    paid_at: string;
    customer: {
      id: number;
      email: string;
      customer_code: string;
    };
    authorization?: {
      authorization_code: string;
      card_type: string;
      last4: string;
      bank: string;
      brand: string;
    };
  };
}

export function getPaystackSecretKey(): string {
  if (process.env.PAYSTACK_SECRET_KEY) {
    return process.env.PAYSTACK_SECRET_KEY;
  }
  const db = getDb();
  const settings = db.prepare('SELECT paystack_secret_key FROM store_settings WHERE id = ?').get('default') as any;
  return settings?.paystack_secret_key || '';
}

export function getPaystackPublicKey(): string {
  if (process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
    return process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
  }
  const db = getDb();
  const settings = db.prepare('SELECT paystack_public_key FROM store_settings WHERE id = ?').get('default') as any;
  return settings?.paystack_public_key || '';
}

export async function initializePaystackPayment(params: PaystackInitParams): Promise<PaystackInitResponse> {
  const secretKey = getPaystackSecretKey();
  if (!secretKey) {
    return {
      status: false,
      message: 'Paystack Secret Key is not configured in environment or store settings.',
    };
  }

  // Paystack expects amount in Pesewas for GHS (1 GHS = 100 pesewas)
  const amountInPesewas = Math.round(params.amount * 100);

  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: params.email,
        amount: amountInPesewas,
        currency: 'GHS',
        reference: params.reference,
        callback_url: params.callback_url,
        channels: params.channels || ['card', 'mobile_money', 'qr'],
        metadata: params.metadata || {},
      }),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Paystack initialization error:', error);
    return {
      status: false,
      message: error?.message || 'Failed to connect to Paystack payment gateway.',
    };
  }
}

export async function verifyPaystackPayment(reference: string): Promise<PaystackVerifyResponse> {
  const secretKey = getPaystackSecretKey();
  if (!secretKey) {
    return {
      status: false,
      message: 'Paystack Secret Key is not configured.',
    };
  }

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Paystack verification error:', error);
    return {
      status: false,
      message: error?.message || 'Failed to verify transaction with Paystack.',
    };
  }
}

export function verifyPaystackWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;
  const secretKey = getPaystackSecretKey();
  if (!secretKey) return false;

  const hash = crypto.createHmac('sha512', secretKey).update(rawBody).digest('hex');
  return hash === signature;
}
