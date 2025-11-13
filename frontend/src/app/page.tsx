import dynamic from 'next/dynamic';
import Layout from '../components/layout/Layout';

// Import sections with dynamic imports for better performance
const HeroSection = dynamic(() => import('../components/sections/HeroSection'));
const WhatIsSection = dynamic(() => import('../components/sections/WhatIsSection'));
const WhySection = dynamic(() => import('../components/sections/WhySection'));
const ProcessSection = dynamic(() => import('../components/sections/ProcessSection'));
const CTASection = dynamic(() => import('../components/sections/CTASection'));

export default function Home() {
  return (
    <Layout>
      <section id="inicio">
        <HeroSection />
      </section>
      
      <section id="que-es" className="py-16 bg-gray-50 dark:bg-gray-800">
        <WhatIsSection />
      </section>
      
      <section id="por-que" className="py-16">
        <WhySection />
      </section>
      
      <section id="proceso" className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <ProcessSection />
      </section>
      
      <section id="contacto" className="py-16 bg-primary-dark text-white">
        <CTASection />
      </section>
    </Layout>
  );
}