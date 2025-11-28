-- =============================================
-- Add Foreign Key Constraints
-- This migration adds all necessary foreign key constraints between tables
-- =============================================

-- First, ensure all tables exist before adding constraints
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================
-- Homologations Table Constraints
-- =============================================
ALTER TABLE homologations 
ADD CONSTRAINT fk_homologation_created_by 
FOREIGN KEY (created_by) REFERENCES users(id)
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE homologations 
ADD CONSTRAINT fk_homologation_updated_by 
FOREIGN KEY (updated_by) REFERENCES users(id)
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE homologations 
ADD CONSTRAINT fk_homologation_deleted_by 
FOREIGN KEY (deleted_by) REFERENCES users(id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- =============================================
-- Photos Table Constraints
-- =============================================
ALTER TABLE photos 
ADD CONSTRAINT fk_photo_homologation 
FOREIGN KEY (homologation_id) REFERENCES homologations(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE photos 
ADD CONSTRAINT fk_photo_created_by 
FOREIGN KEY (created_by) REFERENCES users(id)
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE photos 
ADD CONSTRAINT fk_photo_deleted_by 
FOREIGN KEY (deleted_by) REFERENCES users(id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- =============================================
-- Audit Logs Table Constraints
-- =============================================
ALTER TABLE audit_logs 
ADD CONSTRAINT fk_audit_created_by 
FOREIGN KEY (created_by) REFERENCES users(id)
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE audit_logs 
ADD CONSTRAINT fk_audit_deleted_by 
FOREIGN KEY (deleted_by) REFERENCES users(id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- =============================================
-- User Audit Logs Table Constraints
-- =============================================
ALTER TABLE user_audit_logs 
ADD CONSTRAINT fk_user_audit_user_id 
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- =============================================
-- Self-referencing constraints for users table
-- These were defined in the users table creation but included here for completeness
-- =============================================
ALTER TABLE users 
ADD CONSTRAINT fk_user_created_by 
FOREIGN KEY (created_by) REFERENCES users(id)
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE users 
ADD CONSTRAINT fk_user_updated_by 
FOREIGN KEY (updated_by) REFERENCES users(id)
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE users 
ADD CONSTRAINT fk_user_deleted_by 
FOREIGN KEY (deleted_by) REFERENCES users(id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- Add any additional indexes that might be needed after adding foreign keys
-- Note: Indexes already created in previous migration
-- =============================================
