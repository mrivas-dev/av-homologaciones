import { Router } from "../deps.ts";
import { HomologationController } from "../controllers/homologationController.ts";
import {
    optionalAuth,
    requireAdmin,
    requireAuth,
} from "../middleware/authMiddleware.ts";

const router = new Router();
const homologationController = new HomologationController();

// Public routes (with optional auth to track user if logged in)
router.post(
    "/api/homologations",
    optionalAuth,
    (ctx) => homologationController.create(ctx),
);
router.get(
    "/api/homologations",
    optionalAuth,
    (ctx) => homologationController.list(ctx),
);
router.get(
    "/api/homologations/:id",
    optionalAuth,
    (ctx) => homologationController.getById(ctx),
);
router.patch(
    "/api/homologations/:id",
    optionalAuth,
    (ctx) => homologationController.update(ctx),
);

// Admin-only routes
router.delete(
    "/api/homologations/:id",
    requireAuth,
    requireAdmin,
    (ctx) => homologationController.delete(ctx),
);
router.patch(
    "/api/homologations/:id/status",
    requireAuth,
    requireAdmin,
    (ctx) => homologationController.updateStatus(ctx),
);

export default router;
