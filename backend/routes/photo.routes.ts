import { Router } from "../deps.ts";
import { PhotoController } from "../controllers/photoController.ts";
import {
    optionalAuth,
    requireAdmin,
    requireAuth,
} from "../middleware/authMiddleware.ts";

const router = new Router();
const photoController = new PhotoController();

const UPLOAD_DIR = Deno.env.get("UPLOAD_DIR") || "./uploads";

// Serve uploaded photos as static files
router.get("/uploads/:fileName", async (ctx) => {
    try {
        const fileName = ctx.params.fileName;
        
        // Security: Prevent directory traversal
        if (!fileName || fileName.includes("..") || fileName.includes("/")) {
            ctx.response.status = 400;
            ctx.response.body = { error: "Invalid filename" };
            return;
        }

        const filePath = `${UPLOAD_DIR}/${fileName}`;
        
        // Check if file exists
        try {
            const fileInfo = await Deno.stat(filePath);
            if (!fileInfo.isFile) {
                ctx.response.status = 404;
                ctx.response.body = { error: "File not found" };
                return;
            }
        } catch {
            ctx.response.status = 404;
            ctx.response.body = { error: "File not found" };
            return;
        }

        // Read and serve the file
        const fileData = await Deno.readFile(filePath);
        
        // Set appropriate content type based on file extension
        const ext = fileName.split(".").pop()?.toLowerCase() || "";
        const mimeTypes: Record<string, string> = {
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
            webp: "image/webp",
            heic: "image/heic",
            heif: "image/heif",
            pdf: "application/pdf",
        };
        
        const contentType = mimeTypes[ext] || "application/octet-stream";
        ctx.response.headers.set("Content-Type", contentType);
        ctx.response.headers.set("Cache-Control", "public, max-age=31536000"); // Cache for 1 year
        ctx.response.body = fileData;
    } catch (error) {
        console.error("Error serving file:", error);
        ctx.response.status = 500;
        ctx.response.body = { error: "Internal server error" };
    }
});

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

// Delete photo - public route (no authentication required)
router.delete(
    "/api/photos/:id",
    (ctx) => photoController.delete(ctx),
);

export default router;
