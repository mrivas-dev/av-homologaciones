const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// ============================================================================
// Types
// ============================================================================

export interface Homologation {
  id: string;
  ownerNationalId: string;
  ownerPhone: string;
  ownerFullName?: string;
  ownerEmail?: string;
  trailerType?: string;
  trailerDimensions?: string;
  trailerNumberOfAxles?: number;
  trailerLicensePlateNumber?: string;
  status: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface HomologationUpdate {
  ownerFullName?: string;
  ownerEmail?: string;
  trailerType?: string;
  trailerDimensions?: string;
  trailerNumberOfAxles?: number;
  trailerLicensePlateNumber?: string;
}

export interface Photo {
  id: string;
  homologationId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  isIdDocument: boolean;
  createdAt: string;
}

export interface PhotosResponse {
  data: Photo[];
  total: number;
}

export interface LookupOrCreateResponse {
  found: boolean;
  homologation: Homologation;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: unknown[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ============================================================================
// Homologation API
// ============================================================================

/**
 * Lookup an existing homologation by DNI + phone, or create a new one if not found
 */
export async function lookupOrCreateHomologation(
  dni: string,
  phone: string
): Promise<LookupOrCreateResponse> {
  const response = await fetch(`${API_BASE_URL}/api/homologations/lookup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ dni, phone }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || 'Failed to process request',
      response.status,
      data.code,
      data.details
    );
  }

  return data as LookupOrCreateResponse;
}

/**
 * Get homologation by ID
 */
export async function getHomologationById(id: string): Promise<Homologation> {
  const response = await fetch(`${API_BASE_URL}/api/homologations/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || 'Homologation not found',
      response.status,
      data.code,
      data.details
    );
  }

  return data as Homologation;
}

/**
 * Update homologation fields
 */
export async function updateHomologation(
  id: string,
  updates: HomologationUpdate
): Promise<Homologation> {
  const response = await fetch(`${API_BASE_URL}/api/homologations/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || 'Failed to update homologation',
      response.status,
      data.code,
      data.details
    );
  }

  return data as Homologation;
}

/**
 * Submit homologation for review
 */
export async function submitHomologation(id: string): Promise<Homologation> {
  const response = await fetch(`${API_BASE_URL}/api/homologations/${id}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || 'Failed to submit homologation',
      response.status,
      data.code,
      data.details
    );
  }

  return data as Homologation;
}

/**
 * Update homologation status
 */
export async function updateHomologationStatus(
  id: string,
  status: string,
  reason?: string
): Promise<Homologation> {
  const response = await fetch(`${API_BASE_URL}/api/homologations/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status, reason }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || 'Failed to update status',
      response.status,
      data.code,
      data.details
    );
  }

  return data as Homologation;
}

// ============================================================================
// Photo API
// ============================================================================

/**
 * Get photos for a homologation
 */
export async function getPhotos(homologationId: string): Promise<PhotosResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/photos/homologation/${homologationId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || 'Failed to fetch photos',
      response.status,
      data.code,
      data.details
    );
  }

  return data as PhotosResponse;
}

/**
 * Upload a photo for a homologation
 */
export async function uploadPhoto(
  homologationId: string,
  file: File,
  isIdDocument: boolean = false,
  onProgress?: (progress: number) => void
): Promise<Photo> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('homologationId', homologationId);
  formData.append('isIdDocument', String(isIdDocument));

  // Use XMLHttpRequest for progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve(data as Photo);
        } catch {
          reject(new ApiError('Invalid response', xhr.status));
        }
      } else {
        try {
          const data = JSON.parse(xhr.responseText);
          reject(new ApiError(data.error || 'Upload failed', xhr.status));
        } catch {
          reject(new ApiError('Upload failed', xhr.status));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(new ApiError('Network error', 0));
    });

    xhr.addEventListener('abort', () => {
      reject(new ApiError('Upload cancelled', 0));
    });

    xhr.open('POST', `${API_BASE_URL}/api/photos`);
    xhr.send(formData);
  });
}

/**
 * Get photo file URL
 */
export function getPhotoUrl(photo: Photo): string {
  // The filePath is like ./uploads/uuid_timestamp.jpg
  // We need to serve it from the backend
  const fileName = photo.filePath.split('/').pop();
  return `${API_BASE_URL}/uploads/${fileName}`;
}
