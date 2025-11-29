import type { Context } from "../deps.ts";
import { HomologationRepository } from "../repositories/homologationRepository.ts";
import { HomologationService } from "../services/homologationService.ts";
import { HomologationStatus } from "../types/homologation.types.ts";
import type { AuthContext } from "../types/auth.types.ts";
import { z } from "../deps.ts";

const homologationRepository = new HomologationRepository();
const homologationService = new HomologationService();

const ApproveRejectSchema = z.object({
    reason: z.string().optional(),
});

export class AdminController {
    /**
     * GET /api/admin/homologations
     * List all homologations with admin view (admin only)
     */
    async listAll(ctx: Context) {
        try {
            const params = ctx.request.url.searchParams;
            const status = params.get("status") || undefined;

            const homologations = await homologationRepository.findAll({
                status,
            });

            ctx.response.status = 200;
            ctx.response.body = {
                data: homologations,
                total: homologations.length,
            };
        } catch (error) {
            console.error("List all homologations error:", error);
            ctx.response.status = 500;
            ctx.response.body = { error: "Internal server error" };
        }
    }

    /**
     * POST /api/admin/homologations/:id/approve
     * Approve a homologation (admin only)
     */
    async approve(ctx: Context) {
        try {
            const id = ctx.params.id;

            if (!id) {
                ctx.response.status = 400;
                ctx.response.body = { error: "Homologation ID is required" };
                return;
            }

            const body = await ctx.request.body.json();
            const validationResult = ApproveRejectSchema.safeParse(body);

            if (!validationResult.success) {
                ctx.response.status = 400;
                ctx.response.body = {
                    error: "Invalid request",
                    details: validationResult.error.errors,
                };
                return;
            }

            const auth = ctx.state.auth as AuthContext;

            // Use HomologationService for approval with validation
            const result = await homologationService.approve(
                id,
                auth.user.id,
                validationResult.data.reason,
            );

            if (!result.success) {
                const statusCode = result.code === "NOT_FOUND" ? 404 : 400;
                ctx.response.status = statusCode;
                ctx.response.body = {
                    error: result.error,
                    code: result.code,
                };
                return;
            }

            ctx.response.status = 200;
            ctx.response.body = result.homologation;
        } catch (error) {
            console.error("Approve homologation error:", error);
            ctx.response.status = 500;
            ctx.response.body = { error: "Internal server error" };
        }
    }

    /**
     * POST /api/admin/homologations/:id/reject
     * Reject a homologation (admin only)
     */
    async reject(ctx: Context) {
        try {
            const id = ctx.params.id;

            if (!id) {
                ctx.response.status = 400;
                ctx.response.body = { error: "Homologation ID is required" };
                return;
            }

            const body = await ctx.request.body.json();
            const validationResult = ApproveRejectSchema.safeParse(body);

            if (!validationResult.success) {
                ctx.response.status = 400;
                ctx.response.body = {
                    error: "Invalid request",
                    details: validationResult.error.errors,
                };
                return;
            }

            const auth = ctx.state.auth as AuthContext;

            // Use HomologationService for rejection with validation
            const result = await homologationService.reject(
                id,
                auth.user.id,
                validationResult.data.reason,
            );

            if (!result.success) {
                const statusCode = result.code === "NOT_FOUND" ? 404 : 400;
                ctx.response.status = statusCode;
                ctx.response.body = {
                    error: result.error,
                    code: result.code,
                };
                return;
            }

            ctx.response.status = 200;
            ctx.response.body = result.homologation;
        } catch (error) {
            console.error("Reject homologation error:", error);
            ctx.response.status = 500;
            ctx.response.body = { error: "Internal server error" };
        }
    }

    /**
     * POST /api/admin/homologations/:id/incomplete
     * Mark a homologation as incomplete (admin only)
     */
    async markIncomplete(ctx: Context) {
        try {
            const id = ctx.params.id;

            if (!id) {
                ctx.response.status = 400;
                ctx.response.body = { error: "Homologation ID is required" };
                return;
            }

            const body = await ctx.request.body.json();
            const validationResult = ApproveRejectSchema.safeParse(body);

            if (!validationResult.success) {
                ctx.response.status = 400;
                ctx.response.body = {
                    error: "Invalid request",
                    details: validationResult.error.errors,
                };
                return;
            }

            const auth = ctx.state.auth as AuthContext;

            const result = await homologationService.markIncomplete(
                id,
                auth.user.id,
                validationResult.data.reason,
            );

            if (!result.success) {
                const statusCode = result.code === "NOT_FOUND" ? 404 : 400;
                ctx.response.status = statusCode;
                ctx.response.body = {
                    error: result.error,
                    code: result.code,
                };
                return;
            }

            ctx.response.status = 200;
            ctx.response.body = result.homologation;
        } catch (error) {
            console.error("Mark incomplete error:", error);
            ctx.response.status = 500;
            ctx.response.body = { error: "Internal server error" };
        }
    }

    /**
     * POST /api/admin/homologations/:id/complete
     * Mark a homologation as completed (admin only)
     */
    async complete(ctx: Context) {
        try {
            const id = ctx.params.id;

            if (!id) {
                ctx.response.status = 400;
                ctx.response.body = { error: "Homologation ID is required" };
                return;
            }

            const body = await ctx.request.body.json();
            const validationResult = ApproveRejectSchema.safeParse(body);

            if (!validationResult.success) {
                ctx.response.status = 400;
                ctx.response.body = {
                    error: "Invalid request",
                    details: validationResult.error.errors,
                };
                return;
            }

            const auth = ctx.state.auth as AuthContext;

            const result = await homologationService.complete(
                id,
                auth.user.id,
                validationResult.data.reason,
            );

            if (!result.success) {
                const statusCode = result.code === "NOT_FOUND" ? 404 : 400;
                ctx.response.status = statusCode;
                ctx.response.body = {
                    error: result.error,
                    code: result.code,
                };
                return;
            }

            ctx.response.status = 200;
            ctx.response.body = result.homologation;
        } catch (error) {
            console.error("Complete homologation error:", error);
            ctx.response.status = 500;
            ctx.response.body = { error: "Internal server error" };
        }
    }
}
