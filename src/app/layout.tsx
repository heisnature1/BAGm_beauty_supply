import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { CartProvider } from '@/components/providers/CartProvider';
import { WishlistProvider } from '@/components/providers/WishlistProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { PWAInstallPrompt } from '@/components/common/PWAInstallPrompt';

export const viewport: Viewport = {
  themeColor: '#922244',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://bagmbeauty.com'),
  title: 'BAGm Beauty Supply | Authentic Luxury Skincare & Beauty Ghana',
  description:
    'Ghana\'s premier beauty destination. Curated Ghanaian, International, and signature formulations crafted for tropical climates and melanin-rich skin. East Legon, Accra.',
  keywords: 'skincare ghana, beauty supply accra, melanin skincare, african black soap, shea butter, sun protection ghana, authentic beauty',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BAGm Beauty',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'BAGm Beauty Supply | Authentic Luxury Skincare & Beauty Ghana',
    description: '100% genuine skincare formulations for melanin skin in Ghana. Same-day Accra delivery.',
    url: 'https://bagmbeauty.com',
    siteName: 'BAGm Beauty Supply',
    images: [
      {
        url: '/logo.png',
        width: 419,
        height: 270,
        alt: 'BAGm Beauty Supply Logo',
      },
    ],
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
                <PWAInstallPrompt />
              </ToastProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
