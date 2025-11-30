'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  fetchHomologationDetails,
  deleteHomologation,
  approveHomologation,
  rejectHomologation,
  markHomologationIncomplete,
  completeHomologation,
  HomologationDetail,
  AdminApiError,
} from '@/utils/adminApi';
import {
  FiArrowLeft,
  FiLoader,
  FiAlertCircle,
  FiTrash2,
  FiCheck,
  FiX,
  FiAlertTriangle,
  FiFileText,
  FiCalendar,
  FiUser,
  FiMail,
  FiPhone,
  FiCreditCard,
  FiTruck,
  FiMaximize,
  FiHash,
  FiTag,
  FiImage,
  FiXCircle,
} from 'react-icons/fi';

// Status badge colors and labels
const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  'Draft': {
    label: 'Borrador',
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    border: 'border-slate-500/20'
  },
  'Pending Review': {
    label: 'Pendiente',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20'
  },
  'Payed': {
    label: 'Pagado',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/20'
  },
  'Incomplete': {
    label: 'Incompleto',
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    border: 'border-orange-500/20'
  },
  'Approved': {
    label: 'Aprobado',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20'
  },
  'Rejected': {
    label: 'Rechazado',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/20'
  },
  'Completed': {
    label: 'Completado',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/20'
  },
};

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig['Draft'];
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${config.bg} ${config.text} ${config.border}`}>
      {config.label}
    </span>
  );
}

function truncateId(id: string): string {
  return id.substring(0, 8);
}

// Status change modal
function StatusChangeModal({
  isOpen,
  onClose,
  action,
  currentStatus,
  onConfirm,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  action: 'approve' | 'reject' | 'incomplete' | 'complete' | null;
  currentStatus: string;
  onConfirm: (reason?: string) => Promise<void>;
  isLoading: boolean;
}) {
  const [reason, setReason] = useState('');

  const actionLabels: Record<string, { title: string; description: string; buttonText: string; buttonColor: string }> = {
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

  if (!isOpen || !action) return null;

  const config = actionLabels[action];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm(reason || undefined);
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
                onClick={() => {
                  onClose();
                  setReason('');
                }}
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

// Delete confirmation modal
function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-red-500/20 rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <FiAlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Eliminar Homologación</h3>
          </div>

          <p className="text-slate-400 mb-6">
            ¿Estás seguro de que deseas eliminar esta homologación? Esta acción no se puede deshacer.
          </p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <FiTrash2 className="w-4 h-4" />
                  Eliminar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Get photo URL from backend
function getPhotoUrl(filePath: string): string {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  // Extract filename from filePath (handles both ./uploads/file.jpg and /uploads/file.jpg)
  const fileName = filePath.split('/').pop() || filePath.split('\\').pop() || filePath;
  return `${API_BASE_URL}/uploads/${fileName}`;
}

export default function AdminHomologationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();
  const id = params.id as string;

  const [homologation, setHomologation] = useState<HomologationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusActionLoading, setStatusActionLoading] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<'approve' | 'reject' | 'incomplete' | 'complete' | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const loadHomologation = useCallback(async () => {
    if (!token || !id) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchHomologationDetails(token, id);
      setHomologation(data);
    } catch (err) {
      const message = err instanceof AdminApiError ? err.message : 'Error al cargar la homologación';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    if (isAuthenticated && token && id) {
      loadHomologation();
    }
  }, [isAuthenticated, token, id, loadHomologation]);

  const handleStatusAction = async (action: 'approve' | 'reject' | 'incomplete' | 'complete', reason?: string) => {
    if (!token || !id) return;

    setStatusActionLoading(action);

    try {
      switch (action) {
        case 'approve':
          await approveHomologation(token, id, reason);
          break;
        case 'reject':
          await rejectHomologation(token, id, reason);
          break;
        case 'incomplete':
          await markHomologationIncomplete(token, id, reason);
          break;
        case 'complete':
          await completeHomologation(token, id, reason);
          break;
      }

      setStatusModalOpen(false);
      setCurrentAction(null);
      await loadHomologation();
    } catch (err) {
      const message = err instanceof AdminApiError ? err.message : 'Error al cambiar el estado';
      alert(message);
    } finally {
      setStatusActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!token || !id) return;

    setDeleteLoading(true);

    try {
      await deleteHomologation(token, id);
      router.push('/admin');
    } catch (err) {
      const message = err instanceof AdminApiError ? err.message : 'Error al eliminar la homologación';
      alert(message);
      setDeleteLoading(false);
    }
  };

  const getAvailableActions = (status: string): Array<'approve' | 'reject' | 'incomplete' | 'complete'> => {
    switch (status) {
      case 'Pending Review':
        return ['incomplete', 'reject'];
      case 'Payed':
        return ['approve', 'incomplete', 'reject'];
      case 'Incomplete':
        return ['reject'];
      case 'Approved':
        return ['complete'];
      default:
        return [];
    }
  };

  // Show loading while checking auth
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <FiLoader className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  // Don't render content if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  if (error && !homologation) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 text-lg">{error}</p>
          <button
            onClick={() => router.push('/admin')}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          >
            Volver al listado
          </button>
        </div>
      </div>
    );
  }

  if (!homologation) {
    return null;
  }

  const availableActions = getAvailableActions(homologation.status);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <FiArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Volver</span>
              </button>
              <div>
                <h1 className="text-lg font-semibold text-white font-heading">
                  Homologación #{truncateId(homologation.id)}
                </h1>
                <p className="text-xs text-slate-400">Detalles completos</p>
              </div>
            </div>
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-colors"
            >
              <FiTrash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Eliminar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Badge */}
        <div className="mb-8">
          <StatusBadge status={homologation.status} />
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Owner Information */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FiUser className="w-5 h-5 text-amber-500" />
              Información del Propietario
            </h2>
            <div className="space-y-4">
              {homologation.ownerFullName && (
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider">Nombre Completo</label>
                  <p className="text-slate-300 mt-1">{homologation.ownerFullName}</p>
                </div>
              )}
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <FiCreditCard className="w-3 h-3" />
                  DNI/CUIT
                </label>
                <p className="text-slate-300 mt-1">{homologation.ownerNationalId || '-'}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <FiPhone className="w-3 h-3" />
                  Teléfono
                </label>
                <p className="text-slate-300 mt-1">{homologation.ownerPhone || '-'}</p>
              </div>
              {homologation.ownerEmail && (
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <FiMail className="w-3 h-3" />
                    Email
                  </label>
                  <p className="text-slate-300 mt-1">{homologation.ownerEmail}</p>
                </div>
              )}
            </div>
          </div>

          {/* Trailer Information */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FiTruck className="w-5 h-5 text-amber-500" />
              Información del Vehículo
            </h2>
            <div className="space-y-4">
              {homologation.trailerType && (
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider">Tipo</label>
                  <p className="text-slate-300 mt-1">{homologation.trailerType}</p>
                </div>
              )}
              {homologation.trailerDimensions && (
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <FiMaximize className="w-3 h-3" />
                    Dimensiones
                  </label>
                  <p className="text-slate-300 mt-1">{homologation.trailerDimensions}</p>
                </div>
              )}
              {homologation.trailerNumberOfAxles && (
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <FiHash className="w-3 h-3" />
                    Ejes
                  </label>
                  <p className="text-slate-300 mt-1">{homologation.trailerNumberOfAxles}</p>
                </div>
              )}
              {homologation.trailerLicensePlateNumber && (
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <FiTag className="w-3 h-3" />
                    Patente
                  </label>
                  <p className="text-slate-300 mt-1">{homologation.trailerLicensePlateNumber}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Photos Section */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiImage className="w-5 h-5 text-amber-500" />
            Fotos {homologation.photos && homologation.photos.length > 0 && `(${homologation.photos.length})`}
          </h2>
          {homologation.photos && homologation.photos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {homologation.photos.map((photo) => {
                const photoUrl = getPhotoUrl(photo.filePath);
                const hasError = imageErrors[photo.id];
                
                return (
                  <button
                    key={photo.id}
                    onClick={() => !hasError && setSelectedPhoto(photoUrl)}
                    className="relative aspect-square rounded-lg overflow-hidden border border-slate-800 hover:border-amber-500/50 transition-colors group"
                    disabled={hasError}
                  >
                    {hasError ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800/50">
                        <FiImage className="w-8 h-8 text-slate-500 mb-2" />
                        <p className="text-xs text-slate-500 px-2 text-center truncate w-full">
                          {photo.fileName}
                        </p>
                      </div>
                    ) : (
                      <>
                        <img
                          src={photoUrl}
                          alt={photo.fileName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={() => {
                            setImageErrors(prev => ({ ...prev, [photo.id]: true }));
                          }}
                          onLoad={() => {
                            setImageErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors[photo.id];
                              return newErrors;
                            });
                          }}
                        />
                        {photo.isIdDocument && (
                          <div className="absolute top-2 right-2 px-2 py-1 bg-amber-500/90 text-white text-xs rounded">
                            DNI
                          </div>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FiImage className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-slate-400 text-sm">No hay fotos adjuntas</p>
            </div>
          )}
        </div>

        {/* Status Actions */}
        {availableActions.length > 0 && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Acciones</h2>
            <div className="flex flex-wrap gap-3">
              {availableActions.includes('approve') && (
                <button
                  onClick={() => {
                    setCurrentAction('approve');
                    setStatusModalOpen(true);
                  }}
                  disabled={statusActionLoading !== null}
                  className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <FiCheck className="w-4 h-4" />
                  Aprobar
                </button>
              )}
              {availableActions.includes('reject') && (
                <button
                  onClick={() => {
                    setCurrentAction('reject');
                    setStatusModalOpen(true);
                  }}
                  disabled={statusActionLoading !== null}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <FiX className="w-4 h-4" />
                  Rechazar
                </button>
              )}
              {availableActions.includes('incomplete') && (
                <button
                  onClick={() => {
                    setCurrentAction('incomplete');
                    setStatusModalOpen(true);
                  }}
                  disabled={statusActionLoading !== null}
                  className="px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <FiAlertTriangle className="w-4 h-4" />
                  Marcar como Incompleto
                </button>
              )}
              {availableActions.includes('complete') && (
                <button
                  onClick={() => {
                    setCurrentAction('complete');
                    setStatusModalOpen(true);
                  }}
                  disabled={statusActionLoading !== null}
                  className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <FiCheck className="w-4 h-4" />
                  Completar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="mt-8 text-sm text-slate-500 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <FiCalendar className="w-4 h-4" />
            <span>Creado: {new Date(homologation.createdAt).toLocaleDateString('es-AR')}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiCalendar className="w-4 h-4" />
            <span>Actualizado: {new Date(homologation.updatedAt).toLocaleDateString('es-AR')}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiFileText className="w-4 h-4" />
            <span>Versión: {homologation.version}</span>
          </div>
        </div>
      </main>

      {/* Status Change Modal */}
      <StatusChangeModal
        isOpen={statusModalOpen}
        onClose={() => {
          setStatusModalOpen(false);
          setCurrentAction(null);
        }}
        action={currentAction}
        currentStatus={homologation.status}
        onConfirm={(reason) => {
          if (currentAction) {
            return handleStatusAction(currentAction, reason);
          }
          return Promise.resolve();
        }}
        isLoading={statusActionLoading !== null}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isLoading={deleteLoading}
      />

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 text-white hover:text-red-400 transition-colors"
          >
            <FiXCircle className="w-8 h-8" />
          </button>
          <img
            src={selectedPhoto}
            alt="Preview"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

