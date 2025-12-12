import { getClient } from "../config/db.ts";
import {
  TrailerType,
  TrailerTypeRow,
  CreateTrailerTypeData,
  UpdateTrailerTypeData,
  PublicTrailerType,
  ReferencePhoto,
} from "../types/trailerType.types.ts";

/**
 * Generate a URL-friendly slug from a name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Parse reference_photos from database (handles both string and array)
 */
function parseReferencePhotos(value: string | ReferencePhoto[] | null): ReferencePhoto[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

/**
 * Map database row to TrailerType object
 */
function mapRowToTrailerType(row: TrailerTypeRow): TrailerType {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    price: row.price,
    referencePhotos: parseReferencePhotos(row.reference_photos),
    isActive: Boolean(row.is_active),
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
  };
}

/**
 * Map TrailerType to PublicTrailerType (excludes audit fields)
 */
function mapToPublicTrailerType(trailerType: TrailerType): PublicTrailerType {
  return {
    id: trailerType.id,
    name: trailerType.name,
    slug: trailerType.slug,
    price: trailerType.price,
    referencePhotos: trailerType.referencePhotos,
  };
}

export class TrailerTypeRepository {
  /**
   * Create a new trailer type
   */
  async create(data: CreateTrailerTypeData, userId: string): Promise<TrailerType> {
    const client = await getClient();
    const id = crypto.randomUUID();
    const now = new Date();
    const slug = data.slug || generateSlug(data.name);

    await client.execute(
      `INSERT INTO trailer_types (
        id, name, slug, price, reference_photos, is_active, sort_order,
        created_at, updated_at, created_by, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.name,
        slug,
        data.price,
        JSON.stringify(data.referencePhotos || []),
        data.isActive !== false,
        data.sortOrder || 0,
        now,
        now,
        userId,
        userId,
      ]
    );

    return {
      id,
      name: data.name,
      slug,
      price: data.price,
      referencePhotos: data.referencePhotos || [],
      isActive: data.isActive !== false,
      sortOrder: data.sortOrder || 0,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      updatedBy: userId,
    };
  }

  /**
   * Find a trailer type by ID
   */
  async findById(id: string): Promise<TrailerType | null> {
    const client = await getClient();
    const result = await client.query(
      `SELECT * FROM trailer_types WHERE id = ?`,
      [id]
    );

    if (result.length === 0) {
      return null;
    }

    return mapRowToTrailerType(result[0] as TrailerTypeRow);
  }

  /**
   * Find a trailer type by name
   */
  async findByName(name: string): Promise<TrailerType | null> {
    const client = await getClient();
    const result = await client.query(
      `SELECT * FROM trailer_types WHERE name = ?`,
      [name]
    );

    if (result.length === 0) {
      return null;
    }

    return mapRowToTrailerType(result[0] as TrailerTypeRow);
  }

  /**
   * Find a trailer type by slug
   */
  async findBySlug(slug: string): Promise<TrailerType | null> {
    const client = await getClient();
    const result = await client.query(
      `SELECT * FROM trailer_types WHERE slug = ?`,
      [slug]
    );

    if (result.length === 0) {
      return null;
    }

    return mapRowToTrailerType(result[0] as TrailerTypeRow);
  }

  /**
   * Get all trailer types (admin view - includes inactive)
   */
  async findAll(): Promise<TrailerType[]> {
    const client = await getClient();
    const result = await client.query(
      `SELECT * FROM trailer_types ORDER BY sort_order ASC, name ASC`
    );

    return result.map((row: unknown) => mapRowToTrailerType(row as TrailerTypeRow));
  }

  /**
   * Get active trailer types (public view - for forms)
   */
  async findActive(): Promise<PublicTrailerType[]> {
    const client = await getClient();
    const result = await client.query(
      `SELECT * FROM trailer_types WHERE is_active = true ORDER BY sort_order ASC, name ASC`
    );

    return result
      .map((row: unknown) => mapRowToTrailerType(row as TrailerTypeRow))
      .map(mapToPublicTrailerType);
  }

  /**
   * Update a trailer type
   */
  async update(id: string, data: UpdateTrailerTypeData, userId: string): Promise<TrailerType | null> {
    const client = await getClient();
    const existing = await this.findById(id);

    if (!existing) {
      return null;
    }

    const updates: string[] = [];
    const values: unknown[] = [];

    if (data.name !== undefined) {
      updates.push("name = ?");
      values.push(data.name);
    }

    if (data.slug !== undefined) {
      updates.push("slug = ?");
      values.push(data.slug);
    } else if (data.name !== undefined) {
      // Auto-update slug if name changes
      updates.push("slug = ?");
      values.push(generateSlug(data.name));
    }

    if (data.price !== undefined) {
      updates.push("price = ?");
      values.push(data.price);
    }

    if (data.referencePhotos !== undefined) {
      updates.push("reference_photos = ?");
      values.push(JSON.stringify(data.referencePhotos));
    }

    if (data.isActive !== undefined) {
      updates.push("is_active = ?");
      values.push(data.isActive);
    }

    if (data.sortOrder !== undefined) {
      updates.push("sort_order = ?");
      values.push(data.sortOrder);
    }

    if (updates.length === 0) {
      return existing;
    }

    updates.push("updated_at = ?");
    values.push(new Date());

    updates.push("updated_by = ?");
    values.push(userId);

    values.push(id);

    await client.execute(
      `UPDATE trailer_types SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  /**
   * Delete a trailer type
   */
  async delete(id: string): Promise<boolean> {
    const client = await getClient();
    const result = await client.execute(
      `DELETE FROM trailer_types WHERE id = ?`,
      [id]
    );

    return result.affectedRows !== undefined && result.affectedRows > 0;
  }

  /**
   * Check if a trailer type name already exists (for validation)
   */
  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const client = await getClient();
    let query = `SELECT COUNT(*) as count FROM trailer_types WHERE name = ?`;
    const params: unknown[] = [name];

    if (excludeId) {
      query += ` AND id != ?`;
      params.push(excludeId);
    }

    const result = await client.query(query, params);
    return result[0].count > 0;
  }

  /**
   * Check if a trailer type slug already exists (for validation)
   */
  async existsBySlug(slug: string, excludeId?: string): Promise<boolean> {
    const client = await getClient();
    let query = `SELECT COUNT(*) as count FROM trailer_types WHERE slug = ?`;
    const params: unknown[] = [slug];

    if (excludeId) {
      query += ` AND id != ?`;
      params.push(excludeId);
    }

    const result = await client.query(query, params);
    return result[0].count > 0;
  }
}

// Export singleton instance
export const trailerTypeRepository = new TrailerTypeRepository();

