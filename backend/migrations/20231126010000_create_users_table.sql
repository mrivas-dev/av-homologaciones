-- =============================================
-- Users Table
-- Stores system users including administrators
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'inspector', 'user') NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(36) NULL,
    updated_by VARCHAR(36) NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by VARCHAR(36) NULL,
    version INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_created_by_user FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_updated_by_user FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT fk_deleted_by_user FOREIGN KEY (deleted_by) REFERENCES users(id),
    CONSTRAINT chk_email_format CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Create default admin user
-- Default password: Admin@123 (should be changed on first login)
-- =============================================
INSERT IGNORE INTO users (
    id,
    username,
    email,
    password_hash,
    full_name,
    role,
    is_active,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'admin',
    'admin@example.com',
    -- bcrypt hash for 'Admin@123'
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'System Administrator',
    'admin',
    TRUE,
    NOW(),
    NOW()
);

-- =============================================
-- Indexes for Performance
-- =============================================
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_username ON users(username);
CREATE INDEX idx_user_role ON users(role);
CREATE INDEX idx_user_status ON users(is_active);

-- =============================================
-- Update foreign key constraints in other tables
-- These will be applied when those tables are created
-- =============================================
-- Note: The actual ALTER TABLE statements for adding these constraints
-- should be in a separate migration file that runs after all tables are created

-- =============================================
-- Audit Logs for User Actions
-- =============================================
-- Note: This is a simplified version. The full audit log table is defined in the homologation tables migration
CREATE TABLE IF NOT EXISTS user_audit_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    action VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index for audit logs
CREATE INDEX idx_user_audit_user_id ON user_audit_logs(user_id);
CREATE INDEX idx_user_audit_created_at ON user_audit_logs(created_at);
CREATE INDEX idx_user_audit_action ON user_audit_logs(action);
