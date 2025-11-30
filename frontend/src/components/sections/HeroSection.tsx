'use client';

import { useState } from 'react';
import { FaCar, FaCheckCircle, FaArrowRight, FaSpinner } from 'react-icons/fa';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { lookupOrCreateHomologation, type LookupOrCreateResponse, ApiError } from '../../utils/api';

// Import the VideoBackground component with no SSR
const VideoBackground = dynamic(
  () => import('../common/VideoBackground'),
  { ssr: true }
);

export default function HeroSection() {
  const [dni, setDni] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<LookupOrCreateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await lookupOrCreateHomologation(dni, phone);
      setResult(data);
      // TODO: In the future, redirect to continue the homologation
      // router.push(`/homologation/${data.homologation.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Hubo un error al procesar tu solicitud. Por favor, intentá de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative h-screen flex items-center justify-center text-white overflow-hidden">
      {/* Video Background */}
      <VideoBackground 
        videoSrc="/videos/hero-video.mp4"
        posterSrc='/hero-placeholder.png'
        className="z-0"
      />
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50 z-0" />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-24 md:py-32">
      
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/10 backdrop-blur-sm mb-6">
              <FaCar className="mr-2" />
              <span>Líderes en homologación vehicular</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Homologación de vehículos <span className="text-secondary-light">rápida y segura</span>
            </h1>
            
            <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto lg:mx-0">
              Obtén tu certificado de homologación con los mejores expertos del sector. 
              Proceso 100% online y con el respaldo de profesionales certificados.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="#contacto" className="btn btn-secondary">
                Solicitar presupuesto
                <FaArrowRight className="ml-2" />
              </Link>
              <Link href="#proceso" className="btn btn-outline text-white border-white/20 hover:bg-white/10">
                Conocer el proceso
              </Link>
            </div>
            
            <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-4 text-sm">
              <div className="flex items-center">
                <FaCheckCircle className="text-green-400 mr-2" />
                <span>Más de 1,000 vehículos homologados</span>
              </div>
              <div className="flex items-center">
                <FaCheckCircle className="text-green-400 mr-2" />
                <span>Asesoramiento personalizado</span>
              </div>
              <div className="flex items-center">
                <FaCheckCircle className="text-green-400 mr-2" />
                <span>Sin vueltas ni trámites engorrosos</span>
              </div>
            </div>
          </div>
          
          {/* Right column - Form */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-xl border border-white/10">
            {result ? (
              // Success state
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {result.found ? '¡Ya tenés una solicitud!' : '¡Solicitud creada!'}
                </h3>
                <p className="text-gray-200 mb-4">
                  {result.found
                    ? 'Encontramos tu homologación existente. Pronto te contactaremos.'
                    : 'Tu solicitud fue registrada exitosamente. Pronto te contactaremos.'}
                </p>
                <p className="text-sm text-gray-300 mb-6">
                  ID de solicitud: <span className="font-mono text-white">{result.homologation.id.slice(0, 8)}...</span>
                </p>
                <button
                  onClick={() => {
                    setResult(null);
                    setDni('');
                    setPhone('');
                  }}
                  className="text-secondary-light hover:text-white transition-colors text-sm underline"
                >
                  Enviar otra solicitud
                </button>
              </div>
            ) : (
              // Form state
              <>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">¿Querés saber si tu auto se puede homologar?</h3>
                  <p className="text-gray-200">Dejanos tus datos y te contactamos a la brevedad</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="dni" className="block text-sm font-medium text-gray-200 mb-1">
                      DNI
                    </label>
                    <input
                      type="text"
                      id="dni"
                      name="dni"
                      required
                      value={dni}
                      onChange={(e) => setDni(e.target.value)}
                      disabled={isLoading}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-secondary focus:border-transparent text-white placeholder-gray-300 disabled:opacity-50"
                      placeholder="Número de DNI"
                      inputMode="numeric"
                      pattern="\d*"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-200 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={isLoading}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-secondary focus:border-transparent text-white placeholder-gray-300 disabled:opacity-50"
                      placeholder="Ingresá tu teléfono"
                    />
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm">
                      {error}
                    </div>
                  )}
                  
                  <div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-primary bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          Enviar solicitud
                          <FaArrowRight className="ml-2" />
                        </>
                      )}
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-300 text-center mt-4">
                    Al enviar este formulario, aceptas nuestra{' '}
                    <a href="#" className="text-white font-medium hover:underline">Política de Privacidad</a>.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
