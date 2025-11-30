import { z } from "../deps.ts";

// Login request schema - requires email
export const LoginRequestSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// Login response
export interface LoginResponse {
    token: string;
    user: {
        id: string;
        email: string;
        fullName: string;
        role: string;
    };
}

// Register request schema
export const RegisterRequestSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    fullName: z.string().min(1),
    role: z.enum(["Admin", "Inspector", "User"]).optional(),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

// JWT Payload
export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    exp?: number;
}

// Auth context (attached to request state)
export interface AuthContext {
    user: {
        id: string;
        email: string;
        role: string;
    };
}
