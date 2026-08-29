import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://trio-3d.beenedetich.workers.dev'),
  title: 'Trío 3D | Servicio de Impresión 3D y Prototipado Rápido en Paraná, Entre Ríos',
  description: 'Convertimos tus ideas y repuestos en realidad. Servicio profesional de Impresión 3D, Prototipado Rápido y Diseño CAD en Paraná, Santa Fe y Entre Ríos. Envíos y retiros en Coronel Uzin 1216.',
  keywords: [
    'Impresión 3D',
    'Impresión 3D Paraná',
    'Impresión 3D Entre Ríos',
    'Impresión 3D Santa Fe',
    'Prototipado rápido Paraná',
    'Repuestos 3D a medida',
    'Piezas discontinuadas 3D',
    'Servicio de diseño 3D',
    'Trío 3D',
    'Trío 3D Paraná',
    'Coronel Uzin 1216',
    'Impresión 3D FDM',
    'Impresión 3D Resina',
    'Macetas Voronoi',
    'Llaveros personalizados 3D',
    'Litofanías 3D',
    'Diseño CAD Argentina'
  ],
  authors: [{ name: 'Trío 3D Studio' }],
  creator: 'Trío 3D Studio',
  publisher: 'Trío 3D Studio',
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
    title: 'Trío 3D | Servicio de Impresión 3D en Paraná, Entre Ríos',
    description: 'Impresión 3D profesional, prototipado rápido y diseño de repuestos a medida en Paraná, Santa Fe y todo Entre Ríos.',
    url: 'https://trio-3d.beenedetich.workers.dev',
    siteName: 'Trío 3D Studio',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Trío 3D Studio - Servicio de Impresión 3D en Paraná',
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
    title: 'Trío 3D | Impresión 3D y Prototipado en Paraná, Entre Ríos',
    description: 'Impresiones 3D personalizadas, repuestos técnicos y prototipado rápido en Paraná y Entre Ríos.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://trio-3d.beenedetich.workers.dev',
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
    '@type': ['LocalBusiness', '3DPrintingService'],
    name: 'Trío 3D Studio',
    image: 'https://trio-3d.beenedetich.workers.dev/og-image.png',
    logo: 'https://trio-3d.beenedetich.workers.dev/images/logo.png',
    description: 'Servicio profesional de impresión 3D, prototipado rápido, repuestos técnicos a medida y diseño CAD 3D en Paraná, Entre Ríos y Santa Fe.',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Coronel Uzin 1216',
      addressLocality: 'Paraná',
      addressRegion: 'Entre Ríos',
      postalCode: '3100',
      addressCountry: 'AR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -31.73197,
      longitude: -60.5238,
    },
    hasMap: 'https://maps.google.com/?q=Coronel+Uzin+1216+Parana+Entre+Rios',
    areaServed: [
      { '@type': 'City', name: 'Paraná' },
      { '@type': 'City', name: 'Santa Fe' },
      { '@type': 'City', name: 'Oro Verde' },
      { '@type': 'City', name: 'San Benito' },
      { '@type': 'City', name: 'Colonia Avellaneda' },
      { '@type': 'City', name: 'Crespo' },
      { '@type': 'City', name: 'Diamante' },
      { '@type': 'City', name: 'Victoria' },
      { '@type': 'City', name: 'Concordia' },
      { '@type': 'City', name: 'Gualeguaychú' },
      { '@type': 'AdministrativeArea', name: 'Entre Ríos' },
    ],
    knowsAbout: [
      'Impresión 3D FDM',
      'Impresión 3D Resina SLA',
      'Prototipado Rápido',
      'Diseño 3D CAD',
      'Repuestos Descontinuados',
      'Piezas de Ingenería'
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '20:00',
      },
    ],
    telephone: '+5493434381991',
    url: 'https://trio-3d.beenedetich.workers.dev',
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
