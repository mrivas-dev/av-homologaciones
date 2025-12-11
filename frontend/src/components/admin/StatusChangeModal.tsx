'use client';

import { useState } from 'react';
import { FiLoader } from 'react-icons/fi';

export type StatusAction = 'approve' | 'reject' | 'incomplete' | 'complete';

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: StatusAction | null;
  onConfirm: (reason?: string) => Promise<void>;
  isLoading: boolean;
}

const actionLabels: Record<StatusAction, { title: string; description: string; buttonText: string; buttonColor: string }> = {
  approve: {
    title: 'Aprobar Homologación',
    description: 'Estás a punto de aprobar esta homologación.',
    buttonText: 'Aprobar',
    buttonColor: 'bg-emerald-500 hover:bg-emerald-600',
  },
  reject: {
    title: 'Rechazar Homologación',
    description: 'Estás a punto de rechazar esta homologación.',
    buttonText: 'Rechazar',
    buttonColor: 'bg-red-500 hover:bg-red-600',
  },
  incomplete: {
    title: 'Marcar como Incompleto',
    description: 'Estás a punto de marcar esta homologación como incompleta.',
    buttonText: 'Marcar como Incompleto',
    buttonColor: 'bg-orange-500 hover:bg-orange-600',
  },
  complete: {
    title: 'Completar Homologación',
    description: 'Estás a punto de marcar esta homologación como completada.',
    buttonText: 'Completar',
    buttonColor: 'bg-purple-500 hover:bg-purple-600',
  },
};

export default function StatusChangeModal({
  isOpen,
  onClose,
  action,
  onConfirm,
  isLoading,
}: StatusChangeModalProps) {
  const [reason, setReason] = useState('');

  if (!isOpen || !action) return null;

  const config = actionLabels[action];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm(reason || undefined);
    setReason('');
  };

  const handleClose = () => {
    onClose();
    setReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-2">{config.title}</h3>
          <p className="text-slate-400 mb-6">{config.description}</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Motivo (opcional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Agregar un motivo o comentario..."
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                rows={4}
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`px-4 py-2 ${config.buttonColor} text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2`}
              >
                {isLoading ? (
                  <>
                    <FiLoader className="w-4 h-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  config.buttonText
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Helper function to get available actions based on current status
export function getAvailableActions(status: string): StatusAction[] {
  switch (status) {
    case 'Pending Review':
      return ['approve', 'incomplete', 'reject'];
    case 'Payed':
      return ['approve', 'incomplete', 'reject'];
    case 'Incomplete':
      return ['reject'];
    case 'Approved':
      return ['complete'];
    default:
      return [];
  }
}

