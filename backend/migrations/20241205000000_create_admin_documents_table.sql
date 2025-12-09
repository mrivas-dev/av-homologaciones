-- =============================================
-- Admin Documents Table
-- Stores documents uploaded by admins (payment receipts, homologation papers)
-- =============================================
CREATE TABLE IF NOT EXISTS admin_documents (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    homologation_id VARCHAR(36) NOT NULL,
    document_type ENUM('payment_receipt', 'homologation_papers') NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    description VARCHAR(500) NULL,
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
-- Indexes for Performance
-- =============================================
CREATE INDEX idx_admin_documents_homologation ON admin_documents(homologation_id);
CREATE INDEX idx_admin_documents_type ON admin_documents(document_type);
CREATE INDEX idx_admin_documents_created_at ON admin_documents(created_at);

