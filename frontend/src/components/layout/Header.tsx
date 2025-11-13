'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaPhone } from 'react-icons/fa';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 shadow-md backdrop-blur-sm' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className={`text-xl font-bold ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
              AV Homologación
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="#inicio" 
              className={`text-sm font-medium transition-colors ${isScrolled ? 'text-gray-700 hover:text-primary' : 'text-white/90 hover:text-white'}`}
            >
              Inicio
            </Link>
            <Link 
              href="#que-es" 
              className={`text-sm font-medium transition-colors ${isScrolled ? 'text-gray-700 hover:text-primary' : 'text-white/90 hover:text-white'}`}
            >
              ¿Qué es?
            </Link>
            <Link 
              href="#por-que" 
              className={`text-sm font-medium transition-colors ${isScrolled ? 'text-gray-700 hover:text-primary' : 'text-white/90 hover:text-white'}`}
            >
              ¿Por qué nosotros?
            </Link>
            <Link 
              href="#proceso" 
              className={`text-sm font-medium transition-colors ${isScrolled ? 'text-gray-700 hover:text-primary' : 'text-white/90 hover:text-white'}`}
            >
              Proceso
            </Link>
            <Link 
              href="#contacto"
              className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark transition-colors"
            >
              <FaPhone className="mr-2" />
              Contacto
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              type="button" 
              className={`inline-flex items-center justify-center p-2 rounded-md ${isScrolled ? 'text-gray-700' : 'text-white'}`}
              aria-controls="mobile-menu" 
              aria-expanded="false"
            >
              <span className="sr-only">Abrir menú</span>
              <svg 
                className="h-6 w-6" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;