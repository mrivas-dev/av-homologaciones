# Review Step - Documents Display Plan

## Overview

Add a section to the Review Step that displays documents attached by admins, including:
- Payment receipts
- Homologation documents (certificates, papers)

## Current State

- Documents are stored in `admin_documents` table
- Documents are uploaded by admins via `/api/admin/documents`
- Documents are currently only accessible via admin endpoints
- Documents are stored in the same `uploads/` directory as photos
- Document types: `payment_receipt`, `homologation_papers`

## Requirements

1. **Public API Endpoint**: Allow users to view documents for their own homologations
2. **File Serving**: Documents should be served similar to photos (`/uploads/:fileName`)
3. **UI Display**: Show documents grouped by type in the Review Step
4. **Document Types**: Display with appropriate icons and labels

## Implementation Tasks

### 1. Backend Changes

#### 1.1 Add Public Document List Endpoint

**File**: `backend/routes/document.routes.ts`

Add a public route (no authentication required) to list documents for a homologation:

```typescript
// Public route - users can view documents for their own homologations
router.get(
  `/api/documents/homologation/:homologationId(${uuidPattern})`,
  (ctx) => documentController.listByHomologationPublic(ctx),
);
```

#### 1.2 Add Public List Method

**File**: `backend/controllers/documentController.ts`

Add a method that lists documents without requiring authentication:

```typescript
async listByHomologationPublic(ctx: Context) {
  // Verify homologation exists
  // Return documents (no auth check needed - users can only access their own via homologation ID)
  // Filter out deleted documents
}
```

**Security Note**: Since users access documents via their homologation ID (which they already have access to), we don't need additional authentication. The homologation ID itself acts as the access control.

#### 1.3 File Serving

Documents are already stored in the `uploads/` directory with the pattern `doc_{documentType}_{homologationId}_{timestamp}.{ext}`. The existing `/uploads/:fileName` route should work, but we need to verify it handles all document file types (PDF, images, etc.).

### 2. Frontend Changes

#### 2.1 Add Document Types

**File**: `frontend/src/utils/api.ts`

Add document-related types and API functions:

```typescript
export interface AdminDocument {
  id: string;
  homologationId: string;
  documentType: 'payment_receipt' | 'homologation_papers';
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  description?: string | null;
  createdAt: string;
}

export interface DocumentsResponse {
  data: AdminDocument[];
  total: number;
}

// Get documents for a homologation (public)
export async function getDocuments(homologationId: string): Promise<DocumentsResponse> {
  // GET /api/documents/homologation/:homologationId
}
```

#### 2.2 Update ReviewStep Component

**File**: `frontend/src/app/homologation/[id]/page.tsx`

1. **Add state for documents**:
   ```typescript
   const [documents, setDocuments] = useState<AdminDocument[]>([]);
   const [loadingDocuments, setLoadingDocuments] = useState(false);
   ```

2. **Fetch documents on mount**:
   ```typescript
   useEffect(() => {
     if (homologation?.id) {
       fetchDocuments();
     }
   }, [homologation?.id]);
   ```

3. **Add documents section to UI**:
   - Group documents by type
   - Display with appropriate icons
   - Show download/view links
   - Display file size and upload date

#### 2.3 Document Display UI

Create a section in ReviewStep that shows:

```
┌─────────────────────────────────────────────────────────┐
│  📄 Documentos Adjuntos                                 │
│                                                          │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 💳 Comprobantes de Pago                           │ │
│  │                                                    │ │
│  │  • Recibo_2024-01-15.pdf (245 KB)                 │ │
│  │    Subido el 15/01/2024                           │ │
│  │    [Ver] [Descargar]                              │ │
│  └───────────────────────────────────────────────────┘ │
│                                                          │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 📋 Documentos de Homologación                     │ │
│  │                                                    │ │
│  │  • Certificado_Homologacion.pdf (1.2 MB)         │ │
│  │    Subido el 20/01/2024                           │ │
│  │    [Ver] [Descargar]                              │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 3. UI/UX Design

**Document Card Design:**
- Icon based on document type (receipt icon for payments, document icon for papers)
- File name (truncated if too long)
- File size (formatted: KB/MB)
- Upload date (formatted: DD/MM/YYYY)
- Actions: View (opens in new tab) and Download

**Empty State:**
- Show message: "No hay documentos adjuntos aún"
- Only show if no documents exist

**Loading State:**
- Show skeleton/spinner while fetching documents

### 4. File Type Handling

**Supported File Types:**
- PDF (most common for receipts and certificates)
- Images (JPEG, PNG) - for scanned documents
- All files served via `/uploads/:fileName`

**File Icons:**
- PDF: Document icon
- Images: Image icon
- Default: File icon

## API Endpoints

### New Endpoint

**GET /api/documents/homologation/:homologationId**

**Request:**
```
GET /api/documents/homologation/{homologationId}
```

**Response:**
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

**Error Responses:**
- `404`: Homologation not found
- `500`: Internal server error

## Security Considerations

1. **Access Control**: Users can only access documents via their homologation ID
2. **File Serving**: The `/uploads/:fileName` route already has directory traversal protection
3. **No Authentication Required**: Since users access via homologation ID (which they already have), no additional auth needed
4. **File Validation**: Backend already validates file types and sizes on upload

## Implementation Status: ✅ Completed

All features have been implemented and are working.

## Success Criteria

- [x] Public endpoint returns documents for a homologation
- [x] Documents are displayed in ReviewStep grouped by type
- [x] Users can view documents (opens in new tab)
- [x] Users can download documents
- [x] Empty state shown when no documents
- [x] Loading state during fetch
- [x] Error handling for failed requests
- [x] File sizes formatted correctly (KB/MB)
- [x] Dates formatted in user-friendly format

## Related Files

- `backend/routes/document.routes.ts` - Add public route
- `backend/controllers/documentController.ts` - Add public list method
- `frontend/src/utils/api.ts` - Add document types and API functions
- `frontend/src/app/homologation/[id]/page.tsx` - Update ReviewStep component
- `docs/frontend/homologation-tracking-page.md` - Update documentation
- `docs/api/endpoints.md` - Document new endpoint

