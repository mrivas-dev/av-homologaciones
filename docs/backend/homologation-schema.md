-- ============================================
-- ENUMS
-- ============================================

-- Status of the homologation process
CREATE TYPE homologation_status AS ENUM (
    'pending',     -- Initial status when created
    'reviewing',   -- Under review by staff
    'approved',    -- Successfully approved
    'rejected'     -- Rejected with reason in notes
);

-- Payment status for homologation fees
CREATE TYPE payment_status AS ENUM (
    'pending',     -- Payment initiated but not completed
    'paid',        -- Payment successfully processed
    'failed',      -- Payment failed
    'refunded'     -- Payment was refunded
);


-- ============================================
-- TRAILER CATALOG
-- ============================================

CREATE TABLE trailer_models (
    id              SERIAL PRIMARY KEY,
    type            TEXT NOT NULL,            -- Trailer type (e.g., 'semi', 'full', 'lowboy')
    label           TEXT NOT NULL,            -- Display name of the model
    description     TEXT,                     -- Detailed description
    axles           INTEGER NOT NULL CHECK (axles > 0),  -- Number of axles
    price           NUMERIC(10,2) NOT NULL CHECK (price >= 0),  -- Base price
    is_active       BOOLEAN DEFAULT TRUE,     -- Soft delete flag
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_trailer_model UNIQUE (type, label)
);

-- Index for active trailer models
CREATE INDEX idx_trailer_models_active ON trailer_models(is_active) WHERE is_active = TRUE;


-- ============================================
-- TRAILERS (INSTANCE CREATED FOR EACH HOMOLOGATION)
-- ============================================

CREATE TABLE trailers (
    id              SERIAL PRIMARY KEY,
    model_id        INTEGER NOT NULL REFERENCES trailer_models(id) ON UPDATE CASCADE,
    vin             TEXT UNIQUE,              -- Vehicle Identification Number
    license_plate   TEXT,                     -- License plate number
    year            INTEGER,                  -- Manufacturing year
    color           TEXT,                     -- Vehicle color
    is_active       BOOLEAN DEFAULT TRUE,     -- Soft delete flag
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Add check constraints
    CONSTRAINT valid_year CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 1)
);

-- Indexes for trailers
CREATE INDEX idx_trailers_model ON trailers(model_id);
CREATE INDEX idx_trailers_vin ON trailers(vin) WHERE vin IS NOT NULL;
CREATE INDEX idx_trailers_license_plate ON trailers(license_plate) WHERE license_plate IS NOT NULL;


-- ============================================
-- HOMOLOGATION
-- ============================================

CREATE TABLE homologations (
    id              SERIAL PRIMARY KEY,
    
    -- Applicant information
    first_name      TEXT NOT NULL,            -- Applicant's first name
    last_name       TEXT NOT NULL,            -- Applicant's last name
    phone           TEXT NOT NULL,            -- Contact phone number
    dni             TEXT NOT NULL,            -- National ID number
    email           TEXT NOT NULL,            -- Contact email
    address         TEXT,                     -- Physical address
    city            TEXT,                     -- City
    state           TEXT,                     -- State/Province
    postal_code     TEXT,                     -- Postal/ZIP code
    
    -- Homologation details
    status          homologation_status DEFAULT 'pending' NOT NULL,
    notes           TEXT,                     -- Internal notes
    review_notes    TEXT,                     -- Notes visible to the applicant
    reviewer        TEXT,                     -- Staff who reviewed
    review_date     TIMESTAMP WITH TIME ZONE,  -- When the review was completed
    
    -- Relationships
    trailer_id      INTEGER NOT NULL REFERENCES trailers(id) ON DELETE RESTRICT,
    
    -- Audit fields
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at      TIMESTAMP WITH TIME ZONE  -- For soft deletes
    
    -- Constraints
    UNIQUE (phone, dni),
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_phone CHECK (phone ~ '^[0-9+\\(\\)\\-\\.\\s]+$')
);

-- Indexes for homologations
CREATE INDEX idx_homologations_status ON homologations(status);
CREATE INDEX idx_homologations_phone ON homologations(phone);
CREATE INDEX idx_homologations_email ON homologations(email);
CREATE INDEX idx_homologations_dni ON homologations(dni);
CREATE INDEX idx_homologations_trailer ON homologations(trailer_id);

-- ============================================
-- PAYMENTS
-- ============================================

CREATE TABLE payments (
    id              SERIAL PRIMARY KEY,
    homologation_id INTEGER NOT NULL REFERENCES homologations(id) ON DELETE CASCADE,
    amount          NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    currency        VARCHAR(3) DEFAULT 'USD',
    status          payment_status DEFAULT 'pending' NOT NULL,
    payment_method  TEXT,                           -- e.g., 'credit_card', 'bank_transfer'
    transaction_id  TEXT UNIQUE,                   -- External payment processor ID
    receipt_url     TEXT,                          -- Link to payment receipt
    processed_at    TIMESTAMP WITH TIME ZONE,      -- When payment was processed
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_homologation FOREIGN KEY (homologation_id) REFERENCES homologations(id)
);

-- Indexes for payments
CREATE INDEX idx_payments_homologation ON payments(homologation_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_transaction ON payments(transaction_id) WHERE transaction_id IS NOT NULL;

-- ============================================
-- COMMON FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp for all tables
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at
CREATE TRIGGER trigger_update_timestamp_trailer_models
BEFORE UPDATE ON trailer_models
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_timestamp_trailers
BEFORE UPDATE ON trailers
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_timestamp_homologations
BEFORE UPDATE ON homologations
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_timestamp_payments
BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION update_timestamp();


-- ============================================
-- PICTURES
-- ============================================

CREATE TABLE pictures (
    id              SERIAL PRIMARY KEY,
    homologation_id INTEGER NOT NULL REFERENCES homologations(id) ON DELETE CASCADE,
    url             TEXT NOT NULL,                     -- Storage URL or path
    file_name       TEXT NOT NULL,                    -- Original file name
    file_size       INTEGER,                          -- File size in bytes
    mime_type       TEXT,                             -- MIME type (e.g., 'image/jpeg')
    type            TEXT,                             -- e.g., 'front', 'back', 'side', 'vin', 'document'
    category        TEXT,                             -- e.g., 'exterior', 'interior', 'document'
    is_approved     BOOLEAN,                          -- If the picture meets requirements
    notes           TEXT,                             -- Any notes about the picture
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_mime_type CHECK (mime_type ~* '^(image|application|video)/[a-zA-Z0-9\\.\-+]+$')
);

-- Indexes for pictures
CREATE INDEX idx_pictures_homologation ON pictures(homologation_id);
CREATE INDEX idx_pictures_type ON pictures(type) WHERE type IS NOT NULL;
CREATE INDEX idx_pictures_category ON pictures(category) WHERE category IS NOT NULL;

-- ============================================
-- AUDIT LOG
-- ============================================

-- Optional: Table to track all important changes
CREATE TABLE audit_log (
    id              BIGSERIAL PRIMARY KEY,
    table_name      TEXT NOT NULL,                    -- Name of the affected table
    record_id       INTEGER NOT NULL,                 -- ID of the affected record
    action          TEXT NOT NULL,                   -- 'INSERT', 'UPDATE', 'DELETE'
    changed_fields  JSONB,                           -- JSON with changed fields and their values
    changed_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address      INET                             -- IP address of the requester
);

-- Index for audit log
CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_changed_at ON audit_log(changed_at);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get the current IP address (if available)
CREATE OR REPLACE FUNCTION current_ip_address()
RETURNS INET AS $$
BEGIN
    RETURN current_setting('app.client_ip', TRUE)::INET;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- PAYMENTS
-- ============================================

CREATE TABLE payments (
    id              SERIAL PRIMARY KEY,
    homologation_id INTEGER NOT NULL REFERENCES homologations(id) ON DELETE CASCADE,

    amount          NUMERIC(10,2) NOT NULL,
    status          payment_status DEFAULT 'pending' NOT NULL,
    token           TEXT,
    receipt         TEXT,

    timestamp       TIMESTAMP DEFAULT NOW()
);

CREATE INDEX payments_homologation_idx ON payments(homologation_id);

