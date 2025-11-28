# Database Schema Documentation

## Overview
This document outlines the database schema for the Vehicle Homologation System. The database is designed to manage vehicle homologation requests, user accounts, photos, and audit logs.

## Tables

### users
Stores admin user accounts and authentication information. The system only supports admin users who manage the homologation process.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | Primary key, UUID | PRIMARY KEY |
| username | VARCHAR(50) | Unique username | UNIQUE, NOT NULL |
| email | VARCHAR(255) | User's email | UNIQUE, NOT NULL, Valid email format |
| password_hash | VARCHAR(255) | Hashed password | NOT NULL |
| full_name | VARCHAR(255) | User's full name | NOT NULL |
| role | ENUM | User role | 'admin' (only role) |
| is_active | BOOLEAN | Account status | DEFAULT TRUE |
| last_login_at | TIMESTAMP | Last login timestamp | NULLABLE |
| created_at | TIMESTAMP | Record creation time | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Last update time | DEFAULT CURRENT_TIMESTAMP ON UPDATE |
| created_by | VARCHAR(36) | User who created this record | FOREIGN KEY to users(id) |
| updated_by | VARCHAR(36) | User who last updated | FOREIGN KEY to users(id) |
| is_deleted | BOOLEAN | Soft delete flag | DEFAULT FALSE |
| deleted_at | TIMESTAMP | When record was deleted | NULLABLE |
| deleted_by | VARCHAR(36) | User who deleted the record | FOREIGN KEY to users(id) |
| version | INT | Optimistic locking | DEFAULT 1, NOT NULL |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (username)
- UNIQUE (email)

### homologations
Tracks vehicle homologation requests.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | Primary key, UUID | PRIMARY KEY |
| trailer_type | ENUM | Type of trailer | 'Trailer', 'Rolling Box', 'Motorhome' |
| trailer_dimensions | VARCHAR(100) | Vehicle dimensions | |
| trailer_number_of_axles | INT | Number of axles | |
| trailer_license_plate_number | VARCHAR(20) | License plate | |
| owner_full_name | VARCHAR(255) | Owner's full name | NOT NULL |
| owner_national_id | VARCHAR(50) | National ID | NOT NULL |
| owner_phone | VARCHAR(50) | Contact number | NOT NULL, Valid phone format |
| owner_email | VARCHAR(255) | Contact email | NOT NULL, Valid email format |
| status | ENUM | Request status | 'Draft', 'Pending Review', 'Payed', 'Incomplete', 'Approved', 'Rejected', 'Completed' |
| created_at | TIMESTAMP | Record creation time | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Last update time | DEFAULT CURRENT_TIMESTAMP ON UPDATE |
| created_by | VARCHAR(36) | User who created | FOREIGN KEY to users(id), NOT NULL |
| updated_by | VARCHAR(36) | User who last updated | FOREIGN KEY to users(id), NOT NULL |
| is_deleted | BOOLEAN | Soft delete flag | DEFAULT FALSE |
| deleted_at | TIMESTAMP | When record was deleted | NULLABLE |
| deleted_by | VARCHAR(36) | User who deleted | FOREIGN KEY to users(id) |
| version | INT | Optimistic locking | DEFAULT 1, NOT NULL |

**Indexes:**
- PRIMARY KEY (id)
- idx_homologation_status (status)
- idx_homologation_owner (owner_national_id)
- idx_homologation_created_at (created_at)
- idx_homologation_license_plate (trailer_license_plate_number)

### photos
Stores metadata for uploaded photos and documents.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | Primary key, UUID | PRIMARY KEY |
| homologation_id | VARCHAR(36) | Related homologation | FOREIGN KEY, NOT NULL |
| file_name | VARCHAR(255) | Original filename | NOT NULL |
| file_path | VARCHAR(512) | Storage path | NOT NULL |
| file_size | INT | File size in bytes | NOT NULL |
| mime_type | VARCHAR(100) | File MIME type | NOT NULL |
| is_id_document | BOOLEAN | If file is an ID document | DEFAULT FALSE |
| created_at | TIMESTAMP | Upload time | DEFAULT CURRENT_TIMESTAMP |
| created_by | VARCHAR(36) | Uploading user | FOREIGN KEY to users(id), NOT NULL |
| is_deleted | BOOLEAN | Soft delete flag | DEFAULT FALSE |
| deleted_at | TIMESTAMP | When record was deleted | NULLABLE |
| deleted_by | VARCHAR(36) | User who deleted | FOREIGN KEY to users(id) |

**Indexes:**
- PRIMARY KEY (id)
- idx_photos_homologation (homologation_id)
- idx_photos_created_at (created_at)

### audit_logs
Tracks all significant changes in the system.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | Primary key, UUID | PRIMARY KEY |
| entity_type | VARCHAR(50) | Type of entity changed | NOT NULL |
| entity_id | VARCHAR(36) | ID of the changed entity | NOT NULL |
| action | VARCHAR(50) | Type of action performed | NOT NULL |
| old_values | JSON | Previous values | NULLABLE |
| new_values | JSON | New values | NULLABLE |
| created_at | TIMESTAMP | When change occurred | DEFAULT CURRENT_TIMESTAMP |
| created_by | VARCHAR(36) | User who made the change | FOREIGN KEY to users(id), NOT NULL |
| is_deleted | BOOLEAN | Soft delete flag | DEFAULT FALSE |
| deleted_at | TIMESTAMP | When record was deleted | NULLABLE |
| deleted_by | VARCHAR(36) | User who deleted | FOREIGN KEY to users(id) |

**Indexes:**
- PRIMARY KEY (id)
- idx_audit_entity (entity_type, entity_id)
- idx_audit_created_at (created_at)
- idx_audit_action (action)

## Relationships

1. **users → users** (self-referential)
   - created_by → id (references another admin user)
   - updated_by → id (references another admin user)
   - deleted_by → id (references another admin user)

2. **homologations → users**
   - created_by → id
   - updated_by → id
   - deleted_by → id

3. **photos → homologations**
   - homologation_id → id (CASCADE on delete)

4. **photos → users**
   - created_by → id
   - deleted_by → id

5. **audit_logs → users**
   - created_by → id
   - deleted_by → id

## Triggers

1. **before_homologation_update**
   - Updates version number and updated_at timestamp before any homologation update

2. **after_homologation_update**
   - Logs changes to the audit_logs table when a homologation is updated

## User Management

- Only admin users are supported in the system
- User roles are restricted to 'admin' only
- All admin users have full system access
- User management is restricted to existing admin users

## Data Validation

- Email validation using regex: `^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$`
- Phone number validation: `^[0-9+() -]+$`
- Role is enforced as 'admin' only
- NOT NULL constraints on required fields

## Soft Delete Pattern
Most tables implement soft delete using:
- `is_deleted` (BOOLEAN)
- `deleted_at` (TIMESTAMP)
- `deleted_by` (VARCHAR(36), FOREIGN KEY to users.id)

## Audit Trail
All changes to homologations are automatically logged to the audit_logs table, including:
- What changed (entity_type, entity_id)
- What action was taken
- Old and new values
- Who made the change
- When it was changed

## Versioning
- The `version` field in the homologations table enables optimistic locking
- Automatically incremented on each update via trigger

## Indexing Strategy
- Primary keys on all tables
- Foreign key indexes for all relationships
- Additional indexes on frequently queried columns (status, dates, searchable fields)
- Composite indexes for common query patterns
