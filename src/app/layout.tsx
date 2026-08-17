import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://trio3d.com'),
  title: 'Trío 3D | Impresión 3D Personalizada en Paraná, Entre Ríos',
  description: 'Convertimos tus ideas en realidad. Impresiones 3D personalizadas de alta calidad en Paraná, Entre Ríos. Llaveros, decoración, soportes gamer, macetas y proyectos a medida.',
  keywords: [
    'Impresión 3D',
    'Impresión 3D Paraná',
    'Impresión 3D Entre Ríos',
    'Trío 3D',
    'Trío 3D Paraná',
    'Impresiones 3D personalizadas',
    'Coronel Uzin 1216',
    'Llaveros 3D',
    'Decoración 3D',
    'Soportes Auriculares 3D',
    'Macetas Voronoi',
    'Litofanías 3D',
    'Diseño a medida',
    'PLA',
    'PETG',
    'Argentina'
  ],
  authors: [{ name: 'Trío 3D' }],
  creator: 'Trío 3D',
  publisher: 'Trío 3D',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-182x182.png', sizes: '182x182', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Trío 3D | Impresión 3D Personalizada en Paraná, Entre Ríos',
    description: 'Impresiones 3D personalizadas de alta calidad en Paraná, Entre Ríos: llaveros, decoración, soportes gamer, macetas y proyectos a medida.',
    url: 'https://trio3d.com',
    siteName: 'Trío 3D Studio',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Trío 3D Studio - Impresión 3D Personalizada en Paraná',
      },
      {
        url: '/images/logo.png',
        width: 500,
        height: 500,
        alt: 'Trío 3D Logo',
      },
    ],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trío 3D | Impresión 3D Personalizada en Paraná, Entre Ríos',
    description: 'Impresiones 3D personalizadas de alta calidad en Paraná, Entre Ríos.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://trio3d.com',
  },
  verification: {
    google: 'googleb5fdec3ac2e0efaf',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Trío 3D',
    image: 'https://trio3d.com/og-image.png',
    logo: 'https://trio3d.com/images/logo.png',
    description: 'Impresiones 3D personalizadas de alta calidad en Paraná, Entre Ríos.',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Coronel Uzin 1216',
      addressLocality: 'Paraná',
      addressRegion: 'Entre Ríos',
      addressCountry: 'AR',
    },
    openingHours: 'Mo-Sa 09:00-20:00',
    telephone: '+5493434381991',
    url: 'https://trio3d.com',
    sameAs: [
      'https://www.instagram.com/trio3d.parana',
    ],
  };

  return (
    <html lang="es" className={`scroll-smooth ${outfit.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="182x182" href="/favicon-182x182.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </head>
      <body className="bg-dark-bg text-neutral-100 antialiased selection:bg-brand-500 selection:text-white font-sans">
        {children}
      </body>
    </html>
  );
}
