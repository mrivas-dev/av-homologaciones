const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// ============================================================================
// Types
// ============================================================================

export interface Payment {
  id: string;
  homologationId: string;
  timestamp: string;
  amount: number;
  receiptPath: string | null;
  paymentGateway: string;
  createdAt: string;
}

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
  // Payment fields
  isPaid?: boolean;
  payments?: Payment[];
  totalPaid?: number;
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

// ============================================================================
// Trailer Types (Public)
// ============================================================================

export interface ReferencePhoto {
  label: string;
  path: string;
}

export interface PublicTrailerType {
  id: string;
  name: string;
  slug: string;
  price: number;
  referencePhotos: ReferencePhoto[];
}

export interface TrailerTypesResponse {
  data: PublicTrailerType[];
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
// Trailer Types API (Public)
// ============================================================================

/**
 * Fetch active trailer types (public - for forms)
 */
export async function getTrailerTypes(): Promise<TrailerTypesResponse> {
  const response = await fetch(`${API_BASE_URL}/api/trailer-types`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || 'Failed to fetch trailer types',
      response.status,
      data.code,
      data.details
    );
  }

  return data as TrailerTypesResponse;
}

/**
 * Get trailer type by name (from cached/fetched list)
 */
export function findTrailerTypeByName(
  trailerTypes: PublicTrailerType[],
  name: string
): PublicTrailerType | undefined {
  return trailerTypes.find((t) => t.name === name);
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

/**
 * Delete a photo
 */
export async function deletePhoto(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/photos/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new ApiError(
      data.error || 'Failed to delete photo',
      response.status,
      data.code,
      data.details
    );
  }
}

// ============================================================================
// Document API
// ============================================================================

export interface AdminDocument {
  id: string;
  homologationId: string;
  documentType: 'payment_receipt' | 'homologation_papers';
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  description?: string | null;
  createdAt: string;
}

export interface DocumentsResponse {
  data: AdminDocument[];
  total: number;
}

/**
 * Get documents for a homologation (public endpoint)
 */
export async function getDocuments(homologationId: string): Promise<DocumentsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/documents/homologation/${homologationId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || 'Failed to fetch documents',
      response.status,
      data.code,
      data.details
    );
  }

  return data as DocumentsResponse;
}

/**
 * Get document file URL
 */
export function getDocumentUrl(document: AdminDocument): string {
  // The filePath is like ./uploads/doc_payment_receipt_uuid_timestamp.pdf
  // We need to serve it from the backend
  const fileName = document.filePath.split('/').pop();
  return `${API_BASE_URL}/uploads/${fileName}`;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ============================================================================
// Payment API
// ============================================================================

export interface PaymentsResponse {
  data: Payment[];
  total: number;
  totalPaid: number;
}

export interface CreatePaymentRequest {
  homologationId: string;
  amount: number;
  paymentGateway?: string;
}

/**
 * Create a payment for a homologation
 */
export async function createPayment(
  homologationId: string,
  amount: number,
  paymentGateway?: string
): Promise<Payment> {
  const response = await fetch(`${API_BASE_URL}/api/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      homologationId,
      amount,
      paymentGateway: paymentGateway || 'MercadoPago',
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || 'Failed to create payment',
      response.status,
      data.code,
      data.details
    );
  }

  return data as Payment;
}

/**
 * Get payments for a homologation
 */
export async function getPaymentsByHomologation(
  homologationId: string
): Promise<PaymentsResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/payments/homologation/${homologationId}`,
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
      data.error || 'Failed to fetch payments',
      response.status,
      data.code,
      data.details
    );
  }

  return data as PaymentsResponse;
}

/**
 * Check payment status for a homologation
 */
export async function checkPaymentStatus(
  homologationId: string
): Promise<{ isPaid: boolean; totalPaid: number }> {
  const response = await fetch(
    `${API_BASE_URL}/api/payments/check/${homologationId}`,
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
      data.error || 'Failed to check payment status',
      response.status,
      data.code,
      data.details
    );
  }

  return data;
}

/**
 * Get receipt download URL for a payment
 */
export function getReceiptUrl(paymentId: string): string {
  return `${API_BASE_URL}/api/payments/${paymentId}/receipt`;
}
