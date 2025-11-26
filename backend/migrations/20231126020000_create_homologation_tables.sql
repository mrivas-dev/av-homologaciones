-- =============================================
-- Homologations Table
-- Stores all homologation requests with their current status and metadata
-- Indexed on status and owner_national_id for common query patterns
-- =============================================
CREATE TABLE IF NOT EXISTS homologations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    trailer_type ENUM('Trailer', 'Rolling Box', 'Motorhome'),
    trailer_dimensions VARCHAR(100),
    trailer_number_of_axles INT,
    trailer_license_plate_number VARCHAR(20),
    owner_full_name VARCHAR(255) NOT NULL,
    owner_national_id VARCHAR(50) NOT NULL,
    owner_phone VARCHAR(50) NOT NULL,
    owner_email VARCHAR(255) NOT NULL,
    status ENUM('Draft', 'Pending Review', 'Payed', 'Incomplete', 'Approved', 'Rejected', 'Completed') NOT NULL DEFAULT 'Draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(36) NOT NULL,
    updated_by VARCHAR(36) NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(36) NULL,
    version INT NOT NULL DEFAULT 1,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),
    FOREIGN KEY (deleted_by) REFERENCES users(id),
    CONSTRAINT chk_email CHECK (owner_email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_phone CHECK (owner_phone REGEXP '^[0-9+() -]+$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Photos Table
-- Stores metadata for all uploaded photos including vehicle and ID documents
-- =============================================
CREATE TABLE IF NOT EXISTS photos (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    homologation_id VARCHAR(36) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    is_id_document BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36) NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(36) NULL,
    FOREIGN KEY (homologation_id) REFERENCES homologations(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (deleted_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Audit Logs Table
-- Tracks all changes made to system entities for auditing purposes
-- =============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(36) NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_values JSON,
    new_values JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36) NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(36) NULL,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (deleted_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Indexes for Performance
-- =============================================

-- Homologation Indexes
CREATE INDEX idx_homologation_status ON homologations(status);
CREATE INDEX idx_homologation_owner ON homologations(owner_national_id);
CREATE INDEX idx_homologation_created_at ON homologations(created_at);
CREATE INDEX idx_homologation_license_plate ON homologations(trailer_license_plate_number);

-- Photo Indexes
CREATE INDEX idx_photos_homologation ON photos(homologation_id);
CREATE INDEX idx_photos_created_at ON photos(created_at);

-- Audit Log Indexes
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_action ON audit_logs(action);

-- =============================================
-- Triggers for Automatic Updates
-- =============================================
DELIMITER //

-- Update version and updated_at on homologation update
CREATE TRIGGER before_homologation_update
BEFORE UPDATE ON homologations
FOR EACH ROW
BEGIN
    SET NEW.version = OLD.version + 1;
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

-- Log changes to homologations
CREATE TRIGGER after_homologation_update
AFTER UPDATE ON homologations
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (entity_type, entity_id, action, old_values, new_values, created_by)
    VALUES ('homologation', NEW.id, 'update', 
            JSON_OBJECT('status', OLD.status, 'updated_at', OLD.updated_at),
            JSON_OBJECT('status', NEW.status, 'updated_at', NEW.updated_at),
            NEW.updated_by);
END//

DELIMITER ;
