import { z } from "zod";

// Base Schema (reused pattern from homologation.types.ts)
const BaseSchema = z.object({
    id: z.string().uuid(),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
    isDeleted: z.boolean().default(false),
    deletedAt: z.date().nullable().default(null),
});

export const UserRole = {
    ADMIN: "Admin",
    INSPECTOR: "Inspector",
    USER: "User",
} as const;

export const UserSchema = BaseSchema.extend({
    email: z.string().email(),
    passwordHash: z.string().min(1), // Hashed password
    fullName: z.string().min(1),
    role: z.nativeEnum(UserRole).default(UserRole.USER),
    lastLoginAt: z.date().nullable().default(null),
});

export type User = z.infer<typeof UserSchema>;

export type CreateUserRequest = Omit<
    User,
    "id" | "createdAt" | "updatedAt" | "isDeleted" | "deletedAt" | "lastLoginAt"
>;

export type UpdateUserRequest =
    & Partial<Omit<CreateUserRequest, "passwordHash">>
    & {
        password?: string; // Optional new password to hash
    };
