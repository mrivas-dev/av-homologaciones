'use client';

import { useEffect, useState, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import { useParams } from 'next/navigation';
import { 
  getHomologationById, 
  updateHomologation,
  createPayment,
  getPhotos,
  Homologation, 
  Photo,
  ApiError 
} from '../../../utils/api';
import { FiCheck, FiLoader, FiAlertCircle, FiSave, FiCreditCard } from 'react-icons/fi';
import TrailerInfoForm, { TrailerFormData } from '../../../components/homologation/TrailerInfoForm';
import OwnerInfoForm, { OwnerFormData } from '../../../components/homologation/OwnerInfoForm';
import PhotoUpload from '../../../components/homologation/PhotoUpload';

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
  onStepClick,
  disabled,
}: { 
  currentStep: number; 
  onStepClick: (step: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="w-full">
      {/* Desktop Stepper */}
      <div className="hidden md:flex items-center justify-center">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            {/* Step Circle & Content */}
            <button
              onClick={() => !disabled && onStepClick(step.id)}
              disabled={disabled}
              className={`flex flex-col items-center group focus:outline-none ${disabled ? 'cursor-wait' : 'cursor-pointer'}`}
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
                onClick={() => !disabled && onStepClick(step.id)}
                disabled={disabled}
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

// Validation types
interface FormErrors {
  trailer: Partial<Record<keyof TrailerFormData, string>>;
  owner: Partial<Record<keyof OwnerFormData, string>>;
}

// Ref handle for GeneralInfoStep
export interface GeneralInfoStepHandle {
  saveChanges: () => Promise<boolean>;
  hasUnsavedChanges: () => boolean;
}

// Step 1: General Information Content
const GeneralInfoStep = forwardRef<GeneralInfoStepHandle, {
  homologation: Homologation;
  photos: Photo[];
  onHomologationUpdate: (data: Homologation) => void;
  onPhotosChange: (photos: Photo[]) => void;
  onSavingChange: (isSaving: boolean) => void;
}>(function GeneralInfoStep({ 
  homologation,
  photos,
  onHomologationUpdate,
  onPhotosChange,
  onSavingChange,
}, ref) {
  const [trailerData, setTrailerData] = useState<TrailerFormData>({
    trailerType: homologation.trailerType || '',
    trailerDimensions: homologation.trailerDimensions || '',
    trailerNumberOfAxles: homologation.trailerNumberOfAxles || '',
    trailerLicensePlateNumber: homologation.trailerLicensePlateNumber || '',
  });

  const [ownerData, setOwnerData] = useState<OwnerFormData>({
    ownerFullName: homologation.ownerFullName || '',
    ownerEmail: homologation.ownerEmail || '',
    ownerNationalId: homologation.ownerNationalId,
    ownerPhone: homologation.ownerPhone,
  });

  const [errors, setErrors] = useState<FormErrors>({ trailer: {}, owner: {} });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Track changes
  useEffect(() => {
    const trailerChanged = 
      trailerData.trailerType !== (homologation.trailerType || '') ||
      trailerData.trailerDimensions !== (homologation.trailerDimensions || '') ||
      trailerData.trailerNumberOfAxles !== (homologation.trailerNumberOfAxles || '') ||
      trailerData.trailerLicensePlateNumber !== (homologation.trailerLicensePlateNumber || '');
    
    const ownerChanged = 
      ownerData.ownerFullName !== (homologation.ownerFullName || '') ||
      ownerData.ownerEmail !== (homologation.ownerEmail || '');

    setHasChanges(trailerChanged || ownerChanged);
  }, [trailerData, ownerData, homologation]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = { trailer: {}, owner: {} };

    // Only validate email format if provided (other fields are optional for auto-save)
    if (ownerData.ownerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerData.ownerEmail)) {
      newErrors.owner.ownerEmail = 'Ingresa un email válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors.trailer).length === 0 && Object.keys(newErrors.owner).length === 0;
  };

  const saveChanges = async (): Promise<boolean> => {
    if (!hasChanges) return true; // Nothing to save
    if (!validateForm()) return false;

    setIsSaving(true);
    onSavingChange(true);
    setSaveMessage(null);

    try {
      const updated = await updateHomologation(homologation.id, {
        trailerType: trailerData.trailerType || undefined,
        trailerDimensions: trailerData.trailerDimensions || undefined,
        trailerNumberOfAxles: trailerData.trailerNumberOfAxles || undefined,
        trailerLicensePlateNumber: trailerData.trailerLicensePlateNumber || undefined,
        ownerFullName: ownerData.ownerFullName || undefined,
        ownerEmail: ownerData.ownerEmail || undefined,
      });
      
      onHomologationUpdate(updated);
      setHasChanges(false);
      setSaveMessage({ type: 'success', text: 'Cambios guardados automáticamente' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
      return true;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Error al guardar los cambios';
      setSaveMessage({ type: 'error', text: message });
      return false;
    } finally {
      setIsSaving(false);
      onSavingChange(false);
    }
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    saveChanges,
    hasUnsavedChanges: () => hasChanges,
  }));

  const handleManualSave = async () => {
    await saveChanges();
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Save button and status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {saveMessage && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
              saveMessage.type === 'success' 
                ? 'bg-emerald-500/10 text-emerald-400' 
                : 'bg-red-500/10 text-red-400'
            }`}>
              {saveMessage.type === 'success' ? (
                <FiCheck className="w-4 h-4" />
              ) : (
                <FiAlertCircle className="w-4 h-4" />
              )}
              {saveMessage.text}
            </div>
          )}
        </div>
        
        <button
          onClick={handleManualSave}
          disabled={isSaving || !hasChanges}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
            transition-all duration-200
            ${hasChanges
              ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/20'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }
          `}
        >
          {isSaving ? (
            <FiLoader className="w-4 h-4 animate-spin" />
          ) : (
            <FiSave className="w-4 h-4" />
          )}
          {isSaving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>

      {/* Trailer Info Form */}
      <TrailerInfoForm
        initialData={trailerData}
        onChange={setTrailerData}
        errors={errors.trailer}
        disabled={isSaving}
      />

      {/* Owner Info Form */}
      <OwnerInfoForm
        initialData={ownerData}
        onChange={setOwnerData}
        errors={errors.owner}
        disabled={isSaving}
      />

      {/* Photo Upload */}
      <PhotoUpload
        homologationId={homologation.id}
        photos={photos}
        onPhotosChange={onPhotosChange}
        disabled={isSaving}
      />
    </div>
  );
});

// Step 2: Payment Content
function PaymentStep({
  homologation,
  onHomologationUpdate,
}: {
  homologation: Homologation;
  onHomologationUpdate: (data: Homologation) => void;
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const PRICE = 100; // ARS $1 = 100 cents

  const handlePayment = async () => {
    if (isProcessing || homologation.isPaid) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Create a payment record instead of changing status
      await createPayment(homologation.id, PRICE, 'MercadoPago');
      
      // Refresh homologation data to get updated isPaid status
      const updated = await getHomologationById(homologation.id);
      onHomologationUpdate(updated);
      setSuccess(true);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Error al procesar el pago';
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const isPaid = homologation.isPaid === true;
  const totalPaid = homologation.totalPaid || 0;

  return (
    <div className="animate-in">
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-semibold text-white mb-2 flex items-center justify-center gap-2">
            <FiCreditCard className="w-6 h-6 text-amber-400" />
            Pago del Trámite
          </h3>
          <p className="text-slate-400">
            Complete el pago para continuar con el proceso de homologación
          </p>
        </div>

        {/* Price Display */}
        <div className="bg-slate-800/50 rounded-lg p-6 mb-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">Monto a pagar</p>
              <p className="text-3xl font-bold text-white">
                ARS ${(PRICE / 100).toLocaleString('es-AR')}
              </p>
            </div>
            {isPaid && (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <FiCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">Pagado</span>
              </div>
            )}
          </div>
          {isPaid && totalPaid > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-sm text-slate-400">
                Total abonado: <span className="text-emerald-400 font-medium">ARS ${(totalPaid / 100).toLocaleString('es-AR')}</span>
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
            <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && !error && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
            <FiCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="text-sm text-emerald-400">
              Pago registrado correctamente. Su solicitud será revisada próximamente.
            </p>
          </div>
        )}

        {/* MercadoPago Button */}
        {!isPaid && (
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className={`
              w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg
              font-semibold text-white transition-all duration-200
              ${isProcessing
                ? 'bg-slate-700 cursor-wait'
                : 'bg-[#009EE3] hover:bg-[#0088C7] shadow-lg shadow-[#009EE3]/20 hover:shadow-[#009EE3]/30'
              }
            `}
          >
            {isProcessing ? (
              <>
                <FiLoader className="w-5 h-5 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                {/* MercadoPago Logo - Simple circle with MP */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                    <span className="text-[#009EE3] text-xs font-bold">MP</span>
                  </div>
                  <span>Pagar con MercadoPago</span>
                </div>
              </>
            )}
          </button>
        )}

        {/* Payment Info */}
        <div className="mt-6 pt-6 border-t border-slate-700">
          <p className="text-xs text-slate-500 text-center">
            Al hacer clic en "Pagar con MercadoPago", será redirigido a la plataforma de pago segura de MercadoPago
          </p>
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
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Ref to access GeneralInfoStep methods
  const generalInfoRef = useRef<GeneralInfoStepHandle>(null);

  const fetchData = useCallback(async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
      
      // Fetch homologation and photos in parallel
      const [homologationData, photosData] = await Promise.all([
        getHomologationById(id),
        getPhotos(id),
      ]);
      
      setHomologation(homologationData);
      setPhotos(photosData.data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Error al cargar la homologación');
        }
      } finally {
        setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-save before step change
  const autoSaveAndNavigate = async (targetStep: number) => {
    if (currentStep === targetStep) return;
    
    // Only auto-save if we're on step 1 (the form step)
    if (currentStep === 1 && generalInfoRef.current) {
      const hasChanges = generalInfoRef.current.hasUnsavedChanges();
      if (hasChanges) {
        setIsAutoSaving(true);
        const success = await generalInfoRef.current.saveChanges();
        setIsAutoSaving(false);
        
        if (!success) {
          // If save failed, don't navigate
          return;
        }
      }
    }
    
    setCurrentStep(targetStep);
  };

  const handleStepClick = (step: number) => {
    autoSaveAndNavigate(step);
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      autoSaveAndNavigate(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      autoSaveAndNavigate(currentStep - 1);
    }
  };

  const handleHomologationUpdate = (updated: Homologation) => {
    setHomologation(updated);
  };

  const handlePhotosChange = (newPhotos: Photo[]) => {
    setPhotos(newPhotos);
  };

  const handleSavingChange = (saving: boolean) => {
    setIsAutoSaving(saving);
  };

  // Render step content based on current step
  const renderStepContent = () => {
    if (!homologation) return null;

    switch (currentStep) {
      case 1:
        return (
          <GeneralInfoStep 
            ref={generalInfoRef}
            homologation={homologation} 
            photos={photos}
            onHomologationUpdate={handleHomologationUpdate}
            onPhotosChange={handlePhotosChange}
            onSavingChange={handleSavingChange}
          />
        );
      case 2:
        return (
          <PaymentStep 
            homologation={homologation}
            onHomologationUpdate={handleHomologationUpdate}
          />
        );
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

      {/* Auto-save indicator */}
      {isAutoSaving && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl">
            <FiLoader className="w-4 h-4 text-amber-400 animate-spin" />
            <span className="text-sm text-slate-300">Guardando cambios...</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Wizard Stepper */}
        <div className="mb-10">
          <WizardStepper 
            currentStep={currentStep} 
            onStepClick={handleStepClick}
            disabled={isAutoSaving}
          />
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800">
          <button
            onClick={handleBack}
            disabled={currentStep === 1 || isAutoSaving}
            className={`
              px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200
              ${currentStep === 1 || isAutoSaving
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
            disabled={currentStep === steps.length || isAutoSaving}
            className={`
              px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200
              ${currentStep === steps.length || isAutoSaving
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-white bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20'
              }
            `}
          >
            {isAutoSaving ? (
              <span className="flex items-center gap-2">
                <FiLoader className="w-4 h-4 animate-spin" />
                Guardando...
              </span>
            ) : currentStep === steps.length ? (
              'Finalizar'
            ) : (
              'Siguiente'
            )}
          </button>
      </div>
      </main>
    </div>
  );
}
