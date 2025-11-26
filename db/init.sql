-- Create database if not exists
CREATE DATABASE IF NOT EXISTS av_db;

-- Use the database
USE av_db;

-- Create message_queue table with MySQL compatible syntax
CREATE TABLE IF NOT EXISTS message_queue (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    payload JSON,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
