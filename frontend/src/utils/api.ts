const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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

