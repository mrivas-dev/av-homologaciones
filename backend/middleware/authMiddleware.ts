import type { Context, Middleware } from "../deps.ts";
import { AuthService } from "../services/authService.ts";
import type { AuthContext } from "../types/auth.types.ts";

const authService = new AuthService();

/**
 * Middleware to require authentication
 * Validates JWT token and attaches user to context state
 */
export const requireAuth: Middleware = async (ctx: Context, next) => {
    const authHeader = ctx.request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        ctx.response.status = 401;
        ctx.response.body = { error: "Unauthorized: No token provided" };
        return;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    const payload = await authService.verifyToken(token);

    if (!payload) {
        ctx.response.status = 401;
        ctx.response.body = { error: "Unauthorized: Invalid token" };
        return;
    }

    // Verify user still exists and is not deleted
    const user = await authService.getUserById(payload.userId);

    if (!user) {
        ctx.response.status = 401;
        ctx.response.body = { error: "Unauthorized: User not found" };
        return;
    }

    // Attach user to context state
    ctx.state.auth = {
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
        },
    } as AuthContext;

    await next();
};

/**
 * Middleware to require admin role
 * Must be used after requireAuth
 */
export const requireAdmin: Middleware = async (ctx: Context, next) => {
    const auth = ctx.state.auth as AuthContext | undefined;

    if (!auth) {
        ctx.response.status = 403;
        ctx.response.body = { error: "Forbidden: Authentication required" };
        return;
    }

    // Normalize role: trim whitespace and convert to lowercase
    const userRole = auth.user.role?.trim().toLowerCase();
    const isAdmin = userRole === "admin";

    if (!isAdmin) {
        console.error(
            `Admin access denied for user ${auth.user.email}. Role: "${auth.user.role}" (normalized: "${userRole}")`,
        );
        ctx.response.status = 403;
        ctx.response.body = {
            error: "Forbidden: Admin access required",
            role: auth.user.role, // Include role in response for debugging
        };
        return;
    }

    await next();
};

/**
 * Optional authentication middleware
 * Attaches user to context if token is valid, but doesn't require it
 */
export const optionalAuth: Middleware = async (ctx: Context, next) => {
    const authHeader = ctx.request.headers.get("Authorization");

    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        const payload = await authService.verifyToken(token);

        if (payload) {
            const user = await authService.getUserById(payload.userId);
            if (user) {
                ctx.state.auth = {
                    user: {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                    },
                } as AuthContext;
            }
        }
    }

    await next();
};
