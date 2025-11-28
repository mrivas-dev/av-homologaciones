import type { Context } from "../deps.ts";
import { HomologationRepository } from "../repositories/homologationRepository.ts";
import { AuditLogRepository } from "../repositories/auditLogRepository.ts";
import { HomologationStatus } from "../types/homologation.types.ts";
import type { AuthContext } from "../types/auth.types.ts";
import { z } from "../deps.ts";

const homologationRepository = new HomologationRepository();
const auditLogRepository = new AuditLogRepository();

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

            // Get current homologation
            const currentHomologation = await homologationRepository.findById(
                id,
            );

            if (!currentHomologation) {
                ctx.response.status = 404;
                ctx.response.body = { error: "Homologation not found" };
                return;
            }

            const auth = ctx.state.auth as AuthContext;

            // Update status to approved
            const homologation = await homologationRepository.updateStatus(
                id,
                HomologationStatus.APPROVED,
                auth.user.id,
            );

            // Create audit log
            await auditLogRepository.create({
                entityType: "Homologation",
                entityId: id,
                action: "APPROVED",
                oldValues: { status: currentHomologation.status },
                newValues: {
                    status: HomologationStatus.APPROVED,
                    reason: validationResult.data.reason,
                },
                createdBy: auth.user.id,
            });

            ctx.response.status = 200;
            ctx.response.body = homologation;
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

            // Get current homologation
            const currentHomologation = await homologationRepository.findById(
                id,
            );

            if (!currentHomologation) {
                ctx.response.status = 404;
                ctx.response.body = { error: "Homologation not found" };
                return;
            }

            const auth = ctx.state.auth as AuthContext;

            // Update status to rejected
            const homologation = await homologationRepository.updateStatus(
                id,
                HomologationStatus.REJECTED,
                auth.user.id,
            );

            // Create audit log
            await auditLogRepository.create({
                entityType: "Homologation",
                entityId: id,
                action: "REJECTED",
                oldValues: { status: currentHomologation.status },
                newValues: {
                    status: HomologationStatus.REJECTED,
                    reason: validationResult.data.reason,
                },
                createdBy: auth.user.id,
            });

            ctx.response.status = 200;
            ctx.response.body = homologation;
        } catch (error) {
            console.error("Reject homologation error:", error);
            ctx.response.status = 500;
            ctx.response.body = { error: "Internal server error" };
        }
    }
}
