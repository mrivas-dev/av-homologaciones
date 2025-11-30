# Admin Panel - Implementation Documentation

## Overview

The Admin Panel provides administrative functionality for managing homologation requests. It includes authentication, a dashboard with a homologations list, and will support additional admin features in the future.

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
│       ├── layout.tsx         # Admin layout with AuthProvider
│       ├── login/
│       │   └── page.tsx       # Login page
│       └── page.tsx           # Dashboard page
├── context/
│   └── AuthContext.tsx        # Authentication context and provider
└── utils/
    └── adminApi.ts            # Admin API utilities
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

1. **Homologation Details View** - View full details of each homologation
2. **Status Actions** - Approve, reject, mark incomplete from dashboard
3. **Filtering & Sorting** - Filter by status, date, search
4. **User Management** - Create/manage admin users
5. **Audit Log View** - View system audit trail
6. **Statistics Dashboard** - Charts and metrics

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

