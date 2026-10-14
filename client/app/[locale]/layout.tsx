import { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Toaster } from 'sonner';
import { locales } from '@/i18n/routing';
import '../globals.css';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isHi = locale === 'hi';

  const title = isHi
    ? 'स्कीम सेतु - आपके लिए सरकारी योजनाएं खोजें और पात्रता जांचें'
    : 'Scheme Setu - Find Government Welfare Schemes You Qualify For';

  const description = isHi
    ? 'स्कीम सेतु एक AI-संचालित नागरिक सहायता प्लेटफ़ॉर्म है। अपनी पात्रता जांचें, आवश्यक दस्तावेज देखें, और केंद्र व राज्य सरकार की योजनाओं के लिए तुरंत आवेदन करें।'
    : 'Scheme Setu is India\'s premier AI-powered government welfare scheme discovery platform. Check eligibility, required documents, and application deadlines across central and state schemes.';

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://client-gamma-beryl-99.vercel.app';

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: isHi ? '%s | स्कीम सेतु' : '%s | Scheme Setu',
    },
    description,
    keywords: [
      'Scheme Setu',
      'Government Schemes India',
      'Sarkari Yojana',
      'Welfare Scheme Eligibility',
      'SIH 2026',
      'Direct Benefit Transfer',
      'CSC Kiosk Portal',
      'Citizen Assistance Platform',
      'AI Scheme Discovery',
      'PM Yojanas',
      'National Welfare Portal',
    ],
    authors: [{ name: 'Scheme Setu Team', url: baseUrl }],
    creator: 'Scheme Setu',
    publisher: 'Scheme Setu',
    applicationName: 'Scheme Setu',
    generator: 'Next.js',
    referrer: 'origin-when-cross-origin',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    icons: {
      icon: [
        { url: '/icon.png', type: 'image/png' },
        { url: '/favicon.ico', sizes: 'any' },
      ],
      apple: [{ url: '/icon.png', sizes: '180x180', type: 'image/png' }],
      shortcut: ['/icon.png'],
    },
    manifest: '/manifest.json',
    openGraph: {
      title,
      description,
      url: baseUrl,
      siteName: 'Scheme Setu',
      locale: isHi ? 'hi_IN' : 'en_IN',
      type: 'website',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Scheme Setu - AI-Powered Government Welfare Platform',
        },
        {
          url: '/icon.png',
          width: 512,
          height: 512,
          alt: 'Scheme Setu Logo',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@SchemeSetu',
      images: ['/og-image.png', '/icon.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ...Object.fromEntries(locales.map((loc) => [loc, `/${loc}`])),
        'x-default': '/en',
      } as Record<string, string>,
    },
    category: 'Government & Welfare Services',
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const dir = ['ur', 'ks', 'sd'].includes(locale) ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col antialiased selection:bg-amber-500 selection:text-white transition-colors duration-150`}>
        <NextIntlClientProvider messages={messages}>
          <Toaster position="top-right" richColors closeButton />
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
