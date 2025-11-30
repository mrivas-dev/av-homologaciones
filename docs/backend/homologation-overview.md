# Vehicle Homologation System Documentation

## Overview
The Vehicle Homologation System is designed to manage the certification process for trailers, rolling boxes, and motorhomes, ensuring they meet specific regulatory standards and requirements.

## Access Control
- **Public Access**: Anyone can create and edit homologation requests without authentication
- **Admin Access**: Administrative functions (approvals, system management) require authentication
- **Data Ownership**: Homologations are managed through unique access links rather than user accounts

## Homologation Process

### 1. Application Creation
- Users initiate the process by creating a new homologation request
- Initial status is set to `Draft`
- Basic vehicle and owner information is collected

### 2. Required Information

#### Vehicle Details
- **Type**: Trailer, Rolling Box, or Motorhome
- **Photographs**:
  - Minimum of one
  - Maximum of 10
- **Photo Requirements**:
  - Minimum resolution: 1200x800 pixels
  - File format: JPEG or PNG
  - Maximum file size: 5MB per photo
  - Good lighting conditions
  - Clear visibility of all vehicle parts
- Dimensions (width, length, height)
- Number of axles
- License Plate Number (if applicable)

#### Owner Information
- Full Name
- National ID
- **Photographs**: (of the national ID)
  - Minimum of one
  - Maximum of 2
- **Photo Requirements**:
  - Minimum resolution: 1200x800 pixels
  - File format: JPEG or PNG
  - Maximum file size: 5MB per photo
  - Good lighting conditions
  - Clear visibility of the ID
- Phone
- Email

### Photo Storage and Management

#### Storage Implementation
- **File System Storage**:
  - Photos are stored on the file system in the `./uploads/` directory (configurable via `UPLOAD_DIR` environment variable)
  - Files are saved with a unique naming convention: `{homologationId}_{timestamp}.{extension}`
  - Each photo is associated with a unique identifier (UUID) in the database
  - Metadata (filename, file path, file size, MIME type, timestamp, uploader, vehicle ID) is stored in the database

#### API Endpoints for Photos
- `POST /api/photos` - Upload new photo (multipart/form-data)
- `GET /api/photos/homologation/:homologationId` - List all photos for a homologation
- `GET /api/photos/:id` - Get photo metadata by ID
- `GET /uploads/:fileName` - Serve photo file (static file serving)
- `DELETE /api/photos/:id` - Remove a photo (admin only)

#### Security Measures
- File type validation (MIME type and extension checking)
- File size limits (default 10MB, configurable via `MAX_FILE_SIZE`)
- Directory traversal protection for file serving
- Secure file naming convention (prevents conflicts and unauthorized access)
- Access control based on user roles (admin-only deletion)

### 3. Status Flow
```
Draft → [Documentation] → Payment → Review → [Approved/Rejected] → Completed
```

### 4. Status Definitions
- **Draft**: Initial creation state
- **Pending Review**: Awaiting administrator action
- **Payed**: Payment received
- **Incomplete**: Missing required information
- **Approved**: Successfully homologated
- **Rejected**: Did not meet requirements
- **Completed**: Process finalized

## Technical Implementation

### Database Schema (Key Fields)
```typescript
interface Homologation {
  id: string;
  trailer_type?: 'Trailer' | 'Rolling Box' | 'Motorhome';
  photos?: Array<{
    id: string;
    url: string;
    filename: string;
    size: number;
    mimeType: string;
    uploadedAt: Date;
    uploadedBy: string; // User ID
  }>;
  trailer_dimensions?: string;
  trailer_number_of_axles?: number;
  trailer_license_plate_number?: string;
  owner_full_name: string;
  owner_national_id: string;
  owner_phone: string;
  owner_email: string;
  status: 'Draft' | 'Payed' | 'Incomplete' | 'Completed' | 'Pending Review' | 'Approved' | 'Rejected';
  // ... other fields as per the implementation
}
```

### API Endpoints (Example)
- `POST /api/homologations` - Create new homologation
- `GET /api/homologations` - List all homologations
- `GET /api/homologations/:id` - Get specific homologation
- `PATCH /api/homologations/:id/status` - Update status

## User Roles and Permissions
1. **Users**
   - Any user can create a new homologation request
   - Manage their own homologation requests
   - Upload required documents
   - Track status

2. **Administrators**
   - View all homologation requests
   - Update status
   - Approve/Reject applications

## Integration Points
- Payment processing system
- Document storage service
- Notification system for status updates
- Reporting module for analytics

## Security Considerations
- Role-based access control (only for admin)
- Data encryption for sensitive information
- Audit logging for all status changes
- Secure file upload and storage

## Future Enhancements
- Integration with vehicle registration databases
- Mobile application for field inspections
- Automated document verification
- Multi-language support

---
*Document generated on: 2025-11-25*
*System Version: 1.0*
