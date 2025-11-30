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
│       └── homologation/
│           └── [id]/
│               └── page.tsx              # Detail page for single homologation
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
- Modern dark theme with amber accents

**Design:**
- Dark slate background with geometric grid pattern
- Gradient accent glows for visual interest
- Card-based form with glass morphism effect
- Responsive layout

### Dashboard Page (`/admin`)

**Features:**
- Protected route (requires authentication)
- Header with user info and logout button
- Homologations list table
- Status badges with color coding
- Mobile-responsive card layout
- Refresh functionality
- Loading and empty states
- **Clickable rows** - Navigate to detail page on click

**Displayed Columns:**
| Column | Description |
|--------|-------------|
| ID | Truncated UUID (first 8 characters) |
| Teléfono | Owner's phone number |
| DNI/CUIT | Owner's national ID |
| Estado | Status with color badge |

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
- **Status badge** - Prominent current status display
- **Status actions** - Context-aware action buttons based on current status
- **Delete functionality** - Soft delete with confirmation modal
- **Metadata display** - Created date, updated date, version number
- **Back navigation** - Return to list view

**Status Actions Available:**

Actions are dynamically shown based on the current status and valid status transitions:

| Current Status | Available Actions |
|----------------|-------------------|
| Pending Review | Mark Incomplete, Reject |
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

## Styling

### Design System

The admin panel uses a distinct dark theme:

- **Background**: `slate-950` (near black)
- **Cards**: `slate-900` with blur backdrop
- **Borders**: `slate-800`
- **Accent**: Amber to Orange gradient
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

## Future Enhancements

Planned features for the admin panel:

1. ✅ **Homologation Details View** - View full details of each homologation (Implemented)
2. ✅ **Status Actions** - Approve, reject, mark incomplete from detail page (Implemented)
3. ✅ **Photo Viewing** - View all photos with lightbox (Implemented)
4. ✅ **Delete Functionality** - Soft delete homologations (Implemented)
5. **Filtering & Sorting** - Filter by status, date, search in list view
6. **User Management** - Create/manage admin users
7. **Audit Log View** - View system audit trail
8. **Statistics Dashboard** - Charts and metrics
9. **Bulk Actions** - Select multiple homologations for batch operations
10. **Export Functionality** - Export homologations to CSV/PDF

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

