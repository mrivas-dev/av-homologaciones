import { Router } from "../deps.ts";
import { TrailerTypeController } from "../controllers/trailerTypeController.ts";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware.ts";

const router = new Router();
const trailerTypeController = new TrailerTypeController();

// UUID regex pattern for route parameters
const uuidPattern =
  "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}";

// =============================================
// Public Routes (no authentication required)
// =============================================

// List active trailer types (for forms)
router.get(
  "/api/trailer-types",
  (ctx) => trailerTypeController.listActive(ctx)
);

// =============================================
// Admin Routes (require authentication and admin role)
// =============================================

// List all trailer types (includes inactive)
router.get(
  "/api/admin/trailer-types",
  requireAuth,
  requireAdmin,
  (ctx) => trailerTypeController.listAll(ctx)
);

// Get trailer type by ID
router.get(
  `/api/admin/trailer-types/:id(${uuidPattern})`,
  requireAuth,
  requireAdmin,
  (ctx) => trailerTypeController.getById(ctx)
);

// Create trailer type
router.post(
  "/api/admin/trailer-types",
  requireAuth,
  requireAdmin,
  (ctx) => trailerTypeController.create(ctx)
);

// Update trailer type
router.patch(
  `/api/admin/trailer-types/:id(${uuidPattern})`,
  requireAuth,
  requireAdmin,
  (ctx) => trailerTypeController.update(ctx)
);

// Delete trailer type
router.delete(
  `/api/admin/trailer-types/:id(${uuidPattern})`,
  requireAuth,
  requireAdmin,
  (ctx) => trailerTypeController.delete(ctx)
);

export default router;

