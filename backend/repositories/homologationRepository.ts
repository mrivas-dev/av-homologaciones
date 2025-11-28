import { getClient } from "../config/db.ts";
import {
    CreateHomologationRequest,
    Homologation,
    HomologationStatus,
    TrailerType,
} from "../types/homologation.types.ts";

export class HomologationRepository {
    async create(
        data: CreateHomologationRequest,
        userId: string,
    ): Promise<Homologation> {
        const client = await getClient();
        const id = crypto.randomUUID();
        const now = new Date();

        await client.execute(
            `INSERT INTO homologations (
        id, created_by, updated_by, created_at, updated_at,
        trailer_type, trailer_dimensions, trailer_number_of_axles, trailer_license_plate_number,
        owner_full_name, owner_national_id, owner_phone, owner_email,
        status, version, is_deleted
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                userId,
                userId,
                now,
                now,
                data.trailerType || null,
                data.trailerDimensions || null,
                data.trailerNumberOfAxles || null,
                data.trailerLicensePlateNumber || null,
                data.ownerFullName,
                data.ownerNationalId,
                data.ownerPhone,
                data.ownerEmail,
                data.status || HomologationStatus.DRAFT,
                1, // version
                false, // is_deleted
            ],
        );

        // TODO: Handle photos insertion here or in a service layer

        return {
            id,
            ...data,
            createdBy: userId,
            updatedBy: userId,
            createdAt: now,
            updatedAt: now,
            isDeleted: false,
            deletedAt: null,
            deletedBy: null,
            version: 1,
            status: data.status || HomologationStatus.DRAFT,
            photos: [], // Placeholder
        } as Homologation;
    }

    async findById(id: string): Promise<Homologation | null> {
        const client = await getClient();
        const result = await client.query(
            `SELECT * FROM homologations WHERE id = ? AND is_deleted = false`,
            [id],
        );

        if (result.length === 0) {
            return null;
        }

        return this.mapRowToHomologation(result[0]);
    }

    async findAll(
        filters?: { status?: string; userId?: string },
    ): Promise<Homologation[]> {
        const client = await getClient();
        let query = `SELECT * FROM homologations WHERE is_deleted = false`;
        const params: any[] = [];

        if (filters?.status) {
            query += ` AND status = ?`;
            params.push(filters.status);
        }

        if (filters?.userId) {
            query += ` AND created_by = ?`;
            params.push(filters.userId);
        }

        query += ` ORDER BY created_at DESC`;

        const result = await client.query(query, params);
        return result.map((row: any) => this.mapRowToHomologation(row));
    }

    async update(
        id: string,
        data: Partial<CreateHomologationRequest>,
        userId: string,
    ): Promise<Homologation | null> {
        const client = await getClient();
        const now = new Date();

        // Build dynamic update query
        const updates: string[] = [];
        const params: any[] = [];

        if (data.trailerType !== undefined) {
            updates.push("trailer_type = ?");
            params.push(data.trailerType);
        }
        if (data.trailerDimensions !== undefined) {
            updates.push("trailer_dimensions = ?");
            params.push(data.trailerDimensions);
        }
        if (data.trailerNumberOfAxles !== undefined) {
            updates.push("trailer_number_of_axles = ?");
            params.push(data.trailerNumberOfAxles);
        }
        if (data.trailerLicensePlateNumber !== undefined) {
            updates.push("trailer_license_plate_number = ?");
            params.push(data.trailerLicensePlateNumber);
        }
        if (data.ownerFullName !== undefined) {
            updates.push("owner_full_name = ?");
            params.push(data.ownerFullName);
        }
        if (data.ownerNationalId !== undefined) {
            updates.push("owner_national_id = ?");
            params.push(data.ownerNationalId);
        }
        if (data.ownerPhone !== undefined) {
            updates.push("owner_phone = ?");
            params.push(data.ownerPhone);
        }
        if (data.ownerEmail !== undefined) {
            updates.push("owner_email = ?");
            params.push(data.ownerEmail);
        }

        if (updates.length === 0) {
            // No updates to make
            return this.findById(id);
        }

        updates.push(
            "updated_by = ?",
            "updated_at = ?",
            "version = version + 1",
        );
        params.push(userId, now, id);

        const query = `UPDATE homologations SET ${
            updates.join(", ")
        } WHERE id = ? AND is_deleted = false`;

        await client.execute(query, params);

        return this.findById(id);
    }

    async updateStatus(
        id: string,
        status: typeof HomologationStatus[keyof typeof HomologationStatus],
        userId: string,
    ): Promise<Homologation | null> {
        const client = await getClient();
        const now = new Date();

        await client.execute(
            `UPDATE homologations SET status = ?, updated_by = ?, updated_at = ?, version = version + 1 
             WHERE id = ? AND is_deleted = false`,
            [status, userId, now, id],
        );

        return this.findById(id);
    }

    async softDelete(id: string, userId: string): Promise<boolean> {
        const client = await getClient();
        const now = new Date();

        const result = await client.execute(
            `UPDATE homologations SET is_deleted = true, deleted_at = ?, deleted_by = ?, updated_at = ? 
             WHERE id = ? AND is_deleted = false`,
            [now, userId, now, id],
        );

        return result.affectedRows !== undefined && result.affectedRows > 0;
    }

    private mapRowToHomologation(row: any): Homologation {
        return {
            id: row.id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            createdBy: row.created_by,
            updatedBy: row.updated_by,
            isDeleted: Boolean(row.is_deleted),
            deletedAt: row.deleted_at,
            deletedBy: row.deleted_by,

            trailerType: row.trailer_type as any,
            trailerDimensions: row.trailer_dimensions,
            trailerNumberOfAxles: row.trailer_number_of_axles,
            trailerLicensePlateNumber: row.trailer_license_plate_number,

            ownerFullName: row.owner_full_name,
            ownerNationalId: row.owner_national_id,
            ownerPhone: row.owner_phone,
            ownerEmail: row.owner_email,

            status: row.status as any,
            version: row.version,
            photos: [], // Photos would typically be fetched separately or joined
        };
    }
}
