'use client';

import { useEffect, useState, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getHomologationById,
  updateHomologation,
  createPayment,
  getPhotos,
  getDocuments,
  submitHomologation,
  getDocumentUrl,
  formatFileSize,
  getTrailerTypes,
  findTrailerTypeByName,
  Homologation,
  Photo,
  AdminDocument,
  PublicTrailerType,
  ApiError
} from '../../../utils/api';
import { FiCheck, FiLoader, FiAlertCircle, FiSave, FiCreditCard, FiSend, FiTruck, FiUser, FiCamera, FiClock, FiCheckCircle, FiXCircle, FiFileText, FiDownload, FiEye } from 'react-icons/fi';
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
                  <span className={`text-sm font-semibold ${currentStep === step.id ? 'text-white' : 'text-slate-400'
                    }`}>
                    {step.id}
                  </span>
                )}
              </div>

              {/* Step Label */}
              <div className="mt-3 text-center">
                <p className={`text-sm font-medium transition-colors ${currentStep === step.id
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
                  className={`h-0.5 w-20 lg:w-32 transition-colors duration-300 ${currentStep > step.id ? 'bg-emerald-500' : 'bg-slate-700'
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
                  <span className={`text-sm font-semibold ${currentStep === step.id ? 'text-white' : 'text-slate-400'
                    }`}>
                    {step.id}
                  </span>
                )}
              </button>

              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${currentStep > step.id ? 'bg-emerald-500' : 'bg-slate-700'
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

// Required fields validation for Step 1
interface RequiredFieldsValidation {
  isComplete: boolean;
  missingFields: string[];
}

function validateRequiredFields(homologation: Homologation): RequiredFieldsValidation {
  const missingFields: string[] = [];

  // Trailer required fields
  if (!homologation.trailerType) {
    missingFields.push('Tipo de Trailer');
  }
  if (!homologation.trailerDimensions) {
    missingFields.push('Dimensiones');
  }
  if (!homologation.trailerNumberOfAxles) {
    missingFields.push('Número de Ejes');
  }
  if (!homologation.trailerLicensePlateNumber) {
    missingFields.push('Patente');
  }

  // Owner required fields
  if (!homologation.ownerFullName) {
    missingFields.push('Nombre Completo');
  }

  return {
    isComplete: missingFields.length === 0,
    missingFields,
  };
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
  isPaid: boolean;
  trailerTypes?: PublicTrailerType[];
  trailerTypesLoading?: boolean;
}>(function GeneralInfoStep({
  homologation,
  photos,
  onHomologationUpdate,
  onPhotosChange,
  onSavingChange,
  isPaid,
  trailerTypes,
  trailerTypesLoading,
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

  // Forms are disabled when saving OR when already paid
  const formsDisabled = isSaving || isPaid;

  return (
    <div className="space-y-6 animate-in">
      {/* Paid lock notice */}
      {isPaid && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <FiCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="font-medium text-blue-400">Trámite pagado</p>
            <p className="text-sm text-slate-400">
              Los campos no pueden ser modificados después del pago
            </p>
          </div>
        </div>
      )}

      {/* Save button and status - Hidden when paid */}
      {!isPaid && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {saveMessage && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${saveMessage.type === 'success'
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
      )}

      {/* Trailer Info Form */}
      <TrailerInfoForm
        initialData={trailerData}
        onChange={setTrailerData}
        errors={errors.trailer}
        disabled={formsDisabled}
        isLocked={isPaid}
        trailerTypes={trailerTypes}
        trailerTypesLoading={trailerTypesLoading}
      />

      {/* Owner Info Form */}
      <OwnerInfoForm
        initialData={ownerData}
        onChange={setOwnerData}
        errors={errors.owner}
        disabled={formsDisabled}
        isLocked={isPaid}
      />

      {/* Photo Upload */}
      <PhotoUpload
        homologationId={homologation.id}
        photos={photos}
        onPhotosChange={onPhotosChange}
        disabled={formsDisabled}
        isLocked={isPaid}
        trailerType={trailerData.trailerType || homologation.trailerType}
        referencePhotos={
          trailerTypes && (trailerData.trailerType || homologation.trailerType)
            ? findTrailerTypeByName(trailerTypes, trailerData.trailerType || homologation.trailerType || '')?.referencePhotos
            : undefined
        }
      />
    </div>
  );
});

// Fallback price mapping by trailer type (in cents) - used when API is unavailable
const FALLBACK_TRAILER_TYPE_PRICES: Record<string, number> = {
  'Trailer': 100,      // ARS $1 = 100 cents
  'Rolling Box': 200, // ARS $2 = 200 cents
  'Motorhome': 300,   // ARS $3 = 300 cents
};

// Step 2: Payment Content
function PaymentStep({
  homologation,
  onHomologationUpdate,
  requiredFieldsValidation,
  onGoToStep1,
  trailerTypes,
}: {
  homologation: Homologation;
  onHomologationUpdate: (data: Homologation) => void;
  requiredFieldsValidation: RequiredFieldsValidation;
  onGoToStep1: () => void;
  trailerTypes?: PublicTrailerType[];
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Calculate price based on trailer type using API data or fallback
  const getPrice = (): number => {
    const typeName = homologation.trailerType;
    
    // Try to get price from API trailer types first
    if (trailerTypes && typeName) {
      const trailerType = findTrailerTypeByName(trailerTypes, typeName);
      if (trailerType) {
        return trailerType.price;
      }
    }
    
    // Fall back to hardcoded prices
    return typeName 
      ? (FALLBACK_TRAILER_TYPE_PRICES[typeName] || FALLBACK_TRAILER_TYPE_PRICES['Trailer'])
      : FALLBACK_TRAILER_TYPE_PRICES['Trailer'];
  };

  const PRICE = getPrice();

  const canPay = requiredFieldsValidation.isComplete;

  const handlePayment = async () => {
    if (isProcessing || homologation.isPaid || !canPay) return;

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

        {/* Missing Fields Warning */}
        {!canPay && !isPaid && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <FiAlertCircle className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-amber-400 mb-2">
                  Campos obligatorios incompletos
                </p>
                <p className="text-sm text-slate-400 mb-3">
                  Complete los siguientes campos en el paso anterior para poder realizar el pago:
                </p>
                <ul className="text-sm text-slate-300 space-y-1 mb-4">
                  {requiredFieldsValidation.missingFields.map((field, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      {field}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={onGoToStep1}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Completar información
                </button>
              </div>
            </div>
          </div>
        )}

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
            disabled={isProcessing || !canPay}
            className={`
              w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg
              font-semibold text-white transition-all duration-200
              ${isProcessing || !canPay
                ? 'bg-slate-700 cursor-not-allowed opacity-50'
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
                {/* MercadoPago Logo */}
                <div className="flex items-center gap-2">
                  <img
                    src="/mercadopago-logo.jpeg"
                    alt="MercadoPago"
                    className="h-6 w-auto"
                  />
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

// Status badge configuration
const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  'Draft': { label: 'Borrador', color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20' },
  'Pending Review': { label: 'En Revisión', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20' },
  'Payed': { label: 'Pagado', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20' },
  'Approved': { label: 'Aprobado', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20' },
  'Rejected': { label: 'Rechazado', color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20' },
  'Completed': { label: 'Completado', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20' },
  'Incomplete': { label: 'Incompleto', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/20' },
};

// Step 3: Review Content
function ReviewStep({
  homologation,
  photos,
  requiredFieldsValidation,
  onHomologationUpdate,
  onGoToStep1,
  onGoToStep2,
}: {
  homologation: Homologation;
  photos: Photo[];
  requiredFieldsValidation: RequiredFieldsValidation;
  onHomologationUpdate: (data: Homologation) => void;
  onGoToStep1: () => void;
  onGoToStep2: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);

  const status = homologation.status || 'Draft';
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG['Draft'];
  const isDraft = status === 'Draft';
  const isPaid = homologation.isPaid === true;
  const hasPhotos = photos.length > 0;

  // Fetch documents on mount
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoadingDocuments(true);
      setDocumentsError(null);
      try {
        const response = await getDocuments(homologation.id);
        setDocuments(response.data);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Error al cargar documentos';
        setDocumentsError(message);
      } finally {
        setLoadingDocuments(false);
      }
    };

    fetchDocuments();
  }, [homologation.id]);

  // Check if all prerequisites are met for submission
  const canSubmit = isDraft && 
    requiredFieldsValidation.isComplete && 
    hasPhotos && 
    isPaid;

  // Build warnings list
  const warnings: { type: string; message: string; action: () => void; actionLabel: string }[] = [];
  
  if (isDraft) {
    if (!requiredFieldsValidation.isComplete) {
      warnings.push({
        type: 'fields',
        message: `Campos incompletos: ${requiredFieldsValidation.missingFields.join(', ')}`,
        action: onGoToStep1,
        actionLabel: 'Completar información',
      });
    }
    if (!hasPhotos) {
      warnings.push({
        type: 'photos',
        message: 'Debes subir al menos una foto del trailer',
        action: onGoToStep1,
        actionLabel: 'Subir fotos',
      });
    }
    if (!isPaid) {
      warnings.push({
        type: 'payment',
        message: 'El pago debe estar completado antes de enviar',
        action: onGoToStep2,
        actionLabel: 'Ir al pago',
      });
    }
  }

  const handleSubmit = async () => {
    if (isSubmitting || !canSubmit) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const updated = await submitHomologation(homologation.id);
      onHomologationUpdate(updated);
      setSubmitSuccess(true);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Error al enviar la solicitud';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render status-specific message for non-Draft states
  const renderStatusMessage = () => {
    if (isDraft) return null;

    const messages: Record<string, { icon: React.ReactNode; title: string; description: string }> = {
      'Pending Review': {
        icon: <FiClock className="w-8 h-8 text-blue-400" />,
        title: 'Tu solicitud está siendo revisada',
        description: 'Nuestro equipo está revisando tu documentación. Te notificaremos cuando haya novedades.',
      },
      'Payed': {
        icon: <FiCreditCard className="w-8 h-8 text-cyan-400" />,
        title: 'Pago recibido',
        description: 'Tu pago ha sido procesado. Tu solicitud será revisada pronto.',
      },
      'Approved': {
        icon: <FiCheckCircle className="w-8 h-8 text-emerald-400" />,
        title: '¡Felicitaciones! Tu homologación ha sido aprobada',
        description: 'Tu trailer cumple con todos los requisitos. Puedes descargar tu certificado.',
      },
      'Rejected': {
        icon: <FiXCircle className="w-8 h-8 text-red-400" />,
        title: 'Solicitud rechazada',
        description: homologation.rejectionReason || 'Tu solicitud no cumple con los requisitos necesarios.',
      },
      'Completed': {
        icon: <FiCheckCircle className="w-8 h-8 text-emerald-400" />,
        title: 'Proceso completado',
        description: 'Tu homologación ha sido completada exitosamente.',
      },
      'Incomplete': {
        icon: <FiAlertCircle className="w-8 h-8 text-orange-400" />,
        title: 'Información incompleta',
        description: 'Se requiere información adicional para continuar con tu solicitud.',
      },
    };

    const msg = messages[status];
    if (!msg) return null;

    return (
      <div className={`p-6 rounded-xl ${statusConfig.bgColor} border ${statusConfig.borderColor}`}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">{msg.icon}</div>
          <div>
            <h4 className={`text-lg font-semibold ${statusConfig.color} mb-1`}>{msg.title}</h4>
            <p className="text-slate-400">{msg.description}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in">
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 max-w-3xl mx-auto space-y-6">
        {/* Header with Status */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-xl font-semibold text-white">Revisión Final</h3>
          <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color} border ${statusConfig.borderColor}`}>
            {statusConfig.label}
          </div>
        </div>

        {/* Status Message for non-Draft */}
        {renderStatusMessage()}

        {/* Summary Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
            Resumen de la Solicitud
          </h4>

          {/* Trailer Info */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <FiTruck className="w-5 h-5 text-amber-400" />
              <span className="font-medium text-white">Información del Trailer</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-500">Tipo:</span>
                <span className="ml-2 text-slate-300">{homologation.trailerType || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500">Patente:</span>
                <span className="ml-2 text-slate-300">{homologation.trailerLicensePlateNumber || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500">Dimensiones:</span>
                <span className="ml-2 text-slate-300">{homologation.trailerDimensions || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500">Ejes:</span>
                <span className="ml-2 text-slate-300">{homologation.trailerNumberOfAxles || '—'}</span>
              </div>
            </div>
          </div>

          {/* Owner Info */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <FiUser className="w-5 h-5 text-amber-400" />
              <span className="font-medium text-white">Información del Propietario</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-500">Nombre:</span>
                <span className="ml-2 text-slate-300">{homologation.ownerFullName || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500">DNI/CUIT:</span>
                <span className="ml-2 text-slate-300">{homologation.ownerNationalId || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500">Email:</span>
                <span className="ml-2 text-slate-300">{homologation.ownerEmail || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500">Teléfono:</span>
                <span className="ml-2 text-slate-300">{homologation.ownerPhone || '—'}</span>
              </div>
            </div>
          </div>

          {/* Documentation & Payment */}
          <div className="grid grid-cols-2 gap-4">
            {/* Photos */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiCamera className="w-5 h-5 text-amber-400" />
                <span className="font-medium text-white">Fotos</span>
              </div>
              <p className="text-sm text-slate-300">
                {photos.length} de 6 fotos subidas
              </p>
              {!hasPhotos && (
                <p className="text-xs text-red-400 mt-1">Mínimo 1 foto requerida</p>
              )}
            </div>

            {/* Payment */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiCreditCard className="w-5 h-5 text-amber-400" />
                <span className="font-medium text-white">Pago</span>
              </div>
              {isPaid ? (
                <div className="flex items-center gap-1.5 text-sm text-emerald-400">
                  <FiCheck className="w-4 h-4" />
                  <span>Completado</span>
                </div>
              ) : (
                <p className="text-sm text-slate-400">Pendiente</p>
              )}
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
            Documentos Adjuntos
          </h4>

          {loadingDocuments ? (
            <div className="flex items-center justify-center py-8">
              <FiLoader className="w-6 h-6 text-amber-400 animate-spin" />
            </div>
          ) : documentsError ? (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3">
              <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{documentsError}</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="p-6 rounded-lg bg-slate-800/50 border border-slate-700 text-center">
              <FiFileText className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No hay documentos adjuntos aún</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Payment Receipts */}
              {documents.filter(doc => doc.documentType === 'payment_receipt').length > 0 && (
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FiCreditCard className="w-5 h-5 text-amber-400" />
                    <span className="font-medium text-white">Comprobantes de Pago</span>
                  </div>
                  <div className="space-y-2">
                    {documents
                      .filter(doc => doc.documentType === 'payment_receipt')
                      .map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FiFileText className="w-5 h-5 text-slate-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {doc.fileName}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <p className="text-xs text-slate-500">
                                  {formatFileSize(doc.fileSize)}
                                </p>
                                <span className="text-xs text-slate-600">•</span>
                                <p className="text-xs text-slate-500">
                                  {new Date(doc.createdAt).toLocaleDateString('es-AR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <a
                              href={getDocumentUrl(doc)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
                              title="Ver documento"
                            >
                              <FiEye className="w-4 h-4" />
                            </a>
                            <a
                              href={getDocumentUrl(doc)}
                              download={doc.fileName}
                              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
                              title="Descargar documento"
                            >
                              <FiDownload className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Homologation Papers */}
              {documents.filter(doc => doc.documentType === 'homologation_papers').length > 0 && (
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FiFileText className="w-5 h-5 text-amber-400" />
                    <span className="font-medium text-white">Documentos de Homologación</span>
                  </div>
                  <div className="space-y-2">
                    {documents
                      .filter(doc => doc.documentType === 'homologation_papers')
                      .map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FiFileText className="w-5 h-5 text-slate-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {doc.fileName}
                              </p>
                              {doc.description && (
                                <p className="text-xs text-slate-400 mt-1">{doc.description}</p>
                              )}
                              <div className="flex items-center gap-3 mt-1">
                                <p className="text-xs text-slate-500">
                                  {formatFileSize(doc.fileSize)}
                                </p>
                                <span className="text-xs text-slate-600">•</span>
                                <p className="text-xs text-slate-500">
                                  {new Date(doc.createdAt).toLocaleDateString('es-AR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <a
                              href={getDocumentUrl(doc)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
                              title="Ver documento"
                            >
                              <FiEye className="w-4 h-4" />
                            </a>
                            <a
                              href={getDocumentUrl(doc)}
                              download={doc.fileName}
                              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
                              title="Descargar documento"
                            >
                              <FiDownload className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Warnings */}
        {isDraft && warnings.length > 0 && (
          <div className="space-y-3">
            {warnings.map((warning, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <FiAlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-200">{warning.message}</p>
                  </div>
                  <button
                    onClick={warning.action}
                    className="text-sm font-medium text-amber-400 hover:text-amber-300 whitespace-nowrap"
                  >
                    {warning.actionLabel} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit Error */}
        {submitError && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3">
            <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{submitError}</p>
          </div>
        )}

        {/* Submit Success */}
        {submitSuccess && (
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
            <FiCheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="text-sm text-emerald-400">
              ¡Tu solicitud ha sido enviada! Nuestro equipo la revisará pronto.
            </p>
          </div>
        )}

        {/* Submit Button - Only for Draft status */}
        {isDraft && !submitSuccess && (
          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !canSubmit}
              className={`
                w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg
                font-semibold text-white transition-all duration-200
                ${isSubmitting || !canSubmit
                  ? 'bg-slate-700 cursor-not-allowed opacity-50'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30'
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="w-5 h-5 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <FiSend className="w-5 h-5" />
                  <span>Enviar para Revisión</span>
                </>
              )}
            </button>
            {canSubmit && (
              <p className="text-xs text-slate-500 text-center mt-3">
                Una vez enviado, no podrás modificar la información
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Main Page Component
export default function HomologationTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [homologation, setHomologation] = useState<Homologation | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [trailerTypes, setTrailerTypes] = useState<PublicTrailerType[]>([]);
  const [trailerTypesLoading, setTrailerTypesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Ref to access GeneralInfoStep methods
  const generalInfoRef = useRef<GeneralInfoStepHandle>(null);

  // Fetch trailer types (separate from main data, non-blocking)
  useEffect(() => {
    const fetchTrailerTypesData = async () => {
      try {
        setTrailerTypesLoading(true);
        const response = await getTrailerTypes();
        setTrailerTypes(response.data);
      } catch (err) {
        console.error('Failed to fetch trailer types:', err);
        // Don't block the page, just use fallback types
      } finally {
        setTrailerTypesLoading(false);
      }
    };
    fetchTrailerTypesData();
  }, []);

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

      if (homologationData.status === 'Completed') {
        router.replace(`/homologation/${homologationData.id}/completed`);
        return;
      }

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

  // Compute required fields validation
  const requiredFieldsValidation = homologation 
    ? validateRequiredFields(homologation) 
    : { isComplete: false, missingFields: [] };

  const isPaid = homologation?.isPaid === true;

  // Navigate to step 1 (for incomplete fields warning)
  const handleGoToStep1 = () => {
    setCurrentStep(1);
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
            isPaid={isPaid}
            trailerTypes={trailerTypes}
            trailerTypesLoading={trailerTypesLoading}
          />
        );
      case 2:
        return (
          <PaymentStep
            homologation={homologation}
            onHomologationUpdate={handleHomologationUpdate}
            requiredFieldsValidation={requiredFieldsValidation}
            onGoToStep1={handleGoToStep1}
            trailerTypes={trailerTypes}
          />
        );
      case 3:
        return (
          <ReviewStep
            homologation={homologation}
            photos={photos}
            requiredFieldsValidation={requiredFieldsValidation}
            onHomologationUpdate={handleHomologationUpdate}
            onGoToStep1={handleGoToStep1}
            onGoToStep2={() => setCurrentStep(2)}
          />
        );
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
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors shadow-lg shadow-amber-500/20"
          >
            Ir al inicio
          </button>
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
          <p className="text-slate-400 mb-6">Homologación no encontrada</p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors shadow-lg shadow-amber-500/20"
          >
            Ir al inicio
          </button>
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
