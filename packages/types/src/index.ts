import { z } from 'zod';

// User schemas
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  full_name: z.string().optional(),
  avatar_url: z.string().optional(),
  role: z.enum(['user', 'admin']).default('user'),
  created_at: z.string(),
  updated_at: z.string(),
});

export type User = z.infer<typeof UserSchema>;

// Vehicle schemas
export const VehicleSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  type: z.enum(['trailer', 'rolling_box', 'motorhome']),
  brand: z.string(),
  model: z.string(),
  year: z.number(),
  vin: z.string().optional(),
  license_plate: z.string().optional(),
  axles: z.number().optional(),
  length: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  max_weight: z.number().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Vehicle = z.infer<typeof VehicleSchema>;

// Homologation schemas
export const HomologationStatusSchema = z.enum([
  'draft',
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'completed'
]);

export const HomologationSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  vehicle_id: z.string(),
  status: HomologationStatusSchema,
  submission_date: z.string().optional(),
  review_date: z.string().optional(),
  completion_date: z.string().optional(),
  notes: z.string().optional(),
  documents: z.array(z.string()).optional(),
  payment_id: z.string().optional(),
  payment_status: z.enum(['pending', 'paid', 'refunded']).default('pending'),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Homologation = z.infer<typeof HomologationSchema>;
export type HomologationStatus = z.infer<typeof HomologationStatusSchema>;

// Document schemas
export const DocumentSchema = z.object({
  id: z.string(),
  homologation_id: z.string(),
  name: z.string(),
  type: z.enum(['id_card', 'vehicle_title', 'insurance', 'safety_certificate', 'other']),
  file_url: z.string(),
  file_size: z.number(),
  mime_type: z.string(),
  uploaded_at: z.string(),
});

export type Document = z.infer<typeof DocumentSchema>;

// Payment schemas
export const PaymentSchema = z.object({
  id: z.string(),
  homologation_id: z.string(),
  amount: z.number(),
  currency: z.string().default('ARS'),
  mercadopago_payment_id: z.string().optional(),
  mercadopago_preference_id: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'refunded']),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Payment = z.infer<typeof PaymentSchema>;

// API Response schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export type ApiResponse = z.infer<typeof ApiResponseSchema>;

// Form schemas
export const HomologationFormSchema = z.object({
  vehicle: z.object({
    type: z.enum(['trailer', 'rolling_box', 'motorhome']),
    brand: z.string().min(1, 'Brand is required'),
    model: z.string().min(1, 'Model is required'),
    year: z.number().min(1900).max(new Date().getFullYear() + 1),
    vin: z.string().optional(),
    license_plate: z.string().optional(),
    axles: z.number().positive().optional(),
    length: z.number().positive().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    max_weight: z.number().positive().optional(),
  }),
  documents: z.array(z.object({
    name: z.string(),
    type: z.enum(['id_card', 'vehicle_title', 'insurance', 'safety_certificate', 'other']),
    file: z.any(),
  })).optional(),
});

export type HomologationFormData = z.infer<typeof HomologationFormSchema>;

// Redux state schemas
export const AuthStateSchema = z.object({
  user: UserSchema.optional(),
  session: z.object({
    access_token: z.string(),
    refresh_token: z.string(),
    expires_at: z.number(),
  }).optional(),
  loading: z.boolean(),
  error: z.string().optional(),
});

export type AuthState = z.infer<typeof AuthStateSchema>;

export const HomologationsStateSchema = z.object({
  homologations: z.array(HomologationSchema),
  currentHomologation: HomologationSchema.optional(),
  loading: z.boolean(),
  error: z.string().optional(),
});

export type HomologationsState = z.infer<typeof HomologationsStateSchema>;
