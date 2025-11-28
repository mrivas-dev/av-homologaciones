import { getClient } from "../config/db.ts";
import type { Photo } from "../types/homologation.types.ts";

export interface CreatePhotoRequest {
    homologationId: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    isIdDocument: boolean;
    createdBy: string;
}

export class PhotoRepository {
    async create(data: CreatePhotoRequest): Promise<Photo> {
        const client = await getClient();
        const id = crypto.randomUUID();
        const now = new Date();

        await client.execute(
            `INSERT INTO photos (
        id, homologation_id, file_name, file_path, file_size, mime_type, 
        is_id_document, created_by, created_at, is_deleted
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                data.homologationId,
                data.fileName,
                data.filePath,
                data.fileSize,
                data.mimeType,
                data.isIdDocument,
                data.createdBy,
                now,
                false,
            ],
        );

        return {
            id,
            homologationId: data.homologationId,
            fileName: data.fileName,
            filePath: data.filePath,
            fileSize: data.fileSize,
            mimeType: data.mimeType,
            isIdDocument: data.isIdDocument,
            createdBy: data.createdBy,
            createdAt: now,
            isDeleted: false,
            deletedAt: null,
            deletedBy: null,
        };
    }

    async findByHomologationId(homologationId: string): Promise<Photo[]> {
        const client = await getClient();
        const result = await client.query(
            `SELECT * FROM photos WHERE homologation_id = ? AND is_deleted = false ORDER BY created_at ASC`,
            [homologationId],
        );

        return result.map((row: any) => this.mapRowToPhoto(row));
    }

    async findById(id: string): Promise<Photo | null> {
        const client = await getClient();
        const result = await client.query(
            `SELECT * FROM photos WHERE id = ? AND is_deleted = false`,
            [id],
        );

        if (result.length === 0) {
            return null;
        }

        return this.mapRowToPhoto(result[0]);
    }

    async delete(id: string, userId: string): Promise<boolean> {
        const client = await getClient();
        const now = new Date();

        const result = await client.execute(
            `UPDATE photos SET is_deleted = true, deleted_at = ?, deleted_by = ? 
       WHERE id = ? AND is_deleted = false`,
            [now, userId, id],
        );

        return result.affectedRows !== undefined && result.affectedRows > 0;
    }

    private mapRowToPhoto(row: any): Photo {
        return {
            id: row.id,
            homologationId: row.homologation_id,
            fileName: row.file_name,
            filePath: row.file_path,
            fileSize: row.file_size,
            mimeType: row.mime_type,
            isIdDocument: Boolean(row.is_id_document),
            createdBy: row.created_by,
            createdAt: row.created_at,
            isDeleted: Boolean(row.is_deleted),
            deletedAt: row.deleted_at,
            deletedBy: row.deleted_by,
        };
    }
}
