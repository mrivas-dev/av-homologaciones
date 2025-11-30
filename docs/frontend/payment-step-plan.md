# Payment Step Implementation Plan

## Overview

This document outlines the payment step implementation for the homologation wizard, using MercadoPago as the payment gateway.

## Architecture

### Key Design Decisions

**Payment is independent of homologation status.** A homologation can be paid or unpaid regardless of its workflow status. This separation allows:

- Flexibility in the payment timing
- Multiple payment records per homologation (future support for partial payments)
- Receipt upload/download at any time after payment
- Clear audit trail of all payment activity

### Database Schema

A dedicated `payments` table stores all payment records:

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| homologation_id | UUID | Foreign key to homologations |
| timestamp | TIMESTAMP | When payment was made |
| amount | INT | Amount in cents (100 = $1.00) |
| receipt_path | VARCHAR(512) | Path to receipt file (nullable) |
| payment_gateway | VARCHAR(50) | Default: 'MercadoPago' |

## Current Implementation

### Features Implemented

1. **Price Display**
   - Shows ARS $1 (100 cents, configurable constant)
   - Formatted with locale formatting
   - Displayed in a card with clear typography
   - Shows total paid amount when payment exists

2. **MercadoPago Button**
   - Branded button with MercadoPago logo (MP circle)
   - Uses MercadoPago brand color (#009EE3)
   - Hover effects and shadows
   - Disabled state during processing
   - Hidden after successful payment

3. **Payment Processing**
   - Click handler creates a payment record via `POST /api/payments`
   - Loading state with spinner
   - Error handling with user feedback
   - Refreshes homologation data after payment

4. **Status Indicators**
   - Shows "Pagado" badge when payment exists
   - Displays total paid amount
   - Success message displayed after payment

5. **Receipt Management**
   - Receipt can be uploaded later via `POST /api/payments/:id/receipt`
   - Receipt can be downloaded publicly via `GET /api/payments/:id/receipt`
   - Supports JPEG, PNG, WebP, and PDF files

## API Integration

### Payment Endpoints

**Create Payment:**
```
POST /api/payments
Content-Type: application/json

{
  "homologationId": "uuid",
  "amount": 100,
  "paymentGateway": "MercadoPago"
}
```

**Response:**
```json
{
  "id": "payment-uuid",
  "homologationId": "homologation-uuid",
  "timestamp": "2024-11-30T10:00:00.000Z",
  "amount": 100,
  "receiptPath": null,
  "paymentGateway": "MercadoPago"
}
```

**Check Payment Status:**
```
GET /api/payments/check/:homologationId
```

**Response:**
```json
{
  "isPaid": true,
  "totalPaid": 100
}
```

**Upload Receipt:**
```
POST /api/payments/:id/receipt
Content-Type: multipart/form-data

file: <image or PDF>
```

**Download Receipt (Public):**
```
GET /api/payments/:id/receipt
```

### Homologation Response

The homologation endpoint now includes payment information:

```json
{
  "id": "uuid",
  "status": "Draft",
  "isPaid": true,
  "payments": [...],
  "totalPaid": 100,
  ...
}
```

## UI Components

### PaymentStep Component

```typescript
interface PaymentStepProps {
  homologation: Homologation;
  onHomologationUpdate: (data: Homologation) => void;
}
```

**Features:**
- Price display card with total paid
- MercadoPago payment button
- Status indicators (paid/unpaid)
- Error and success messages
- Processing state management

## Future Enhancements (Phase 2)

### Full MercadoPago Integration

1. **Payment Gateway Setup**
   - MercadoPago SDK integration
   - Create payment preference
   - Generate payment link/QR code
   - Handle payment callbacks (webhooks)

2. **Payment Flow**
   - Redirect to MercadoPago checkout
   - Handle payment success/failure webhooks
   - Store MercadoPago transaction ID
   - Automatic receipt generation

3. **Additional Features**
   - Payment history view
   - Invoice/receipt PDF generation
   - Payment retry for failed payments
   - Refund handling (admin)
   - Partial payment support

### Configuration

- Make price configurable (environment variable or database)
- Support multiple payment methods
- Payment currency selection
- Tax calculation

## Payment vs Status Flow

**Important:** Payment is now separate from the status workflow.

```
Homologation Status Flow:
Draft → Pending Review → Approved → Completed
       ↓
       Incomplete ← (can return to Pending Review)
       ↓
       Rejected (terminal)

Payment Flow (independent):
Unpaid → Paid (via /api/payments)
              ↓
         Receipt uploaded (optional)
```

A homologation can be paid at any point during the workflow. The `isPaid` field indicates whether at least one payment exists.

## Error Handling

- Network errors: Display error message, allow retry
- Payment failures: Allow retry, show error details
- Receipt upload errors: Show file validation errors
- Graceful fallback if payment service is unavailable

## Security Considerations

- All payment endpoints are currently public (no auth required)
- Receipt download is public to allow end-user access
- Payment records are immutable (no updates except receipt path)
- Audit log tracks all payment creation and receipt uploads
- File upload validation (type, size limits)
- Directory traversal prevention for file serving

## Related Documentation

- [Database Schema](../backend/database-schema.md) - Payments table definition
- [API Endpoints](../api/endpoints.md) - Full API reference
- [Homologation Tracking Page](./homologation-tracking-page.md)
- [MercadoPago Integration Guide](https://www.mercadopago.com.ar/developers)

