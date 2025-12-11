import { FiClipboard, FiUpload, FiCheckCircle, FiTruck } from 'react-icons/fi';

const steps = [
  {
    title: 'Carga de datos',
    description: 'Completá la información del titular y del vehículo en menos de 5 minutos.',
    icon: FiClipboard,
  },
  {
    title: 'Subida de documentos',
    description: 'Adjuntá fotos y comprobantes. Te guiamos con ejemplos y validaciones.',
    icon: FiUpload,
  },
  {
    title: 'Revisión técnica',
    description: 'Nuestro equipo valida la documentación y te avisa si falta algo.',
    icon: FiCheckCircle,
  },
  {
    title: 'Homologación lista',
    description: 'Recibís la constancia y podés circular con tu vehículo sin demoras.',
    icon: FiTruck,
  },
];

const ProcessSection = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          Cómo es el proceso
        </h2>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Seguimos un flujo simple y transparente para homologar tu vehículo sin trámites
          complicados.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              className="rounded-2xl bg-white dark:bg-gray-900 shadow-lg shadow-primary/5 border border-gray-100 dark:border-gray-800 p-6 flex items-start gap-4"
            >
              <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-primary/10 text-primary dark:text-amber-400 dark:bg-amber-400/10 flex items-center justify-center">
                <Icon className="h-6 w-6" aria-hidden />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-primary/80 dark:text-amber-400">
                    Paso {index + 1}
                  </span>
                  <span className="h-px w-8 bg-gray-200 dark:bg-gray-700" aria-hidden />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessSection;
