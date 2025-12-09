import type { Context } from "../deps.ts";
import { DocumentRepository } from "../repositories/documentRepository.ts";
import { HomologationRepository } from "../repositories/homologationRepository.ts";
import { AdminDocumentType, type AdminDocumentTypeValue } from "../types/document.types.ts";
import type { AuthContext } from "../types/auth.types.ts";

const documentRepository = new DocumentRepository();
const homologationRepository = new HomologationRepository();

const UPLOAD_DIR = Deno.env.get("UPLOAD_DIR") || "./uploads";
const MAX_FILE_SIZE = parseInt(Deno.env.get("MAX_FILE_SIZE") || "10485760"); // 10MB default

// Allowed MIME types for admin document uploads
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
];

// Allowed file extensions
const ALLOWED_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
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

/**
 * Validate document type
 */
function isValidDocumentType(type: string): type is AdminDocumentTypeValue {
  return Object.values(AdminDocumentType).includes(type as AdminDocumentTypeValue);
}

// Ensure upload directory exists
try {
  await Deno.mkdir(UPLOAD_DIR, { recursive: true });
} catch (error) {
  console.log("Upload directory already exists or error creating it:", error);
}

export class DocumentController {
  /**
   * POST /api/admin/documents
   * Upload a document (admin only)
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
      const documentType = fields.documentType;
      const description = fields.description;

      if (!homologationId) {
        ctx.response.status = 400;
        ctx.response.body = { error: "homologationId is required" };
        return;
      }

      if (!documentType || !isValidDocumentType(documentType)) {
        ctx.response.status = 400;
        ctx.response.body = {
          error: `documentType is required and must be one of: ${Object.values(AdminDocumentType).join(", ")}`,
        };
        return;
      }

      // Verify homologation exists
      const homologation = await homologationRepository.findById(homologationId);
      if (!homologation) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Homologation not found" };
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        ctx.response.status = 413;
        ctx.response.body = {
          error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes`,
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

      // Generate unique filename with document type prefix
      const timestamp = Date.now();
      const ext = file.name.split(".").pop();
      const fileName = `doc_${documentType}_${homologationId}_${timestamp}.${ext}`;
      const filePath = `${UPLOAD_DIR}/${fileName}`;

      // Save file to disk
      await Deno.writeFile(
        filePath,
        new Uint8Array(await file.arrayBuffer()),
      );

      // Get user ID from auth context
      const auth = ctx.state.auth as AuthContext;
      const userId = auth.user.id;

      // Save document metadata to database
      const document = await documentRepository.create({
        homologationId,
        documentType,
        fileName: file.name,
        filePath,
        fileSize: file.size,
        mimeType: file.type,
        description,
        createdBy: userId,
      });

      ctx.response.status = 201;
      ctx.response.body = document;
    } catch (error) {
      console.error("Upload document error:", error);
      ctx.response.status = 500;
      ctx.response.body = { error: "Internal server error" };
    }
  }

  /**
   * GET /api/admin/documents/homologation/:homologationId
   * List documents for a homologation (admin only)
   */
  async listByHomologation(ctx: Context) {
    try {
      const homologationId = ctx.params.homologationId;

      if (!homologationId) {
        ctx.response.status = 400;
        ctx.response.body = { error: "Homologation ID is required" };
        return;
      }

      const documents = await documentRepository.findByHomologationId(homologationId);

      ctx.response.status = 200;
      ctx.response.body = {
        data: documents,
        total: documents.length,
      };
    } catch (error) {
      console.error("List documents error:", error);
      ctx.response.status = 500;
      ctx.response.body = { error: "Internal server error" };
    }
  }

  /**
   * GET /api/documents/homologation/:homologationId
   * List documents for a homologation (public - users can view their own documents)
   */
  async listByHomologationPublic(ctx: Context) {
    try {
      const homologationId = ctx.params.homologationId;

      if (!homologationId) {
        ctx.response.status = 400;
        ctx.response.body = { error: "Homologation ID is required" };
        return;
      }

      // Verify homologation exists
      const homologation = await homologationRepository.findById(homologationId);
      if (!homologation) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Homologation not found" };
        return;
      }

      // Get documents (already filters out deleted documents)
      const documents = await documentRepository.findByHomologationId(homologationId);

      ctx.response.status = 200;
      ctx.response.body = {
        data: documents,
        total: documents.length,
      };
    } catch (error) {
      console.error("List documents (public) error:", error);
      ctx.response.status = 500;
      ctx.response.body = { error: "Internal server error" };
    }
  }

  /**
   * GET /api/admin/documents/:id
   * Get document details (admin only)
   */
  async getById(ctx: Context) {
    try {
      const id = ctx.params.id;

      if (!id) {
        ctx.response.status = 400;
        ctx.response.body = { error: "Document ID is required" };
        return;
      }

      const document = await documentRepository.findById(id);

      if (!document) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Document not found" };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = document;
    } catch (error) {
      console.error("Get document error:", error);
      ctx.response.status = 500;
      ctx.response.body = { error: "Internal server error" };
    }
  }

  /**
   * DELETE /api/admin/documents/:id
   * Delete a document (admin only)
   */
  async delete(ctx: Context) {
    try {
      const id = ctx.params.id;

      if (!id) {
        ctx.response.status = 400;
        ctx.response.body = { error: "Document ID is required" };
        return;
      }

      // Get document to delete file from disk
      const document = await documentRepository.findById(id);

      if (!document) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Document not found" };
        return;
      }

      const auth = ctx.state.auth as AuthContext;
      const userId = auth.user.id;

      const success = await documentRepository.delete(id, userId);

      if (!success) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Document not found" };
        return;
      }

      // Delete file from disk
      try {
        await Deno.remove(document.filePath);
      } catch (error) {
        console.error("Error deleting file from disk:", error);
        // Continue even if file deletion fails
      }

      ctx.response.status = 200;
      ctx.response.body = { message: "Document deleted successfully" };
    } catch (error) {
      console.error("Delete document error:", error);
      ctx.response.status = 500;
      ctx.response.body = { error: "Internal server error" };
    }
  }
}

