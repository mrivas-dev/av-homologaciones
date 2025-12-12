const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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

export type AdminDocumentType = 'payment_receipt' | 'homologation_papers';

export interface AdminDocument {
  id: string;
  homologationId: string;
  documentType: AdminDocumentType;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  description: string | null;
  createdBy: string;
  createdAt: string;
}

export interface HomologationListItem {
  id: string;
  ownerPhone: string | null;
  ownerNationalId: string | null;
  ownerFullName: string | null;
  trailerType: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface HomologationDetail extends HomologationListItem {
  trailerType: string | null;
  trailerDimensions: string | null;
  trailerNumberOfAxles: number | null;
  trailerLicensePlateNumber: string | null;
  ownerEmail: string | null;
  photos: Photo[];
  documents: AdminDocument[];
  version: number;
}

// =============================================
// Trailer Types
// =============================================

export interface ReferencePhoto {
  label: string;
  path: string;
}

export interface TrailerType {
  id: string;
  name: string;
  slug: string;
  price: number;
  referencePhotos: ReferencePhoto[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface TrailerTypesResponse {
  data: TrailerType[];
  total: number;
}

export interface CreateTrailerTypeData {
  name: string;
  slug?: string;
  price: number;
  referencePhotos?: ReferencePhoto[];
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateTrailerTypeData {
  name?: string;
  slug?: string;
  price?: number;
  referencePhotos?: ReferencePhoto[];
  isActive?: boolean;
  sortOrder?: number;
}

export interface HomologationsResponse {
  data: HomologationListItem[];
  total: number;
}

export class AdminApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'AdminApiError';
  }
}

/**
 * Get auth headers with the current token
 */
function getAuthHeaders(token: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

/**
 * Handle API response errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new AdminApiError(
      data.error || 'An error occurred',
      response.status,
      data.code
    );
  }

  return data as T;
}

/**
 * Fetch all homologations (admin view)
 */
export async function fetchHomologations(
  token: string,
  status?: string
): Promise<HomologationsResponse> {
  const url = new URL(`${API_BASE_URL}/api/admin/homologations`);
  if (status) {
    url.searchParams.set('status', status);
  }

  const response = await fetch(url.toString(), {
    headers: getAuthHeaders(token),
  });

  return handleResponse<HomologationsResponse>(response);
}

/**
 * Approve a homologation
 */
export async function approveHomologation(
  token: string,
  id: string,
  reason?: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/homologations/${id}/approve`,
    {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ reason }),
    }
  );

  return handleResponse(response);
}

/**
 * Reject a homologation
 */
export async function rejectHomologation(
  token: string,
  id: string,
  reason?: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/homologations/${id}/reject`,
    {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ reason }),
    }
  );

  return handleResponse(response);
}

/**
 * Mark a homologation as incomplete
 */
export async function markHomologationIncomplete(
  token: string,
  id: string,
  reason?: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/homologations/${id}/incomplete`,
    {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ reason }),
    }
  );

  return handleResponse(response);
}

/**
 * Complete a homologation
 */
export async function completeHomologation(
  token: string,
  id: string,
  reason?: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/homologations/${id}/complete`,
    {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ reason }),
    }
  );

  return handleResponse(response);
}

/**
 * Fetch a single homologation with full details including photos
 */
export async function fetchHomologationDetails(
  token: string,
  id: string
): Promise<HomologationDetail> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/homologations/${id}`,
    {
      headers: getAuthHeaders(token),
    }
  );

  return handleResponse<HomologationDetail>(response);
}

/**
 * Delete a homologation (soft delete)
 */
export async function deleteHomologation(
  token: string,
  id: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/homologations/${id}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    }
  );

  return handleResponse(response);
}

/**
 * Upload a document for a homologation
 */
export async function uploadDocument(
  token: string,
  homologationId: string,
  documentType: AdminDocumentType,
  file: File,
  description?: string
): Promise<AdminDocument> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('homologationId', homologationId);
  formData.append('documentType', documentType);
  if (description) {
    formData.append('description', description);
  }

  const response = await fetch(
    `${API_BASE_URL}/api/admin/documents`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    }
  );

  return handleResponse<AdminDocument>(response);
}

/**
 * Delete a document
 */
export async function deleteDocument(
  token: string,
  documentId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/documents/${documentId}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    }
  );

  return handleResponse(response);
}

/**
 * Get document URL from file path
 */
export function getDocumentUrl(filePath: string): string {
  const fileName = filePath.split('/').pop() || filePath.split('\\').pop() || filePath;
  return `${API_BASE_URL}/uploads/${fileName}`;
}

// =============================================
// Trailer Type Admin API Functions
// =============================================

/**
 * Fetch all trailer types (admin view - includes inactive)
 */
export async function fetchTrailerTypes(
  token: string
): Promise<TrailerTypesResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/trailer-types`,
    {
      headers: getAuthHeaders(token),
    }
  );

  return handleResponse<TrailerTypesResponse>(response);
}

/**
 * Fetch a single trailer type by ID
 */
export async function fetchTrailerTypeById(
  token: string,
  id: string
): Promise<TrailerType> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/trailer-types/${id}`,
    {
      headers: getAuthHeaders(token),
    }
  );

  return handleResponse<TrailerType>(response);
}

/**
 * Create a new trailer type
 */
export async function createTrailerType(
  token: string,
  data: CreateTrailerTypeData
): Promise<TrailerType> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/trailer-types`,
    {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }
  );

  return handleResponse<TrailerType>(response);
}

/**
 * Update a trailer type
 */
export async function updateTrailerType(
  token: string,
  id: string,
  data: UpdateTrailerTypeData
): Promise<TrailerType> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/trailer-types/${id}`,
    {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }
  );

  return handleResponse<TrailerType>(response);
}

/**
 * Delete a trailer type
 */
export async function deleteTrailerType(
  token: string,
  id: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/trailer-types/${id}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    }
  );

  return handleResponse(response);
}

