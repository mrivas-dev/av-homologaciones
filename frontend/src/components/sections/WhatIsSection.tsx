import { FaCarAlt, FaFileAlt, FaShieldAlt, FaClock } from 'react-icons/fa';

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 h-full">
    <div className="text-primary text-3xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2 text-dark dark:text-white">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300">{description}</p>
  </div>
);

export default function WhatIsSection() {
  const features = [
    {
      icon: <FaCarAlt />,
      title: '¿Qué es la homologación?',
      description: 'Proceso técnico que verifica que un vehículo cumple con las normas de seguridad y medioambientales vigentes en Argentina.',
    },
    {
      icon: <FaFileAlt />,
      title: 'Documentación',
      description: 'Te asesoramos en la obtención de toda la documentación necesaria para el trámite de homologación.',
    },
    {
      icon: <FaShieldAlt />,
      title: 'Seguridad garantizada',
      description: 'Verificamos que tu vehículo cumpla con todos los estándares de seguridad requeridos por la normativa vigente.',
    },
    {
      icon: <FaClock />,
      title: 'Ahorro de tiempo',
      description: 'Simplificamos el proceso para que obtengas tu certificado en el menor tiempo posible.',
    },
  ];

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          <span className="text-primary">¿Qué es</span> la homologación de vehículos?
        </h2>
        <div className="w-24 h-1 bg-secondary mx-auto my-6"></div>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          La homologación vehicular es un procedimiento obligatorio que garantiza que tu vehículo cumple con las normas de seguridad y medioambientales establecidas en Argentina.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>

      <div className="mt-16 bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 md:p-12 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">¿Necesitas asesoramiento personalizado?</h3>
          <p className="text-lg mb-6 text-white/90">
            Nuestros expertos están listos para responder todas tus preguntas y guiarte en el proceso de homologación de tu vehículo.
          </p>
          <a
            href="#contacto"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-white hover:bg-gray-100 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
          >
            Contáctanos ahora
          </a>
        </div>
      </div>
    </div>
  );
}
