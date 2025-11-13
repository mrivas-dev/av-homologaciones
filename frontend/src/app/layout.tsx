import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';

// Configure Inter font
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Configure Poppins font
const poppins = Poppins({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'AV Homologación | Soluciones de Homologación de Vehículos',
  description: 'Servicios profesionales de homologación de vehículos en Argentina. Obtén tu certificado de forma rápida y segura.',
  keywords: 'homologación, vehículos, certificación, trámites, automóviles, Argentina',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  openGraph: {
    title: 'AV Homologación | Soluciones de Homologación de Vehículos',
    description: 'Servicios profesionales de homologación de vehículos en Argentina. Obtén tu certificado de forma rápida y segura.',
    url: 'https://av-homologacion.com',
    siteName: 'AV Homologación',
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AV Homologación | Soluciones de Homologación de Vehículos',
    description: 'Servicios profesionales de homologación de vehículos en Argentina.',
    creator: '@avhomologacion',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}