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
  title: 'Trío 3D | Impresión 3D Personalizada de Alta Calidad',
  description: 'Convertimos tus ideas en realidad. Impresiones 3D personalizadas de alta calidad: llaveros, decoración, soportes gamer, macetas, regalos con foto y proyectos a medida.',
  keywords: [
    'Impresión 3D',
    'Trío 3D',
    'Impresiones 3D personalizadas',
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
  openGraph: {
    title: 'Trío 3D | Convertimos tus ideas en realidad',
    description: 'Impresiones 3D personalizadas de alta calidad. Presupuestos al instante por WhatsApp.',
    url: 'https://trio3d.com',
    siteName: 'Trío 3D Studio',
    images: [
      {
        url: '/images/hero.png',
        width: 1200,
        height: 630,
        alt: 'Trío 3D Studio - Impresión 3D',
      },
    ],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trío 3D | Convertimos tus ideas en realidad',
    description: 'Impresiones 3D personalizadas de alta calidad.',
    images: ['/images/hero.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://trio3d.com',
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
    image: 'https://trio3d.com/images/hero.png',
    description: 'Impresiones 3D personalizadas de alta calidad.',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'AR',
    },
    openingHours: 'Mo-Sa 09:00-20:00',
    telephone: '+5493434381991',
    url: 'https://trio3d.com',
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
      </head>
      <body className="bg-dark-bg text-neutral-100 antialiased selection:bg-brand-500 selection:text-white font-sans">
        {children}
      </body>
    </html>
  );
}
