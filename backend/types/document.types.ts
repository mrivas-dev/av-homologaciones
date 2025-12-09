import { z } from "zod";

// Document type enum
export const AdminDocumentType = {
  PAYMENT_RECEIPT: "payment_receipt",
  HOMOLOGATION_PAPERS: "homologation_papers",
} as const;

export type AdminDocumentTypeValue = typeof AdminDocumentType[keyof typeof AdminDocumentType];

// Base schema for AdminDocument
const AdminDocumentBaseSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date().default(() => new Date()),
  createdBy: z.string().uuid(),
  isDeleted: z.boolean().default(false),
  deletedAt: z.date().nullable().default(null),
  deletedBy: z.string().uuid().nullable().default(null),
});

// AdminDocument Schema
export const AdminDocumentSchema = AdminDocumentBaseSchema.extend({
  homologationId: z.string().uuid(),
  documentType: z.enum([AdminDocumentType.PAYMENT_RECEIPT, AdminDocumentType.HOMOLOGATION_PAPERS]),
  fileName: z.string().min(1),
  filePath: z.string().min(1),
  fileSize: z.number().int().positive(),
  mimeType: z.string().min(1),
  description: z.string().nullable().optional(),
});

export type AdminDocument = z.infer<typeof AdminDocumentSchema>;

// Request type for creating admin documents
export interface CreateAdminDocumentRequest {
  homologationId: string;
  documentType: AdminDocumentTypeValue;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  description?: string;
  createdBy: string;
}

