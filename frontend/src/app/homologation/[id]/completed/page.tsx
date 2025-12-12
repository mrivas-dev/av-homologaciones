'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getHomologationById,
  getPhotos,
  getDocuments,
  getPhotoUrl,
  getDocumentUrl,
  formatFileSize,
  Homologation,
  Photo,
  AdminDocument,
  ApiError,
} from '@/utils/api';
import {
  FiArrowLeft,
  FiLoader,
  FiAlertCircle,
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
  FiDownload,
  FiExternalLink,
  FiXCircle,
} from 'react-icons/fi';

export default function CompletedHomologationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [homologation, setHomologation] = useState<Homologation | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const [homologationData, photosData, documentsData] = await Promise.all([
        getHomologationById(id),
        getPhotos(id),
        getDocuments(id),
      ]);

      setHomologation(homologationData);
      setPhotos(photosData.data);
      setDocuments(documentsData.data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Error al cargar la homologación';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando homologación...</p>
        </div>
      </div>
    );
  }

  if (error || !homologation) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No se pudo cargar</h2>
          <p className="text-slate-400 mb-6">{error || 'Homologación no encontrada'}</p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (homologation.status !== 'Completed') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="w-7 h-7 text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Tu homologación aún no está completada</h2>
          <p className="text-slate-400 mb-6">
            Estado actual: <span className="text-blue-300 font-semibold">{homologation.status}</span>
          </p>
          <button
            onClick={() => router.push(`/homologation/${homologation.id}`)}
            className="inline-flex items-center gap-2 px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20"
          >
            Ir al seguimiento
          </button>
        </div>
      </div>
    );
  }

  const paymentReceipt = documents.find((doc) => doc.documentType === 'payment_receipt');
  const otherDocuments = documents.filter((doc) => doc.documentType !== 'payment_receipt');

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.push(`/`)}
              className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Volver al inicio</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-300 text-sm font-medium">
                <FiCheckCircle className="w-4 h-4" />
                Proceso completado
              </div>
              <span className="text-xs text-slate-500">ID: {homologation.id.substring(0, 8)}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="bg-gradient-to-br from-emerald-600/10 via-emerald-500/5 to-emerald-400/5 border border-emerald-500/20 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <FiCheckCircle className="w-7 h-7 text-emerald-300" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white">¡Homologación completada!</h1>
              <p className="text-slate-300 mt-1">
                Tu proceso finalizó con éxito. Guarda esta información y descarga tus documentos.
              </p>
            </div>
          </div>
          <div className="text-right space-y-1 text-sm text-slate-400">
            <p>Creado: {new Date(homologation.createdAt).toLocaleDateString('es-AR')}</p>
            <p>Actualizado: {new Date(homologation.updatedAt).toLocaleDateString('es-AR')}</p>
            <p className="text-slate-500">Versión {homologation.version}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 text-blue-400 mb-3">
              <FiUser className="w-5 h-5" />
              <h3 className="text-lg font-semibold text-white">Datos del usuario</h3>
            </div>
            <div className="space-y-3 text-sm text-slate-200">
              <div className="flex items-center gap-2">
                <FiUser className="w-4 h-4 text-slate-500" />
                <span>{homologation.ownerFullName || 'Nombre no cargado'}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCreditCard className="w-4 h-4 text-slate-500" />
                <span>{homologation.ownerNationalId}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiPhone className="w-4 h-4 text-slate-500" />
                <span>{homologation.ownerPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiMail className="w-4 h-4 text-slate-500" />
                <span>{homologation.ownerEmail || 'Email no cargado'}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 text-blue-400 mb-3">
              <FiTruck className="w-5 h-5" />
              <h3 className="text-lg font-semibold text-white">Datos del trailer</h3>
            </div>
            <div className="space-y-3 text-sm text-slate-200">
              <div className="flex items-center gap-2">
                <FiTag className="w-4 h-4 text-slate-500" />
                <span>{homologation.trailerLicensePlateNumber || 'Patente no cargada'}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiMaximize className="w-4 h-4 text-slate-500" />
                <span>{homologation.trailerDimensions || 'Dimensiones no cargadas'}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiHash className="w-4 h-4 text-slate-500" />
                <span>{homologation.trailerNumberOfAxles || 'Ejes no cargados'}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiTruck className="w-4 h-4 text-slate-500" />
                <span>{homologation.trailerType || 'Tipo no cargado'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-blue-400">
                <FiImage className="w-5 h-5" />
                <h3 className="text-lg font-semibold text-white">Fotos ({photos.length})</h3>
              </div>
              <span className="text-xs text-slate-500">Toque para ampliar</span>
            </div>
            {photos.length === 0 ? (
              <p className="text-sm text-slate-400">No hay fotos adjuntas.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => setSelectedPhoto(getPhotoUrl(photo))}
                    className="relative aspect-square rounded-lg overflow-hidden border border-slate-800 hover:border-emerald-500/40 transition-colors"
                  >
                    <img
                      src={getPhotoUrl(photo)}
                      alt={photo.fileName}
                      className="w-full h-full object-cover"
                    />
                    {photo.isIdDocument && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 bg-blue-500/90 text-white text-xs rounded">
                        DNI
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-blue-400">
              <FiCreditCard className="w-5 h-5" />
              <h3 className="text-lg font-semibold text-white">Pago y documentos</h3>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Pago</p>
              {paymentReceipt ? (
                <a
                  href={getDocumentUrl(paymentReceipt)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 hover:bg-emerald-500/20 transition-colors text-sm"
                >
                  <FiExternalLink className="w-4 h-4" />
                  Comprobante: {paymentReceipt.fileName}
                </a>
              ) : (
                <p className="text-sm text-slate-400">No hay comprobante de pago disponible.</p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Documentos adjuntos</p>
              {otherDocuments.length === 0 ? (
                <p className="text-sm text-slate-400">No hay documentos adicionales.</p>
              ) : (
                <div className="space-y-2">
                  {otherDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-800"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FiFileText className="w-5 h-5 text-slate-400" />
                        <div className="min-w-0">
                          <p className="text-sm text-white truncate">{doc.fileName}</p>
                          <p className="text-xs text-slate-500">
                            {formatFileSize(doc.fileSize)} ·{' '}
                            {new Date(doc.createdAt).toLocaleDateString('es-AR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={getDocumentUrl(doc)}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                          title="Ver"
                        >
                          <FiExternalLink className="w-4 h-4" />
                        </a>
                        <a
                          href={getDocumentUrl(doc)}
                          download={doc.fileName}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                          title="Descargar"
                        >
                          <FiDownload className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-6 right-6 text-white hover:text-blue-400 transition-colors"
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
