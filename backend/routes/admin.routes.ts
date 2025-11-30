import { Router } from "../deps.ts";
import { AdminController } from "../controllers/adminController.ts";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware.ts";

const router = new Router();
const adminController = new AdminController();

// UUID regex pattern to prevent matching non-UUID paths (case-insensitive)
const uuidPattern =
    "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}";

// All admin routes require authentication and admin role
// List all homologations (must come before :id routes)
router.get(
    "/api/admin/homologations",
    requireAuth,
    requireAdmin,
    (ctx) => adminController.listAll(ctx),
);

// Action routes (more specific, must come before generic :id routes)
router.post(
    `/api/admin/homologations/:id(${uuidPattern})/approve`,
    requireAuth,
    requireAdmin,
    (ctx) => adminController.approve(ctx),
);
router.post(
    `/api/admin/homologations/:id(${uuidPattern})/reject`,
    requireAuth,
    requireAdmin,
    (ctx) => adminController.reject(ctx),
);
router.post(
    `/api/admin/homologations/:id(${uuidPattern})/incomplete`,
    requireAuth,
    requireAdmin,
    (ctx) => adminController.markIncomplete(ctx),
);
router.post(
    `/api/admin/homologations/:id(${uuidPattern})/complete`,
    requireAuth,
    requireAdmin,
    (ctx) => adminController.complete(ctx),
);

// Generic :id routes (must come after more specific routes)
router.get(
    `/api/admin/homologations/:id(${uuidPattern})`,
    requireAuth,
    requireAdmin,
    (ctx) => adminController.getById(ctx),
);
router.delete(
    `/api/admin/homologations/:id(${uuidPattern})`,
    requireAuth,
    requireAdmin,
    (ctx) => adminController.delete(ctx),
);

export default router;
