# First, create a temporary file with the corrected schema
cat > /tmp/fixed_schema.sql << 'EOL'
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
    type            TEXT NOT NULL,
    label           TEXT NOT NULL,
    description     TEXT,
    axles           INTEGER NOT NULL CHECK (axles > 0),
    price           NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_trailer_model UNIQUE (type, label)
);

-- ============================================
-- TRAILERS
-- ============================================

CREATE TABLE trailers (
    id              SERIAL PRIMARY KEY,
    model_id        INTEGER NOT NULL,
    vin             TEXT UNIQUE,
    license_plate   TEXT,
    year            INTEGER,
    color           TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_trailer_model FOREIGN KEY (model_id) REFERENCES trailer_models(id) ON UPDATE CASCADE,
    CONSTRAINT valid_year CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 1)
);

-- ============================================
-- HOMOLOGATION
-- ============================================

CREATE TABLE homologations (
    id              SERIAL PRIMARY KEY,
    first_name      TEXT NOT NULL,
    last_name       TEXT NOT NULL,
    phone           TEXT NOT NULL,
    dni             TEXT NOT NULL,
    email           TEXT NOT NULL,
    address         TEXT,
    city            TEXT,
    state           TEXT,
    postal_code     TEXT,
    status          homologation_status DEFAULT 'pending' NOT NULL,
    notes           TEXT,
    review_notes    TEXT,
    reviewer        TEXT,
    review_date     TIMESTAMP WITH TIME ZONE,
    trailer_id      INTEGER NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at      TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_trailer FOREIGN KEY (trailer_id) REFERENCES trailers(id) ON DELETE RESTRICT,
    CONSTRAINT unique_phone_dni UNIQUE (phone, dni),
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_phone CHECK (phone ~ '^[0-9+\\(\\)\\-\\.\\s]+$')
);

-- ============================================
-- PAYMENTS (single definition)
-- ============================================

CREATE TABLE payments (
    id              SERIAL PRIMARY KEY,
    homologation_id INTEGER NOT NULL,
    amount          NUMERIC(10,2) NOT NULL,
    status          payment_status DEFAULT 'pending' NOT NULL,
    currency        VARCHAR(3) DEFAULT 'USD',
    payment_method  TEXT,
    transaction_id  TEXT UNIQUE,
    receipt_url     TEXT,
    processed_at    TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_homologation FOREIGN KEY (homologation_id) REFERENCES homologations(id) ON DELETE CASCADE
);

-- ============================================
-- PICTURES
-- ============================================

CREATE TABLE pictures (
    id              SERIAL PRIMARY KEY,
    homologation_id INTEGER NOT NULL,
    url             TEXT NOT NULL,
    file_name       TEXT NOT NULL,
    file_size       INTEGER,
    mime_type       TEXT,
    type            TEXT,
    category        TEXT,
    is_approved     BOOLEAN,
    notes           TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_homologation_pictures FOREIGN KEY (homologation_id) REFERENCES homologations(id) ON DELETE CASCADE,
    CONSTRAINT valid_mime_type CHECK (mime_type ~* '^(image|application|video)/[a-zA-Z0-9\\.\\-+]+$')
);

-- ============================================
-- AUDIT LOG
-- ============================================

CREATE TABLE audit_log (
    id              BIGSERIAL PRIMARY KEY,
    table_name      TEXT NOT NULL,
    record_id       INTEGER NOT NULL,
    action          TEXT NOT NULL,
    changed_fields  JSONB,
    changed_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address      INET
);

-- ============================================
-- INDEXES
-- ============================================

-- Indexes for trailer_models
CREATE INDEX idx_trailer_models_active ON trailer_models(is_active) WHERE is_active = TRUE;

-- Indexes for trailers
CREATE INDEX idx_trailers_model ON trailers(model_id);
CREATE INDEX idx_trailers_vin ON trailers(vin) WHERE vin IS NOT NULL;
CREATE INDEX idx_trailers_license_plate ON trailers(license_plate) WHERE license_plate IS NOT NULL;

-- Indexes for homologations
CREATE INDEX idx_homologations_status ON homologations(status);
CREATE INDEX idx_homologations_phone ON homologations(phone);
CREATE INDEX idx_homologations_email ON homologations(email);
CREATE INDEX idx_homologations_dni ON homologations(dni);
CREATE INDEX idx_homologations_trailer ON homologations(trailer_id);

-- Indexes for payments
CREATE INDEX idx_payments_homologation ON payments(homologation_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_transaction ON payments(transaction_id) WHERE transaction_id IS NOT NULL;

-- Indexes for pictures
CREATE INDEX idx_pictures_homologation ON pictures(homologation_id);
CREATE INDEX idx_pictures_type ON pictures(type) WHERE type IS NOT NULL;
CREATE INDEX idx_pictures_category ON pictures(category) WHERE category IS NOT NULL;

-- Index for audit log
CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_changed_at ON audit_log(changed_at);

-- ============================================
-- TRIGGERS AND FUNCTIONS
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

-- Function to get the current IP address (if available)
CREATE OR REPLACE FUNCTION current_ip_address()
RETURNS INET AS $$
BEGIN
    RETURN current_setting('app.client_ip', TRUE)::INET;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
EOL

# Then execute the fixed schema
docker exec -i av_db psql -U avuser -d av < /tmp/fixed_schema.sql