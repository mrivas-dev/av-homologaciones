import { HomologationRepository } from "../repositories/homologationRepository.ts";
import { AuditLogRepository } from "../repositories/auditLogRepository.ts";
import { PhotoRepository } from "../repositories/photoRepository.ts";
import { NotificationService } from "./notificationService.ts";
import {
  CreateHomologationRequest,
  Homologation,
  HomologationStatus,
} from "../types/homologation.types.ts";

// Define valid status transitions
// Each status maps to an array of statuses it can transition to
const STATUS_TRANSITIONS: Record<string, string[]> = {
  [HomologationStatus.DRAFT]: [
    HomologationStatus.PENDING_REVIEW,
  ],
  [HomologationStatus.PENDING_REVIEW]: [
    HomologationStatus.PAYED,
    HomologationStatus.APPROVED,
    HomologationStatus.INCOMPLETE,
    HomologationStatus.REJECTED,
  ],
  [HomologationStatus.PAYED]: [
    HomologationStatus.APPROVED,
    HomologationStatus.REJECTED,
    HomologationStatus.INCOMPLETE,
  ],
  [HomologationStatus.INCOMPLETE]: [
    HomologationStatus.PENDING_REVIEW,
    HomologationStatus.REJECTED,
  ],
  [HomologationStatus.APPROVED]: [
    HomologationStatus.COMPLETED,
  ],
  [HomologationStatus.REJECTED]: [],
  [HomologationStatus.COMPLETED]: [],
};

// Statuses that require admin role to transition to
const ADMIN_ONLY_STATUSES = [
  HomologationStatus.APPROVED,
  HomologationStatus.REJECTED,
  HomologationStatus.COMPLETED,
];

// Required fields for submitting (moving from DRAFT to PENDING_REVIEW)
const REQUIRED_FIELDS_FOR_SUBMISSION = [
  "ownerFullName",
  "ownerNationalId",
  "ownerPhone",
  "ownerEmail",
  "trailerType",
];

export interface StatusTransitionResult {
  success: boolean;
  homologation?: Homologation;
  error?: string;
  code?: "INVALID_TRANSITION" | "MISSING_FIELDS" | "REQUIRES_ADMIN" | "NOT_FOUND";
}

export class HomologationService {
  private homologationRepository: HomologationRepository;
  private auditLogRepository: AuditLogRepository;
  private photoRepository: PhotoRepository;
  private notificationService: NotificationService;

  constructor() {
    this.homologationRepository = new HomologationRepository();
    this.auditLogRepository = new AuditLogRepository();
    this.photoRepository = new PhotoRepository();
    this.notificationService = new NotificationService();
  }

  /**
   * Check if a status transition is valid
   */
  isValidTransition(
    currentStatus: string,
    newStatus: string,
  ): boolean {
    const allowedTransitions = STATUS_TRANSITIONS[currentStatus] || [];
    return allowedTransitions.includes(newStatus);
  }

  /**
   * Check if a status requires admin role
   */
  requiresAdmin(status: string): boolean {
    return ADMIN_ONLY_STATUSES.includes(status as any);
  }

  /**
   * Get allowed transitions for a given status
   */
  getAllowedTransitions(currentStatus: string): string[] {
    return STATUS_TRANSITIONS[currentStatus] || [];
  }

  /**
   * Validate that a homologation has all required fields for submission
   */
  validateForSubmission(homologation: Homologation): { valid: boolean; missingFields: string[] } {
    const missingFields: string[] = [];

    for (const field of REQUIRED_FIELDS_FOR_SUBMISSION) {
      const value = (homologation as any)[field];
      if (value === undefined || value === null || value === "") {
        missingFields.push(field);
      }
    }

    return {
      valid: missingFields.length === 0,
      missingFields,
    };
  }

  /**
   * Transition a homologation to a new status with validation
   */
  async transitionStatus(
    homologationId: string,
    newStatus: string,
    userId: string,
    isAdmin: boolean,
    reason?: string,
  ): Promise<StatusTransitionResult> {
    // Get current homologation
    const homologation = await this.homologationRepository.findById(homologationId);

    if (!homologation) {
      return {
        success: false,
        error: "Homologation not found",
        code: "NOT_FOUND",
      };
    }

    const currentStatus = homologation.status;

    // Check if transition is valid
    if (!this.isValidTransition(currentStatus, newStatus)) {
      return {
        success: false,
        error: `Cannot transition from "${currentStatus}" to "${newStatus}". Allowed transitions: ${
          this.getAllowedTransitions(currentStatus).join(", ") || "none"
        }`,
        code: "INVALID_TRANSITION",
      };
    }

    // Check admin requirement
    if (this.requiresAdmin(newStatus) && !isAdmin) {
      return {
        success: false,
        error: `Transitioning to "${newStatus}" requires admin privileges`,
        code: "REQUIRES_ADMIN",
      };
    }

    // Special validation for DRAFT -> PENDING_REVIEW
    if (
      currentStatus === HomologationStatus.DRAFT &&
      newStatus === HomologationStatus.PENDING_REVIEW
    ) {
      const validation = this.validateForSubmission(homologation);
      if (!validation.valid) {
        return {
          success: false,
          error: `Missing required fields for submission: ${validation.missingFields.join(", ")}`,
          code: "MISSING_FIELDS",
        };
      }

      // Check if at least one photo is uploaded
      const photos = await this.photoRepository.findByHomologationId(homologationId);
      if (photos.length === 0) {
        return {
          success: false,
          error: "At least one photo is required for submission",
          code: "MISSING_FIELDS",
        };
      }
    }

    // Perform the status update
    const updatedHomologation = await this.homologationRepository.updateStatus(
      homologationId,
      newStatus as typeof HomologationStatus[keyof typeof HomologationStatus],
      userId,
    );

    // Create audit log
    await this.auditLogRepository.create({
      entityType: "Homologation",
      entityId: homologationId,
      action: `STATUS_CHANGE_${newStatus.toUpperCase().replace(/\s+/g, "_")}`,
      oldValues: { status: currentStatus },
      newValues: { status: newStatus, reason },
      createdBy: userId,
    });

    // Send notification email
    try {
      await this.notificationService.sendStatusNotification({
        ownerFullName: homologation.ownerFullName,
        ownerEmail: homologation.ownerEmail,
        homologationId,
        status: newStatus,
        reason,
      });
    } catch (error) {
      // Log but don't fail the operation if notification fails
      console.error("Failed to send status notification:", error);
    }

    return {
      success: true,
      homologation: updatedHomologation!,
    };
  }

  /**
   * Submit a homologation for review (convenience method)
   */
  async submitForReview(
    homologationId: string,
    userId: string,
  ): Promise<StatusTransitionResult> {
    return this.transitionStatus(
      homologationId,
      HomologationStatus.PENDING_REVIEW,
      userId,
      false,
    );
  }

  /**
   * Approve a homologation (admin only)
   */
  async approve(
    homologationId: string,
    adminId: string,
    reason?: string,
  ): Promise<StatusTransitionResult> {
    return this.transitionStatus(
      homologationId,
      HomologationStatus.APPROVED,
      adminId,
      true,
      reason,
    );
  }

  /**
   * Reject a homologation (admin only)
   */
  async reject(
    homologationId: string,
    adminId: string,
    reason?: string,
  ): Promise<StatusTransitionResult> {
    return this.transitionStatus(
      homologationId,
      HomologationStatus.REJECTED,
      adminId,
      true,
      reason,
    );
  }

  /**
   * Mark as incomplete (admin only)
   */
  async markIncomplete(
    homologationId: string,
    adminId: string,
    reason?: string,
  ): Promise<StatusTransitionResult> {
    return this.transitionStatus(
      homologationId,
      HomologationStatus.INCOMPLETE,
      adminId,
      true,
      reason,
    );
  }

  /**
   * Complete a homologation (admin only)
   */
  async complete(
    homologationId: string,
    adminId: string,
    reason?: string,
  ): Promise<StatusTransitionResult> {
    return this.transitionStatus(
      homologationId,
      HomologationStatus.COMPLETED,
      adminId,
      true,
      reason,
    );
  }
}

