import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a numeric value into Ghanaian Cedi format: GH₵ 180.00
 */
export function formatGHS(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'GH₵ 0.00';
  }
  return `GH₵ ${Number(amount).toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-GH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDateOnly(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-GH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `BAGM-${year}-${randomChars}${randomNum}`;
}

export function generateReturnNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `RET-${year}-${randomNum}`;
}

export function generatePONumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `PO-${year}-${randomNum}`;
}

export function getOrderStatusLabel(status: string): { label: string; color: string } {
  switch (status) {
    case 'order_placed':
      return { label: 'Order Placed', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'awaiting_payment':
      return { label: 'Awaiting Payment', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'payment_confirmed':
      return { label: 'Payment Confirmed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'processing':
      return { label: 'Processing', color: 'bg-purple-50 text-purple-700 border-purple-200' };
    case 'ready_for_dispatch':
      return { label: 'Ready for Dispatch', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    case 'dispatched':
      return { label: 'Dispatched', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
    case 'out_for_delivery':
      return { label: 'Out for Delivery', color: 'bg-sky-50 text-sky-700 border-sky-200' };
    case 'delivered':
      return { label: 'Delivered', color: 'bg-green-50 text-green-700 border-green-200' };
    case 'ready_for_pickup':
      return { label: 'Ready for Pickup', color: 'bg-teal-50 text-teal-700 border-teal-200' };
    case 'collected':
      return { label: 'Collected', color: 'bg-green-50 text-green-700 border-green-200' };
    case 'cancelled':
      return { label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-200' };
    case 'return_requested':
      return { label: 'Return Requested', color: 'bg-orange-50 text-orange-700 border-orange-200' };
    case 'returned':
      return { label: 'Returned', color: 'bg-stone-50 text-stone-700 border-stone-200' };
    case 'refund_pending':
      return { label: 'Refund Pending', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
    case 'refunded':
      return { label: 'Refunded', color: 'bg-rose-50 text-rose-700 border-rose-200' };
    default:
      return { label: status, color: 'bg-gray-50 text-gray-700 border-gray-200' };
  }
}

export function getPaymentStatusLabel(status: string): { label: string; color: string } {
  switch (status) {
    case 'paid':
      return { label: 'Paid', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'pending':
      return { label: 'Payment Pending', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'processing':
      return { label: 'Processing', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'failed':
      return { label: 'Failed', color: 'bg-red-50 text-red-700 border-red-200' };
    case 'cancelled':
      return { label: 'Cancelled', color: 'bg-gray-50 text-gray-700 border-gray-200' };
    case 'refunded':
      return { label: 'Refunded', color: 'bg-purple-50 text-purple-700 border-purple-200' };
    default:
      return { label: status, color: 'bg-gray-50 text-gray-700 border-gray-200' };
  }
}

export function getPaymentMethodLabel(method: string): string {
  switch (method) {
    case 'paystack_momo':
      return 'Mobile Money (MTN / Telecel / AT)';
    case 'paystack_card':
      return 'Credit / Debit Card (Visa / Mastercard)';
    case 'bank_transfer':
      return 'Direct Bank Transfer';
    case 'cash_on_delivery':
      return 'Cash on Delivery (COD)';
    case 'flutterwave':
      return 'Flutterwave Payment';
    default:
      return method;
  }
}
