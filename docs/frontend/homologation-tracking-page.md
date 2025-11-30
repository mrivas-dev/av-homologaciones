# Homologation Tracking Page

## Overview

The Homologation Tracking Page allows users to view and follow the status of their vehicle homologation request. This page implements a **Wizard UI Pattern** to guide users through the homologation process step-by-step.

## Route

```
/homologation/[id]
```

Where `[id]` is the UUID of the homologation.

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
| 1 | Información General | Display homologation data | ✅ Implemented |
| 2 | Pago | Payment processing | 🔜 Coming soon |
| 3 | Revisión | Final review and approval | 🔜 Coming soon |

### Visual States

The wizard stepper uses visual cues to indicate step status:

- **Completed steps**: Green checkmark with emerald color scheme
- **Current step**: Amber/orange highlight with shadow effect
- **Pending steps**: Slate/gray with subtle hover effects

## Page Features

### Current Implementation

#### Step 1: Información General
Displays all available homologation information:
- ID (UUID)
- Status
- Owner phone number
- Owner national ID (DNI/CUIT)
- Owner full name (if available)
- Owner email (if available)
- Trailer type (if available)
- Trailer dimensions (if available)
- Number of axles (if available)
- License plate (if available)
- Created/Updated timestamps
- Version number

#### Step 2: Pago
Placeholder for payment functionality (coming soon)

#### Step 3: Revisión
Placeholder for review functionality (coming soon)

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
| `frontend/src/utils/api.ts` | API client with `getHomologationById()` |
| `frontend/src/components/sections/HeroSection.tsx` | Form that redirects to tracking page |

### Component Structure

```
HomologationTrackingPage
├── WizardStepper         # Horizontal step indicator
├── GeneralInfoStep       # Step 1 content
├── PaymentStep           # Step 2 content (placeholder)
└── ReviewStep            # Step 3 content (placeholder)
```

### State Management

- `currentStep`: Tracks the active wizard step (1-3)
- `homologation`: Stores the fetched homologation data
- `loading`: Loading state for API call
- `error`: Error state for API failures

### Navigation

- **Step clicking**: Users can click on any step indicator to navigate
- **Next/Back buttons**: Sequential navigation with disabled states at boundaries
- **Step counter**: Shows current position (e.g., "Paso 1 de 3")

### API Endpoint Used

```
GET /api/homologations/:id
```

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

### Component States

1. **Loading:** Shows spinner while fetching data
2. **Error:** Displays error message with icon if API fails
3. **Not Found:** Shows message if homologation doesn't exist
4. **Success:** Displays wizard with step content

## Styling

The page uses Tailwind CSS with the project's dark theme:

- **Background:** `bg-slate-950` (dark)
- **Cards:** `bg-slate-900/50` with `border-slate-800`
- **Accent colors:** Amber (primary), Emerald (success)
- **Typography:** System fonts with slate color variations
- **Animations:** `animate-in` for smooth step transitions

## Future Enhancements

Planned features for future phases:

### Step 1: Información General
- [ ] Editable form fields for incomplete data
- [ ] Photo upload functionality
- [ ] Form validation

### Step 2: Pago
- [ ] Payment gateway integration
- [ ] Payment status display
- [ ] Invoice/receipt generation

### Step 3: Revisión
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

- [Homologation Overview](../backend/homologation-overview.md)
- [API Endpoints](../api/endpoints.md)
- [Landing Page Plan](./landing-page-plan.md)
- [Wizard UI Pattern Reference](https://www.eleken.co/blog-posts/wizard-ui-pattern-explained)
