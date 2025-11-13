import { Metadata } from 'next';
import { ReactNode } from 'react';
import ClientLayout from './ClientLayout';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export const metadata: Metadata = {
  title: 'AV Homologación - Expertos en Homologación de Vehículos',
  description: 'Somos expertos en homologación de vehículos en Argentina. Te ayudamos a legalizar tu vehículo de forma rápida y segura.',
  openGraph: {
    type: 'website',
    url: 'https://avhomologacion.com/',
    title: 'AV Homologación - Expertos en Homologación de Vehículos',
    description: 'Somos expertos en homologación de vehículos en Argentina. Te ayudamos a legalizar tu vehículo de forma rápida y segura.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AV Homologación',
      },
    ],
    siteName: 'AV Homologación',
    locale: 'es_AR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AV Homologación - Expertos en Homologación de Vehículos',
    description: 'Somos expertos en homologación de vehículos en Argentina. Te ayudamos a legalizar tu vehículo de forma rápida y segura.',
    images: ['/images/og-image.jpg'],
  },
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function Layout({ 
  children, 
  title = 'AV Homologación', 
  description = 'Expertos en homologación de vehículos en Argentina' 
}: LayoutProps) {
  return (
    <ClientLayout>
      {children}
    </ClientLayout>
  );
}
