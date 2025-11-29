import type { Context } from "../deps.ts";
import { multiParser } from "../deps.ts";
import { PhotoRepository } from "../repositories/photoRepository.ts";
import type { AuthContext } from "../types/auth.types.ts";
import { z } from "../deps.ts";

const photoRepository = new PhotoRepository();

const UPLOAD_DIR = Deno.env.get("UPLOAD_DIR") || "./uploads";
const MAX_FILE_SIZE = parseInt(Deno.env.get("MAX_FILE_SIZE") || "10485760"); // 10MB default

// Allowed MIME types for photo uploads
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf", // For ID documents
];

// Allowed file extensions
const ALLOWED_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "heic",
  "heif",
  "pdf",
];

/**
 * Validate file type based on MIME type and extension
 */
function validateFileType(file: File): { valid: boolean; error?: string } {
  const mimeType = file.type.toLowerCase();
  const extension = file.name.split(".").pop()?.toLowerCase() || "";

  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: `Invalid file type: ${mimeType}. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
    };
  }

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `Invalid file extension: .${extension}. Allowed extensions: ${ALLOWED_EXTENSIONS.join(", ")}`,
    };
  }

  return { valid: true };
}

// Ensure upload directory exists
try {
    await Deno.mkdir(UPLOAD_DIR, { recursive: true });
} catch (error) {
    // Directory might already exist
    console.log("Upload directory already exists or error creating it:", error);
}

export class PhotoController {
    /**
     * POST /api/photos
     * Upload a photo
     */
    async upload(ctx: Context) {
        try {
            const contentType = ctx.request.headers.get("content-type");

            if (!contentType || !contentType.includes("multipart/form-data")) {
                ctx.response.status = 400;
                ctx.response.body = {
                    error: "Content-Type must be multipart/form-data",
                };
                return;
            }

            // Use standard FormData API
            const body = (ctx.request as any).body;
            if (!body || typeof body.formData !== "function") {
                throw new Error("Request body does not support formData()");
            }

            const formData = await body.formData();

            let file: File | null = null;
            const fields: Record<string, string> = {};

            for (const [key, value] of formData.entries()) {
                if (value instanceof File) {
                    file = value;
                } else {
                    fields[key] = value.toString();
                }
            }

            if (!file) {
                ctx.response.status = 400;
                ctx.response.body = { error: "No file uploaded" };
                return;
            }

            const homologationId = fields.homologationId;
            const isIdDocument = fields.isIdDocument === "true";

            if (!homologationId) {
                ctx.response.status = 400;
                ctx.response.body = { error: "homologationId is required" };
                return;
            }

            // Validate file size
            if (file.size > MAX_FILE_SIZE) {
                ctx.response.status = 413;
                ctx.response.body = {
                    error:
                        `File size exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes`,
                };
                return;
            }

            // Validate file type
            const fileTypeValidation = validateFileType(file);
            if (!fileTypeValidation.valid) {
                ctx.response.status = 415;
                ctx.response.body = {
                    error: fileTypeValidation.error,
                };
                return;
            }

            // Generate unique filename
            const timestamp = Date.now();
            const ext = file.name.split(".").pop();
            const fileName = `${homologationId}_${timestamp}.${ext}`;
            const filePath = `${UPLOAD_DIR}/${fileName}`;

            // Save file to disk
            await Deno.writeFile(
                filePath,
                new Uint8Array(await file.arrayBuffer()),
            );

            // Get user ID
            const auth = ctx.state.auth as AuthContext | undefined;
            const userId = auth?.user.id ||
                "00000000-0000-0000-0000-000000000000";

            // Save photo metadata to database
            const photo = await photoRepository.create({
                homologationId,
                fileName: file.name,
                filePath,
                fileSize: file.size,
                mimeType: file.type,
                isIdDocument,
                createdBy: userId,
            });

            ctx.response.status = 201;
            ctx.response.body = photo;
        } catch (error) {
            console.error("Upload photo error:", error);
            ctx.response.status = 500;
            ctx.response.body = { error: "Internal server error" };
        }
    }

    /**
     * GET /api/photos/:homologationId
     * List photos for a homologation
     */
    async listByHomologation(ctx: Context) {
        try {
            const homologationId = ctx.params.homologationId;

            if (!homologationId) {
                ctx.response.status = 400;
                ctx.response.body = { error: "Homologation ID is required" };
                return;
            }

            const photos = await photoRepository.findByHomologationId(
                homologationId,
            );

            ctx.response.status = 200;
            ctx.response.body = {
                data: photos,
                total: photos.length,
            };
        } catch (error) {
            console.error("List photos error:", error);
            ctx.response.status = 500;
            ctx.response.body = { error: "Internal server error" };
        }
    }

    /**
     * GET /api/photos/:id
     * Get photo details
     */
    async getById(ctx: Context) {
        try {
            const id = ctx.params.id;

            if (!id) {
                ctx.response.status = 400;
                ctx.response.body = { error: "Photo ID is required" };
                return;
            }

            const photo = await photoRepository.findById(id);

            if (!photo) {
                ctx.response.status = 404;
                ctx.response.body = { error: "Photo not found" };
                return;
            }

            ctx.response.status = 200;
            ctx.response.body = photo;
        } catch (error) {
            console.error("Get photo error:", error);
            ctx.response.status = 500;
            ctx.response.body = { error: "Internal server error" };
        }
    }

    /**
     * DELETE /api/photos/:id
     * Remove photo (admin only)
     */
    async delete(ctx: Context) {
        try {
            const id = ctx.params.id;

            if (!id) {
                ctx.response.status = 400;
                ctx.response.body = { error: "Photo ID is required" };
                return;
            }

            // Get photo to delete file from disk
            const photo = await photoRepository.findById(id);

            if (!photo) {
                ctx.response.status = 404;
                ctx.response.body = { error: "Photo not found" };
                return;
            }

            const auth = ctx.state.auth as AuthContext;
            const success = await photoRepository.delete(id, auth.user.id);

            if (!success) {
                ctx.response.status = 404;
                ctx.response.body = { error: "Photo not found" };
                return;
            }

            // Delete file from disk
            try {
                await Deno.remove(photo.filePath);
            } catch (error) {
                console.error("Error deleting file from disk:", error);
                // Continue even if file deletion fails
            }

            ctx.response.status = 200;
            ctx.response.body = { message: "Photo deleted successfully" };
        } catch (error) {
            console.error("Delete photo error:", error);
            ctx.response.status = 500;
            ctx.response.body = { error: "Internal server error" };
        }
    }
}
