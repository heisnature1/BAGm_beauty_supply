import { NextResponse } from 'next/server';
import { getStoreSettings } from '@/lib/products';

export async function GET() {
  try {
    const settings = getStoreSettings();
    return NextResponse.json({
      enabled: Boolean(settings.announcement_enabled),
      text: settings.announcement_text || '✨ Fast & Reliable Express Delivery across Greater Accra & Nationwide Courier Service across Ghana',
      link: '/shop',
    });
  } catch (error) {
    return NextResponse.json({
      enabled: true,
      text: '✨ Fast & Reliable Express Delivery across Greater Accra & Nationwide Courier Service across Ghana',
      link: '/shop',
    });
  }
}
