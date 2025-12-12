# Homologation Tracking Page

## Overview

The Homologation Tracking Page allows users to view and follow the status of their vehicle homologation request. This page implements a **Wizard UI Pattern** to guide users through the homologation process step-by-step.

## Route

```
/homologation/[id]
```

Where `[id]` is the UUID of the homologation.

### Completed Summary View

```
/homologation/[id]/completed
```

Read-only page shown when the homologation is **Completed**. Presents a concise summary, photo
previews, payment receipt (if available), and attached documents with download links.

**Auto-redirect:** When a homologation reaches status **Completed**, requests to
`/homologation/[id]` automatically redirect the user to `/homologation/[id]/completed`.

## Access Control

- **Authentication Required:** No
- **Role Required:** None
- **Access Method:** Users access this page by:
  1. Submitting their DNI and phone number in the hero form on the landing page
  2. Being redirected to `/homologation/{id}` with their homologation ID

## Wizard UI Pattern

The page follows the [Wizard UI Pattern](https://www.eleken.co/blog-posts/wizard-ui-pattern-explained) best practices, inspired by Airbnb's Host Onboarding Wizard:

### Key Design Principles

1. **Step-by-step progression**: The process is divided into manageable sequential steps
2. **Progress indicators**: Visual stepper shows current position and completed steps
3. **User-friendly navigation**: Next/Back buttons and clickable step indicators
4. **Clear feedback**: Visual distinction between completed, current, and pending steps
5. **Responsive design**: Optimized for both desktop and mobile devices

### Wizard Steps

| Step | Name | Description | Status |
|------|------|-------------|--------|
| 1 | Información General | Trailer info form + Photo upload | ✅ Completed |
| 2 | Pago | Payment processing with MercadoPago | 🚧 In Progress |
| 3 | Revisión | Final review and approval | 🔜 Coming soon |

> 📋 See [Step 1 Form Plan](./step1-form-plan.md) for detailed implementation plan.

### Visual States

The wizard stepper uses visual cues to indicate step status:

- **Completed steps**: Green checkmark with emerald color scheme
- **Current step**: Amber/orange highlight with shadow effect
- **Pending steps**: Slate/gray with subtle hover effects

## Page Features

### Current Implementation

#### Step 1: Información General

Step 1 is being enhanced to include an editable form and photo upload. See [Step 1 Form Plan](./step1-form-plan.md) for full details.

**Trailer Information Form:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `trailerType` | Dropdown | ✅ | "Trailer", "Rolling Box", "Motorhome" |
| `trailerDimensions` | Text | ✅ | e.g., "4x2m" |
| `trailerNumberOfAxles` | Number | ✅ | 1-10 |
| `trailerLicensePlateNumber` | Text | ✅ | License plate number |

**Owner Information Form:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ownerFullName` | Text | ✅ | Full legal name |
| `ownerEmail` | Email | ❌ | Contact email |
| `ownerNationalId` | Read-only | - | Pre-filled from lookup |
| `ownerPhone` | Read-only | - | Pre-filled from lookup |

**Photo Upload:**
- Up to 6 photos
- Supported formats: JPEG, PNG, WebP, HEIC, PDF
- Max file size: 10MB per file
- Drag-and-drop or click to upload
- Thumbnail gallery with delete functionality
- Upload progress indicator
- **Reference photos section** showing acceptable photo types based on trailer type:
  - **Trailer**: Frontal, Lateral, Trasera, Ficha eléctrica (4 photos)
  - **Rolling Box**: Frontal, Lateral, Trasera, Rueda de auxilio, Ficha eléctrica (5 photos)
  - **Motorhome** (or no type): Frontal, Lateral, Chasis (3 photos)
- Reference photos update **immediately** when the trailer type selector changes (no save required)
- Reference photos are displayed in a responsive grid (2-5 columns) and are compact to fit all on the page

**Photo Management:**
- **Delete Photos**: Users can delete their own photos
  - Delete button appears on hover over each photo thumbnail
  - Confirmation dialog prevents accidental deletion
  - Loading state with spinner during deletion
  - Error handling with user feedback
  - Photos are immediately removed from the gallery after successful deletion

**Auto-Save Functionality:**
- Changes are automatically saved when navigating between steps
- Manual save button available for explicit saves
- Visual indicator shows when auto-save is in progress
- Navigation is disabled during save operations
- If save fails, navigation is prevented and error is shown

#### Step 2: Pago

Payment step with MercadoPago integration (initial implementation):

**Features:**
- Price display: Varies by trailer type
  - Trailer: ARS $1 (100 cents)
  - Rolling Box: ARS $2 (200 cents)
  - Motorhome: ARS $3 (300 cents)
- Price is automatically calculated based on `homologation.trailerType`
- Defaults to Trailer price if trailer type is not set
- MercadoPago payment button with logo
- Click handler to mark homologation as "Payed"
- Status indicators (paid/unpaid)
- Error handling and success messages
- Processing state during payment

**Current Implementation:**
- Payment button marks homologation as "Payed" immediately
- Full MercadoPago integration coming soon

#### Step 3: Revisión

Review and submission step for homologations in Draft status:

**Features:**
- Summary display showing all homologation data:
  - Trailer info (type, dimensions, axles, license plate)
  - Owner info (name, email, DNI, phone)
  - Photo count
  - Payment status
- Status-based content:
  - **Draft**: Shows submit button (if all prerequisites met)
  - **Pending Review**: Shows "awaiting review" message
  - **Approved/Rejected/Completed**: Shows final status message

**Prerequisites for Submission:**
- All required fields must be filled:
  - Trailer type, dimensions, axles, license plate
  - Owner full name, national ID, phone, email
- At least one photo uploaded
- Payment completed (`isPaid === true`)

**Note:** The backend API (`POST /api/homologations/:id/submit`) also validates these prerequisites and will return specific error messages if any are missing.

**Submit Flow:**
1. User clicks "Enviar para Revisión" button
2. System validates prerequisites
3. Calls `POST /api/homologations/:id/submit`
4. Status changes from "Draft" to "Pending Review"
5. Success message shown, button hidden

**Warnings Display:**
- Missing fields: Lists required fields, link to Step 1
- No photos: Warning with link to Step 1
- Payment incomplete: Warning with link to Step 2

**Documents Section:**
- Displays documents attached by admins
- Grouped by type:
  - **Comprobantes de Pago** (Payment Receipts)
  - **Documentos de Homologación** (Homologation Papers)
- Each document shows:
  - File name
  - File size (formatted: KB/MB)
  - Upload date (DD/MM/YYYY)
  - Description (if available)
- Actions available:
  - View (opens in new tab)
  - Download
- Empty state: "No hay documentos adjuntos aún"
- Loading state: Spinner while fetching
- Error state: Error message if fetch fails

**Status Badge Colors:**
| Status | Color | Label |
|--------|-------|-------|
| Draft | Amber | Borrador |
| Pending Review | Blue | En Revisión |
| Payed | Cyan | Pagado |
| Approved | Green | Aprobado |
| Rejected | Red | Rechazado |
| Completed | Green | Completado |
| Incomplete | Orange | Incompleto |

### Status Values

Possible homologation statuses (defined in `backend/types/homologation.types.ts`):
- `Draft` - Initial state, homologation created but not submitted
- `Pending Review` - Submitted and awaiting admin review
- `Payed` - Payment confirmed
- `Incomplete` - Missing required information
- `Approved` - Homologation approved
- `Rejected` - Homologation rejected
- `Completed` - Process completed

## User Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Landing Page                                   │
│                        (Hero Form)                                    │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  DNI: [____________]                                         │    │
│  │  Phone: [____________]                                       │    │
│  │  [Submit]                                                    │    │
│  └─────────────────────────────────────────────────────────────┘    │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼ POST /api/homologations/lookup
                             │
                  ┌──────────┴──────────┐
                  │  Lookup or Create   │
                  └──────────┬──────────┘
                             │
                             ▼ Redirect to /homologation/{id}
                             │
┌────────────────────────────┴────────────────────────────────────────┐
│                 Homologation Tracking Page                           │
│                   /homologation/[id]                                 │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    WIZARD STEPPER                            │    │
│  │                                                              │    │
│  │    (1) ──────── (2) ──────── (3)                            │    │
│  │    Info         Pago        Revisión                        │    │
│  │  General                                                     │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    STEP CONTENT                              │    │
│  │                                                              │    │
│  │  Current step's content displayed here                      │    │
│  │                                                              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │    [Anterior]       Paso 1 de 3          [Siguiente]        │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

## Technical Implementation

### Files

| File | Description |
|------|-------------|
| `frontend/src/app/homologation/[id]/page.tsx` | Main page component with wizard logic |
| `frontend/src/utils/api.ts` | API client with CRUD functions |
| `frontend/src/components/sections/HeroSection.tsx` | Form that redirects to tracking page |
| `frontend/src/components/homologation/TrailerInfoForm.tsx` | Trailer information form |
| `frontend/src/components/homologation/OwnerInfoForm.tsx` | Owner information form |
| `frontend/src/components/homologation/PhotoUpload.tsx` | Photo upload component with integrated gallery |
| `frontend/src/components/homologation/index.ts` | Component exports |

### Component Structure

```
HomologationTrackingPage
├── WizardStepper              # Horizontal step indicator (with auto-save disabled state)
├── GeneralInfoStep            # Step 1 content (with ref for auto-save)
│   ├── TrailerInfoForm        # Trailer details form
│   ├── OwnerInfoForm          # Owner details form  
│   └── PhotoUpload            # Drag-drop upload zone + thumbnail gallery
│       ├── Reference photos   # Conditionally shown based on trailerType
│       │                      # Trailer: 4 photos | Rolling Box: 5 photos | Motorhome: 3 photos
│       ├── Photo thumbnails   # With delete button on hover
│       └── Upload zone        # Drag-drop or click to upload
├── PaymentStep                # Step 2 content
│   ├── Price display          # Varies by trailer type (Trailer: $1, Rolling Box: $2, Motorhome: $3)
│   └── MercadoPago button     # Payment button with logo
└── ReviewStep                 # Step 3 content
    ├── Status badge           # Current homologation status
    ├── Summary section        # Trailer, owner, photos, payment info
    ├── Documents section      # Admin-attached documents (receipts, certificates)
    │   ├── Payment receipts   # Grouped by type
    │   └── Homologation papers # Grouped by type
    ├── Prerequisites warnings # Missing fields, photos, or payment
    └── Submit button          # "Enviar para Revisión" (Draft only)
```

### State Management

- `currentStep`: Tracks the active wizard step (1-3)
- `homologation`: Stores the fetched homologation data
- `photos`: Stores uploaded photos for the homologation
- `loading`: Loading state for API call
- `error`: Error state for API failures
- `isAutoSaving`: Tracks auto-save operation in progress
- Form state: Managed within `GeneralInfoStep` component with change tracking

### Navigation

- **Step clicking**: Users can click on any step indicator to navigate
- **Next/Back buttons**: Sequential navigation with disabled states at boundaries
- **Step counter**: Shows current position (e.g., "Paso 1 de 3")
- **Auto-save**: Changes are automatically saved when navigating between steps

### API Endpoints Used

#### GET /api/homologations/:id
Get homologation by ID

**Response:**
```json
{
  "id": "645772ae-8e88-41a4-b037-55c93c0f43bb",
  "ownerNationalId": "12345678",
  "ownerPhone": "+54 11 1234-5678",
  "ownerFullName": "John Doe",
  "ownerEmail": "john@example.com",
  "trailerType": "Trailer",
  "trailerDimensions": "4x2m",
  "trailerNumberOfAxles": 2,
  "trailerLicensePlateNumber": "ABC123",
  "status": "Draft",
  "version": 1,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

#### PATCH /api/homologations/:id
Update homologation fields (used for auto-save and manual save)

**Request Body:**
```json
{
  "trailerType": "Trailer",
  "trailerDimensions": "4x2m",
  "trailerNumberOfAxles": 2,
  "trailerLicensePlateNumber": "ABC123",
  "ownerFullName": "John Doe",
  "ownerEmail": "john@example.com"
}
```

#### POST /api/photos
Upload photo for homologation

**Request:** multipart/form-data
- `file`: The photo file
- `homologationId`: UUID of the homologation
- `isIdDocument`: boolean (optional)

**Response:**
```json
{
  "id": "photo-uuid",
  "homologationId": "homologation-uuid",
  "fileName": "photo.jpg",
  "filePath": "./uploads/homologation-uuid_timestamp.jpg",
  "fileSize": 1024000,
  "mimeType": "image/jpeg",
  "isIdDocument": false,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### GET /api/photos/homologation/:homologationId
Get all photos for a homologation

**Response:**
```json
{
  "data": [
    {
      "id": "photo-uuid",
      "homologationId": "homologation-uuid",
      "fileName": "photo.jpg",
      "filePath": "./uploads/homologation-uuid_timestamp.jpg",
      "fileSize": 1024000,
      "mimeType": "image/jpeg",
      "isIdDocument": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1
}
```

#### DELETE /api/photos/:id
Delete a photo (public - users can delete their own photos)

**Request:**
```
DELETE /api/photos/:id
```

**Note:** This endpoint is public (no authentication required). Users can delete photos from their own homologations.

**Response:**
**Success (200 OK)**
```json
{
  "message": "Photo deleted successfully"
}
```

**Error (404 Not Found)**
```json
{
  "error": "Photo not found"
}
```

**Error (500 Internal Server Error)**
```json
{
  "error": "Internal server error"
}
```

#### PATCH /api/homologations/:id/status
Update homologation status (used for payment)

**Request Body:**
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

#### GET /api/documents/homologation/:homologationId
Get documents attached by admins for a homologation (public endpoint)

**Request:**
```
GET /api/documents/homologation/:homologationId
```

**Response:**
**Success (200 OK)**
```json
{
  "data": [
    {
      "id": "uuid",
      "homologationId": "uuid",
      "documentType": "payment_receipt",
      "fileName": "recibo_2024.pdf",
      "filePath": "./uploads/doc_payment_receipt_uuid_1234567890.pdf",
      "fileSize": 245760,
      "mimeType": "application/pdf",
      "description": "Comprobante de pago MercadoPago",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1
}
```

**Error (404 Not Found)**
```json
{
  "error": "Homologation not found"
}
```

**Note:** Documents are served via `/uploads/:fileName` endpoint (same as photos).

#### POST /api/homologations/:id/submit
Submit homologation for review (changes status from Draft to Pending Review)

**Request:**
```
POST /api/homologations/:id/submit
```

**Prerequisites:**
- Status must be "Draft"
- Required fields must be filled:
  - `ownerFullName`
  - `ownerNationalId`
  - `ownerPhone`
  - `ownerEmail`
  - `trailerType`
- At least one photo uploaded

**Response:**
**Success (200 OK)**
```json
{
  "id": "homologation-uuid",
  "status": "Pending Review",
  "updatedAt": "2024-01-15T10:30:00Z",
  ...
}
```

**Error (400 Bad Request) - Missing Fields**
```json
{
  "error": "Missing required fields for submission: trailerType",
  "code": "MISSING_FIELDS"
}
```

**Error (400 Bad Request) - Invalid Status**
```json
{
  "error": "Cannot submit homologation with status: Pending Review",
  "code": "INVALID_STATUS"
}
```

### Component States

1. **Loading:** Shows spinner while fetching data
2. **Error:** Displays error message with icon if API fails
3. **Not Found:** Shows message if homologation doesn't exist
4. **Success:** Displays wizard with step content
5. **Auto-saving:** Shows floating indicator when saving changes during navigation

### Auto-Save Behavior

The wizard implements automatic saving when navigating between steps:

1. **Change Detection**: Form tracks changes by comparing current values with original data
2. **Navigation Trigger**: When user clicks Next, Back, or any step indicator:
   - System checks for unsaved changes
   - If changes exist, automatically saves before navigating
   - Shows "Guardando cambios..." indicator
   - Disables navigation during save
3. **Save Process**:
   - Validates form data (email format, etc.)
   - Calls `updateHomologation` API
   - Updates local state on success
   - Shows success message: "Cambios guardados automáticamente"
4. **Error Handling**:
   - If save fails, navigation is prevented
   - Error message is displayed
   - User can retry or fix validation errors
5. **Manual Save**: Users can also click "Guardar cambios" button to save explicitly

This ensures no data loss when users navigate between steps.

## Styling

The page uses Tailwind CSS with the project's dark theme:

- **Background:** `bg-slate-950` (dark)
- **Cards:** `bg-slate-900/50` with `border-slate-800`
- **Accent colors:** Blue (primary, matching main page), Emerald (success)
- **Typography:** System fonts with slate color variations
- **Animations:** `animate-in` for smooth step transitions

## Future Enhancements

Planned features for future phases:

### Step 1: Información General (✅ Completed)
- [x] Wizard stepper UI
- [x] TrailerInfoForm component
- [x] OwnerInfoForm component  
- [x] PhotoUpload component with drag-drop
- [x] PhotoGallery component (integrated in PhotoUpload)
- [x] Photo deletion functionality
- [x] Reference photos section (trailer-type-based: Trailer, Rolling Box, or Motorhome)
- [x] Form validation
- [x] API integration (updateHomologation, uploadPhoto, getPhotos, deletePhoto, getDocuments)
- [x] Auto-save functionality on step navigation
- [x] Manual save button
- [x] Change tracking and visual feedback

> 📋 See [Step 1 Form Plan](./step1-form-plan.md) for full implementation details.

### Step 2: Pago (In Progress)
- [x] Payment UI with price display
- [x] MercadoPago button with logo
- [x] Status update to "Payed" on click
- [x] Payment status indicators
- [ ] Full MercadoPago gateway integration
- [ ] Payment webhook handling
- [ ] Invoice/receipt generation

### Step 3: Revisión (✅ Completed)
- [x] Submit for review button (Draft status only)
- [x] Prerequisites validation (fields, photos, payment)
- [x] Status-based content display
- [x] Summary of homologation data (trailer, owner, photos, payment)
- [x] Warnings with navigation links to fix issues
- [x] Status badge with color coding
- [ ] Document preview
- [ ] Status timeline
- [ ] Admin comments display
- [ ] Certificate download (upon approval)

### General Improvements
- [ ] Email/SMS notifications for status changes
- [ ] Progress persistence (resume from where user left off)
- [ ] Real-time status updates via WebSocket

## Security Considerations

1. **URL Security:** The homologation ID is a UUID, making it difficult to guess
2. **Public Access:** No sensitive information is exposed beyond what the user already provided (DNI, phone)
3. **Future:** Consider adding verification (e.g., require DNI + phone to view details)

## Accessibility

- Keyboard navigation support for step indicators
- Focus states on interactive elements
- Semantic HTML structure
- Color contrast meets WCAG guidelines

## Related Documentation

- [Step 1 Form Plan](./step1-form-plan.md) - Detailed implementation plan for Step 1
- [Photo Examples Plan](./photo-examples-plan.md) - Example photos feature
- [Review Step Plan](./review-step-plan.md) - Implementation plan for Step 3 submit functionality
- [Homologation Overview](../backend/homologation-overview.md)
- [API Endpoints](../api/endpoints.md)
- [Landing Page Plan](./landing-page-plan.md)
- [Wizard UI Pattern Reference](https://www.eleken.co/blog-posts/wizard-ui-pattern-explained)
