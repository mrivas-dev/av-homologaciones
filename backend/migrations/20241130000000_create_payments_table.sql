-- =============================================
-- Payments Table
-- Stores payment records for homologations
-- A homologation can have multiple payments (e.g., partial payments, refunds)
-- =============================================
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    homologation_id VARCHAR(36) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    amount INT NOT NULL COMMENT 'Amount in cents (e.g., 100 = $1.00)',
    receipt_path VARCHAR(512) NULL COMMENT 'Path to receipt file (photo or PDF)',
    payment_gateway VARCHAR(50) NOT NULL DEFAULT 'MercadoPago',
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
CREATE INDEX idx_payments_homologation ON payments(homologation_id);
CREATE INDEX idx_payments_timestamp ON payments(timestamp);
CREATE INDEX idx_payments_gateway ON payments(payment_gateway);

