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

export interface HomologationListItem {
  id: string;
  ownerPhone: string | null;
  ownerNationalId: string | null;
  ownerFullName: string | null;
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
  version: number;
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

