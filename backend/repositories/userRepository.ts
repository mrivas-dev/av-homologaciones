import { getClient } from "../config/db.ts";
import { CreateUserRequest, User, UserRole } from "../types/user.types.ts";

export class UserRepository {
    async create(user: CreateUserRequest): Promise<User> {
        const client = await getClient();
        const id = crypto.randomUUID();
        const now = new Date();

        await client.execute(
            `INSERT INTO users (
        id, email, password_hash, full_name, role, created_at, updated_at, is_deleted
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                user.email,
                user.passwordHash,
                user.fullName,
                user.role || UserRole.USER,
                now,
                now,
                false,
            ],
        );

        return {
            id,
            ...user,
            role: user.role || UserRole.USER,
            createdAt: now,
            updatedAt: now,
            isDeleted: false,
            deletedAt: null,
            lastLoginAt: null,
        };
    }

    async findByEmail(email: string): Promise<User | null> {
        const client = await getClient();
        const result = await client.query(
            `SELECT * FROM users WHERE email = ? AND is_deleted = false`,
            [email],
        );

        if (result.length === 0) {
            return null;
        }

        const row = result[0];
        return this.mapRowToUser(row);
    }

    async findById(id: string): Promise<User | null> {
        const client = await getClient();
        const result = await client.query(
            `SELECT * FROM users WHERE id = ? AND is_deleted = false`,
            [id],
        );

        if (result.length === 0) {
            return null;
        }

        const row = result[0];
        return this.mapRowToUser(row);
    }

    async updateLastLogin(userId: string): Promise<void> {
        const client = await getClient();
        const now = new Date();

        await client.execute(
            `UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?`,
            [now, now, userId],
        );
    }

    async findAll(): Promise<User[]> {
        const client = await getClient();
        const result = await client.query(
            `SELECT * FROM users WHERE is_deleted = false ORDER BY created_at DESC`,
        );

        return result.map((row: any) => this.mapRowToUser(row));
    }

    private mapRowToUser(row: any): User {
        return {
            id: row.id,
            email: row.email,
            passwordHash: row.password_hash,
            fullName: row.full_name,
            role: row.role as any,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            isDeleted: Boolean(row.is_deleted),
            deletedAt: row.deleted_at,
            lastLoginAt: row.last_login_at,
        };
    }
}
