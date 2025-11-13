'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <Header />
      
      <main className="flex-grow">
        {children}
      </main>
      
      <Footer />
      
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        body {
          padding-top: 0;
        }
      `}</style>
    </div>
  );
}
