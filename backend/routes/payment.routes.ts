import { Router } from "../deps.ts";
import {
  createPayment,
  getPaymentsByHomologation,
  getPaymentById,
  uploadReceipt,
  downloadReceipt,
  checkPaymentStatus,
} from "../controllers/paymentController.ts";

const paymentRouter = new Router();

// Public endpoints (no authentication required)

// Create a payment for a homologation
paymentRouter.post("/api/payments", createPayment);

// Get payments for a homologation
paymentRouter.get(
  "/api/payments/homologation/:homologationId",
  getPaymentsByHomologation,
);

// Check if homologation is paid
paymentRouter.get("/api/payments/check/:homologationId", checkPaymentStatus);

// Get payment by ID
paymentRouter.get("/api/payments/:id", getPaymentById);

// Upload receipt for a payment
paymentRouter.post("/api/payments/:id/receipt", uploadReceipt);

// Download receipt for a payment (public - no auth required)
paymentRouter.get("/api/payments/:id/receipt", downloadReceipt);

export default paymentRouter;

