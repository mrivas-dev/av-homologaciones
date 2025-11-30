# Step 1: Información General - Implementation Plan

## Overview

This document outlines the plan to enhance Step 1 of the homologation wizard with:
1. An editable form for trailer and owner information
2. Photo upload functionality (up to 6 photos)

## Current State

✅ **Implementation Complete**: Step 1 now includes a fully functional form with trailer information, owner information, photo upload, and auto-save functionality.

The form allows users to:
- Edit trailer details (type, dimensions, axles, license plate)
- Edit owner information (name, email)
- Upload up to 6 photos with drag-and-drop
- Automatically save changes when navigating between steps
- Manually save changes at any time

## Backend API Analysis

### Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `PATCH /api/homologations/:id` | PATCH | Update homologation fields |
| `POST /api/homologations/:id/submit` | POST | Submit for review |
| `POST /api/photos` | POST | Upload photo (multipart/form-data) |
| `GET /api/photos/homologation/:id` | GET | List photos for homologation |
| `DELETE /api/photos/:id` | DELETE | Delete photo (public - users can delete their own photos) |

### Photo Upload Requirements

- **Max file size:** 10MB (configurable via `MAX_FILE_SIZE` env)
- **Allowed formats:** JPEG, PNG, WebP, HEIC, HEIF, PDF
- **Required fields:** `homologationId`, `file`, `isIdDocument` (optional)
- **Max photos:** 6 per homologation

## Data Model

### Trailer Information Fields

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `trailerType` | Enum | Yes | "Trailer", "Rolling Box", "Motorhome" |
| `trailerDimensions` | String | Yes | Format: "4M x 2M x 1.5M" (auto-formatted from separate numeric inputs) |
| `trailerNumberOfAxles` | Number | Yes | Positive integer |
| `trailerLicensePlateNumber` | String | Yes | Min 1 char |

### Owner Information Fields

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `ownerFullName` | String | Yes | Min 1 char |
| `ownerNationalId` | String | Pre-filled | Already provided at creation |
| `ownerPhone` | String | Pre-filled | Already provided at creation |
| `ownerEmail` | String | No | Valid email format |

### Photo Type

```typescript
interface Photo {
  id: string;
  homologationId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  isIdDocument: boolean;
  createdAt: Date;
}
```

## Implementation Tasks

### Phase 1: API Layer (Frontend)

1. **Add `updateHomologation` function**
   - PATCH request to update homologation fields
   - Handle validation errors

2. **Add `uploadPhoto` function**
   - Multipart form data upload
   - Progress tracking (optional)

3. **Add `getPhotos` function**
   - Fetch photos for homologation

4. **Add `Photo` interface to types**

### Phase 2: Form Component

1. **Create `TrailerInfoForm` component**
   - Form fields for trailer information
   - Dropdown for trailer type selection
   - Input validation with error messages
   - Auto-save on blur (optional) or save button

2. **Create `OwnerInfoForm` component**
   - Pre-filled DNI and phone (read-only)
   - Editable full name and email
   - Input validation
   - Lock icons on read-only fields

### Phase 3: Photo Upload Component

1. **Create `PhotoUpload` component**
   - Example photos section (Frontal, Lateral, Chasis)
   - Drag-and-drop zone
   - Click to select files
   - Preview thumbnails
   - Upload progress indicator
   - Delete functionality with confirmation dialog
   - Delete button appears on hover
   - Loading state during deletion
   - 6-photo limit enforcement
   - File type/size validation on client side

2. **Create `PhotoGallery` component**
   - Display uploaded photos
   - Thumbnail grid layout
   - Click to view full size (optional)
   - Delete button per photo

### Phase 4: Integration

1. **Update `GeneralInfoStep` component**
   - Integrate form components
   - Integrate photo components
   - Handle form state
   - Save functionality
   - Loading states

2. **Update wizard navigation**
   - Auto-save changes before navigating between steps
   - Validate form before proceeding to Step 2
   - Show validation errors if incomplete
   - Disable navigation during save operations
   - Visual feedback during auto-save

## UI/UX Design

### Form Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Información del Trailer                                    │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │ Tipo de Trailer  ▼  │  │ Patente             │          │
│  └─────────────────────┘  └─────────────────────┘          │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Dimensiones (Largo x Ancho x Alto)                  │  │
│  │  ┌──────┐  ┌──────┐  ┌──────┐                       │  │
│  │  │ Largo│  │Ancho │  │ Alto │                       │  │
│  │  └──────┘  └──────┘  └──────┘                       │  │
│  └─────────────────────────────────────────────────────┘  │
│  ┌─────────────────────┐                                  │
│  │ Número de Ejes      │                                  │
│  └─────────────────────┘                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Información del Propietario                                │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │ Nombre Completo     │  │ Email               │          │
│  └─────────────────────┘  └─────────────────────┘          │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │ DNI/CUIT (readonly) │  │ Teléfono (readonly) │          │
│  └─────────────────────┘  └─────────────────────┘          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Fotos del Trailer (máximo 6)                               │
│  Formatos: JPG, PNG, WebP, HEIC, PDF • Max 10MB            │
│                                                              │
│  Ejemplos de fotos aceptadas:                               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                    │
│  │ Frontal │  │ Lateral │  │ Chasis  │                    │
│  │ [img]   │  │ [img]   │  │ [img]   │                    │
│  └─────────┘  └─────────┘  └─────────┘                    │
│                                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐│
│  │  📷     │  │  📷     │  │  📷     │  │  + Agregar      ││
│  │  img1   │  │  img2   │  │  img3   │  │    Foto         ││
│  └─────────┘  └─────────┘  └─────────┘  └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Visual States

1. **Empty field** - Default border
2. **Focused field** - Amber border with glow
3. **Valid field** - Green checkmark
4. **Invalid field** - Red border + error message
5. **Read-only field** - Gray background

### Photo Upload States

1. **Example photos** - Three example thumbnails (Frontal, Lateral, Chasis) with labels
2. **Empty slot** - Dashed border with "+" icon
3. **Uploading** - Progress bar/spinner
4. **Uploaded** - Thumbnail with delete button (appears on hover)
5. **Deleting** - Loading state with spinner during deletion
6. **Error** - Red border with error message

## Validation Rules

### Client-side Validation

```typescript
const validationRules = {
  trailerType: { required: true },
  trailerDimensions: { required: true, format: 'numeric values in format "4M x 2M x 1.5M"' },
  trailerNumberOfAxles: { required: true, min: 1, max: 10 },
  trailerLicensePlateNumber: { required: true, pattern: /^[A-Z0-9]+$/ },
  ownerFullName: { required: true, minLength: 2 },
  ownerEmail: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
};
```

### Photo Validation

```typescript
const photoValidation = {
  maxFiles: 6,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'],
};
```

## File Structure

```
frontend/src/
├── app/homologation/[id]/
│   └── page.tsx                    # Updated with new components
├── components/
│   └── homologation/               # New folder
│       ├── TrailerInfoForm.tsx     # Trailer information form
│       ├── OwnerInfoForm.tsx       # Owner information form
│       ├── PhotoUpload.tsx         # Photo upload component
│       └── PhotoGallery.tsx        # Photo display component
└── utils/
    └── api.ts                      # Updated with new API functions
```

## API Functions to Add

```typescript
// frontend/src/utils/api.ts

// Update homologation
export async function updateHomologation(
  id: string,
  data: Partial<HomologationUpdate>
): Promise<Homologation>;

// Upload photo
export async function uploadPhoto(
  homologationId: string,
  file: File,
  isIdDocument?: boolean
): Promise<Photo>;

// Get photos for homologation
export async function getPhotos(
  homologationId: string
): Promise<{ data: Photo[]; total: number }>;

// Delete photo (for future admin use)
export async function deletePhoto(
  id: string,
  token: string
): Promise<void>;
```

## Implementation Order

1. **API Layer** (~1 hour)
   - Add types and API functions
   - Test with backend

2. **Form Components** (~2 hours)
   - TrailerInfoForm
   - OwnerInfoForm
   - Form validation logic

3. **Photo Components** (~2 hours)
   - PhotoUpload with drag-drop
   - PhotoGallery with thumbnails
   - Upload progress

4. **Integration** (~1.5 hours)
   - Update GeneralInfoStep
   - Wire up save functionality
   - Add loading/error states
   - Implement auto-save on navigation
   - Add change tracking

5. **Testing & Polish** (~1 hour)
   - Test all form fields
   - Test photo upload/delete
   - Mobile responsiveness
   - Error handling

## Success Criteria

- [x] All trailer fields are editable and validated
- [x] Owner full name and email are editable
- [x] DNI and phone are displayed but read-only
- [x] Photos can be uploaded (up to 6)
- [x] Photos display as thumbnails
- [x] Upload progress is visible
- [x] Example photos section showing acceptable photo types
- [x] Delete functionality with confirmation dialog
- [x] Delete button appears on hover
- [x] Loading state during deletion
- [x] Form validates before proceeding to Step 2
- [x] Changes are saved to the backend
- [x] Auto-save on step navigation
- [x] Manual save button available
- [x] Mobile-responsive design
- [x] Error states are handled gracefully

## Auto-Save Implementation

### How It Works

1. **Change Detection**: The form tracks changes by comparing current form values with the original homologation data
2. **Navigation Trigger**: When user clicks Next, Back, or any step indicator, the system checks for unsaved changes
3. **Auto-Save Process**:
   - If changes exist, shows "Guardando cambios..." indicator
   - Disables navigation buttons and stepper during save
   - Validates form (email format, etc.)
   - Saves changes via `updateHomologation` API
   - If successful, navigates to target step
   - If failed, stays on current step and shows error
4. **Visual Feedback**:
   - Floating toast notification during save
   - Success message: "Cambios guardados automáticamente"
   - Error message if save fails
   - Manual save button shows "Guardar cambios" when changes exist

### Technical Details

- Uses `useImperativeHandle` and `forwardRef` to expose save methods from `GeneralInfoStep`
- `autoSaveAndNavigate()` function handles the save-and-navigate logic
- Only validates email format for auto-save (other validations are for manual save)
- Navigation is prevented if save fails to prevent data loss

## Related Documentation

- [Homologation Tracking Page](./homologation-tracking-page.md)
- [Photo Examples Plan](./photo-examples-plan.md) - Implementation details for example photos
- [API Endpoints](../api/endpoints.md)
- [Database Schema](../backend/database-schema.md)

