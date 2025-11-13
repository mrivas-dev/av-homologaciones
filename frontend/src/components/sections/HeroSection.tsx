import { FaCar, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Import the VideoBackground component with no SSR
const VideoBackground = dynamic(
  () => import('../common/VideoBackground'),
  { ssr: true }
);

export default function HeroSection() {
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
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">¿Querés saber si tu auto se puede homologar?</h3>
              <p className="text-gray-200">Dejanos tus datos y te contactamos a la brevedad</p>
            </div>
            
            <form className="space-y-4">
              <div>
                <label htmlFor="dni" className="block text-sm font-medium text-gray-200 mb-1">
                  DNI
                </label>
                <input
                  type="number"
                  id="dni"
                  name="dni"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-secondary focus:border-transparent text-white placeholder-gray-300"
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
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-secondary focus:border-transparent text-white placeholder-gray-300"
                  placeholder="Ingresá tu teléfono"
                />
              </div>
              
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-primary bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors"
                >
                  Enviar solicitud
                  <FaArrowRight className="ml-2" />
                </button>
              </div>
              
              <p className="text-xs text-gray-300 text-center mt-4">
                Al enviar este formulario, aceptas nuestra{' '}
                <a href="#" className="text-white font-medium hover:underline">Política de Privacidad</a>.
              </p>
            </form>
          </div>
        </div>
      </div>
      
      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg 
          className="w-full h-16 md:h-24 text-white" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" 
            fill="currentColor"
          ></path>
        </svg>
      </div>
    </div>
  );
}
