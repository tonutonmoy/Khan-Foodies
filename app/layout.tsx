import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display, Poppins, Geist } from 'next/font/google';
import './globals.css';
import './product-cards.css';
import './gallery.css';
import { JsonLd } from '@/components/json-ld';
import { MetaPixel } from '@/components/meta-pixel';
import { Providers } from './providers';

const themeScript = `(function(){try{var t=localStorage.getItem('khanfoods-theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://khanfoods.com.bd';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Khan Foodies | Premium Organic Mango & Gourmet Foods Bangladesh',
    template: '%s | Khan Foodies',
  },
  description:
    'Buy premium Rajshahi Himsagar mango, organic honey, amsotto & pure gourmet foods. Cash on delivery across Bangladesh. 100% chemical-free.',
  keywords: [
    'Khan Foodies',
    'Khan Foods',
    'organic mango Bangladesh',
    'Rajshahi Himsagar',
    'premium honey',
    'amsotto',
    'organic food delivery Dhaka',
    'খান ফুডিজ',
  ],
  authors: [{ name: 'Khan Foodies' }],
  openGraph: {
    type: 'website',
    locale: 'bn_BD',
    alternateLocale: 'en_US',
    url: siteUrl,
    siteName: 'Khan Foodies',
    title: 'Khan Foodies | Premium Organic Delicacies',
    description: 'Hand-picked natural honey, premium mangoes, and organic superfoods delivered across Bangladesh.',
    images: [
      {
        url: '/khan-foodies-logo.png',
        width: 1200,
        height: 630,
        alt: 'Khan Foodies — Premium Organic Foods',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Khan Foodies | Premium Organic Delicacies',
    description: 'Pure organic mango, honey & gourmet foods — delivered across Bangladesh.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: '/khan-foodies-logo.png',
    apple: '/khan-foodies-logo.png',
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Khan Foodies',
  },
  formatDetection: {
    telephone: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1a234d',
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={`${inter.variable} ${playfair.variable} ${poppins.variable} ${geist.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <JsonLd />
        <MetaPixel />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
