import { getClient } from "../config/db.ts";
import type { AuditLog } from "../types/homologation.types.ts";

export interface CreateAuditLogRequest {
    entityType: string;
    entityId: string;
    action: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    createdBy: string;
}

export class AuditLogRepository {
    async create(data: CreateAuditLogRequest): Promise<AuditLog> {
        const client = await getClient();
        const id = crypto.randomUUID();
        const now = new Date();

        await client.execute(
            `INSERT INTO audit_logs (
        id, entity_type, entity_id, action, old_values, new_values,
        created_by, created_at, is_deleted
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                data.entityType,
                data.entityId,
                data.action,
                data.oldValues ? JSON.stringify(data.oldValues) : null,
                data.newValues ? JSON.stringify(data.newValues) : null,
                data.createdBy,
                now,
                false,
            ],
        );

        return {
            id,
            entityType: data.entityType,
            entityId: data.entityId,
            action: data.action,
            oldValues: data.oldValues,
            newValues: data.newValues,
            createdBy: data.createdBy,
            createdAt: now,
            isDeleted: false,
            deletedAt: null,
            deletedBy: null,
        };
    }

    async findByEntity(
        entityType: string,
        entityId: string,
    ): Promise<AuditLog[]> {
        const client = await getClient();
        const result = await client.query(
            `SELECT * FROM audit_logs WHERE entity_type = ? AND entity_id = ? AND is_deleted = false ORDER BY created_at DESC`,
            [entityType, entityId],
        );

        return result.map((row: any) => this.mapRowToAuditLog(row));
    }

    private mapRowToAuditLog(row: any): AuditLog {
        return {
            id: row.id,
            entityType: row.entity_type,
            entityId: row.entity_id,
            action: row.action,
            oldValues: row.old_values ? JSON.parse(row.old_values) : undefined,
            newValues: row.new_values ? JSON.parse(row.new_values) : undefined,
            createdBy: row.created_by,
            createdAt: row.created_at,
            isDeleted: Boolean(row.is_deleted),
            deletedAt: row.deleted_at,
            deletedBy: row.deleted_by,
        };
    }
}
