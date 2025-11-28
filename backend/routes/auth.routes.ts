import { Router } from "../deps.ts";
import { AuthController } from "../controllers/authController.ts";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware.ts";

const router = new Router();
const authController = new AuthController();

// Public routes
router.post("/api/auth/login", (ctx) => authController.login(ctx));

// Protected routes
router.post(
    "/api/auth/register",
    requireAuth,
    requireAdmin,
    (ctx) => authController.register(ctx),
);
router.get(
    "/api/auth/me",
    requireAuth,
    (ctx) => authController.getCurrentUser(ctx),
);
router.post(
    "/api/auth/logout",
    requireAuth,
    (ctx) => authController.logout(ctx),
);

export default router;
