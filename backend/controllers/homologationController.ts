import type { Context } from "../deps.ts";
import { HomologationRepository } from "../repositories/homologationRepository.ts";
import {
    HomologationSchema,
    HomologationStatus,
    UpdateHomologationStatusRequest,
} from "../types/homologation.types.ts";
import type {
    CreateHomologationRequest,
    Homologation,
} from "../types/homologation.types.ts";
import type { AuthContext } from "../types/auth.types.ts";
import { z } from "../deps.ts";

const homologationRepository = new HomologationRepository();

// Validation schema for update (all fields optional)
const UpdateHomologationSchema = z.object({
    trailerType: z.enum(["Trailer", "Rolling Box", "Motorhome"]).optional(),
    trailerDimensions: z.string().optional(),
    trailerNumberOfAxles: z.number().int().positive().optional(),
    trailerLicensePlateNumber: z.string().optional(),
    ownerFullName: z.string().min(1).optional(),
    ownerNationalId: z.string().min(1).optional(),
    ownerPhone: z.string().regex(/^[0-9+() -]+$/).optional(),
    ownerEmail: z.string().email().optional(),
});

const UpdateStatusSchema = z.object({
    status: z.nativeEnum(HomologationStatus),
    reason: z.string().optional(),
});

export class HomologationController {
    /**
     * POST /api/homologations
     * Create a new homologation (public)
     */
    async create(ctx: Context) {
        try {
            const body = await ctx.request.body.json();

            // Validate request body
            const validationResult = HomologationSchema.partial({
                id: true,
                createdAt: true,
                updatedAt: true,
                createdBy: true,
                updatedBy: true,
                isDeleted: true,
                deletedAt: true,
                deletedBy: true,
                version: true,
                photos: true,
                status: true,
            }).safeParse(body);

            if (!validationResult.success) {
                ctx.response.status = 400;
                ctx.response.body = {
                    error: "Invalid request",
                    details: validationResult.error.errors,
                };
                return;
            }

            const data = validationResult.data as CreateHomologationRequest;

            // Use authenticated user ID if available, otherwise use a system ID
            const auth = ctx.state.auth as AuthContext | undefined;
            const userId = auth?.user.id ||
                "00000000-0000-0000-0000-000000000000"; // System user for public submissions

            const homologation = await homologationRepository.create(
                data,
                userId,
            );

            ctx.response.status = 201;
            ctx.response.body = homologation;
        } catch (error) {
            console.error("Create homologation error:", error);
            ctx.response.status = 500;
            ctx.response.body = { error: "Internal server error" };
        }
    }

    /**
     * GET /api/homologations
     * List homologations with filtering (public)
     */
    async list(ctx: Context) {
        try {
            const params = ctx.request.url.searchParams;
            const status = params.get("status") || undefined;
            const userId = params.get("userId") || undefined;

            const homologations = await homologationRepository.findAll({
                status,
                userId,
            });

            ctx.response.status = 200;
            ctx.response.body = {
                data: homologations,
                total: homologations.length,
            };
        } catch (error) {
            console.error("List homologations error:", error);
            ctx.response.status = 500;
            ctx.response.body = { error: "Internal server error" };
        }
    }

    /**
     * GET /api/homologations/:id
     * Get homologation details (public)
     */
    async getById(ctx: Context) {
        try {
            const id = ctx.params.id;

            if (!id) {
                ctx.response.status = 400;
                ctx.response.body = { error: "Homologation ID is required" };
                return;
            }

            const homologation = await homologationRepository.findById(id);

            if (!homologation) {
                ctx.response.status = 404;
                ctx.response.body = { error: "Homologation not found" };
                return;
            }

            ctx.response.status = 200;
            ctx.response.body = homologation;
        } catch (error) {
            console.error("Get homologation error:", error);
            ctx.response.status = 500;
            ctx.response.body = { error: "Internal server error" };
        }
    }

    /**
     * PATCH /api/homologations/:id
     * Update homologation (public)
     */
    async update(ctx: Context) {
        try {
            const id = ctx.params.id;

            if (!id) {
                ctx.response.status = 400;
                ctx.response.body = { error: "Homologation ID is required" };
                return;
            }

            const body = await ctx.request.body.json();

            // Validate request body
            const validationResult = UpdateHomologationSchema.safeParse(body);
            if (!validationResult.success) {
                ctx.response.status = 400;
                ctx.response.body = {
                    error: "Invalid request",
                    details: validationResult.error.errors,
                };
                return;
            }

            const data = validationResult.data;

            // Use authenticated user ID if available, otherwise use system ID
            const auth = ctx.state.auth as AuthContext | undefined;
            const userId = auth?.user.id ||
                "00000000-0000-0000-0000-000000000000";

            const homologation = await homologationRepository.update(
                id,
                data,
                userId,
            );

            if (!homologation) {
                ctx.response.status = 404;
                ctx.response.body = { error: "Homologation not found" };
                return;
            }

            ctx.response.status = 200;
            ctx.response.body = homologation;
        } catch (error) {
            console.error("Update homologation error:", error);
            ctx.response.status = 500;
            ctx.response.body = { error: "Internal server error" };
        }
    }

    /**
     * DELETE /api/homologations/:id
     * Soft delete homologation (admin only)
     */
    async delete(ctx: Context) {
        try {
            const id = ctx.params.id;

            if (!id) {
                ctx.response.status = 400;
                ctx.response.body = { error: "Homologation ID is required" };
                return;
            }

            const auth = ctx.state.auth as AuthContext;
            const success = await homologationRepository.softDelete(
                id,
                auth.user.id,
            );

            if (!success) {
                ctx.response.status = 404;
                ctx.response.body = { error: "Homologation not found" };
                return;
            }

            ctx.response.status = 200;
            ctx.response.body = {
                message: "Homologation deleted successfully",
            };
        } catch (error) {
            console.error("Delete homologation error:", error);
            ctx.response.status = 500;
            ctx.response.body = { error: "Internal server error" };
        }
    }

    /**
     * PATCH /api/homologations/:id/status
     * Update homologation status (admin only)
     */
    async updateStatus(ctx: Context) {
        try {
            const id = ctx.params.id;

            if (!id) {
                ctx.response.status = 400;
                ctx.response.body = { error: "Homologation ID is required" };
                return;
            }

            const body = await ctx.request.body.json();

            // Validate request body
            const validationResult = UpdateStatusSchema.safeParse(body);
            if (!validationResult.success) {
                ctx.response.status = 400;
                ctx.response.body = {
                    error: "Invalid request",
                    details: validationResult.error.errors,
                };
                return;
            }

            const { status } = validationResult.data;

            const auth = ctx.state.auth as AuthContext;
            const homologation = await homologationRepository.updateStatus(
                id,
                status,
                auth.user.id,
            );

            if (!homologation) {
                ctx.response.status = 404;
                ctx.response.body = { error: "Homologation not found" };
                return;
            }

            ctx.response.status = 200;
            ctx.response.body = homologation;
        } catch (error) {
            console.error("Update status error:", error);
            ctx.response.status = 500;
            ctx.response.body = { error: "Internal server error" };
        }
    }
}
