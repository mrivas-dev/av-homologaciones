-- =============================================
-- Trailer Types Table
-- Stores configurable trailer types with prices and reference photos
-- Managed by administrators via the admin panel
-- =============================================
CREATE TABLE IF NOT EXISTS trailer_types (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    price INT NOT NULL,  -- Price in cents (e.g., 10000 = $100.00 ARS)
    reference_photos JSON,  -- Array of {label, path} objects
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(36) NOT NULL,
    updated_by VARCHAR(36) NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Indexes for Performance
-- =============================================
CREATE INDEX idx_trailer_types_is_active ON trailer_types(is_active);
CREATE INDEX idx_trailer_types_sort_order ON trailer_types(sort_order);

-- =============================================
-- Seed Initial Data
-- Migrate existing hardcoded trailer types with their prices and reference photos
-- Note: Only inserts if admin user exists and types don't already exist
-- =============================================

-- Insert Trailer type (only if it doesn't exist and admin user exists)
INSERT INTO trailer_types (id, name, slug, price, reference_photos, is_active, sort_order, created_by, updated_by)
SELECT 
    UUID(),
    'Trailer',
    'trailer',
    100,  -- 100 cents = $1.00 ARS (placeholder price)
    JSON_ARRAY(
        JSON_OBJECT('label', 'Frontal', 'path', '/reference_photos/trailer/frontal.jpeg'),
        JSON_OBJECT('label', 'Lateral', 'path', '/reference_photos/trailer/lateral.jpeg'),
        JSON_OBJECT('label', 'Trasera', 'path', '/reference_photos/trailer/trasera.jpeg'),
        JSON_OBJECT('label', 'Ficha eléctrica', 'path', '/reference_photos/ficha_electrica.jpeg')
    ),
    TRUE,
    1,
    admin.id,
    admin.id
FROM (SELECT id FROM users WHERE role = 'Admin' LIMIT 1) AS admin
WHERE NOT EXISTS (SELECT 1 FROM trailer_types WHERE name = 'Trailer');

-- Insert Rolling Box type (only if it doesn't exist and admin user exists)
INSERT INTO trailer_types (id, name, slug, price, reference_photos, is_active, sort_order, created_by, updated_by)
SELECT 
    UUID(),
    'Rolling Box',
    'rolling-box',
    200,  -- 200 cents = $2.00 ARS (placeholder price)
    JSON_ARRAY(
        JSON_OBJECT('label', 'Frontal', 'path', '/reference_photos/rollingbox/frontal.jpeg'),
        JSON_OBJECT('label', 'Lateral', 'path', '/reference_photos/rollingbox/lateral.jpeg'),
        JSON_OBJECT('label', 'Trasera', 'path', '/reference_photos/rollingbox/trasera.jpeg'),
        JSON_OBJECT('label', 'Rueda de auxilio', 'path', '/reference_photos/rollingbox/rueda_auxilio.jpeg'),
        JSON_OBJECT('label', 'Ficha eléctrica', 'path', '/reference_photos/ficha_electrica.jpeg')
    ),
    TRUE,
    2,
    admin.id,
    admin.id
FROM (SELECT id FROM users WHERE role = 'Admin' LIMIT 1) AS admin
WHERE NOT EXISTS (SELECT 1 FROM trailer_types WHERE name = 'Rolling Box');

-- Insert Motorhome type (only if it doesn't exist and admin user exists)
INSERT INTO trailer_types (id, name, slug, price, reference_photos, is_active, sort_order, created_by, updated_by)
SELECT 
    UUID(),
    'Motorhome',
    'motorhome',
    300,  -- 300 cents = $3.00 ARS (placeholder price)
    JSON_ARRAY(
        JSON_OBJECT('label', 'Frontal', 'path', '/ejemplo_trailer_frontal.jpg'),
        JSON_OBJECT('label', 'Lateral', 'path', '/ejemplo_trailer_lateral.jpg'),
        JSON_OBJECT('label', 'Chasis', 'path', '/ejemplo_trailer_chasis.jpg')
    ),
    TRUE,
    3,
    admin.id,
    admin.id
FROM (SELECT id FROM users WHERE role = 'Admin' LIMIT 1) AS admin
WHERE NOT EXISTS (SELECT 1 FROM trailer_types WHERE name = 'Motorhome');

