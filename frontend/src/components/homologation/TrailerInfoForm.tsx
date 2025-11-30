'use client';

import { useState, useEffect } from 'react';
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

export default function TrailerInfoForm({
  initialData,
  onChange,
  errors = {},
  disabled = false,
}: TrailerInfoFormProps) {
  const [formData, setFormData] = useState<TrailerFormData>(initialData);

  // Sync with parent when initialData changes
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (field: keyof TrailerFormData, value: string | number) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange(newData);
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
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            <FiMaximize className="inline w-4 h-4 mr-1" />
            Dimensiones *
          </label>
          <input
            type="text"
            value={formData.trailerDimensions}
            onChange={(e) => handleChange('trailerDimensions', e.target.value)}
            disabled={disabled}
            placeholder="Ej: 4m x 2m x 1.5m"
            className={`
              w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-white
              placeholder:text-slate-500
              focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
              disabled:opacity-50 disabled:cursor-not-allowed
              ${errors.trailerDimensions ? 'border-red-500' : 'border-slate-700'}
            `}
          />
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

