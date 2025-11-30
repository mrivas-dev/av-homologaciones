# Payment Step Implementation Plan

## Overview

This document outlines the payment step implementation for the homologation wizard, using MercadoPago as the payment gateway.

## Current Implementation (Phase 1)

### Features Implemented

1. **Price Display**
   - Shows ARS $1 (configurable constant)
   - Formatted with locale formatting
   - Displayed in a card with clear typography

2. **MercadoPago Button**
   - Branded button with MercadoPago logo (MP circle)
   - Uses MercadoPago brand color (#009EE3)
   - Hover effects and shadows
   - Disabled state during processing

3. **Payment Processing**
   - Click handler updates homologation status to "Payed"
   - Uses `updateHomologationStatus` API endpoint
   - Loading state with spinner
   - Error handling with user feedback

4. **Status Indicators**
   - Shows "Pagado" badge when payment is complete
   - Hides payment button after successful payment
   - Success message displayed after payment

## API Integration

### Endpoint Used

```
PATCH /api/homologations/:id/status
```

**Request:**
```json
{
  "status": "Payed",
  "reason": "Payment processed via MercadoPago"
}
```

**Response:**
```json
{
  "id": "homologation-uuid",
  "status": "Payed",
  "updatedAt": "2024-01-15T10:30:00Z",
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
- Price display card
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
   - Handle payment callbacks

2. **Payment Flow**
   - Redirect to MercadoPago checkout
   - Handle payment success/failure webhooks
   - Update status based on payment result
   - Store payment transaction ID

3. **Additional Features**
   - Payment history
   - Invoice/receipt generation
   - Payment retry for failed payments
   - Refund handling (admin)

### Configuration

- Make price configurable (environment variable or database)
- Support multiple payment methods
- Payment currency selection
- Tax calculation

## Status Transitions

The payment step transitions the homologation status:

```
Draft → Pending Review → Payed → Approved → Completed
```

**Current Flow:**
- User completes Step 1 (Información General)
- User proceeds to Step 2 (Pago)
- User clicks "Pagar con MercadoPago"
- Status updates to "Payed"
- User can proceed to Step 3 (Revisión)

## Error Handling

- Network errors: Display error message, allow retry
- Invalid status transitions: Show appropriate error
- Payment failures: Allow retry, show error details

## Security Considerations

- Payment status updates should be validated server-side
- Prevent duplicate payments
- Verify payment amount matches expected amount
- Audit log all payment status changes

## Related Documentation

- [Homologation Tracking Page](./homologation-tracking-page.md)
- [API Endpoints](../api/endpoints.md)
- [MercadoPago Integration Guide](https://www.mercadopago.com.ar/developers)

