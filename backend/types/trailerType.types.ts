/**
 * Trailer Type Types
 * Defines interfaces for trailer types with prices and reference photos
 */

/**
 * Reference photo configuration for a trailer type
 */
export interface ReferencePhoto {
  label: string;
  path: string;
}

/**
 * Trailer type as stored in the database
 */
export interface TrailerType {
  id: string;
  name: string;
  slug: string;
  price: number; // Price in cents
  referencePhotos: ReferencePhoto[];
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

/**
 * Data required to create a new trailer type
 */
export interface CreateTrailerTypeData {
  name: string;
  slug?: string; // Auto-generated from name if not provided
  price: number;
  referencePhotos?: ReferencePhoto[];
  isActive?: boolean;
  sortOrder?: number;
}

/**
 * Data for updating an existing trailer type
 */
export interface UpdateTrailerTypeData {
  name?: string;
  slug?: string;
  price?: number;
  referencePhotos?: ReferencePhoto[];
  isActive?: boolean;
  sortOrder?: number;
}

/**
 * Public trailer type data (for forms, excludes audit fields)
 */
export interface PublicTrailerType {
  id: string;
  name: string;
  slug: string;
  price: number;
  referencePhotos: ReferencePhoto[];
}

/**
 * Database row representation (snake_case)
 */
export interface TrailerTypeRow {
  id: string;
  name: string;
  slug: string;
  price: number;
  reference_photos: string | ReferencePhoto[]; // JSON string or parsed array
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
}

