# Homologation System Documentation

## Overview
This document provides comprehensive documentation for the Homologation System database schema. The system is designed to manage trailer homologation processes, including vehicle information, documentation, payments, and status tracking.

## Database Schema

### Enums

#### `homologation_status`
- `pending`: Initial status when created
- `reviewing`: Under review by staff
- `approved`: Successfully approved
- `rejected`: Rejected with reason in notes

#### `payment_status`
- `pending`: Payment initiated but not completed
- `paid`: Payment successfully processed
- `failed`: Payment failed
- `refunded`: Payment was refunded

## Core Tables

### `trailer_models`
Stores different types of trailer models available for homologation.

**Fields:**
- `id`: Unique identifier (SERIAL)
- `type`: Trailer type (e.g., 'semi', 'full', 'lowboy')
- `label`: Display name of the model
- `description`: Detailed description
- `axles`: Number of axles (must be > 0)
- `price`: Base price (must be >= 0)
- `is_active`: Soft delete flag
- `created_at`, `updated_at`: Timestamps

### `trailers`
Represents individual trailer instances being homologated.

**Fields:**
- `id`: Unique identifier (SERIAL)
- `model_id`: Reference to `trailer_models`
- `vin`: Vehicle Identification Number (unique)
- `license_plate`: License plate number
- `year`: Manufacturing year (1900-current+1)
- `color`: Vehicle color
- `is_active`: Soft delete flag
- `created_at`, `updated_at`: Timestamps

### `homologations`
Tracks the homologation process for each trailer.

**Fields:**
- **Applicant Information**:
  - `first_name`, `last_name`: Applicant's full name
  - `phone`: Contact number (validated format)
  - `dni`: National ID number (unique with phone)
  - `email`: Contact email (validated format)
  - `address`, `city`, `state`, `postal_code`: Physical address

- **Process Information**:
  - `status`: Current status (pending, reviewing, approved, rejected)
  - `notes`: Internal notes for staff
  - `review_notes`: Notes visible to applicant
  - `reviewer`: Staff who reviewed
  - `review_date`: When review was completed
  - `trailer_id`: Reference to the trailer (required)

- **Audit Fields**:
  - `created_at`: When record was created
  - `updated_at`: When record was last updated
  - `deleted_at`: For soft deletes

**Constraints**:
- `UNIQUE (phone, dni)`
- Email validation: Must match pattern `^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$`
- Phone validation: Must match pattern `^[0-9+()\-\.\s]+$`

### `payments`
Manages payment information for homologations.

**Fields:**
- `id`: Unique identifier (SERIAL)
- `homologation_id`: Reference to homologation
- `amount`: Payment amount (must be > 0)
- `currency`: Currency code (default: 'USD')
- `status`: Payment status
- `payment_method`: e.g., 'credit_card', 'bank_transfer'
- `transaction_id`: External payment processor ID (unique)
- `receipt_url`: Link to payment receipt
- `processed_at`: When payment was completed
- `created_at`, `updated_at`: Timestamps

### `pictures`
Stores documentation and images related to homologations.

**Fields:**
- `id`: Unique identifier (SERIAL)
- `homologation_id`: Reference to homologation (required)
- `url`: Storage URL or path (required)
- `file_name`: Original file name (required)
- `file_size`: File size in bytes
- `mime_type`: Media type (e.g., 'image/jpeg')
- `type`: Image type (e.g., 'front', 'back', 'side', 'vin', 'document')
- `category`: Category (e.g., 'exterior', 'interior', 'document')
- `is_approved`: If the picture meets requirements
- `notes`: Any notes about the picture
- `created_at`: When the picture was uploaded

**Constraints**:
- MIME type must match pattern `^(image|application|video)/[a-zA-Z0-9\.\-+]+$`
- `file_name`: Original file name
- `file_size`: File size in bytes
- `mime_type`: e.g., 'image/jpeg'
- `type`: e.g., 'front', 'back', 'side', 'vin', 'document'
- `category`: e.g., 'exterior', 'interior', 'document'
- `is_approved`: If the picture meets requirements
- `notes`: Any notes about the picture
- `created_at`: Upload timestamp

## Audit Log

Tracks all important changes across the system.

**Fields:**
- `id`: Unique identifier (BIGSERIAL)
- `table_name`: Name of the affected table
- `record_id`: ID of the affected record
- `action`: Type of change (INSERT, UPDATE, DELETE)
- `changed_fields`: JSON with changed fields and their values
- `changed_at`: When the change occurred
- `ip_address`: IP address of the requester

**Indexes**:
- `idx_audit_log_table_record`: On (table_name, record_id)
- `idx_audit_log_changed_at`: On changed_at

## Helper Functions

### `update_timestamp()`
Automatically updates the `updated_at` timestamp on record updates.

`current_ip_address()`
Retrieves the client's IP address for audit logging.

## Database Indexes

### `trailer_models`
- `idx_trailer_models_active`: On `is_active` (partial index where is_active = true)
- Primary key on `id`
- Unique constraint on (`type`, `label`)

### `trailers`
- `idx_trailers_model`: On `model_id`
- `idx_trailers_vin`: On `vin` (partial index where vin IS NOT NULL)
- `idx_trailers_license_plate`: On `license_plate` (partial index where license_plate IS NOT NULL)
- Primary key on `id`
- Unique constraint on `vin`

### `homologations`
- `idx_homologations_status`: On `status`
- `idx_homologations_phone`: On `phone`
- `idx_homologations_email`: On `email`
- `idx_homologations_dni`: On `dni`
- `idx_homologations_trailer`: On `trailer_id`
- Primary key on `id`
- Unique constraint on (`phone`, `dni`)

### `payments`
- `idx_payments_homologation`: On `homologation_id`
- `idx_payments_status`: On `status`
- `idx_payments_transaction`: On `transaction_id` (partial index where transaction_id IS NOT NULL)
- Primary key on `id`
- Unique constraint on `transaction_id`

### `pictures`
- `idx_pictures_homologation`: On `homologation_id`
- `idx_pictures_type`: On `type` (partial index where type IS NOT NULL)
- `idx_pictures_category`: On `category` (partial index where category IS NOT NULL)
- Primary key on `id`

## Best Practices

1. **Data Integrity**:
   - Use the provided constraints and validations
   - Use soft deletes (`deleted_at`) instead of hard deletes

2. **Performance**:
   - Queries should use the provided indexes
   - For large datasets, consider adding additional indexes based on query patterns

3. **Security**:
   - Never store sensitive information in plain text
   - Validate all inputs at the application level

## Example Queries

### Get Active Homologations
```sql
SELECT h.id, h.first_name, h.last_name, h.status, t.license_plate
FROM homologations h
JOIN trailers t ON h.trailer_id = t.id
WHERE h.deleted_at IS NULL
  AND h.status = 'pending';
```

### Get Payments Needing Attention
```sql
SELECT p.id, h.first_name, h.last_name, p.amount, p.status
FROM payments p
JOIN homologations h ON p.homologation_id = h.id
WHERE p.status IN ('pending', 'failed')
ORDER BY p.created_at DESC;
```

### Get Pictures for a Homologation
```sql
SELECT type, category, is_approved, created_at
FROM pictures
WHERE homologation_id = :homologation_id
ORDER BY category, type;
```

## Version History
- **1.0.0**: Initial schema implementation
