# Review Step (Step 3) - Implementation Plan

## Overview

The Review Step allows users to review their homologation data and submit it for admin review when in Draft status. This document outlines the implementation plan for the submit functionality.

## Implementation Status: ✅ Completed

The Review Step has been fully implemented with all planned features, including:
- Submit for review functionality
- Documents display (payment receipts and homologation papers)
- Status-based content display
- Summary section
- Prerequisites validation

## Target State

A fully functional review step with:
1. Summary display of all homologation data
2. Prerequisites validation
3. Submit button for Draft status homologations
4. Status-appropriate messages for other states

## API Endpoint

**Existing endpoint:** `POST /api/homologations/:id/submit`

**Frontend function:** `submitHomologation(id)` in `frontend/src/utils/api.ts`

```typescript
export async function submitHomologation(id: string): Promise<Homologation> {
  const response = await fetch(`${API_BASE_URL}/api/homologations/${id}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  // ... error handling
  return data as Homologation;
}
```

## Implementation Tasks

### 1. Update ReviewStep Component

**Location:** `frontend/src/app/homologation/[id]/page.tsx`

**Props needed:**
```typescript
interface ReviewStepProps {
  homologation: Homologation;
  photos: Photo[];
  requiredFieldsValidation: RequiredFieldsValidation;
  onHomologationUpdate: (data: Homologation) => void;
  onGoToStep1: () => void;
  onGoToStep2: () => void;
}
```

**State:**
```typescript
const [isSubmitting, setIsSubmitting] = useState(false);
const [submitError, setSubmitError] = useState<string | null>(null);
const [submitSuccess, setSubmitSuccess] = useState(false);
```

### 2. UI Components

#### Status Badge
Display current homologation status with appropriate color:
- Draft: Amber/Yellow
- Pending Review: Blue
- Payed: Cyan
- Approved: Green
- Rejected: Red
- Completed: Green
- Incomplete: Orange

#### Summary Section
Display key information:
- **Trailer Info:** Type, Dimensions, Axles, License Plate
- **Owner Info:** Full Name, Email, DNI, Phone
- **Photos:** Count and thumbnails
- **Payment:** Status (paid/unpaid)

#### Prerequisites Warnings
Conditional warnings:
1. Missing required fields → Link to Step 1
2. No photos uploaded → Link to Step 1
3. Payment incomplete → Link to Step 2

#### Submit Button
- Only visible when status === 'Draft' AND all prerequisites met
- "Enviar para Revisión" label
- Loading state during submission
- Disabled when submitting

#### Status Messages
For non-Draft statuses:
- **Pending Review:** "Tu solicitud está siendo revisada por nuestro equipo"
- **Payed:** "Pago recibido. Tu solicitud será procesada pronto"
- **Approved:** "¡Felicitaciones! Tu homologación ha sido aprobada"
- **Rejected:** "Tu solicitud fue rechazada" + reason if available
- **Completed:** "Proceso completado"

### 3. Submit Handler

```typescript
const handleSubmit = async () => {
  if (isSubmitting || homologation.status !== 'Draft') return;
  
  setIsSubmitting(true);
  setSubmitError(null);
  
  try {
    const updated = await submitHomologation(homologation.id);
    onHomologationUpdate(updated);
    setSubmitSuccess(true);
  } catch (err) {
    const message = err instanceof ApiError 
      ? err.message 
      : 'Error al enviar la solicitud';
    setSubmitError(message);
  } finally {
    setIsSubmitting(false);
  }
};
```

### 4. Update Page Component

Modify `renderStepContent()` to pass required props:

```typescript
case 3:
  return (
    <ReviewStep
      homologation={homologation}
      photos={photos}
      requiredFieldsValidation={requiredFieldsValidation}
      onHomologationUpdate={handleHomologationUpdate}
      onGoToStep1={handleGoToStep1}
      onGoToStep2={() => setCurrentStep(2)}
    />
  );
```

## UI Design

```
┌─────────────────────────────────────────────────────────────────┐
│                        Revisión Final                            │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Estado: [Draft ●]                                        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  📋 Resumen de la Solicitud                               │  │
│  │                                                            │  │
│  │  Información del Trailer                                  │  │
│  │  ├── Tipo: Trailer                                        │  │
│  │  ├── Dimensiones: 4M x 2M x 1.5M                         │  │
│  │  ├── Número de Ejes: 2                                   │  │
│  │  └── Patente: ABC123                                     │  │
│  │                                                            │  │
│  │  Información del Propietario                              │  │
│  │  ├── Nombre: Juan García                                  │  │
│  │  ├── Email: juan@example.com                             │  │
│  │  ├── DNI/CUIT: 12345678                                  │  │
│  │  └── Teléfono: +54 9 11 1234-5678                        │  │
│  │                                                            │  │
│  │  Documentación                                            │  │
│  │  └── Fotos: 4 de 6                                       │  │
│  │                                                            │  │
│  │  Pago                                                     │  │
│  │  └── Estado: ✓ Completado                                │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  [If prerequisites not met: Warning boxes with links]           │
│                                                                  │
│         ┌─────────────────────────────────────┐                 │
│         │      Enviar para Revisión           │                 │
│         └─────────────────────────────────────┘                 │
│                                                                  │
│  Nota: Una vez enviado, no podrás modificar la información     │
└─────────────────────────────────────────────────────────────────┘
```

## Validation Logic

```typescript
interface SubmissionValidation {
  canSubmit: boolean;
  warnings: {
    type: 'fields' | 'photos' | 'payment';
    message: string;
    action: () => void;
  }[];
}

function validateSubmission(
  homologation: Homologation,
  photos: Photo[],
  requiredFieldsValidation: RequiredFieldsValidation
): SubmissionValidation {
  const warnings = [];
  
  // Check required fields
  if (!requiredFieldsValidation.isComplete) {
    warnings.push({
      type: 'fields',
      message: `Campos incompletos: ${requiredFieldsValidation.missingFields.join(', ')}`,
      action: onGoToStep1,
    });
  }
  
  // Check photos
  if (photos.length === 0) {
    warnings.push({
      type: 'photos',
      message: 'Debes subir al menos una foto del trailer',
      action: onGoToStep1,
    });
  }
  
  // Check payment
  if (!homologation.isPaid) {
    warnings.push({
      type: 'payment',
      message: 'El pago debe estar completado',
      action: onGoToStep2,
    });
  }
  
  return {
    canSubmit: homologation.status === 'Draft' && warnings.length === 0,
    warnings,
  };
}
```

## Success Criteria

- [x] Summary displays all relevant homologation data
- [x] Status badge shows correct color and label
- [x] Submit button only appears for Draft status
- [x] Prerequisites warnings shown with correct links
- [x] Submit handler calls API correctly
- [x] Success state shows confirmation message
- [x] Error state shows error message
- [x] Non-Draft statuses show appropriate messages
- [x] Loading state during submission
- [x] Navigation to steps works correctly

## Related Documents

- [Homologation Tracking Page](./homologation-tracking-page.md)
- [Review Step Documents Plan](./review-step-documents-plan.md) - Documents display implementation
- [API Endpoints](../api/endpoints.md)
- [Status Transitions](../api/endpoints.md#status-transitions)

