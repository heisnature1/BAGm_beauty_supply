import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { CartProvider } from '@/components/providers/CartProvider';
import { WishlistProvider } from '@/components/providers/WishlistProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';

export const metadata: Metadata = {
  title: 'BAGm Beauty Supply | Authentic Luxury Skincare & Beauty Ghana',
  description:
    'Ghana\'s premier beauty destination. Curated Ghanaian, International, and signature formulations crafted for tropical climates and melanin-rich skin. East Legon, Accra.',
  keywords: 'skincare ghana, beauty supply accra, melanin skincare, african black soap, shea butter, sun protection ghana, authentic beauty',
  openGraph: {
    title: 'BAGm Beauty Supply | Authentic Luxury Skincare & Beauty Ghana',
    description: '100% genuine skincare formulations for melanin skin in Ghana. Same-day Accra delivery.',
    url: 'https://bagmbeauty.com',
    siteName: 'BAGm Beauty Supply',
    locale: 'en_GH',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-[#FFF9FA] text-charcoal-900 font-sans antialiased flex flex-col">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
