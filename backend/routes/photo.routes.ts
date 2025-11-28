import { Router } from "../deps.ts";
import { PhotoController } from "../controllers/photoController.ts";
import {
    optionalAuth,
    requireAdmin,
    requireAuth,
} from "../middleware/authMiddleware.ts";

const router = new Router();
const photoController = new PhotoController();

// Public/optional auth routes
router.post("/api/photos", optionalAuth, (ctx) => photoController.upload(ctx));
router.get(
    "/api/photos/homologation/:homologationId",
    optionalAuth,
    (ctx) => photoController.listByHomologation(ctx),
);
router.get(
    "/api/photos/:id",
    optionalAuth,
    (ctx) => photoController.getById(ctx),
);

// Admin-only routes
router.delete(
    "/api/photos/:id",
    requireAuth,
    requireAdmin,
    (ctx) => photoController.delete(ctx),
);

export default router;
