'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  fetchHomologations,
  approveHomologation,
  rejectHomologation,
  markHomologationIncomplete,
  completeHomologation,
  HomologationListItem,
  AdminApiError,
} from '@/utils/adminApi';
import { StatusChangeModal, getAvailableActions, StatusAction } from '@/components/admin';
import { 
  FiLogOut, 
  FiLoader, 
  FiRefreshCw, 
  FiUser,
  FiAlertCircle,
  FiClipboard,
  FiPhone,
  FiCreditCard,
  FiTruck,
  FiCheck,
  FiCheckCircle,
  FiX,
  FiAlertTriangle,
  FiChevronRight,
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
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      {config.label}
    </span>
  );
}

export default function AdminDashboardPage() {
  const { user, token, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [homologations, setHomologations] = useState<HomologationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Status change state
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<StatusAction | null>(null);
  const [selectedHomologationId, setSelectedHomologationId] = useState<string | null>(null);
  const [statusActionLoading, setStatusActionLoading] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const loadHomologations = useCallback(async () => {
    if (!token) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchHomologations(token);
      setHomologations(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar las homologaciones';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Load data on mount
  useEffect(() => {
    if (isAuthenticated && token) {
      loadHomologations();
    }
  }, [isAuthenticated, token, loadHomologations]);

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  // Handle status action click
  const handleActionClick = (e: React.MouseEvent, homologationId: string, action: StatusAction) => {
    e.stopPropagation(); // Prevent row click navigation
    setSelectedHomologationId(homologationId);
    setCurrentAction(action);
    setStatusModalOpen(true);
  };

  // Execute status change
  const handleStatusChange = async (reason?: string) => {
    if (!token || !selectedHomologationId || !currentAction) return;

    setStatusActionLoading(true);

    try {
      switch (currentAction) {
        case 'approve':
          await approveHomologation(token, selectedHomologationId, reason);
          break;
        case 'reject':
          await rejectHomologation(token, selectedHomologationId, reason);
          break;
        case 'incomplete':
          await markHomologationIncomplete(token, selectedHomologationId, reason);
          break;
        case 'complete':
          await completeHomologation(token, selectedHomologationId, reason);
          break;
      }

      setStatusModalOpen(false);
      setCurrentAction(null);
      setSelectedHomologationId(null);
      await loadHomologations(); // Refresh list
    } catch (err) {
      const message = err instanceof AdminApiError ? err.message : 'Error al cambiar el estado';
      alert(message);
    } finally {
      setStatusActionLoading(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
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

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              href="/" 
              className="group flex items-center gap-3 rounded-lg px-2 py-1 -ml-2 hover:bg-slate-800 transition-colors"
              aria-label="Ir al sitio público"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/30">
                <span className="text-sm font-bold text-white font-heading">AV</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white font-heading leading-tight">Admin Panel</h1>
                <p className="text-xs text-slate-400">Volver al inicio</p>
              </div>
            </Link>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <FiUser className="w-4 h-4 text-slate-400" />
                <span>{user?.fullName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <FiLogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white font-heading">Homologaciones</h2>
            <p className="text-slate-400 mt-1">
              {homologations.length} {homologations.length === 1 ? 'registro' : 'registros'} encontrados
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push('/admin/completed')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
            >
              <FiCheckCircle className="w-4 h-4" />
              <span>Ver Completadas</span>
            </button>
            <button
              onClick={loadHomologations}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors disabled:opacity-50"
            >
              <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-400">{error}</p>
              <button
                onClick={loadHomologations}
                className="text-sm text-red-300 hover:text-red-200 underline mt-1"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Data Table */}
        {isLoading && homologations.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <FiLoader className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-4" />
              <p className="text-slate-400">Cargando homologaciones...</p>
            </div>
          </div>
        ) : homologations.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <FiClipboard className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No hay homologaciones</p>
              <p className="text-slate-500 text-sm mt-1">Los registros aparecerán aquí</p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Propietario
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Teléfono
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      DNI/CUIT
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {homologations.map((item) => {
                    const availableActions = getAvailableActions(item.status);
                    return (
                      <tr
                        key={item.id}
                        onClick={() => router.push(`/admin/homologation/${item.id}`)}
                        className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-300 font-medium">
                            {item.ownerFullName || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-300">
                            {item.trailerType || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-300">
                            {item.ownerPhone || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-300">
                            {item.ownerNationalId || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-6 py-4">
                          {availableActions.length > 0 ? (
                            <div className="flex items-center gap-1">
                              {availableActions.includes('approve') && (
                                <button
                                  onClick={(e) => handleActionClick(e, item.id, 'approve')}
                                  className="p-2 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors"
                                  title="Aprobar"
                                >
                                  <FiCheck className="w-4 h-4" />
                                </button>
                              )}
                              {availableActions.includes('reject') && (
                                <button
                                  onClick={(e) => handleActionClick(e, item.id, 'reject')}
                                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                  title="Rechazar"
                                >
                                  <FiX className="w-4 h-4" />
                                </button>
                              )}
                              {availableActions.includes('incomplete') && (
                                <button
                                  onClick={(e) => handleActionClick(e, item.id, 'incomplete')}
                                  className="p-2 text-orange-400 hover:bg-orange-500/20 rounded-lg transition-colors"
                                  title="Marcar Incompleto"
                                >
                                  <FiAlertTriangle className="w-4 h-4" />
                                </button>
                              )}
                              {availableActions.includes('complete') && (
                                <button
                                  onClick={(e) => handleActionClick(e, item.id, 'complete')}
                                  className="p-2 text-purple-400 hover:bg-purple-500/20 rounded-lg transition-colors"
                                  title="Completar"
                                >
                                  <FiChevronRight className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-600 text-sm">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-800">
              {homologations.map((item) => {
                const availableActions = getAvailableActions(item.status);
                return (
                  <div
                    key={item.id}
                    className="p-4 hover:bg-slate-800/50 transition-colors"
                  >
                    <div
                      onClick={() => router.push(`/admin/homologation/${item.id}`)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-slate-300 font-medium">
                          {item.ownerFullName || '-'}
                        </span>
                        <StatusBadge status={item.status} />
                      </div>
                      <div className="space-y-2">
                        {item.trailerType && (
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <FiTruck className="w-4 h-4 text-slate-500" />
                            <span>{item.trailerType}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <FiPhone className="w-4 h-4 text-slate-500" />
                          <span>{item.ownerPhone || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <FiCreditCard className="w-4 h-4 text-slate-500" />
                          <span>{item.ownerNationalId || '-'}</span>
                        </div>
                      </div>
                    </div>
                    {/* Mobile Action Buttons */}
                    {availableActions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-800">
                        {availableActions.includes('approve') && (
                          <button
                            onClick={(e) => handleActionClick(e, item.id, 'approve')}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors"
                          >
                            <FiCheck className="w-3.5 h-3.5" />
                            Aprobar
                          </button>
                        )}
                        {availableActions.includes('reject') && (
                          <button
                            onClick={(e) => handleActionClick(e, item.id, 'reject')}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
                          >
                            <FiX className="w-3.5 h-3.5" />
                            Rechazar
                          </button>
                        )}
                        {availableActions.includes('incomplete') && (
                          <button
                            onClick={(e) => handleActionClick(e, item.id, 'incomplete')}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-lg hover:bg-orange-500/20 transition-colors"
                          >
                            <FiAlertTriangle className="w-3.5 h-3.5" />
                            Incompleto
                          </button>
                        )}
                        {availableActions.includes('complete') && (
                          <button
                            onClick={(e) => handleActionClick(e, item.id, 'complete')}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-colors"
                          >
                            <FiChevronRight className="w-3.5 h-3.5" />
                            Completar
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Status Change Modal */}
      <StatusChangeModal
        isOpen={statusModalOpen}
        onClose={() => {
          setStatusModalOpen(false);
          setCurrentAction(null);
          setSelectedHomologationId(null);
        }}
        action={currentAction}
        onConfirm={handleStatusChange}
        isLoading={statusActionLoading}
      />
    </div>
  );
}

