import { FaCheckCircle, FaCarCrash, FaFileInvoiceDollar, FaClock, FaCarSide, FaUserShield } from 'react-icons/fa';

type BenefitCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

const BenefitCard = ({ icon, title, description }: BenefitCardProps) => (
  <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 h-full">
    <div className="text-primary text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2 text-dark dark:text-white">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300">{description}</p>
  </div>
);

export default function WhySection() {
  const benefits = [
    {
      icon: <FaCheckCircle />,
      title: 'Cumplimiento legal',
      description: 'Evita multas y sanciones por circular sin la documentación en regla.',
    },
    {
      icon: <FaCarCrash />,
      title: 'Seguridad vial',
      description: 'Asegúrate de que tu vehículo cumple con los estándares de seguridad necesarios.',
    },
    {
      icon: <FaFileInvoiceDollar />,
      title: 'Valor de reventa',
      description: 'Mantén el valor de tu vehículo con una documentación al día y en regla.',
    },
    {
      icon: <FaClock />,
      title: 'Ahorro de tiempo',
      description: 'Nos encargamos de todo el proceso para que no pierdas tiempo en trámites burocráticos.',
    },
    {
      icon: <FaCarSide />,
      title: 'Movilidad sin restricciones',
      description: 'Circula por todo el país sin preocupaciones por controles viales.',
    },
    {
      icon: <FaUserShield />,
      title: 'Protección legal',
      description: 'Respaldo legal en caso de siniestros o inspecciones técnicas.',
    },
  ];

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          <span className="text-primary">¿Por qué</span> homologar tu vehículo?
        </h2>
        <div className="w-24 h-1 bg-secondary mx-auto my-6"></div>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          La homologación de tu vehículo no solo es un requisito legal, sino también una garantía de seguridad y tranquilidad para ti y tu familia.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {benefits.map((benefit, index) => (
          <BenefitCard
            key={index}
            icon={benefit.icon}
            title={benefit.title}
            description={benefit.description}
          />
        ))}
      </div>

      <div className="mt-16 bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-12 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="md:flex items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
              <h3 className="text-2xl font-bold mb-4">¿Sabías que...?</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Más del 30% de los vehículos en circulación en Argentina no cuentan con la documentación al día, lo que puede generar multas y complicaciones legales.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-200">Evita multas de hasta $500.000</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-200">Proceso 100% garantizado</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-200">Asesoramiento personalizado</span>
                </li>
              </ul>
            </div>
            <div className="md:w-1/2 bg-primary/5 dark:bg-white/5 p-6 rounded-xl">
              <h4 className="text-xl font-bold mb-4 text-center">Beneficios exclusivos</h4>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-primary/10 dark:bg-white/10 p-2 rounded-lg mr-4">
                    <FaCarSide className="text-primary text-xl" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-dark dark:text-white">Inspección gratuita</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Revisión inicial sin costo de tu documentación</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary/10 dark:bg-white/10 p-2 rounded-lg mr-4">
                    <FaClock className="text-primary text-xl" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-dark dark:text-white">Tiempo récord</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Entrega de certificados en tiempo récord</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary/10 dark:bg-white/10 p-2 rounded-lg mr-4">
                    <FaUserShield className="text-primary text-xl" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-dark dark:text-white">Asesoría legal</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Soporte legal durante todo el proceso</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
