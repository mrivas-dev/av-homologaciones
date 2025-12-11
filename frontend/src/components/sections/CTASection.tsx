import Link from 'next/link';
import { FiPhone, FiMail, FiArrowRight } from 'react-icons/fi';

const CTASection = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-white/5 border border-white/10 shadow-2xl overflow-hidden">
        <div className="grid md:grid-cols-3">
          <div className="md:col-span-2 p-8 md:p-10 space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-amber-200">
              Listo para homologar
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              Empezá hoy y evitá demoras en ruta
            </h2>
            <p className="text-lg text-white/80">
              Te acompañamos en cada paso para que tus papeles estén en regla sin perder tiempo.
              Resolvemos dudas y validamos tu documentación rápido.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="tel:+5491122334455"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-primary font-semibold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition transform"
              >
                <FiPhone className="h-4 w-4" />
                Llamar ahora
              </Link>
              <Link
                href="mailto:contacto@av-homologacion.com"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/30 text-white font-semibold hover:bg-white/10 transition"
              >
                <FiMail className="h-4 w-4" />
                Escribir por mail
              </Link>
            </div>
            <p className="text-sm text-white/70">
              Horario de atención: Lunes a viernes de 9 a 18 hs (ART).
            </p>
          </div>
          <div className="p-8 md:p-10 bg-black/20 border-t md:border-l border-white/10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-100 text-sm font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Tiempo estimado
            </div>
            <div className="space-y-2">
              <p className="text-white/70 text-sm">Proceso completo</p>
              <p className="text-3xl font-bold text-white">48 - 72 hs*</p>
              <p className="text-white/60 text-sm">
                *Tiempos sujetos a la documentación entregada y validaciones necesarias.
              </p>
            </div>
            <div className="pt-4">
              <Link
                href="#proceso"
                className="inline-flex items-center gap-2 text-white font-semibold hover:text-amber-100 transition"
              >
                Ver el paso a paso
                <FiArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTASection;
