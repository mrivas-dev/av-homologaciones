import type { Context } from "../deps.ts";
import { AuthService } from "../services/authService.ts";
import { UserRepository } from "../repositories/userRepository.ts";
import {
    LoginRequestSchema,
    RegisterRequestSchema,
} from "../types/auth.types.ts";
import type { AuthContext } from "../types/auth.types.ts";
import { UserRole } from "../types/user.types.ts";

const authService = new AuthService();
const userRepository = new UserRepository();

export class AuthController {
    /**
     * POST /api/auth/login
     * Authenticate user and return JWT token
     */
    async login(ctx: Context) {
        try {
            const body = await ctx.request.body.json();

            // Validate request body
            const validationResult = LoginRequestSchema.safeParse(body);
            if (!validationResult.success) {
                ctx.response.status = 400;
                ctx.response.body = {
                    error: "Invalid request",
                    details: validationResult.error.errors,
                };
                return;
            }

            const credentials = validationResult.data;

            // Attempt login
            const result = await authService.login(credentials);

            if (!result) {
                ctx.response.status = 401;
                ctx.response.body = { error: "Invalid email or password" };
                return;
            }

            ctx.response.status = 200;
            ctx.response.body = result;
        } catch (error) {
            console.error("Login error:", error);
            ctx.response.status = 500;
            ctx.response.body = { error: "Internal server error" };
        }
    }

    /**
     * POST /api/auth/register
     * Register a new user (admin only)
     */
    async register(ctx: Context) {
        try {
            const body = await ctx.request.body.json();

            // Validate request body
            const validationResult = RegisterRequestSchema.safeParse(body);
            if (!validationResult.success) {
                ctx.response.status = 400;
                ctx.response.body = {
                    error: "Invalid request",
                    details: validationResult.error.errors,
                };
                return;
            }

            const userData = validationResult.data;

            // Check if user already exists
            const existingUser = await userRepository.findByEmail(
                userData.email,
            );
            if (existingUser) {
                ctx.response.status = 409;
                ctx.response.body = {
                    error: "User with this email already exists",
                };
                return;
            }

            // Hash password
            const passwordHash = await authService.hashPassword(
                userData.password,
            );

            // Create user
            const user = await userRepository.create({
                email: userData.email,
                passwordHash,
                fullName: userData.fullName,
                role: userData.role || UserRole.USER,
            });

            ctx.response.status = 201;
            ctx.response.body = {
                message: "User created successfully",
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                },
            };
        } catch (error) {
            console.error("Registration error:", error);
            ctx.response.status = 500;
            ctx.response.body = { error: "Internal server error" };
        }
    }

    /**
     * GET /api/auth/me
     * Get current authenticated user
     */
    async getCurrentUser(ctx: Context) {
        try {
            const auth = ctx.state.auth as AuthContext;

            // Get full user details
            const user = await userRepository.findById(auth.user.id);

            if (!user) {
                ctx.response.status = 404;
                ctx.response.body = { error: "User not found" };
                return;
            }

            ctx.response.status = 200;
            ctx.response.body = {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                createdAt: user.createdAt,
                lastLoginAt: user.lastLoginAt,
            };
        } catch (error) {
            console.error("Get current user error:", error);
            ctx.response.status = 500;
            ctx.response.body = { error: "Internal server error" };
        }
    }

    /**
     * POST /api/auth/logout
     * Logout (client-side token removal, this is just a placeholder)
     */
    async logout(ctx: Context) {
        ctx.response.status = 200;
        ctx.response.body = { message: "Logged out successfully" };
    }
}
