import { Context } from "../deps.ts";
import { PaymentRepository } from "../repositories/paymentRepository.ts";
import { HomologationRepository } from "../repositories/homologationRepository.ts";
import { AuditLogRepository } from "../repositories/auditLogRepository.ts";
import { CreatePaymentRequest, PaymentGateway } from "../types/payment.types.ts";

const paymentRepository = new PaymentRepository();
const homologationRepository = new HomologationRepository();
const auditLogRepository = new AuditLogRepository();

// Constants
const UPLOADS_DIR = Deno.env.get("UPLOAD_DIR") || "./uploads";
const MAX_FILE_SIZE = parseInt(Deno.env.get("MAX_FILE_SIZE") || "10485760"); // 10MB
const ALLOWED_RECEIPT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

/**
 * Create a payment for a homologation
 * POST /api/payments
 */
export async function createPayment(ctx: Context) {
  try {
    const body = await ctx.request.body.json();
    const { homologationId, amount, paymentGateway } = body as CreatePaymentRequest;

    // Validate required fields
    if (!homologationId) {
      ctx.response.status = 400;
      ctx.response.body = { error: "homologationId is required" };
      return;
    }

    if (!amount || amount <= 0) {
      ctx.response.status = 400;
      ctx.response.body = { error: "amount must be a positive number" };
      return;
    }

    // Verify homologation exists
    const homologation = await homologationRepository.findById(homologationId);
    if (!homologation) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Homologation not found" };
      return;
    }

    // Use a system user ID for now (public endpoint)
    const systemUserId = homologation.createdBy;

    const payment = await paymentRepository.create(
      {
        homologationId,
        amount,
        paymentGateway: paymentGateway || PaymentGateway.MERCADOPAGO,
      },
      systemUserId,
    );

    // Create audit log
    await auditLogRepository.create({
      entityType: "Payment",
      entityId: payment.id,
      action: "PAYMENT_CREATED",
      oldValues: undefined,
      newValues: {
        homologationId,
        amount,
        paymentGateway: payment.paymentGateway,
      },
      createdBy: systemUserId,
    });

    ctx.response.status = 201;
    ctx.response.body = payment;
  } catch (error) {
    console.error("Error creating payment:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error" };
  }
}

/**
 * Get payments for a homologation
 * GET /api/payments/homologation/:homologationId
 */
export async function getPaymentsByHomologation(ctx: Context) {
  try {
    const homologationId = ctx.params.homologationId;

    if (!homologationId) {
      ctx.response.status = 400;
      ctx.response.body = { error: "homologationId is required" };
      return;
    }

    const payments = await paymentRepository.findByHomologationId(homologationId);
    const totalPaid = await paymentRepository.getTotalPaid(homologationId);

    ctx.response.body = {
      data: payments,
      total: payments.length,
      totalPaid,
    };
  } catch (error) {
    console.error("Error fetching payments:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error" };
  }
}

/**
 * Get payment by ID
 * GET /api/payments/:id
 */
export async function getPaymentById(ctx: Context) {
  try {
    const id = ctx.params.id;

    if (!id) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Payment ID is required" };
      return;
    }

    const payment = await paymentRepository.findById(id);

    if (!payment) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Payment not found" };
      return;
    }

    ctx.response.body = payment;
  } catch (error) {
    console.error("Error fetching payment:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error" };
  }
}

/**
 * Upload receipt for a payment
 * POST /api/payments/:id/receipt
 */
export async function uploadReceipt(ctx: Context) {
  try {
    const id = ctx.params.id;

    if (!id) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Payment ID is required" };
      return;
    }

    // Verify payment exists
    const payment = await paymentRepository.findById(id);
    if (!payment) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Payment not found" };
      return;
    }

    const contentType = ctx.request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Content-Type must be multipart/form-data" };
      return;
    }

    const body = ctx.request.body;
    const formData = await body.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      ctx.response.status = 400;
      ctx.response.body = { error: "No file uploaded" };
      return;
    }

    // Validate file type
    if (!ALLOWED_RECEIPT_TYPES.includes(file.type)) {
      ctx.response.status = 415;
      ctx.response.body = {
        error: `Invalid file type: ${file.type}. Allowed types: ${ALLOWED_RECEIPT_TYPES.join(", ")}`,
      };
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

    // Generate unique filename
    const extension = file.name.split(".").pop() || "bin";
    const uniqueFileName = `receipt_${id}_${Date.now()}.${extension}`;
    const filePath = `${UPLOADS_DIR}/${uniqueFileName}`;

    // Save file
    const fileContent = await file.arrayBuffer();
    await Deno.writeFile(filePath, new Uint8Array(fileContent));

    // Update payment with receipt path
    const updatedPayment = await paymentRepository.updateReceipt(id, filePath);

    // Create audit log
    await auditLogRepository.create({
      entityType: "Payment",
      entityId: id,
      action: "RECEIPT_UPLOADED",
      oldValues: { receiptPath: payment.receiptPath },
      newValues: { receiptPath: filePath },
      createdBy: payment.createdBy,
    });

    ctx.response.status = 200;
    ctx.response.body = updatedPayment;
  } catch (error) {
    console.error("Error uploading receipt:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error" };
  }
}

/**
 * Download receipt for a payment (public endpoint)
 * GET /api/payments/:id/receipt
 */
export async function downloadReceipt(ctx: Context) {
  try {
    const id = ctx.params.id;

    if (!id) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Payment ID is required" };
      return;
    }

    const payment = await paymentRepository.findById(id);

    if (!payment) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Payment not found" };
      return;
    }

    if (!payment.receiptPath) {
      ctx.response.status = 404;
      ctx.response.body = { error: "No receipt uploaded for this payment" };
      return;
    }

    // Check if file exists
    try {
      await Deno.stat(payment.receiptPath);
    } catch {
      ctx.response.status = 404;
      ctx.response.body = { error: "Receipt file not found" };
      return;
    }

    // Read and serve file
    const fileContent = await Deno.readFile(payment.receiptPath);
    const fileName = payment.receiptPath.split("/").pop() || "receipt";
    const extension = fileName.split(".").pop()?.toLowerCase();

    // Set content type
    const mimeTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      pdf: "application/pdf",
    };

    ctx.response.headers.set(
      "Content-Type",
      mimeTypes[extension || ""] || "application/octet-stream",
    );
    ctx.response.headers.set(
      "Content-Disposition",
      `attachment; filename="${fileName}"`,
    );
    ctx.response.headers.set("Cache-Control", "public, max-age=31536000");
    ctx.response.body = fileContent;
  } catch (error) {
    console.error("Error downloading receipt:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error" };
  }
}

/**
 * Check if homologation is paid
 * GET /api/payments/check/:homologationId
 */
export async function checkPaymentStatus(ctx: Context) {
  try {
    const homologationId = ctx.params.homologationId;

    if (!homologationId) {
      ctx.response.status = 400;
      ctx.response.body = { error: "homologationId is required" };
      return;
    }

    const isPaid = await paymentRepository.hasPayment(homologationId);
    const totalPaid = await paymentRepository.getTotalPaid(homologationId);

    ctx.response.body = {
      isPaid,
      totalPaid,
    };
  } catch (error) {
    console.error("Error checking payment status:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error" };
  }
}

