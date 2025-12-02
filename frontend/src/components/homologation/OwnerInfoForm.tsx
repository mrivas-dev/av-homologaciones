'use client';

import { useState, useEffect } from 'react';
import { FiUser, FiMail, FiCreditCard, FiPhone, FiLock } from 'react-icons/fi';

export interface OwnerFormData {
  ownerFullName: string;
  ownerEmail: string;
  ownerNationalId: string;
  ownerPhone: string;
}

interface OwnerInfoFormProps {
  initialData: OwnerFormData;
  onChange: (data: OwnerFormData) => void;
  errors?: Partial<Record<keyof OwnerFormData, string>>;
  disabled?: boolean;
  isLocked?: boolean;
}

export default function OwnerInfoForm({
  initialData,
  onChange,
  errors = {},
  disabled = false,
  isLocked = false,
}: OwnerInfoFormProps) {
  const [formData, setFormData] = useState<OwnerFormData>(initialData);

  // Sync with parent when initialData changes
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (field: keyof OwnerFormData, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange(newData);
  };

  return (
    <div className={`bg-slate-900/50 border rounded-xl p-6 ${isLocked ? 'border-blue-500/30' : 'border-slate-800'}`}>
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <FiUser className="w-5 h-5 text-amber-400" />
        Información del Propietario
        {isLocked && (
          <span className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-400">
            <FiLock className="w-3 h-3" />
            Bloqueado
          </span>
        )}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            <FiUser className="inline w-4 h-4 mr-1" />
            Nombre Completo *
          </label>
          <input
            type="text"
            value={formData.ownerFullName}
            onChange={(e) => handleChange('ownerFullName', e.target.value)}
            disabled={disabled}
            placeholder="Ingrese su nombre completo"
            className={`
              w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-white
              placeholder:text-slate-500
              focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
              disabled:opacity-50 disabled:cursor-not-allowed
              ${errors.ownerFullName ? 'border-red-500' : 'border-slate-700'}
            `}
          />
          {errors.ownerFullName && (
            <p className="mt-1 text-sm text-red-400">{errors.ownerFullName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            <FiMail className="inline w-4 h-4 mr-1" />
            Email
          </label>
          <input
            type="email"
            value={formData.ownerEmail}
            onChange={(e) => handleChange('ownerEmail', e.target.value)}
            disabled={disabled}
            placeholder="correo@ejemplo.com"
            className={`
              w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-white
              placeholder:text-slate-500
              focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
              disabled:opacity-50 disabled:cursor-not-allowed
              ${errors.ownerEmail ? 'border-red-500' : 'border-slate-700'}
            `}
          />
          {errors.ownerEmail && (
            <p className="mt-1 text-sm text-red-400">{errors.ownerEmail}</p>
          )}
        </div>

        {/* DNI/CUIT (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            <FiCreditCard className="inline w-4 h-4 mr-1" />
            DNI/CUIT
            <FiLock className="inline w-3 h-3 ml-1 text-slate-500" />
          </label>
          <input
            type="text"
            value={formData.ownerNationalId}
            disabled
            className="
              w-full px-4 py-3 bg-slate-800/30 border border-slate-700 rounded-lg 
              text-slate-400 cursor-not-allowed
            "
          />
          <p className="mt-1 text-xs text-slate-500">
            Este campo no se puede modificar
          </p>
        </div>

        {/* Phone (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            <FiPhone className="inline w-4 h-4 mr-1" />
            Teléfono
            <FiLock className="inline w-3 h-3 ml-1 text-slate-500" />
          </label>
          <input
            type="text"
            value={formData.ownerPhone}
            disabled
            className="
              w-full px-4 py-3 bg-slate-800/30 border border-slate-700 rounded-lg 
              text-slate-400 cursor-not-allowed
            "
          />
          <p className="mt-1 text-xs text-slate-500">
            Este campo no se puede modificar
          </p>
        </div>
      </div>
    </div>
  );
}

