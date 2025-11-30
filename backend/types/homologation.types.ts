import { z } from "zod";

// Base schemas
const BaseSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid(),
  isDeleted: z.boolean().default(false),
  deletedAt: z.date().nullable().default(null),
  deletedBy: z.string().uuid().nullable().default(null),
});

// Base schema for Photo (no updatedAt/updatedBy in photos table)
const PhotoBaseSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date().default(() => new Date()),
  createdBy: z.string().uuid(),
  isDeleted: z.boolean().default(false),
  deletedAt: z.date().nullable().default(null),
  deletedBy: z.string().uuid().nullable().default(null),
});

// Enums
export const TrailerType = {
  TRAILER: "Trailer",
  ROLLING_BOX: "Rolling Box",
  MOTORHOME: "Motorhome",
} as const;

export const HomologationStatus = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending Review",
  PAYED: "Payed",
  INCOMPLETE: "Incomplete",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  COMPLETED: "Completed",
} as const;

// Photo Schema
export const PhotoSchema = PhotoBaseSchema.extend({
  homologationId: z.string().uuid(),
  fileName: z.string().min(1),
  filePath: z.string().min(1),
  fileSize: z.number().int().positive(),
  mimeType: z.string().min(1),
  isIdDocument: z.boolean().default(false),
});

export type Photo = z.infer<typeof PhotoSchema>;

// Homologation Schema
export const HomologationSchema = BaseSchema.extend({
  trailerType: z.nativeEnum(TrailerType).optional(),
  trailerDimensions: z.string().optional(),
  trailerNumberOfAxles: z.number().int().positive().optional(),
  trailerLicensePlateNumber: z.string().optional(),
  ownerFullName: z.string().min(1).optional(),
  ownerNationalId: z.string().min(1),
  ownerPhone: z.string().regex(/^[0-9+() -]+$/),
  ownerEmail: z.string().email().optional(),
  status: z.nativeEnum(HomologationStatus).default(HomologationStatus.DRAFT),
  version: z.number().int().positive().default(1),
  photos: z.array(PhotoSchema).optional(),
});

export type Homologation = z.infer<typeof HomologationSchema>;

// Audit Log Schema
export const AuditLogSchema = BaseSchema.extend({
  entityType: z.string().min(1),
  entityId: z.string().uuid(),
  action: z.string().min(1),
  oldValues: z.record(z.any()).optional(),
  newValues: z.record(z.any()).optional(),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

// API Request/Response Types
export type CreateHomologationRequest =
  & Omit<
    Homologation,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "createdBy"
    | "updatedBy"
    | "isDeleted"
    | "deletedAt"
    | "deletedBy"
    | "version"
    | "photos"
  >
  & {
    photos?: Omit<
      Photo,
      "id" | "createdAt" | "createdBy" | "isDeleted" | "deletedAt" | "deletedBy"
    >[];
  };

export type UpdateHomologationStatusRequest = {
  status: typeof HomologationStatus[keyof typeof HomologationStatus];
  reason?: string;
};

// File Upload
export type FileUpload = {
  filename: string;
  mimetype: string;
  content: Uint8Array;
};
