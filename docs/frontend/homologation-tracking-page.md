# Homologation Tracking Page

## Overview

The Homologation Tracking Page allows users to view and follow the status of their vehicle homologation request. This page is publicly accessible without authentication, requiring only the homologation ID (which users receive after submitting the initial lookup form).

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

## Page Features

### Current Implementation (Phase 1)

The page displays basic homologation information:
- **ID:** The unique identifier of the homologation
- **Phone (Teléfono):** Owner's phone number
- **DNI:** Owner's national ID
- **Status (Estado):** Current status of the homologation

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
┌─────────────────────────────────────────────────────────┐
│                    Landing Page                          │
│                    (Hero Form)                           │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │  DNI: [____________]                             │    │
│  │  Phone: [____________]                           │    │
│  │  [Submit]                                        │    │
│  └─────────────────────────────────────────────────┘    │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼ POST /api/homologations/lookup
                         │
              ┌──────────┴──────────┐
              │  Lookup or Create   │
              └──────────┬──────────┘
                         │
                         ▼ Redirect to /homologation/{id}
                         │
┌────────────────────────┴────────────────────────────────┐
│              Homologation Tracking Page                  │
│                 /homologation/[id]                       │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │  ID: 645772ae-8e88-41a4-b037-55c93c0f43bb       │    │
│  │  Phone: +54 11 1234-5678                         │    │
│  │  DNI: 12345678                                   │    │
│  │  Status: Draft                                   │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Technical Implementation

### Files

| File | Description |
|------|-------------|
| `frontend/src/app/homologation/[id]/page.tsx` | Page component |
| `frontend/src/utils/api.ts` | API client with `getHomologationById()` |
| `frontend/src/components/sections/HeroSection.tsx` | Form that redirects to tracking page |

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

1. **Loading:** Shows "Cargando..." while fetching data
2. **Error:** Displays error message if homologation not found or API fails
3. **Success:** Displays homologation information

## Future Enhancements

Planned features for future phases:
- [ ] Styled UI with proper layout and design
- [ ] Form to complete missing homologation information
- [ ] Photo upload functionality
- [ ] Progress indicator showing completion steps
- [ ] Email/SMS notifications for status changes
- [ ] Payment integration
- [ ] Document download (certificates, receipts)

## Security Considerations

1. **URL Security:** The homologation ID is a UUID, making it difficult to guess
2. **Public Access:** No sensitive information is exposed beyond what the user already provided (DNI, phone)
3. **Future:** Consider adding verification (e.g., require DNI + phone to view details)

## Related Documentation

- [Homologation Overview](../backend/homologation-overview.md)
- [API Endpoints](../api/endpoints.md)
- [Landing Page Plan](./landing-page-plan.md)

