'use client';

import { useState, useCallback, useRef } from 'react';
import { FiCamera, FiUpload, FiX, FiLoader, FiAlertCircle, FiImage, FiTrash2 } from 'react-icons/fi';
import { Photo, uploadPhoto, getPhotoUrl, deletePhoto } from '../../utils/api';

const MAX_PHOTOS = 6;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'pdf'];

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  error?: string;
}

interface PhotoUploadProps {
  homologationId: string;
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
  disabled?: boolean;
}

export default function PhotoUpload({
  homologationId,
  photos,
  onPhotosChange,
  disabled = false,
}: PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remainingSlots = MAX_PHOTOS - photos.length - uploadingFiles.length;

  const validateFile = (file: File): string | null => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase()) && !ALLOWED_EXTENSIONS.includes(extension)) {
      return `Tipo de archivo no permitido: ${file.type || extension}`;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return `El archivo excede el tamaño máximo de 10MB`;
    }
    
    return null;
  };

  const handleUpload = useCallback(async (files: File[]) => {
    if (disabled) return;

    setError(null);
    
    // Filter and validate files
    const validFiles: File[] = [];
    for (const file of files) {
      if (validFiles.length >= remainingSlots) {
        setError(`Solo puedes subir ${MAX_PHOTOS} fotos en total`);
        break;
      }
      
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        continue;
      }
      
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Create uploading entries
    const newUploadingFiles: UploadingFile[] = validFiles.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      progress: 0,
    }));

    setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);

    // Upload each file
    for (const uploadingFile of newUploadingFiles) {
      try {
        const photo = await uploadPhoto(
          homologationId,
          uploadingFile.file,
          false,
          (progress) => {
            setUploadingFiles((prev) =>
              prev.map((f) =>
                f.id === uploadingFile.id ? { ...f, progress } : f
              )
            );
          }
        );

        // Remove from uploading and add to photos
        setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadingFile.id));
        onPhotosChange([...photos, photo]);
      } catch (err) {
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === uploadingFile.id
              ? { ...f, error: err instanceof Error ? err.message : 'Error al subir' }
              : f
          )
        );
      }
    }
  }, [homologationId, photos, onPhotosChange, remainingSlots, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files);
    handleUpload(files);
  }, [handleUpload, disabled]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleUpload(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleUpload]);

  const handleRemoveUploading = (id: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (disabled || deletingPhotoId) return;

    // Confirm deletion
    if (!confirm('¿Estás seguro de que deseas eliminar esta foto?')) {
      return;
    }

    setDeletingPhotoId(photoId);
    setError(null);

    try {
      await deletePhoto(photoId);
      // Remove photo from list
      onPhotosChange(photos.filter((p) => p.id !== photoId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar la foto';
      setError(message);
    } finally {
      setDeletingPhotoId(null);
    }
  };

  const canUpload = remainingSlots > 0 && !disabled;

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
        <FiCamera className="w-5 h-5 text-amber-400" />
        Fotos del Trailer
      </h3>
      <p className="text-sm text-slate-400 mb-6">
        Máximo {MAX_PHOTOS} fotos • JPG, PNG, WebP, HEIC, PDF • Max 10MB por archivo
      </p>

      {/* Example Photos Section */}
      <div className="mb-6">
        <p className="text-sm font-medium text-slate-300 mb-3">
          Ejemplos de fotos aceptadas:
        </p>
        <div className="grid grid-cols-3 gap-3">
          {/* Frontal Example */}
          <div className="flex flex-col items-center">
            <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-slate-800 border border-slate-700 mb-2">
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Trailer body - front view */}
                <rect x="50" y="60" width="100" height="80" fill="#475569" stroke="#64748b" strokeWidth="2" rx="4" />
                {/* Door */}
                <rect x="85" y="80" width="30" height="50" fill="#334155" stroke="#475569" strokeWidth="1.5" rx="2" />
                <line x1="100" y1="80" x2="100" y2="130" stroke="#64748b" strokeWidth="1" />
                {/* Wheels */}
                <circle cx="70" cy="150" r="12" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                <circle cx="130" cy="150" r="12" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                {/* Wheel details */}
                <circle cx="70" cy="150" r="6" fill="#475569" />
                <circle cx="130" cy="150" r="6" fill="#475569" />
              </svg>
            </div>
            <span className="text-xs text-slate-400">Frontal</span>
          </div>

          {/* Lateral Example */}
          <div className="flex flex-col items-center">
            <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-slate-800 border border-slate-700 mb-2">
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Trailer body - side view */}
                <rect x="40" y="70" width="120" height="60" fill="#475569" stroke="#64748b" strokeWidth="2" rx="4" />
                {/* Roof */}
                <path d="M 40 70 L 50 50 L 150 50 L 160 70 Z" fill="#334155" stroke="#475569" strokeWidth="2" />
                {/* Axles */}
                <line x1="70" y1="130" x2="70" y2="145" stroke="#64748b" strokeWidth="3" />
                <line x1="130" y1="130" x2="130" y2="145" stroke="#64748b" strokeWidth="3" />
                {/* Wheels */}
                <circle cx="70" cy="155" r="10" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                <circle cx="130" cy="155" r="10" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                {/* Wheel details */}
                <circle cx="70" cy="155" r="5" fill="#475569" />
                <circle cx="130" cy="155" r="5" fill="#475569" />
              </svg>
            </div>
            <span className="text-xs text-slate-400">Lateral</span>
          </div>

          {/* Chasis Example */}
          <div className="flex flex-col items-center">
            <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-slate-800 border border-slate-700 mb-2">
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Chassis frame */}
                <rect x="30" y="80" width="140" height="8" fill="#1e293b" stroke="#334155" strokeWidth="1" rx="2" />
                <rect x="30" y="112" width="140" height="8" fill="#1e293b" stroke="#334155" strokeWidth="1" rx="2" />
                {/* Cross members */}
                <line x1="70" y1="80" x2="70" y2="120" stroke="#334155" strokeWidth="2" />
                <line x1="130" y1="80" x2="130" y2="120" stroke="#334155" strokeWidth="2" />
                {/* Axle beams */}
                <rect x="60" y="95" width="20" height="6" fill="#475569" stroke="#64748b" strokeWidth="1" rx="1" />
                <rect x="120" y="95" width="20" height="6" fill="#475569" stroke="#64748b" strokeWidth="1" rx="1" />
                {/* Suspension */}
                <path d="M 70 88 Q 70 95 70 100" stroke="#64748b" strokeWidth="2" fill="none" />
                <path d="M 130 88 Q 130 95 130 100" stroke="#64748b" strokeWidth="2" fill="none" />
              </svg>
            </div>
            <span className="text-xs text-slate-400">Chasis</span>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
          <FiAlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {/* Existing Photos */}
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative aspect-square rounded-lg overflow-hidden bg-slate-800 group"
          >
            {photo.mimeType.startsWith('image/') ? (
              <img
                src={getPhotoUrl(photo)}
                alt={photo.fileName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FiImage className="w-12 h-12 text-slate-500" />
              </div>
            )}
            
            {/* Hover overlay with delete button */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <span className="text-xs text-white truncate px-2 max-w-full">{photo.fileName}</span>
              <button
                onClick={() => handleDeletePhoto(photo.id)}
                disabled={disabled || deletingPhotoId === photo.id}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${deletingPhotoId === photo.id
                    ? 'bg-slate-700 text-slate-400 cursor-wait'
                    : 'bg-red-500/90 hover:bg-red-600 text-white'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                title="Eliminar foto"
              >
                {deletingPhotoId === photo.id ? (
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
        ))}

        {/* Uploading Files */}
        {uploadingFiles.map((file) => (
          <div
            key={file.id}
            className="relative aspect-square rounded-lg overflow-hidden bg-slate-800 border border-slate-700"
          >
            <div className="w-full h-full flex flex-col items-center justify-center p-4">
              {file.error ? (
                <>
                  <FiAlertCircle className="w-8 h-8 text-red-400 mb-2" />
                  <p className="text-xs text-red-400 text-center">{file.error}</p>
                  <button
                    onClick={() => handleRemoveUploading(file.id)}
                    className="mt-2 text-xs text-slate-400 hover:text-white"
                  >
                    Cerrar
                  </button>
                </>
              ) : (
                <>
                  <FiLoader className="w-8 h-8 text-amber-400 animate-spin mb-2" />
                  <p className="text-xs text-slate-400 mb-2 truncate max-w-full">
                    {file.file.name}
                  </p>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div
                      className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{file.progress}%</p>
                </>
              )}
            </div>
          </div>
        ))}

        {/* Upload Zone */}
        {canUpload && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative aspect-square rounded-lg border-2 border-dashed 
              flex flex-col items-center justify-center cursor-pointer
              transition-all duration-200
              ${isDragging
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'
              }
            `}
          >
            <FiUpload className={`w-8 h-8 mb-2 ${isDragging ? 'text-amber-400' : 'text-slate-500'}`} />
            <p className={`text-sm ${isDragging ? 'text-amber-400' : 'text-slate-500'}`}>
              {isDragging ? 'Soltar aquí' : 'Agregar foto'}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {remainingSlots} restantes
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ALLOWED_EXTENSIONS.map(ext => `.${ext}`).join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        {/* Empty slots indicator */}
        {photos.length === 0 && uploadingFiles.length === 0 && (
          <div className="col-span-2 sm:col-span-2 flex items-center justify-center p-8 text-slate-500">
            <p className="text-sm">Aún no has subido fotos</p>
          </div>
        )}
      </div>

      {/* Photo count */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-slate-400">
          {photos.length} de {MAX_PHOTOS} fotos
        </span>
        {photos.length >= MAX_PHOTOS && (
          <span className="text-amber-400">Máximo alcanzado</span>
        )}
      </div>
    </div>
  );
}

