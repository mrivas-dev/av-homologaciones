import { bcrypt, createJWT, verifyJWT } from "../deps.ts";
import type { Payload } from "../deps.ts";
import { UserRepository } from "../repositories/userRepository.ts";
import type { User } from "../types/user.types.ts";
import type {
    JWTPayload,
    LoginRequest,
    LoginResponse,
} from "../types/auth.types.ts";

const JWT_SECRET = Deno.env.get("JWT_SECRET") || "dev-secret-key";
const JWT_EXPIRATION = Deno.env.get("JWT_EXPIRATION") || "24h";

// Convert expiration string to seconds
function parseExpiration(exp: string): number {
    const match = exp.match(/^(\d+)([hdm])$/);
    if (!match) return 24 * 60 * 60; // Default 24 hours

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
        case "h":
            return value * 60 * 60;
        case "d":
            return value * 24 * 60 * 60;
        case "m":
            return value * 60;
        default:
            return 24 * 60 * 60;
    }
}

export class AuthService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    /**
     * Hash a password using bcrypt
     */
    async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password);
    }

    /**
     * Verify a password against a hash
     */
    async verifyPassword(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }

    /**
     * Generate a JWT token for a user
     */
    async generateToken(user: User): Promise<string> {
        const payload: JWTPayload & Payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            exp: Math.floor(Date.now() / 1000) +
                parseExpiration(JWT_EXPIRATION),
        };

        const key = await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(JWT_SECRET),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign", "verify"],
        );

        return await createJWT({ alg: "HS256", typ: "JWT" }, payload, key);
    }

    /**
     * Verify and decode a JWT token
     */
    async verifyToken(token: string): Promise<JWTPayload | null> {
        try {
            const key = await crypto.subtle.importKey(
                "raw",
                new TextEncoder().encode(JWT_SECRET),
                { name: "HMAC", hash: "SHA-256" },
                false,
                ["sign", "verify"],
            );

            const payload = await verifyJWT(token, key);

            return {
                userId: payload.userId as string,
                email: payload.email as string,
                role: payload.role as string,
                exp: payload.exp as number,
            };
        } catch (error) {
            console.error("Token verification failed:", error);
            return null;
        }
    }

    /**
     * Authenticate a user with email and password
     */
    async login(credentials: LoginRequest): Promise<LoginResponse | null> {
        // Find user by email
        const user = await this.userRepository.findByEmail(
            credentials.email,
        );

        if (!user) {
            return null;
        }

        const isValidPassword = await this.verifyPassword(
            credentials.password,
            user.passwordHash,
        );

        if (!isValidPassword) {
            return null;
        }

        // Update last login timestamp
        await this.userRepository.updateLastLogin(user.id);

        const token = await this.generateToken(user);

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
            },
        };
    }

    /**
     * Get user by ID (for token validation)
     */
    async getUserById(userId: string): Promise<User | null> {
        return await this.userRepository.findById(userId);
    }
}
