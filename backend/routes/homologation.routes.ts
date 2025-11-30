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

// Lookup or create homologation by DNI + phone (must be before :id routes)
router.post(
    "/api/homologations/lookup",
    optionalAuth,
    (ctx) => homologationController.lookupOrCreate(ctx),
);

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

// Submit for review (public route, service handles validation)
router.post(
    "/api/homologations/:id/submit",
    optionalAuth,
    (ctx) => homologationController.submit(ctx),
);

// Status update (with optional auth - service validates admin for restricted transitions)
router.patch(
    "/api/homologations/:id/status",
    optionalAuth,
    (ctx) => homologationController.updateStatus(ctx),
);

// Admin-only routes
router.delete(
    "/api/homologations/:id",
    requireAuth,
    requireAdmin,
    (ctx) => homologationController.delete(ctx),
);

export default router;
