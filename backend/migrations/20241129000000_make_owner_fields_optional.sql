-- =============================================
-- Migration: Make owner_full_name and owner_email optional
-- This allows creating draft homologations with just DNI and phone
-- =============================================

-- Remove the email check constraint first (it prevents NULL values)
-- Note: MySQL uses DROP CHECK, not DROP CONSTRAINT for check constraints
ALTER TABLE homologations DROP CHECK chk_email;

-- Make owner_full_name nullable
ALTER TABLE homologations MODIFY COLUMN owner_full_name VARCHAR(255) NULL;

-- Make owner_email nullable
ALTER TABLE homologations MODIFY COLUMN owner_email VARCHAR(255) NULL;

-- Re-add email constraint only when email is not null
ALTER TABLE homologations ADD CONSTRAINT chk_email 
    CHECK (owner_email IS NULL OR owner_email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$');

-- Add index for DNI + phone lookups (used by the lookup-or-create endpoint)
-- Note: Will fail if index already exists, which is fine
CREATE INDEX idx_homologation_dni_phone ON homologations(owner_national_id, owner_phone);

