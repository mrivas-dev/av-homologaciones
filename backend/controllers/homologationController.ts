import type { Context } from "../deps.ts";
import { HomologationRepository } from "../repositories/homologationRepository.ts";
import { AuditLogRepository } from "../repositories/auditLogRepository.ts";
import { HomologationService } from "../services/homologationService.ts";
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
const auditLogRepository = new AuditLogRepository();
const homologationService = new HomologationService();

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

            // Create audit log for new homologation
            await auditLogRepository.create({
                entityType: "Homologation",
                entityId: homologation.id,
                action: "CREATED",
                oldValues: undefined,
                newValues: {
                    ownerFullName: data.ownerFullName,
                    ownerEmail: data.ownerEmail,
                    trailerType: data.trailerType,
                    status: homologation.status,
                },
                createdBy: userId,
            });

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

            // Get current values for audit log
            const currentHomologation = await homologationRepository.findById(id);
            if (!currentHomologation) {
                ctx.response.status = 404;
                ctx.response.body = { error: "Homologation not found" };
                return;
            }

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

            // Create audit log for update
            await auditLogRepository.create({
                entityType: "Homologation",
                entityId: id,
                action: "UPDATED",
                oldValues: {
                    ownerFullName: currentHomologation.ownerFullName,
                    ownerEmail: currentHomologation.ownerEmail,
                    trailerType: currentHomologation.trailerType,
                },
                newValues: data,
                createdBy: userId,
            });

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

            // Get current homologation for audit log
            const currentHomologation = await homologationRepository.findById(id);
            if (!currentHomologation) {
                ctx.response.status = 404;
                ctx.response.body = { error: "Homologation not found" };
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

            // Create audit log for deletion
            await auditLogRepository.create({
                entityType: "Homologation",
                entityId: id,
                action: "DELETED",
                oldValues: {
                    ownerFullName: currentHomologation.ownerFullName,
                    ownerEmail: currentHomologation.ownerEmail,
                    status: currentHomologation.status,
                },
                newValues: undefined,
                createdBy: auth.user.id,
            });

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
     * Update homologation status with transition validation
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

            const { status, reason } = validationResult.data;

            const auth = ctx.state.auth as AuthContext | undefined;
            const userId = auth?.user.id || "00000000-0000-0000-0000-000000000000";
            const isAdmin = auth?.user.role?.toLowerCase() === "admin";

            // Use HomologationService for status transition with validation
            const result = await homologationService.transitionStatus(
                id,
                status,
                userId,
                isAdmin,
                reason,
            );

            if (!result.success) {
                const statusCode = result.code === "NOT_FOUND" ? 404 :
                    result.code === "REQUIRES_ADMIN" ? 403 : 400;

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
            console.error("Update status error:", error);
            ctx.response.status = 500;
            ctx.response.body = { error: "Internal server error" };
        }
    }

    /**
     * POST /api/homologations/:id/submit
     * Submit homologation for review (convenience endpoint)
     */
    async submit(ctx: Context) {
        try {
            const id = ctx.params.id;

            if (!id) {
                ctx.response.status = 400;
                ctx.response.body = { error: "Homologation ID is required" };
                return;
            }

            const auth = ctx.state.auth as AuthContext | undefined;
            const userId = auth?.user.id || "00000000-0000-0000-0000-000000000000";

            const result = await homologationService.submitForReview(id, userId);

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
            console.error("Submit homologation error:", error);
            ctx.response.status = 500;
            ctx.response.body = { error: "Internal server error" };
        }
    }

    /**
     * POST /api/homologations/lookup
     * Lookup existing homologation by DNI + phone, or create a new one if not found
     */
    async lookupOrCreate(ctx: Context) {
        try {
            const body = await ctx.request.body.json();

            // Validate request body
            const LookupSchema = z.object({
                dni: z.string().min(1, "DNI is required"),
                phone: z.string().regex(/^[0-9+() -]+$/, "Invalid phone format"),
            });

            const validationResult = LookupSchema.safeParse(body);
            if (!validationResult.success) {
                ctx.response.status = 400;
                ctx.response.body = {
                    error: "Invalid request",
                    details: validationResult.error.errors,
                };
                return;
            }

            const { dni, phone } = validationResult.data;

            // Try to find existing homologation
            const existing = await homologationRepository.findByNationalIdAndPhone(
                dni,
                phone,
            );

            if (existing) {
                ctx.response.status = 200;
                ctx.response.body = {
                    found: true,
                    homologation: existing,
                };
                return;
            }

            // Create new homologation with minimal data
            const auth = ctx.state.auth as AuthContext | undefined;
            const userId = auth?.user.id ||
                "00000000-0000-0000-0000-000000000000";

            const newHomologation = await homologationRepository.create(
                {
                    ownerNationalId: dni,
                    ownerPhone: phone,
                    status: HomologationStatus.DRAFT,
                } as CreateHomologationRequest,
                userId,
            );

            // Create audit log for new homologation
            await auditLogRepository.create({
                entityType: "Homologation",
                entityId: newHomologation.id,
                action: "CREATED_VIA_LOOKUP",
                oldValues: undefined,
                newValues: {
                    ownerNationalId: dni,
                    ownerPhone: phone,
                    status: newHomologation.status,
                },
                createdBy: userId,
            });

            ctx.response.status = 201;
            ctx.response.body = {
                found: false,
                homologation: newHomologation,
            };
        } catch (error) {
            console.error("Lookup or create homologation error:", error);
            ctx.response.status = 500;
            ctx.response.body = { error: "Internal server error" };
        }
    }
}
