# Admin Panel - Implementation Documentation

## Overview

The Admin Panel provides comprehensive administrative functionality for managing homologation requests. It includes authentication, a dashboard with a homologations list, detailed homologation views with photos, status management, and deletion capabilities.

## Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: React Context (AuthContext)
- **API Communication**: Fetch API with JWT authentication

### File Structure

```
frontend/src/
├── app/
│   └── admin/
│       ├── layout.tsx                    # Admin layout with AuthProvider
│       ├── login/
│       │   └── page.tsx                  # Login page
│       ├── page.tsx                      # Dashboard page (list view)
│       ├── completed/
│       │   └── page.tsx                  # Completed homologations view
│       ├── homologation/
│       │   └── [id]/
│       │       └── page.tsx              # Detail page for single homologation
│       └── trailer-types/
│           └── page.tsx                  # Trailer types management page
├── components/
│   └── admin/
│       ├── index.ts                      # Exports for admin components
│       ├── StatusChangeModal.tsx         # Shared status change modal
│       └── DocumentUploadSection.tsx     # Document upload component for admin
├── context/
│   └── AuthContext.tsx                   # Authentication context and provider
└── utils/
    └── adminApi.ts                       # Admin API utilities
```

## Authentication

### Auth Context (`AuthContext.tsx`)

The `AuthContext` manages authentication state across the admin panel:

**Features:**
- JWT token storage in localStorage
- Automatic token verification on page load
- Role-based access control (Admin only)
- Login/logout functionality
- Error handling

**Interface:**
```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}
```

**Usage:**
```tsx
import { useAuth } from '@/context/AuthContext';

function Component() {
  const { user, isAuthenticated, login, logout, error } = useAuth();
  // ...
}
```

### Login Flow

1. User enters username/email and password at `/admin/login`
2. Credentials are sent to `POST /api/auth/login`
3. Backend validates and returns JWT token + user info
4. Frontend verifies user has Admin role
5. Token and user data are stored in localStorage
6. User is redirected to `/admin` dashboard

### Protected Routes

The dashboard (`/admin`) automatically redirects unauthenticated users to `/admin/login`:

```tsx
useEffect(() => {
  if (!authLoading && !isAuthenticated) {
    router.push('/admin/login');
  }
}, [authLoading, isAuthenticated, router]);
```

## Pages

### Login Page (`/admin/login`)

**Features:**
- Username or email authentication
- Password field with secure input
- Error display for invalid credentials
- Loading states during authentication
- Automatic redirect if already authenticated
- Modern dark theme with blue accents (matching main page)

**Design:**
- Dark slate background with geometric grid pattern
- Blue to indigo gradient accent glows (matching main page colors)
- Card-based form with glass morphism effect
- Responsive layout

### Dashboard Page (`/admin`)

**Features:**
- Protected route (requires authentication)
- Header with user info and logout button
- Brand block in header links back to the public homepage
- Homologations list table with **status change actions**
- Status badges with color coding
- Mobile-responsive card layout with action buttons
- Refresh functionality
- Quick link to **Completed** homologations view
- Loading and empty states
- **Clickable rows** - Navigate to detail page on click
- **Quick status actions** - Change status directly from the list

**Displayed Columns:**
| Column | Description |
|--------|-------------|
| Propietario | Owner's full name (falls back to "-" if not provided) |
| Tipo | Trailer type (Trailer, Rolling Box, or Motorhome) - falls back to "-" if not provided |
| Teléfono | Owner's phone number |
| DNI/CUIT | Owner's national ID |
| Estado | Status with color badge |
| Acciones | Quick action buttons based on status |

**Note:** The homologation ID is still used internally for navigation and API calls, but is no longer displayed in the table as it's not relevant information for admins.

**Action Buttons (Desktop):**
- Compact icon buttons with tooltips
- Color-coded to match action type
- Click opens confirmation modal

**Action Buttons (Mobile):**
- Full buttons with labels below the card content
- Separated by border for clear visual distinction

**Quick Actions Available by Status:**

| Current Status | Available Quick Actions |
|---------------|------------------------|
| Pending Review | Approve (✓), Mark Incomplete (⚠), Reject (✗) |
| Payed | Approve (✓), Mark Incomplete (⚠), Reject (✗) |
| Incomplete | Reject (✗) |
| Approved | Complete (→) |
| Draft | - (no admin actions) |
| Rejected | - (terminal state) |
| Completed | - (terminal state) |

**Status Change Flow (from listing):**
1. Click action button in the row (doesn't navigate away)
2. Confirmation modal opens with optional reason field
3. Enter reason (optional) and confirm
4. Status updates and list refreshes automatically

**Status Colors:**
| Status | Color |
|--------|-------|
| Draft (Borrador) | Slate/Gray |
| Pending Review (Pendiente) | Amber |
| Payed (Pagado) | Blue |
| Incomplete (Incompleto) | Orange |
| Approved (Aprobado) | Emerald/Green |
| Rejected (Rechazado) | Red |
| Completed (Completado) | Purple |

### Homologation Detail Page (`/admin/homologation/[id]`)

**Features:**
- **Public site link** - Header includes a logo button to return to the homepage
- **Full homologation details** - Complete information display
- **Owner information card** - Name, DNI/CUIT, phone, email
- **Trailer information card** - Type, dimensions, axles, license plate
- **Photos card** - Always visible card with photo grid (empty state when no photos)
  - Shows photo count in header: "Fotos (X)" or just "Fotos" if empty
  - Grid layout with clickable thumbnails (2-4 columns responsive)
  - Click thumbnail to open full-size lightbox modal
  - DNI badge indicator for ID documents (amber badge)
  - Empty state with icon and message when no photos
  - Error handling for failed image loads (shows placeholder with filename)
- **Admin Documents section** - Upload and manage administrative documents
  - Payment receipts (Comprobante de Pago)
  - Homologation papers (Papeles de Homologación)
  - Preview support for images and PDFs
  - Download functionality
  - Delete with confirmation
- **Status badge** - Prominent current status display
- **Status actions** - Context-aware action buttons based on current status
- **Delete functionality** - Soft delete with confirmation modal
- **Metadata display** - Created date, updated date, version number
- **Back navigation** - Return to list view

**Status Actions Available:**

Actions are dynamically shown based on the current status and valid status transitions:

| Current Status | Available Actions |
|----------------|-------------------|
| Pending Review | Approve, Mark Incomplete, Reject |
| Payed | Approve, Mark Incomplete, Reject |
| Incomplete | Reject |
| Approved | Complete |
| Rejected | None (terminal state) |
| Completed | None (terminal state) |
| Draft | None (user action) |

**Status Change Flow:**
1. Click action button (Approve, Reject, etc.)
2. Confirmation modal appears with optional reason field
3. Enter reason (optional) and confirm
4. Status updates and page refreshes automatically
5. Success/error feedback provided

**Photo Viewing:**
- **Photos card always visible** - Displayed even when no photos are attached
- Thumbnail grid with hover effects (2-4 columns responsive)
- Click thumbnail to open full-size lightbox modal
- Lightbox modal with close button (X icon in top-right)
- DNI badge overlay for ID documents (amber badge in top-right corner)
- **Empty state** - Shows icon and "No hay fotos adjuntas" message when no photos exist
- **Error handling** - Shows placeholder with filename if image fails to load
- **Photo count** - Displays number of photos in card header, e.g., "Fotos (3)"
- Photo URLs constructed from backend file paths: `/uploads/[filename]`
- Responsive image display with proper aspect ratios

**Delete Flow:**
1. Click "Delete" button in header
2. Confirmation modal with warning message
3. Confirm deletion
4. Homologation is soft-deleted
5. Redirect to dashboard list view

### Completed Homologations Page (`/admin/completed`)

**Purpose:** Dedicated view to audit homologaciones with status **Completed**, showing a concise
summary for each closed process.

**Data Source:**
- Uses `fetchHomologations(token, 'Completed')` to pull the list
- For each item, calls `fetchHomologationDetails` to populate photos and documents

**Features:**
- Purple "Completado" badge and quick stats (count, total photos)
- Owner summary: name, DNI/CUIT, phone, email
- Trailer summary: patent, dimensions, axles, type
- Photos preview grid (up to 4 thumbnails) with "+N más" indicator
- Payment section with receipt link when `payment_receipt` exists
- Documents list for other attachments with download links
- Metadata: created date, updated date, version
- CTA to open full detail view (`/admin/homologation/[id]`)
- Refresh + retry handling, loading, and empty states

## API Utilities (`adminApi.ts`)

### Functions

#### `fetchHomologations(token, status?)`
Fetches all homologations with optional status filter.

```typescript
const response = await fetchHomologations(token);
// Returns: { data: HomologationListItem[], total: number }
```

#### `approveHomologation(token, id, reason?)`
Approves a homologation.

#### `rejectHomologation(token, id, reason?)`
Rejects a homologation.

#### `markHomologationIncomplete(token, id, reason?)`
Marks a homologation as incomplete.

#### `completeHomologation(token, id, reason?)`
Marks a homologation as completed.

#### `fetchHomologationDetails(token, id)`
Fetches a single homologation with full details including photos.

```typescript
const homologation = await fetchHomologationDetails(token, id);
// Returns: HomologationDetail with photos array
```

#### `deleteHomologation(token, id)`
Soft deletes a homologation.

```typescript
await deleteHomologation(token, id);
// Returns: void
```

#### `uploadDocument(token, homologationId, documentType, file, description?)`
Uploads an administrative document.

```typescript
const document = await uploadDocument(
  token,
  homologationId,
  'payment_receipt', // or 'homologation_papers'
  file,
  'Optional description'
);
// Returns: AdminDocument
```

#### `deleteDocument(token, documentId)`
Deletes an administrative document.

```typescript
await deleteDocument(token, documentId);
// Returns: void
```

#### `getDocumentUrl(filePath)`
Constructs the URL for accessing a document.

```typescript
const url = getDocumentUrl(document.filePath);
// Returns: string (full URL)
```

### Types

#### `HomologationListItem`
```typescript
interface HomologationListItem {
  id: string;
  ownerPhone: string | null;
  ownerNationalId: string | null;
  ownerFullName: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}
```

#### `HomologationDetail`
```typescript
interface HomologationDetail extends HomologationListItem {
  trailerType: string | null;
  trailerDimensions: string | null;
  trailerNumberOfAxles: number | null;
  trailerLicensePlateNumber: string | null;
  ownerEmail: string | null;
  photos: Photo[];
  documents: AdminDocument[];
  version: number;
}

interface Photo {
  id: string;
  homologationId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  isIdDocument: boolean;
  createdAt: string;
}
```

#### `AdminDocument`
```typescript
type AdminDocumentType = 'payment_receipt' | 'homologation_papers';

interface AdminDocument {
  id: string;
  homologationId: string;
  documentType: AdminDocumentType;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  description: string | null;
  createdBy: string;
  createdAt: string;
}
```

### Photo URL Construction

Photos are served from the backend at `/uploads/:fileName`. The admin panel constructs photo URLs by:

1. Extracting the filename from the `filePath` stored in the database (e.g., `./uploads/uuid_timestamp.jpg` → `uuid_timestamp.jpg`)
2. Constructing the URL: `${API_BASE_URL}/uploads/${fileName}`
3. Handling errors gracefully if images fail to load

**Example:**
```typescript
function getPhotoUrl(filePath: string): string {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const fileName = filePath.split('/').pop() || filePath.split('\\').pop() || filePath;
  return `${API_BASE_URL}/uploads/${fileName}`;
}
```

**Error Handling:**
- Failed images show a placeholder with the filename
- Image errors are tracked in component state
- Broken images are disabled from opening in lightbox

### Error Handling

All API functions throw `AdminApiError` on failure:

```typescript
class AdminApiError extends Error {
  status: number;
  code?: string;
}
```

## Shared Components

### StatusChangeModal (`components/admin/StatusChangeModal.tsx`)

A reusable modal component for changing homologation status. Used in both the listing page and detail page.

**Props:**
```typescript
interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: StatusAction | null;  // 'approve' | 'reject' | 'incomplete' | 'complete'
  onConfirm: (reason?: string) => Promise<void>;
  isLoading: boolean;
}
```

**Features:**
- Displays action-specific title and description
- Optional reason/comment textarea
- Loading state with spinner
- Cancel and confirm buttons
- Color-coded confirm button based on action type

**Usage:**
```tsx
import { StatusChangeModal, getAvailableActions, StatusAction } from '@/components/admin';

// In your component
const [modalOpen, setModalOpen] = useState(false);
const [action, setAction] = useState<StatusAction | null>(null);

// Get available actions based on current status
const availableActions = getAvailableActions(homologation.status);

// Render modal
<StatusChangeModal
  isOpen={modalOpen}
  onClose={() => setModalOpen(false)}
  action={action}
  onConfirm={async (reason) => {
    // Handle status change
  }}
  isLoading={isLoading}
/>
```

### getAvailableActions Helper

Returns the list of available status actions based on the current status.

```typescript
function getAvailableActions(status: string): StatusAction[]
```

### DocumentUploadSection (`components/admin/DocumentUploadSection.tsx`)

A component for uploading and managing administrative documents attached to homologations.

**Props:**
```typescript
interface DocumentUploadSectionProps {
  token: string;
  homologationId: string;
  documents: AdminDocument[];
  onDocumentChange: () => void;
}
```

**Features:**
- Document type selection (Payment Receipt or Homologation Papers)
- Optional description field for each document
- File upload with drag-and-drop support
- Preview support for images and PDFs
- Download functionality
- Delete with confirmation
- Grouped display by document type
- Loading states and error handling

**Supported File Types:**
- PDF (.pdf)
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- Maximum file size: 10MB

**Usage:**
```tsx
import { DocumentUploadSection } from '@/components/admin';

<DocumentUploadSection
  token={authToken}
  homologationId={homologation.id}
  documents={homologation.documents}
  onDocumentChange={refreshHomologation}
/>
```

**Document Types:**
| Type | Label | Description |
|------|-------|-------------|
| `payment_receipt` | Comprobante de Pago | Payment receipts/proof of payment |
| `homologation_papers` | Papeles de Homologación | Final homologation documents |

**Returns actions by status:**
- `'Pending Review'` → `['incomplete', 'reject']`
- `'Payed'` → `['approve', 'incomplete', 'reject']`
- `'Incomplete'` → `['reject']`
- `'Approved'` → `['complete']`
- Other statuses → `[]` (no actions available)

## Styling

### Design System

The admin panel uses a distinct dark theme:

- **Background**: `slate-950` (near black)
- **Cards**: `slate-900` with blur backdrop
- **Borders**: `slate-800`
- **Accent**: Blue to Indigo gradient (matching main page colors)
- **Text**: White and slate tones

### Components

Custom components follow the existing Tailwind patterns from the main site but with the dark theme:

- Buttons with gradient backgrounds
- Form inputs with slate styling
- Status badges with semantic colors
- Cards with backdrop blur

## Security

### Token Storage
- JWT stored in localStorage (`av_admin_token`)
- User data stored in localStorage (`av_admin_user`)
- Token verified on page load

### Role Verification
- Frontend checks `user.role?.toLowerCase() === 'admin'` before granting access (case-insensitive)
- Backend middleware (`requireAdmin`) enforces role on all admin endpoints (case-insensitive)

### Session Management
- Token expiration handled by backend (24h default)
- Manual logout clears local storage
- Failed token verification triggers logout

### Trailer Types Management Page (`/admin/trailer-types`)

**Purpose:** Manage trailer types with their prices and reference photos.

**Features:**
- Card grid layout showing all trailer types
- Each card displays: Name, slug, price (in ARS), reference photos count, active status
- Create new trailer type modal with:
  - Name input
  - Price input (displayed in ARS, stored in cents)
  - Sort order
  - Active/inactive toggle
  - Reference photos manager (add label + path pairs)
- Edit existing trailer types
- Toggle active/inactive status directly from card
- Delete trailer type with confirmation modal
- Navigation link from admin dashboard

**API Functions** in `frontend/src/utils/adminApi.ts`:
- `fetchTrailerTypes(token)` - List all trailer types (admin view)
- `fetchTrailerTypeById(token, id)` - Get single trailer type
- `createTrailerType(token, data)` - Create new trailer type
- `updateTrailerType(token, id, data)` - Update trailer type
- `deleteTrailerType(token, id)` - Delete trailer type

**Public API** in `frontend/src/utils/api.ts`:
- `getTrailerTypes()` - Fetch active trailer types (for forms)
- `findTrailerTypeByName(trailerTypes, name)` - Find type by name

**Types:**
```typescript
interface ReferencePhoto {
  label: string;
  path: string;
}

interface TrailerType {
  id: string;
  name: string;
  slug: string;
  price: number;  // in cents
  referencePhotos: ReferencePhoto[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}
```

**Integration with Homologation Form:**
- TrailerInfoForm fetches trailer types from API
- Dropdown is populated with active trailer types
- PhotoUpload displays reference photos from the selected trailer type
- PaymentStep calculates price from the trailer type's configured price

## Future Enhancements

Planned features for the admin panel:

1. ✅ **Homologation Details View** - View full details of each homologation (Implemented)
2. ✅ **Status Actions** - Approve, reject, mark incomplete from both listing AND detail pages (Implemented)
3. ✅ **Photo Viewing** - View all photos with lightbox (Implemented)
4. ✅ **Delete Functionality** - Soft delete homologations (Implemented)
5. ✅ **Quick Actions in List** - Status change directly from listing page (Implemented)
6. ✅ **Admin Documents** - Upload payment receipts and homologation papers (Implemented)
7. ✅ **Trailer Types Management** - Manage trailer types with prices and reference photos (Implemented)
8. **Filtering & Sorting** - Filter by status, date, search in list view
9. **User Management** - Create/manage admin users
10. **Audit Log View** - View system audit trail
11. **Statistics Dashboard** - Charts and metrics
12. **Bulk Actions** - Select multiple homologations for batch operations
13. **Export Functionality** - Export homologations to CSV/PDF

## Development

### Running Locally

```bash
cd frontend
npm run dev
```

Access the admin panel at `http://localhost:3000/admin/login`

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Backend API URL |

### Testing Admin Login

Use the seeded admin user (check backend seed data) or create one via the API:

```bash
# First login as an existing admin, then:
POST /api/auth/register
{
  "email": "admin@example.com",
  "password": "secure_password",
  "fullName": "Admin User",
  "role": "Admin"
}
```

