# API Documentation

## Base URL
```
http://localhost:4000
```

## Response Format
All API responses are in JSON format.

## Authentication

The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

### Login

Authenticate with username or email.

#### Request
```
POST /api/auth/login
Content-Type: application/json

{
  "identifier": "admin@example.com",
  "password": "password123"
}
```

**Note:** The `identifier` field accepts either an email address or a username.

#### Response
**Success (200 OK)**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "fullName": "Admin User",
    "role": "admin"
  }
}
```

---

## Homologation Endpoints

### Create Homologation

#### Request
```
POST /api/homologations
Content-Type: application/json

{
  "ownerFullName": "Juan García",
  "ownerNationalId": "12345678-9",
  "ownerPhone": "+56 9 1234 5678",
  "ownerEmail": "juan@example.com",
  "trailerType": "Trailer",
  "trailerDimensions": "3.5M x 2M x 1.5M",
  "trailerNumberOfAxles": 2,
  "trailerLicensePlateNumber": "ABC-123"
}
```

#### Response
**Success (201 Created)**
```json
{
  "id": "uuid",
  "ownerFullName": "Juan García",
  "ownerEmail": "juan@example.com",
  "status": "Draft",
  "version": 1,
  "createdAt": "2025-11-29T00:00:00.000Z",
  "...": "..."
}
```

### List Homologations

#### Request
```
GET /api/homologations
GET /api/homologations?status=Draft
GET /api/homologations?userId=<uuid>
```

#### Response
**Success (200 OK)**
```json
{
  "data": [
    {
      "id": "uuid",
      "ownerFullName": "Juan García",
      "status": "Draft",
      "...": "..."
    }
  ],
  "total": 1
}
```

### Get Homologation by ID

#### Request
```
GET /api/homologations/:id
```

#### Response
**Success (200 OK)**
```json
{
  "id": "uuid",
  "ownerFullName": "Juan García",
  "status": "Draft",
  "photos": [],
  "...": "..."
}
```

### Update Homologation

#### Request
```
PATCH /api/homologations/:id
Content-Type: application/json

{
  "ownerPhone": "+56 9 8765 4321"
}
```

### Submit for Review

#### Request
```
POST /api/homologations/:id/submit
```

#### Response
**Success (200 OK)**
```json
{
  "id": "uuid",
  "status": "Pending Review",
  "...": "..."
}
```

**Error (400 Bad Request)**
```json
{
  "error": "Missing required fields for submission: trailerType",
  "code": "MISSING_FIELDS"
}
```

### Update Status

#### Request
```
PATCH /api/homologations/:id/status
Content-Type: application/json

{
  "status": "Pending Review",
  "reason": "Optional reason for status change"
}
```

#### Response
**Success (200 OK)**
```json
{
  "id": "uuid",
  "status": "Pending Review",
  "...": "..."
}
```

**Error (400 Bad Request) - Invalid Transition**
```json
{
  "error": "Cannot transition from \"Draft\" to \"Approved\". Allowed transitions: Pending Review",
  "code": "INVALID_TRANSITION"
}
```

**Error (403 Forbidden) - Admin Required**
```json
{
  "error": "Transitioning to \"Approved\" requires admin privileges",
  "code": "REQUIRES_ADMIN"
}
```

### Delete Homologation (Admin Only)

#### Request
```
DELETE /api/homologations/:id
Authorization: Bearer <admin-token>
```

---

## Photo Endpoints

### Upload Photo

#### Request
```
POST /api/photos
Content-Type: multipart/form-data

file: <image file>
homologationId: <uuid>
isIdDocument: true/false (optional)
```

#### Supported File Types
- JPEG/JPG
- PNG
- WebP
- HEIC/HEIF
- PDF (for ID documents)

#### Response
**Success (201 Created)**
```json
{
  "id": "uuid",
  "homologationId": "uuid",
  "fileName": "original-name.jpg",
  "filePath": "./uploads/uuid_timestamp.jpg",
  "fileSize": 123456,
  "mimeType": "image/jpeg",
  "isIdDocument": false
}
```

**Error (413 Payload Too Large)**
```json
{
  "error": "File size exceeds maximum allowed size of 10485760 bytes"
}
```

**Error (415 Unsupported Media Type)**
```json
{
  "error": "Invalid file type: application/zip. Allowed types: image/jpeg, image/png, ..."
}
```

### List Photos by Homologation

#### Request
```
GET /api/photos/homologation/:homologationId
```

### Get Photo

#### Request
```
GET /api/photos/:id
```

### Serve Photo File

Serves the actual photo file from the uploads directory. This endpoint is used to display photos in the frontend.

#### Request
```
GET /uploads/:fileName
```

#### Response
**Success (200 OK)**
- Returns the binary file data with appropriate `Content-Type` header
- Supported MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/heic`, `image/heif`, `application/pdf`
- Includes `Cache-Control: public, max-age=31536000` header for browser caching

**Error (400 Bad Request)**
```json
{
  "error": "Invalid filename"
}
```

**Error (404 Not Found)**
```json
{
  "error": "File not found"
}
```

**Note:** The `fileName` parameter should be the filename only (e.g., `uuid_timestamp.jpg`), not the full path. Directory traversal attempts are blocked for security.

### Delete Photo

#### Request
```
DELETE /api/photos/:id
```

**Note:** This endpoint is public (no authentication required). Users can delete photos from their own homologations.

#### Response
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

---

## Payment Endpoints

All payment endpoints are public (no authentication required).

### Create Payment

Create a payment record for a homologation.

#### Request
```
POST /api/payments
Content-Type: application/json

{
  "homologationId": "uuid",
  "amount": 100,
  "paymentGateway": "MercadoPago"
}
```

**Note:** Amount is in cents (e.g., 100 = $1.00). `paymentGateway` defaults to "MercadoPago" if not provided.

#### Response
**Success (201 Created)**
```json
{
  "id": "uuid",
  "homologationId": "uuid",
  "timestamp": "2024-11-30T10:00:00.000Z",
  "amount": 100,
  "receiptPath": null,
  "paymentGateway": "MercadoPago",
  "createdAt": "2024-11-30T10:00:00.000Z"
}
```

### List Payments by Homologation

#### Request
```
GET /api/payments/homologation/:homologationId
```

#### Response
**Success (200 OK)**
```json
{
  "data": [
    {
      "id": "uuid",
      "homologationId": "uuid",
      "timestamp": "2024-11-30T10:00:00.000Z",
      "amount": 100,
      "receiptPath": null,
      "paymentGateway": "MercadoPago"
    }
  ],
  "total": 1,
  "totalPaid": 100
}
```

### Check Payment Status

Check if a homologation has been paid.

#### Request
```
GET /api/payments/check/:homologationId
```

#### Response
**Success (200 OK)**
```json
{
  "isPaid": true,
  "totalPaid": 100
}
```

### Get Payment by ID

#### Request
```
GET /api/payments/:id
```

#### Response
**Success (200 OK)**
```json
{
  "id": "uuid",
  "homologationId": "uuid",
  "timestamp": "2024-11-30T10:00:00.000Z",
  "amount": 100,
  "receiptPath": "./uploads/receipt_uuid_timestamp.pdf",
  "paymentGateway": "MercadoPago"
}
```

### Upload Receipt

Upload a receipt (photo or PDF) for a payment.

#### Request
```
POST /api/payments/:id/receipt
Content-Type: multipart/form-data

file: <image or PDF file>
```

#### Supported File Types
- JPEG/JPG
- PNG
- WebP
- PDF

#### Response
**Success (200 OK)**
```json
{
  "id": "uuid",
  "homologationId": "uuid",
  "timestamp": "2024-11-30T10:00:00.000Z",
  "amount": 100,
  "receiptPath": "./uploads/receipt_uuid_timestamp.pdf",
  "paymentGateway": "MercadoPago"
}
```

### Download Receipt

Download the receipt file for a payment (public endpoint - no auth required).

#### Request
```
GET /api/payments/:id/receipt
```

#### Response
**Success (200 OK)**
- Returns the binary file data with appropriate `Content-Type` header
- `Content-Disposition: attachment; filename="receipt_uuid_timestamp.pdf"`

**Error (404 Not Found)**
```json
{
  "error": "No receipt uploaded for this payment"
}
```

---

## Admin Endpoints

All admin endpoints require authentication with admin role.

### List All Homologations (Admin View)

#### Request
```
GET /api/admin/homologations
GET /api/admin/homologations?status=Pending Review
Authorization: Bearer <admin-token>
```

### Approve Homologation

#### Request
```
POST /api/admin/homologations/:id/approve
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "reason": "All documentation verified"
}
```

### Reject Homologation

#### Request
```
POST /api/admin/homologations/:id/reject
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "reason": "Invalid documentation provided"
}
```

### Mark as Incomplete

#### Request
```
POST /api/admin/homologations/:id/incomplete
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "reason": "Missing ID document photo"
}
```

### Complete Homologation

#### Request
```
POST /api/admin/homologations/:id/complete
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "reason": "Certificate issued"
}
```

---

## Status Transitions

### Valid Status Transitions

| Current Status | → | Allowed Next Status |
|----------------|---|---------------------|
| Draft | → | Pending Review |
| Pending Review | → | Payed, Incomplete, Rejected |
| Payed | → | Approved, Rejected, Incomplete |
| Incomplete | → | Pending Review, Rejected |
| Approved | → | Completed |
| Rejected | → | (terminal state) |
| Completed | → | (terminal state) |

### Transition Requirements

**Draft → Pending Review:**
- All required fields must be filled:
  - `ownerFullName`
  - `ownerNationalId`
  - `ownerPhone`
  - `ownerEmail`
  - `trailerType`
- At least one photo must be uploaded

**Admin-Only Transitions:**
- Approved
- Rejected
- Completed
- Incomplete (to mark for correction)

---

## Error Handling

### Status Codes
- `200` OK - Request successful
- `201` Created - Resource created successfully
- `400` Bad Request - Invalid input or invalid state transition
- `401` Unauthorized - Missing or invalid authentication
- `403` Forbidden - Insufficient permissions
- `404` Not Found - Resource not found
- `413` Payload Too Large - File size exceeds limit
- `415` Unsupported Media Type - Invalid file type
- `500` Internal Server Error - Unexpected error occurred

### Error Response Format
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": []
}
```

### Common Error Codes
- `INVALID_TRANSITION` - Status transition not allowed
- `MISSING_FIELDS` - Required fields not provided
- `REQUIRES_ADMIN` - Operation requires admin role
- `NOT_FOUND` - Resource not found

---

## CORS Headers
All responses include the following CORS headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 4000 | Server port |
| `JWT_SECRET` | dev-secret-key | JWT signing secret |
| `JWT_EXPIRATION` | 24h | JWT token expiration |
| `UPLOAD_DIR` | ./uploads | Photo upload directory |
| `MAX_FILE_SIZE` | 10485760 | Max upload size (10MB) |
| `EMAIL_FROM` | noreply@av-homologacion.com | Sender email |
| `SMTP_HOST` | - | SMTP server host |
| `SMTP_PORT` | 587 | SMTP server port |
| `SMTP_USER` | - | SMTP username |
| `SMTP_PASS` | - | SMTP password |
| `APP_URL` | http://localhost:3000 | Frontend URL for emails |
