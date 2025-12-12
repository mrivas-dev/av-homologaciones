'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  fetchTrailerTypes,
  createTrailerType,
  updateTrailerType,
  deleteTrailerType,
  TrailerType,
  ReferencePhoto,
  CreateTrailerTypeData,
  UpdateTrailerTypeData,
  AdminApiError,
} from '@/utils/adminApi';
import { 
  FiLogOut, 
  FiLoader, 
  FiRefreshCw, 
  FiUser,
  FiAlertCircle,
  FiTruck,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiX,
  FiImage,
  FiDollarSign,
  FiArrowLeft,
  FiToggleLeft,
  FiToggleRight,
} from 'react-icons/fi';

// Modal for creating/editing trailer types
interface TrailerTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateTrailerTypeData | UpdateTrailerTypeData) => Promise<void>;
  trailerType?: TrailerType | null;
  isLoading: boolean;
}

function TrailerTypeModal({ isOpen, onClose, onSave, trailerType, isLoading }: TrailerTypeModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState('0');
  const [referencePhotos, setReferencePhotos] = useState<ReferencePhoto[]>([]);
  const [newPhotoLabel, setNewPhotoLabel] = useState('');
  const [newPhotoPath, setNewPhotoPath] = useState('');

  // Initialize form when opening
  useEffect(() => {
    if (isOpen && trailerType) {
      setName(trailerType.name);
      setPrice((trailerType.price / 100).toString()); // Convert cents to dollars for display
      setIsActive(trailerType.isActive);
      setSortOrder(trailerType.sortOrder.toString());
      setReferencePhotos(trailerType.referencePhotos || []);
    } else if (isOpen && !trailerType) {
      setName('');
      setPrice('');
      setIsActive(true);
      setSortOrder('0');
      setReferencePhotos([]);
    }
  }, [isOpen, trailerType]);

  const handleAddPhoto = () => {
    if (newPhotoLabel.trim() && newPhotoPath.trim()) {
      setReferencePhotos([...referencePhotos, { label: newPhotoLabel.trim(), path: newPhotoPath.trim() }]);
      setNewPhotoLabel('');
      setNewPhotoPath('');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setReferencePhotos(referencePhotos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const priceInCents = Math.round(parseFloat(price) * 100);
    
    const data: CreateTrailerTypeData | UpdateTrailerTypeData = {
      name: name.trim(),
      price: priceInCents,
      isActive,
      sortOrder: parseInt(sortOrder) || 0,
      referencePhotos,
    };

    await onSave(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-xl font-semibold text-white">
            {trailerType ? 'Editar Tipo de Trailer' : 'Nuevo Tipo de Trailer'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              placeholder="Ej: Trailer, Rolling Box"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Precio (ARS) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
                step="0.01"
                className="w-full pl-8 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                placeholder="0.00"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">El precio se guardará internamente en centavos</p>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Orden de visualización
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              min="0"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              placeholder="0"
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative w-12 h-6 rounded-full transition-colors ${isActive ? 'bg-amber-500' : 'bg-slate-700'}`}
            >
              <span 
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${isActive ? 'translate-x-6' : ''}`} 
              />
            </button>
            <span className="text-sm text-slate-300">
              {isActive ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          {/* Reference Photos */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Fotos de Referencia
            </label>
            
            {/* Existing photos */}
            {referencePhotos.length > 0 && (
              <div className="space-y-2 mb-4">
                {referencePhotos.map((photo, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                    <FiImage className="w-4 h-4 text-slate-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{photo.label}</p>
                      <p className="text-xs text-slate-500 truncate">{photo.path}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new photo */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newPhotoLabel}
                onChange={(e) => setNewPhotoLabel(e.target.value)}
                placeholder="Etiqueta (ej: Frontal)"
                className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
              <input
                type="text"
                value={newPhotoPath}
                onChange={(e) => setNewPhotoPath(e.target.value)}
                placeholder="Ruta (ej: /reference_photos/trailer/frontal.jpeg)"
                className="flex-[2] px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleAddPhoto}
                disabled={!newPhotoLabel.trim() || !newPhotoPath.trim()}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <FiPlus className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Las fotos deben estar en la carpeta public/ del proyecto. Usa rutas como /reference_photos/tipo/foto.jpeg
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim() || !price}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {isLoading ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <FiCheck className="w-4 h-4" />
                  <span>{trailerType ? 'Guardar Cambios' : 'Crear'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete confirmation modal
interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  trailerTypeName: string;
  isLoading: boolean;
}

function DeleteModal({ isOpen, onClose, onConfirm, trailerTypeName, isLoading }: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <FiTrash2 className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Eliminar Tipo de Trailer</h3>
              <p className="text-sm text-slate-400">Esta acción no se puede deshacer</p>
            </div>
          </div>
          <p className="text-slate-300 mb-6">
            ¿Estás seguro de que deseas eliminar <strong className="text-white">{trailerTypeName}</strong>?
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 text-white rounded-lg transition-colors"
            >
              {isLoading ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  <span>Eliminando...</span>
                </>
              ) : (
                <>
                  <FiTrash2 className="w-4 h-4" />
                  <span>Eliminar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TrailerTypesPage() {
  const { user, token, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [trailerTypes, setTrailerTypes] = useState<TrailerType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<TrailerType | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingType, setDeletingType] = useState<TrailerType | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const loadTrailerTypes = useCallback(async () => {
    if (!token) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchTrailerTypes(token);
      setTrailerTypes(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar los tipos de trailer';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Load data on mount
  useEffect(() => {
    if (isAuthenticated && token) {
      loadTrailerTypes();
    }
  }, [isAuthenticated, token, loadTrailerTypes]);

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const handleOpenCreate = () => {
    setEditingType(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (trailerType: TrailerType) => {
    setEditingType(trailerType);
    setModalOpen(true);
  };

  const handleOpenDelete = (trailerType: TrailerType) => {
    setDeletingType(trailerType);
    setDeleteModalOpen(true);
  };

  const handleSave = async (data: CreateTrailerTypeData | UpdateTrailerTypeData) => {
    if (!token) return;
    
    setModalLoading(true);

    try {
      if (editingType) {
        await updateTrailerType(token, editingType.id, data);
      } else {
        await createTrailerType(token, data as CreateTrailerTypeData);
      }
      setModalOpen(false);
      setEditingType(null);
      await loadTrailerTypes();
    } catch (err) {
      const message = err instanceof AdminApiError ? err.message : 'Error al guardar';
      alert(message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !deletingType) return;
    
    setDeleteLoading(true);

    try {
      await deleteTrailerType(token, deletingType.id);
      setDeleteModalOpen(false);
      setDeletingType(null);
      await loadTrailerTypes();
    } catch (err) {
      const message = err instanceof AdminApiError ? err.message : 'Error al eliminar';
      alert(message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleActive = async (trailerType: TrailerType) => {
    if (!token) return;

    try {
      await updateTrailerType(token, trailerType.id, { isActive: !trailerType.isActive });
      await loadTrailerTypes();
    } catch (err) {
      const message = err instanceof AdminApiError ? err.message : 'Error al actualizar';
      alert(message);
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

  // Don't render content if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40">
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
        {/* Back Link */}
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Volver al Dashboard</span>
        </Link>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white font-heading flex items-center gap-3">
              <FiTruck className="w-7 h-7 text-amber-500" />
              Tipos de Trailer
            </h2>
            <p className="text-slate-400 mt-1">
              Administra los tipos de trailer, precios y fotos de referencia
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              <span>Nuevo Tipo</span>
            </button>
            <button
              onClick={loadTrailerTypes}
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
                onClick={loadTrailerTypes}
                className="text-sm text-red-300 hover:text-red-200 underline mt-1"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && trailerTypes.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <FiLoader className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-4" />
              <p className="text-slate-400">Cargando tipos de trailer...</p>
            </div>
          </div>
        ) : trailerTypes.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <FiTruck className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No hay tipos de trailer</p>
              <p className="text-slate-500 text-sm mt-1">Crea uno para comenzar</p>
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-4 py-2 mt-4 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                <span>Nuevo Tipo</span>
              </button>
            </div>
          </div>
        ) : (
          /* Trailer Types Grid */
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trailerTypes.map((trailerType) => (
              <div
                key={trailerType.id}
                className={`bg-slate-900/50 border rounded-xl p-6 ${trailerType.isActive ? 'border-slate-800' : 'border-slate-800/50 opacity-60'}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{trailerType.name}</h3>
                    <p className="text-xs text-slate-500">Slug: {trailerType.slug}</p>
                  </div>
                  <button
                    onClick={() => handleToggleActive(trailerType)}
                    className={`p-1.5 rounded-lg transition-colors ${trailerType.isActive ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-500 hover:bg-slate-800'}`}
                    title={trailerType.isActive ? 'Desactivar' : 'Activar'}
                  >
                    {trailerType.isActive ? (
                      <FiToggleRight className="w-6 h-6" />
                    ) : (
                      <FiToggleLeft className="w-6 h-6" />
                    )}
                  </button>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 mb-4 p-3 bg-slate-800/50 rounded-lg">
                  <FiDollarSign className="w-5 h-5 text-amber-500" />
                  <span className="text-xl font-bold text-white">
                    ${(trailerType.price / 100).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-sm text-slate-400">ARS</span>
                </div>

                {/* Reference Photos Count */}
                <div className="flex items-center gap-2 mb-4 text-slate-400">
                  <FiImage className="w-4 h-4" />
                  <span className="text-sm">
                    {trailerType.referencePhotos?.length || 0} fotos de referencia
                  </span>
                </div>

                {/* Sort Order */}
                <p className="text-xs text-slate-500 mb-4">Orden: {trailerType.sortOrder}</p>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => handleOpenEdit(trailerType)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleOpenDelete(trailerType)}
                    className="px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      <TrailerTypeModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingType(null);
        }}
        onSave={handleSave}
        trailerType={editingType}
        isLoading={modalLoading}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingType(null);
        }}
        onConfirm={handleDelete}
        trailerTypeName={deletingType?.name || ''}
        isLoading={deleteLoading}
      />
    </div>
  );
}

