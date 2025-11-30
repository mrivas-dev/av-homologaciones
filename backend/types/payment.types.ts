import { z } from "zod";

// Payment Gateway enum
export const PaymentGateway = {
  MERCADOPAGO: "MercadoPago",
} as const;

// Base schema for Payment (no updatedAt/updatedBy - payments are immutable)
const PaymentBaseSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date().default(() => new Date()),
  createdBy: z.string().uuid(),
  isDeleted: z.boolean().default(false),
  deletedAt: z.date().nullable().default(null),
  deletedBy: z.string().uuid().nullable().default(null),
});

// Payment Schema
export const PaymentSchema = PaymentBaseSchema.extend({
  homologationId: z.string().uuid(),
  timestamp: z.date().default(() => new Date()),
  amount: z.number().int().positive().describe("Amount in cents"),
  receiptPath: z.string().nullable().default(null),
  paymentGateway: z.nativeEnum(PaymentGateway).default(PaymentGateway.MERCADOPAGO),
});

export type Payment = z.infer<typeof PaymentSchema>;

// API Request Types
export type CreatePaymentRequest = {
  homologationId: string;
  amount: number;
  paymentGateway?: typeof PaymentGateway[keyof typeof PaymentGateway];
};

export type PaymentResponse = Payment & {
  receiptUrl?: string;
};

