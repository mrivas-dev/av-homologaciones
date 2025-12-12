'use client';

import { useState, useRef } from 'react';
import {
  FiUpload,
  FiFile,
  FiTrash2,
  FiDownload,
  FiLoader,
  FiImage,
  FiFileText,
  FiX,
} from 'react-icons/fi';
import {
  AdminDocument,
  AdminDocumentType,
  uploadDocument,
  deleteDocument,
  getDocumentUrl,
  AdminApiError,
} from '@/utils/adminApi';

interface DocumentUploadSectionProps {
  token: string;
  homologationId: string;
  documents: AdminDocument[];
  onDocumentChange: () => void;
}

const DOCUMENT_TYPES: { value: AdminDocumentType; label: string; description: string }[] = [
  {
    value: 'payment_receipt',
    label: 'Comprobante de Pago',
    description: 'Recibo o comprobante del pago de la homologación',
  },
  {
    value: 'homologation_papers',
    label: 'Papeles de Homologación',
    description: 'Documentos finales de la homologación completada',
  },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) {
    return <FiImage className="w-5 h-5" />;
  }
  return <FiFileText className="w-5 h-5" />;
}

export default function DocumentUploadSection({
  token,
  homologationId,
  documents,
  onDocumentChange,
}: DocumentUploadSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<AdminDocumentType>('payment_receipt');
  const [description, setDescription] = useState('');
  const [previewDoc, setPreviewDoc] = useState<AdminDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const paymentReceipts = documents.filter((d) => d.documentType === 'payment_receipt');
  const homologationPapers = documents.filter((d) => d.documentType === 'homologation_papers');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      await uploadDocument(token, homologationId, selectedType, file, description || undefined);
      setDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onDocumentChange();
    } catch (err) {
      const message = err instanceof AdminApiError ? err.message : 'Error al subir el documento';
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este documento?')) return;

    setDeletingId(documentId);
    setError(null);

    try {
      await deleteDocument(token, documentId);
      onDocumentChange();
    } catch (err) {
      const message = err instanceof AdminApiError ? err.message : 'Error al eliminar el documento';
      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  const renderDocumentList = (docs: AdminDocument[], title: string, emptyMessage: string) => (
    <div className="mb-6">
      <h4 className="text-sm font-medium text-slate-300 mb-3">{title}</h4>
      {docs.length === 0 ? (
        <p className="text-sm text-slate-500 italic">{emptyMessage}</p>
      ) : (
        <div className="space-y-2">
          {docs.map((doc) => {
            const docUrl = getDocumentUrl(doc.filePath);
            const isImage = doc.mimeType.startsWith('image/');
            const isPdf = doc.mimeType === 'application/pdf';

            return (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center text-slate-400">
                    {getFileIcon(doc.mimeType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate">{doc.fileName}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{formatFileSize(doc.fileSize)}</span>
                      <span>•</span>
                      <span>{new Date(doc.createdAt).toLocaleDateString('es-AR')}</span>
                    </div>
                    {doc.description && (
                      <p className="text-xs text-slate-400 mt-1 truncate">{doc.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  {(isImage || isPdf) && (
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                      title="Vista previa"
                    >
                      <FiFile className="w-4 h-4" />
                    </button>
                  )}
                  <a
                    href={docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    title="Descargar"
                  >
                    <FiDownload className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={deletingId === doc.id}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                    title="Eliminar"
                  >
                    {deletingId === doc.id ? (
                      <FiLoader className="w-4 h-4 animate-spin" />
                    ) : (
                      <FiTrash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <FiFile className="w-5 h-5 text-blue-500" />
        Documentos Administrativos
      </h2>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Upload Section */}
      <div className="mb-6 p-4 bg-slate-800/30 border border-slate-700 rounded-lg">
        <h4 className="text-sm font-medium text-slate-300 mb-3">Subir Nuevo Documento</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Tipo de Documento</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as AdminDocumentType)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-blue-500"
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              {DOCUMENT_TYPES.find((t) => t.value === selectedType)?.description}
            </p>
          </div>
          
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Descripción (opcional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Comprobante de transferencia bancaria"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={handleFileSelect}
            className="hidden"
            id="document-upload"
          />
          <label
            htmlFor="document-upload"
            className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg transition-colors cursor-pointer ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isUploading ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <FiUpload className="w-4 h-4" />
                Seleccionar Archivo
              </>
            )}
          </label>
          <span className="text-xs text-slate-500">PDF, JPG, PNG, WebP (máx. 10MB)</span>
        </div>
      </div>

      {/* Document Lists */}
      {renderDocumentList(
        paymentReceipts,
        'Comprobantes de Pago',
        'No hay comprobantes de pago adjuntos'
      )}
      {renderDocumentList(
        homologationPapers,
        'Papeles de Homologación',
        'No hay papeles de homologación adjuntos'
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setPreviewDoc(null)}
        >
          <button
            onClick={() => setPreviewDoc(null)}
            className="absolute top-4 right-4 text-white hover:text-red-400 transition-colors"
          >
            <FiX className="w-8 h-8" />
          </button>
          <div className="max-w-4xl max-h-[90vh] w-full h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-800 px-4 py-2 rounded-t-lg flex items-center justify-between">
              <span className="text-sm text-slate-200 truncate">{previewDoc.fileName}</span>
              <a
                href={getDocumentUrl(previewDoc.filePath)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
              >
                <FiDownload className="w-4 h-4" />
                Descargar
              </a>
            </div>
            {previewDoc.mimeType.startsWith('image/') ? (
              <img
                src={getDocumentUrl(previewDoc.filePath)}
                alt={previewDoc.fileName}
                className="flex-1 object-contain bg-slate-900 rounded-b-lg"
              />
            ) : previewDoc.mimeType === 'application/pdf' ? (
              <iframe
                src={getDocumentUrl(previewDoc.filePath)}
                className="flex-1 w-full bg-white rounded-b-lg"
                title={previewDoc.fileName}
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

