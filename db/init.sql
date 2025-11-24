-- Create database if not exists
SELECT 'CREATE DATABASE av_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'av_db')\gexec

-- Connect to the database
\c av_db

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create message_queue table
CREATE TABLE IF NOT EXISTS message_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    payload JSONB NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending'
);
