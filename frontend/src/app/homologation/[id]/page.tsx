'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getHomologationById, Homologation, ApiError } from '../../../utils/api';
import { FiCheck, FiLoader, FiAlertCircle } from 'react-icons/fi';

// Step configuration
interface Step {
  id: number;
  name: string;
  description: string;
}

const steps: Step[] = [
  { id: 1, name: 'Información General', description: 'Datos del vehículo y propietario' },
  { id: 2, name: 'Pago', description: 'Realizar el pago del trámite' },
  { id: 3, name: 'Revisión', description: 'Revisión y aprobación final' },
];

// Stepper Component
function WizardStepper({ 
  currentStep, 
  onStepClick 
}: { 
  currentStep: number; 
  onStepClick: (step: number) => void;
}) {
  return (
    <div className="w-full">
      {/* Desktop Stepper */}
      <div className="hidden md:flex items-center justify-center">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            {/* Step Circle & Content */}
            <button
              onClick={() => onStepClick(step.id)}
              className="flex flex-col items-center group cursor-pointer focus:outline-none"
            >
              {/* Step Circle */}
              <div
                className={`
                  relative flex items-center justify-center w-12 h-12 rounded-full 
                  border-2 transition-all duration-300 ease-in-out
                  ${currentStep === step.id 
                    ? 'bg-amber-500 border-amber-500 shadow-lg shadow-amber-500/30' 
                    : currentStep > step.id 
                      ? 'bg-emerald-500 border-emerald-500' 
                      : 'bg-slate-800 border-slate-600 group-hover:border-slate-500'
                  }
                `}
              >
                {currentStep > step.id ? (
                  <FiCheck className="w-5 h-5 text-white" />
                ) : (
                  <span className={`text-sm font-semibold ${
                    currentStep === step.id ? 'text-white' : 'text-slate-400'
                  }`}>
                    {step.id}
                  </span>
                )}
              </div>
              
              {/* Step Label */}
              <div className="mt-3 text-center">
                <p className={`text-sm font-medium transition-colors ${
                  currentStep === step.id 
                    ? 'text-amber-400' 
                    : currentStep > step.id 
                      ? 'text-emerald-400' 
                      : 'text-slate-400 group-hover:text-slate-300'
                }`}>
                  {step.name}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 max-w-[140px]">
                  {step.description}
                </p>
              </div>
            </button>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex items-center mx-4 mb-10">
                <div
                  className={`h-0.5 w-20 lg:w-32 transition-colors duration-300 ${
                    currentStep > step.id ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile Stepper */}
      <div className="md:hidden">
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <button
                onClick={() => onStepClick(step.id)}
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full 
                  border-2 transition-all duration-300
                  ${currentStep === step.id 
                    ? 'bg-amber-500 border-amber-500 shadow-lg shadow-amber-500/30' 
                    : currentStep > step.id 
                      ? 'bg-emerald-500 border-emerald-500' 
                      : 'bg-slate-800 border-slate-600'
                  }
                `}
              >
                {currentStep > step.id ? (
                  <FiCheck className="w-4 h-4 text-white" />
                ) : (
                  <span className={`text-sm font-semibold ${
                    currentStep === step.id ? 'text-white' : 'text-slate-400'
                  }`}>
                    {step.id}
                  </span>
                )}
              </button>
              
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${
                    currentStep > step.id ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        
        {/* Current Step Label */}
        <div className="text-center">
          <p className="text-sm font-medium text-amber-400">
            {steps.find(s => s.id === currentStep)?.name}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {steps.find(s => s.id === currentStep)?.description}
          </p>
        </div>
      </div>
    </div>
  );
}

// Step 1: General Information Content
function GeneralInfoStep({ homologation }: { homologation: Homologation }) {
  return (
    <div className="animate-in">
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">
          Información de la Homologación
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ID */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">ID</p>
              <p className="text-sm font-mono text-slate-300">{homologation.id}</p>
            </div>
            
            {/* Status */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Estado</p>
              <p className="text-sm text-slate-300">{homologation.status}</p>
            </div>
            
            {/* Phone */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Teléfono</p>
              <p className="text-sm text-slate-300">{homologation.ownerPhone || '-'}</p>
            </div>
            
            {/* DNI */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">DNI/CUIT</p>
              <p className="text-sm text-slate-300">{homologation.ownerNationalId || '-'}</p>
            </div>
            
            {/* Full Name */}
            {homologation.ownerFullName && (
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Nombre Completo</p>
                <p className="text-sm text-slate-300">{homologation.ownerFullName}</p>
              </div>
            )}
            
            {/* Email */}
            {homologation.ownerEmail && (
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Email</p>
                <p className="text-sm text-slate-300">{homologation.ownerEmail}</p>
              </div>
            )}
            
            {/* Trailer Type */}
            {homologation.trailerType && (
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Tipo de Trailer</p>
                <p className="text-sm text-slate-300">{homologation.trailerType}</p>
              </div>
            )}
            
            {/* Trailer Dimensions */}
            {homologation.trailerDimensions && (
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Dimensiones</p>
                <p className="text-sm text-slate-300">{homologation.trailerDimensions}</p>
              </div>
            )}
            
            {/* Number of Axles */}
            {homologation.trailerNumberOfAxles && (
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Número de Ejes</p>
                <p className="text-sm text-slate-300">{homologation.trailerNumberOfAxles}</p>
              </div>
            )}
            
            {/* License Plate */}
            {homologation.trailerLicensePlateNumber && (
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Patente</p>
                <p className="text-sm text-slate-300">{homologation.trailerLicensePlateNumber}</p>
              </div>
            )}
          </div>
          
          {/* Timestamps */}
          <div className="pt-4 border-t border-slate-700/50">
            <div className="flex flex-wrap gap-4 text-xs text-slate-500">
              <span>Creado: {new Date(homologation.createdAt).toLocaleDateString('es-AR')}</span>
              <span>Actualizado: {new Date(homologation.updatedAt).toLocaleDateString('es-AR')}</span>
              <span>Versión: {homologation.version}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 2: Payment Content
function PaymentStep() {
  return (
    <div className="animate-in">
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-white mb-2">Pago</h3>
          <p className="text-slate-400">Próximamente</p>
        </div>
      </div>
    </div>
  );
}

// Step 3: Review Content
function ReviewStep() {
  return (
    <div className="animate-in">
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-white mb-2">Revisión</h3>
          <p className="text-slate-400">Próximamente</p>
        </div>
      </div>
    </div>
  );
}

// Main Page Component
export default function HomologationTrackingPage() {
  const params = useParams();
  const id = params.id as string;

  const [homologation, setHomologation] = useState<Homologation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    async function fetchHomologation() {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const data = await getHomologationById(id);
        setHomologation(data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Error al cargar la homologación');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchHomologation();
  }, [id]);

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Render step content based on current step
  const renderStepContent = () => {
    if (!homologation) return null;

    switch (currentStep) {
      case 1:
        return <GeneralInfoStep homologation={homologation} />;
      case 2:
        return <PaymentStep />;
      case 3:
        return <ReviewStep />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Error</h2>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!homologation) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="w-8 h-8 text-slate-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No encontrado</h2>
          <p className="text-slate-400">Homologación no encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <span className="text-sm font-bold text-white">AV</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">Homologación</h1>
                <p className="text-xs text-slate-400">Seguimiento de trámite</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Wizard Stepper */}
        <div className="mb-10">
          <WizardStepper currentStep={currentStep} onStepClick={handleStepClick} />
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`
              px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200
              ${currentStep === 1
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-300 bg-slate-800 hover:bg-slate-700'
              }
            `}
          >
            Anterior
          </button>

          <div className="text-sm text-slate-500">
            Paso {currentStep} de {steps.length}
          </div>

          <button
            onClick={handleNext}
            disabled={currentStep === steps.length}
            className={`
              px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200
              ${currentStep === steps.length
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-white bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20'
              }
            `}
          >
            {currentStep === steps.length ? 'Finalizar' : 'Siguiente'}
          </button>
        </div>
      </main>
    </div>
  );
}
