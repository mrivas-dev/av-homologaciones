'use client';

import { useState, useEffect, useRef } from 'react';
import { FiTruck, FiMaximize, FiHash, FiCreditCard } from 'react-icons/fi';

// Trailer types matching backend enum
const TRAILER_TYPES = [
  { value: 'Trailer', label: 'Trailer' },
  { value: 'Rolling Box', label: 'Rolling Box' },
  { value: 'Motorhome', label: 'Motorhome' },
];

export interface TrailerFormData {
  trailerType: string;
  trailerDimensions: string;
  trailerNumberOfAxles: number | '';
  trailerLicensePlateNumber: string;
}

interface TrailerInfoFormProps {
  initialData: TrailerFormData;
  onChange: (data: TrailerFormData) => void;
  errors?: Partial<Record<keyof TrailerFormData, string>>;
  disabled?: boolean;
}

interface DimensionValues {
  length: string;
  width: string;
  height: string;
}

// Parse dimensions string (e.g., "4M x 2M x 1.5M") to separate values
function parseDimensions(dimensions: string): DimensionValues {
  if (!dimensions || dimensions.trim() === '') {
    return { length: '', width: '', height: '' };
  }

  // Match patterns like:
  // - "4M x 2M x 1.5M" or "4m x 2m x 1.5m"
  // - "4 x 2 x 1.5"
  // - "4M x 2M" (partial)
  const match = dimensions.match(/(\d+\.?\d*)\s*[mM]?\s*x\s*(\d+\.?\d*)\s*[mM]?\s*(?:x\s*(\d+\.?\d*)\s*[mM]?)?/i);
  
  if (match) {
    return {
      length: match[1] || '',
      width: match[2] || '',
      height: match[3] || '',
    };
  }

  // If parsing fails, return empty values
  return { length: '', width: '', height: '' };
}

// Format separate dimension values to string (e.g., "4M x 2M x 1.5M")
function formatDimensions(values: DimensionValues): string {
  const parts: string[] = [];
  
  if (values.length.trim() !== '') {
    parts.push(`${values.length}M`);
  }
  if (values.width.trim() !== '') {
    parts.push(`${values.width}M`);
  }
  if (values.height.trim() !== '') {
    parts.push(`${values.height}M`);
  }

  return parts.length > 0 ? parts.join(' x ') : '';
}

export default function TrailerInfoForm({
  initialData,
  onChange,
  errors = {},
  disabled = false,
}: TrailerInfoFormProps) {
  const [formData, setFormData] = useState<TrailerFormData>(initialData);
  const [dimensions, setDimensions] = useState<DimensionValues>(
    parseDimensions(initialData.trailerDimensions)
  );
  const lastSentDimensionsRef = useRef<string>(initialData.trailerDimensions);

  // Sync with parent when initialData changes (but only if it's different from what we last sent)
  useEffect(() => {
    // Only update if the incoming data is different from what we last sent
    // This prevents resetting our local state when parent re-renders with our own data
    if (initialData.trailerDimensions !== lastSentDimensionsRef.current) {
      setFormData(initialData);
      setDimensions(parseDimensions(initialData.trailerDimensions));
      lastSentDimensionsRef.current = initialData.trailerDimensions;
    } else {
      // Still update formData for other fields
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (field: keyof TrailerFormData, value: string | number) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange(newData);
  };

  const handleDimensionChange = (field: 'length' | 'width' | 'height', value: string) => {
    // Only allow numeric input (including decimals)
    // Allow empty string, numbers, and decimal points
    const numericValue = value === '' || value.match(/^\d*\.?\d*$/) ? value : dimensions[field];
    
    const newDimensions = { ...dimensions, [field]: numericValue };
    setDimensions(newDimensions);
    
    // Format and update formData
    const formattedDimensions = formatDimensions(newDimensions);
    lastSentDimensionsRef.current = formattedDimensions;
    handleChange('trailerDimensions', formattedDimensions);
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <FiTruck className="w-5 h-5 text-amber-400" />
        Información del Trailer
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Trailer Type */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Tipo de Trailer *
          </label>
          <div className="relative">
            <select
              value={formData.trailerType}
              onChange={(e) => handleChange('trailerType', e.target.value)}
              disabled={disabled}
              className={`
                w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-white
                focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                disabled:opacity-50 disabled:cursor-not-allowed
                appearance-none cursor-pointer
                ${errors.trailerType ? 'border-red-500' : 'border-slate-700'}
              `}
            >
              <option value="">Seleccionar tipo...</option>
              {TRAILER_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {errors.trailerType && (
            <p className="mt-1 text-sm text-red-400">{errors.trailerType}</p>
          )}
        </div>

        {/* License Plate */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            <FiCreditCard className="inline w-4 h-4 mr-1" />
            Patente *
          </label>
          <input
            type="text"
            value={formData.trailerLicensePlateNumber}
            onChange={(e) => handleChange('trailerLicensePlateNumber', e.target.value.toUpperCase())}
            disabled={disabled}
            placeholder="Ej: ABC123"
            className={`
              w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-white
              placeholder:text-slate-500
              focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
              disabled:opacity-50 disabled:cursor-not-allowed
              ${errors.trailerLicensePlateNumber ? 'border-red-500' : 'border-slate-700'}
            `}
          />
          {errors.trailerLicensePlateNumber && (
            <p className="mt-1 text-sm text-red-400">{errors.trailerLicensePlateNumber}</p>
          )}
        </div>

        {/* Dimensions */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-400 mb-2">
            <FiMaximize className="inline w-4 h-4 mr-1" />
            Dimensiones *
          </label>
          <div className="flex gap-2">
            {/* Length */}
            <div className="flex-1">
              <input
                type="text"
                inputMode="decimal"
                value={dimensions.length}
                onChange={(e) => handleDimensionChange('length', e.target.value)}
                disabled={disabled}
                placeholder="Largo"
                className={`
                  w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-white text-center
                  placeholder:text-slate-500
                  focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${errors.trailerDimensions ? 'border-red-500' : 'border-slate-700'}
                `}
              />
            </div>
            
            {/* Width */}
            <div className="flex-1">
              <input
                type="text"
                inputMode="decimal"
                value={dimensions.width}
                onChange={(e) => handleDimensionChange('width', e.target.value)}
                disabled={disabled}
                placeholder="Ancho"
                className={`
                  w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-white text-center
                  placeholder:text-slate-500
                  focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${errors.trailerDimensions ? 'border-red-500' : 'border-slate-700'}
                `}
              />
            </div>
            
            {/* Height */}
            <div className="flex-1">
              <input
                type="text"
                inputMode="decimal"
                value={dimensions.height}
                onChange={(e) => handleDimensionChange('height', e.target.value)}
                disabled={disabled}
                placeholder="Alto"
                className={`
                  w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-white text-center
                  placeholder:text-slate-500
                  focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${errors.trailerDimensions ? 'border-red-500' : 'border-slate-700'}
                `}
              />
            </div>
          </div>
          {errors.trailerDimensions && (
            <p className="mt-1 text-sm text-red-400">{errors.trailerDimensions}</p>
          )}
        </div>

        {/* Number of Axles */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            <FiHash className="inline w-4 h-4 mr-1" />
            Número de Ejes *
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={formData.trailerNumberOfAxles}
            onChange={(e) => handleChange('trailerNumberOfAxles', e.target.value ? parseInt(e.target.value) : '')}
            disabled={disabled}
            placeholder="Ej: 2"
            className={`
              w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-white
              placeholder:text-slate-500
              focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
              disabled:opacity-50 disabled:cursor-not-allowed
              ${errors.trailerNumberOfAxles ? 'border-red-500' : 'border-slate-700'}
            `}
          />
          {errors.trailerNumberOfAxles && (
            <p className="mt-1 text-sm text-red-400">{errors.trailerNumberOfAxles}</p>
          )}
        </div>
      </div>
    </div>
  );
}

