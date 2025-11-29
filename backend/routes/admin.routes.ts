import { Router } from "../deps.ts";
import { AdminController } from "../controllers/adminController.ts";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware.ts";

const router = new Router();
const adminController = new AdminController();

// All admin routes require authentication and admin role
router.get(
    "/api/admin/homologations",
    requireAuth,
    requireAdmin,
    (ctx) => adminController.listAll(ctx),
);
router.post(
    "/api/admin/homologations/:id/approve",
    requireAuth,
    requireAdmin,
    (ctx) => adminController.approve(ctx),
);
router.post(
    "/api/admin/homologations/:id/reject",
    requireAuth,
    requireAdmin,
    (ctx) => adminController.reject(ctx),
);
router.post(
    "/api/admin/homologations/:id/incomplete",
    requireAuth,
    requireAdmin,
    (ctx) => adminController.markIncomplete(ctx),
);
router.post(
    "/api/admin/homologations/:id/complete",
    requireAuth,
    requireAdmin,
    (ctx) => adminController.complete(ctx),
);

export default router;
