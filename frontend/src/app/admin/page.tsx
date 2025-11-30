'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchHomologations, HomologationListItem } from '@/utils/adminApi';
import { 
  FiLogOut, 
  FiLoader, 
  FiRefreshCw, 
  FiUser,
  FiAlertCircle,
  FiClipboard,
  FiPhone,
  FiCreditCard,
  FiTag
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

function truncateId(id: string): string {
  return id.substring(0, 8);
}

export default function AdminDashboardPage() {
  const { user, token, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [homologations, setHomologations] = useState<HomologationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <span className="text-sm font-bold text-white font-heading">AV</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white font-heading">Admin Panel</h1>
                <p className="text-xs text-slate-400">AV Homologación</p>
              </div>
            </div>

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
          <button
            onClick={loadHomologations}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors disabled:opacity-50"
          >
            <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
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
                      ID
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {homologations.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-slate-300">
                          {truncateId(item.id)}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-800">
              {homologations.map((item) => (
                <div key={item.id} className="p-4 hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-sm text-slate-400">
                      #{truncateId(item.id)}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="space-y-2">
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
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

