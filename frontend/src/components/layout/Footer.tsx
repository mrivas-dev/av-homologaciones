import Link from 'next/link';
import { FiMail, FiPhone, FiExternalLink } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-200 border-t border-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 text-primary dark:text-amber-400 dark:bg-amber-400/10">
              <span className="text-sm font-bold">AV Homologación</span>
            </div>
            <p className="text-sm text-slate-400">
              Soluciones rápidas y confiables para homologar tu vehículo sin trámites eternos.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wide">Navegación</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Link href="#inicio" className="hover:text-white transition">Inicio</Link>
              <Link href="#que-es" className="hover:text-white transition">¿Qué es?</Link>
              <Link href="#por-que" className="hover:text-white transition">¿Por qué nosotros?</Link>
              <Link href="#proceso" className="hover:text-white transition">Proceso</Link>
              <Link href="#contacto" className="hover:text-white transition">Contacto</Link>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wide">Contacto</h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="tel:+5491122334455" className="inline-flex items-center gap-2 hover:text-white transition">
                <FiPhone className="h-4 w-4" aria-hidden />
                +54 9 11 2233 4455
              </Link>
              <Link href="mailto:contacto@av-homologacion.com" className="inline-flex items-center gap-2 hover:text-white transition">
                <FiMail className="h-4 w-4" aria-hidden />
                contacto@av-homologacion.com
              </Link>
              <p className="text-slate-400">Lunes a viernes · 9 a 18 hs (ART)</p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AV Homologación. Todos los derechos reservados.</p>
          <p className="text-slate-500">
            Tiempos sujetos a revisión documental y normativa vigente.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;