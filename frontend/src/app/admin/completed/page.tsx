'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  fetchHomologations,
  fetchHomologationDetails,
  HomologationDetail,
  AdminApiError,
  getDocumentUrl,
} from '@/utils/adminApi';
import {
  FiArrowLeft,
  FiLoader,
  FiRefreshCw,
  FiCheckCircle,
  FiUser,
  FiCreditCard,
  FiPhone,
  FiMail,
  FiTruck,
  FiMaximize,
  FiHash,
  FiTag,
  FiImage,
  FiFileText,
  FiLink,
  FiCalendar,
  FiChevronRight,
} from 'react-icons/fi';

type CompletedHomologation = HomologationDetail & {
  paymentReceipt?: string;
};

const statusBadge = (
  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-purple-500/10 text-purple-300 border border-purple-500/30">
    <FiCheckCircle className="w-4 h-4" />
    Completado
  </span>
);

function getPhotoUrl(filePath: string): string {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const fileName = filePath.split('/').pop() || filePath.split('\\').pop() || filePath;
  return `${API_BASE_URL}/uploads/${fileName}`;
}

export default function CompletedHomologationsPage() {
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<CompletedHomologation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCompleted = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const listResponse = await fetchHomologations(token, 'Completed');
      const details = await Promise.all(
        listResponse.data.map(async (item) => {
          const detail = await fetchHomologationDetails(token, item.id);
          const payment = detail.documents?.find((doc) => doc.documentType === 'payment_receipt');
          return {
            ...detail,
            paymentReceipt: payment ? getDocumentUrl(payment.filePath) : undefined,
          };
        })
      );

      setItems(details);
    } catch (err) {
      const message =
        err instanceof AdminApiError ? err.message : 'Error al cargar homologaciones completadas';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && token) {
      loadCompleted();
    }
  }, [isAuthenticated, token, loadCompleted]);

  const totalPhotos = useMemo(
    () => items.reduce((acc, item) => acc + (item.photos?.length || 0), 0),
    [items]
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <FiLoader className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <FiArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Volver</span>
              </button>
              <div>
                <h1 className="text-lg font-semibold text-white font-heading">
                  Homologaciones Completadas
                </h1>
                <p className="text-xs text-slate-400">
                  Resumen final de procesos cerrados
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadCompleted}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors disabled:opacity-50"
              >
                <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-2 mb-8">
          <div className="flex items-center gap-3 text-purple-200">
            {statusBadge}
            <span className="text-sm text-slate-300">
              {items.length} {items.length === 1 ? 'homologación' : 'homologaciones'} cerradas
            </span>
          </div>
          <p className="text-slate-400 max-w-3xl">
            Vista resumida para revisar procesos completados, validar comprobantes y descargar
            documentos asociados.
          </p>
          {totalPhotos > 0 && (
            <p className="text-xs text-slate-500">
              {totalPhotos} {totalPhotos === 1 ? 'foto' : 'fotos'} almacenadas en total
            </p>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <FiFileText className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-400">{error}</p>
              <button
                onClick={loadCompleted}
                className="text-sm text-red-300 hover:text-red-200 underline mt-1"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <FiLoader className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-4" />
              <p className="text-slate-400">Cargando homologaciones completadas...</p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <FiCheckCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-300 text-lg">No hay homologaciones completadas</p>
              <p className="text-slate-500 text-sm mt-1">
                Los registros aparecerán aquí cuando se cierren
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {items.map((item) => {
              const receiptDoc = item.documents?.find(
                (doc) => doc.documentType === 'payment_receipt'
              );
              const otherDocs = item.documents?.filter(
                (doc) => doc.documentType !== 'payment_receipt'
              );
              const photos = item.photos || [];
              const previewPhotos = photos.slice(0, 4);
              const remainingCount = photos.length - previewPhotos.length;

              return (
                <div
                  key={item.id}
                  className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 shadow-lg shadow-slate-900/40"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        {statusBadge}
                        <span className="text-xs text-slate-500">
                          ID: {item.id.substring(0, 8)}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-white">
                        {item.ownerFullName || 'Propietario sin nombre'}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <FiCalendar className="w-4 h-4" />
                          Creado: {new Date(item.createdAt).toLocaleDateString('es-AR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiCalendar className="w-4 h-4" />
                          Actualizado: {new Date(item.updatedAt).toLocaleDateString('es-AR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiFileText className="w-4 h-4" />
                          Versión {item.version}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/admin/homologation/${item.id}`)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
                    >
                      Ver detalle
                      <FiChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-amber-400 mb-3">
                        <FiUser className="w-4 h-4" />
                        <h4 className="text-sm font-semibold text-white">Información del Usuario</h4>
                      </div>
                      <div className="space-y-2 text-sm text-slate-300">
                        <div className="flex items-center gap-2">
                          <FiCreditCard className="w-4 h-4 text-slate-500" />
                          <span>{item.ownerNationalId || 'DNI/CUIT no cargado'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiPhone className="w-4 h-4 text-slate-500" />
                          <span>{item.ownerPhone || 'Teléfono no cargado'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiMail className="w-4 h-4 text-slate-500" />
                          <span>{item.ownerEmail || 'Email no cargado'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-amber-400 mb-3">
                        <FiTruck className="w-4 h-4" />
                        <h4 className="text-sm font-semibold text-white">
                          Información del Trailer
                        </h4>
                      </div>
                      <div className="space-y-2 text-sm text-slate-300">
                        <div className="flex items-center gap-2">
                          <FiTag className="w-4 h-4 text-slate-500" />
                          <span>{item.trailerLicensePlateNumber || 'Patente no cargada'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiMaximize className="w-4 h-4 text-slate-500" />
                          <span>{item.trailerDimensions || 'Dimensiones no cargadas'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiHash className="w-4 h-4 text-slate-500" />
                          <span>
                            {item.trailerNumberOfAxles
                              ? `${item.trailerNumberOfAxles} ejes`
                              : 'Ejes no cargados'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiTruck className="w-4 h-4 text-slate-500" />
                          <span>{item.trailerType || 'Tipo no cargado'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-amber-400">
                          <FiImage className="w-4 h-4" />
                          <h4 className="text-sm font-semibold text-white">
                            Fotos ({photos.length})
                          </h4>
                        </div>
                        <span className="text-xs text-slate-500">
                          Previsualización rápida
                        </span>
                      </div>
                      {photos.length === 0 ? (
                        <p className="text-sm text-slate-500">No hay fotos adjuntas</p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {previewPhotos.map((photo) => (
                            <div
                              key={photo.id}
                              className="relative aspect-square rounded-md overflow-hidden border border-slate-800"
                            >
                              <img
                                src={getPhotoUrl(photo.filePath)}
                                alt={photo.fileName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {remainingCount > 0 && (
                            <div className="flex items-center justify-center rounded-md border border-slate-800 bg-slate-800/60 text-slate-300 text-sm">
                              +{remainingCount} más
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-4">
                      <div className="flex items-center gap-2 text-amber-400">
                        <FiFileText className="w-4 h-4" />
                        <h4 className="text-sm font-semibold text-white">Documentación</h4>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs text-slate-500 uppercase tracking-wide">
                          Pago
                        </p>
                        {receiptDoc ? (
                          <a
                            href={getDocumentUrl(receiptDoc.filePath)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 hover:bg-emerald-500/20 transition-colors text-sm"
                          >
                            <FiLink className="w-4 h-4" />
                            Comprobante: {receiptDoc.fileName}
                          </a>
                        ) : (
                          <p className="text-sm text-slate-500">Sin comprobante de pago adjunto</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs text-slate-500 uppercase tracking-wide">
                          Documentos adjuntos
                        </p>
                        {otherDocs && otherDocs.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {otherDocs.map((doc) => (
                              <a
                                key={doc.id}
                                href={getDocumentUrl(doc.filePath)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700 text-slate-200 hover:bg-slate-800 transition-colors text-sm"
                              >
                                <FiFileText className="w-4 h-4 text-slate-400" />
                                <span className="truncate">{doc.fileName}</span>
                              </a>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">No hay documentos adicionales</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
