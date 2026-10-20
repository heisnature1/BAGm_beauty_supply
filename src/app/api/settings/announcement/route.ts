import { NextResponse } from 'next/server';
import { getStoreSettings } from '@/lib/products';

export const revalidate = 0;

export async function GET() {
  try {
    const settings = getStoreSettings();
    return NextResponse.json({
      enabled: Boolean(settings.announcement_enabled),
      text: settings.announcement_text || '✨ Fast & Reliable Express Delivery across Greater Accra & Nationwide Courier Service across Ghana',
      link: '/shop',
      store_address: settings.address_line || 'Plot 42 Lagos Avenue, East Legon, Accra, Ghana',
      store_phone: settings.contact_phone || '+233 24 123 4567 / +233 55 987 6543',
      store_email: settings.contact_email || 'support@bagmbeauty.com',
      store_hours: settings.store_hours || 'Monday – Saturday: 9:00 AM – 7:00 PM GMT',
      hero_headline: settings.hero_headline || 'Your Beauty. Your Ritual. Your Glow.',
      hero_subtitle: settings.hero_subtitle || 'Discover curated beauty and skincare essentials selected to help you build a routine that feels right for you.',
      hero_primary_cta_text: settings.hero_primary_cta_text || 'Shop With Us',
    });
  } catch (error) {
    return NextResponse.json({
      enabled: true,
      text: '✨ Fast & Reliable Express Delivery across Greater Accra & Nationwide Courier Service across Ghana',
      link: '/shop',
      store_address: 'Plot 42 Lagos Avenue, East Legon, Accra, Ghana',
      store_phone: '+233 24 123 4567 / +233 55 987 6543',
      store_email: 'support@bagmbeauty.com',
      store_hours: 'Monday – Saturday: 9:00 AM – 7:00 PM GMT',
      hero_headline: 'Your Beauty. Your Ritual. Your Glow.',
      hero_subtitle: 'Discover curated beauty and skincare essentials selected to help you build a routine that feels right for you.',
      hero_primary_cta_text: 'Shop With Us',
    });
  }
}
