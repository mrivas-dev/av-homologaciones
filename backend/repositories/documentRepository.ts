import { getClient } from "../config/db.ts";
import type { AdminDocument, CreateAdminDocumentRequest, AdminDocumentTypeValue } from "../types/document.types.ts";

export class DocumentRepository {
  async create(data: CreateAdminDocumentRequest): Promise<AdminDocument> {
    const client = await getClient();
    const id = crypto.randomUUID();
    const now = new Date();

    await client.execute(
      `INSERT INTO admin_documents (
        id, homologation_id, document_type, file_name, file_path, file_size, 
        mime_type, description, created_by, created_at, is_deleted
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.homologationId,
        data.documentType,
        data.fileName,
        data.filePath,
        data.fileSize,
        data.mimeType,
        data.description || null,
        data.createdBy,
        now,
        false,
      ],
    );

    return {
      id,
      homologationId: data.homologationId,
      documentType: data.documentType,
      fileName: data.fileName,
      filePath: data.filePath,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      description: data.description || null,
      createdBy: data.createdBy,
      createdAt: now,
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
    };
  }

  async findByHomologationId(homologationId: string): Promise<AdminDocument[]> {
    const client = await getClient();
    const result = await client.query(
      `SELECT * FROM admin_documents WHERE homologation_id = ? AND is_deleted = false ORDER BY created_at ASC`,
      [homologationId],
    );

    return result.map((row: any) => this.mapRowToDocument(row));
  }

  async findByHomologationIdAndType(
    homologationId: string,
    documentType: AdminDocumentTypeValue
  ): Promise<AdminDocument[]> {
    const client = await getClient();
    const result = await client.query(
      `SELECT * FROM admin_documents 
       WHERE homologation_id = ? AND document_type = ? AND is_deleted = false 
       ORDER BY created_at ASC`,
      [homologationId, documentType],
    );

    return result.map((row: any) => this.mapRowToDocument(row));
  }

  async findById(id: string): Promise<AdminDocument | null> {
    const client = await getClient();
    const result = await client.query(
      `SELECT * FROM admin_documents WHERE id = ? AND is_deleted = false`,
      [id],
    );

    if (result.length === 0) {
      return null;
    }

    return this.mapRowToDocument(result[0]);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const client = await getClient();
    const now = new Date();

    const result = await client.execute(
      `UPDATE admin_documents SET is_deleted = true, deleted_at = ?, deleted_by = ? 
       WHERE id = ? AND is_deleted = false`,
      [now, userId, id],
    );

    return result.affectedRows !== undefined && result.affectedRows > 0;
  }

  private mapRowToDocument(row: any): AdminDocument {
    return {
      id: row.id,
      homologationId: row.homologation_id,
      documentType: row.document_type,
      fileName: row.file_name,
      filePath: row.file_path,
      fileSize: row.file_size,
      mimeType: row.mime_type,
      description: row.description,
      createdBy: row.created_by,
      createdAt: row.created_at,
      isDeleted: Boolean(row.is_deleted),
      deletedAt: row.deleted_at,
      deletedBy: row.deleted_by,
    };
  }
}

