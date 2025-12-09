import { Router } from "../deps.ts";
import { DocumentController } from "../controllers/documentController.ts";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware.ts";

const router = new Router();
const documentController = new DocumentController();

// UUID regex pattern for route matching
const uuidPattern =
  "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}";

// Public route - users can view documents for their own homologations
router.get(
  "/api/documents/homologation/:homologationId",
  (ctx) => documentController.listByHomologationPublic(ctx),
);

// All document routes below require admin authentication

// Upload a new document
router.post(
  "/api/admin/documents",
  requireAuth,
  requireAdmin,
  (ctx) => documentController.upload(ctx),
);

// List documents for a homologation (admin only)
router.get(
  `/api/admin/documents/homologation/:homologationId(${uuidPattern})`,
  requireAuth,
  requireAdmin,
  (ctx) => documentController.listByHomologation(ctx),
);

// Get a single document
router.get(
  `/api/admin/documents/:id(${uuidPattern})`,
  requireAuth,
  requireAdmin,
  (ctx) => documentController.getById(ctx),
);

// Delete a document
router.delete(
  `/api/admin/documents/:id(${uuidPattern})`,
  requireAuth,
  requireAdmin,
  (ctx) => documentController.delete(ctx),
);

export default router;

