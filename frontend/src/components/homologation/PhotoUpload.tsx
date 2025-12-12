'use client';

import { useState, useCallback, useRef } from 'react';
import { FiCamera, FiUpload, FiX, FiLoader, FiAlertCircle, FiImage, FiTrash2, FiLock } from 'react-icons/fi';
import { Photo, uploadPhoto, getPhotoUrl, deletePhoto, ReferencePhoto } from '../../utils/api';

const MAX_PHOTOS = 6;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'pdf'];

// Fallback reference photos when API data is not available
const FALLBACK_REFERENCE_PHOTOS: Record<string, ReferencePhoto[]> = {
  'Trailer': [
    { label: 'Frontal', path: '/reference_photos/trailer/frontal.jpeg' },
    { label: 'Lateral', path: '/reference_photos/trailer/lateral.jpeg' },
    { label: 'Trasera', path: '/reference_photos/trailer/trasera.jpeg' },
    { label: 'Ficha eléctrica', path: '/reference_photos/ficha_electrica.jpeg' },
  ],
  'Rolling Box': [
    { label: 'Frontal', path: '/reference_photos/rollingbox/frontal.jpeg' },
    { label: 'Lateral', path: '/reference_photos/rollingbox/lateral.jpeg' },
    { label: 'Trasera', path: '/reference_photos/rollingbox/trasera.jpeg' },
    { label: 'Rueda de auxilio', path: '/reference_photos/rollingbox/rueda_auxilio.jpeg' },
    { label: 'Ficha eléctrica', path: '/reference_photos/ficha_electrica.jpeg' },
  ],
  'Motorhome': [
    { label: 'Frontal', path: '/ejemplo_trailer_frontal.jpg' },
    { label: 'Lateral', path: '/ejemplo_trailer_lateral.jpg' },
    { label: 'Chasis', path: '/ejemplo_trailer_chasis.jpg' },
  ],
};

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
  isLocked?: boolean;
  trailerType?: string;
  referencePhotos?: ReferencePhoto[];
}

export default function PhotoUpload({
  homologationId,
  photos,
  onPhotosChange,
  disabled = false,
  isLocked = false,
  trailerType,
  referencePhotos,
}: PhotoUploadProps) {
  // Use API reference photos or fallback
  const effectiveReferencePhotos = referencePhotos && referencePhotos.length > 0
    ? referencePhotos
    : (trailerType && FALLBACK_REFERENCE_PHOTOS[trailerType]) || FALLBACK_REFERENCE_PHOTOS['Motorhome'];
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

  // Can only upload if not disabled, not locked, and has remaining slots
  const canUpload = remainingSlots > 0 && !disabled && !isLocked;

  return (
    <div className={`bg-slate-900/50 border rounded-xl p-6 ${isLocked ? 'border-blue-500/30' : 'border-slate-800'}`}>
      <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
        <FiCamera className="w-5 h-5 text-blue-400" />
        Fotos del Trailer
        {isLocked && (
          <span className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-400">
            <FiLock className="w-3 h-3" />
            Bloqueado
          </span>
        )}
      </h3>
      <p className="text-sm text-slate-400 mb-6">
        {isLocked 
          ? 'Las fotos no pueden ser modificadas después del pago'
          : `Máximo ${MAX_PHOTOS} fotos • JPG, PNG, WebP, HEIC, PDF • Max 10MB por archivo`
        }
      </p>

      {/* Example Photos Section */}
      <div className="mb-6">
        <p className="text-sm font-medium text-slate-300 mb-3">
          Ejemplos de fotos aceptadas:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {effectiveReferencePhotos.map((photo, index) => (
            <div key={`${photo.label}-${index}`} className="flex flex-col items-center">
              <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-slate-800 border border-slate-700 mb-1">
                <img
                  src={photo.path}
                  alt={`Ejemplo de foto: ${photo.label}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs text-slate-400">{photo.label}</span>
            </div>
          ))}
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
            
            {/* Hover overlay with delete button - only show when not locked */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <span className="text-xs text-white truncate px-2 max-w-full">{photo.fileName}</span>
              {isLocked ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <FiLock className="w-4 h-4" />
                  <span>Bloqueado</span>
                </div>
              ) : (
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
              )}
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
                  <FiLoader className="w-8 h-8 text-blue-400 animate-spin mb-2" />
                  <p className="text-xs text-slate-400 mb-2 truncate max-w-full">
                    {file.file.name}
                  </p>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
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
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'
              }
            `}
          >
            <FiUpload className={`w-8 h-8 mb-2 ${isDragging ? 'text-blue-400' : 'text-slate-500'}`} />
            <p className={`text-sm ${isDragging ? 'text-blue-400' : 'text-slate-500'}`}>
              {isDragging ? 'Soltar aquí' : 'Agregar foto'}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Hasta {remainingSlots} 
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
          <span className="text-blue-400">Máximo alcanzado</span>
        )}
      </div>
    </div>
  );
}

