-- =============================================
-- Seed Data for Development
-- =============================================

-- First, let's create admin users if they don't exist
-- Note: All passwords are hashed with bcrypt and set to 'Admin@123'

-- System Admin (created by initial migration)
-- Username: admin
-- Password: Admin@123

-- Additional admin users
INSERT IGNORE INTO users (
    id,
    username,
    email,
    password_hash,
    full_name,
    role,
    is_active,
    created_by,
    updated_by
) VALUES 
-- Admin 1
('11111111-1111-1111-1111-111111111111', 
 'admin1', 
 'admin1@example.com', 
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
 'John Admin', 
 'admin', 
 TRUE,
 '00000000-0000-0000-0000-000000000000',
 '00000000-0000-0000-0000-000000000000'),
 
-- Admin 2
('22222222-2222-2222-2222-222222222222', 
 'admin2', 
 'admin2@example.com', 
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
 'Jane Admin', 
 'admin', 
 TRUE,
 '00000000-0000-0000-0000-000000000000',
 '00000000-0000-0000-0000-000000000000');

-- =============================================
-- Sample Homologation Records
-- =============================================

-- Pending Review Homologation
INSERT INTO homologations (
    id,
    trailer_type,
    trailer_dimensions,
    trailer_number_of_axles,
    trailer_license_plate_number,
    owner_full_name,
    owner_national_id,
    owner_phone,
    owner_email,
    status,
    created_by,
    updated_by
) VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    'Trailer',
    '8.5x2.5x4.0m',
    2,
    'ABC123',
    'Alice User',
    '1234567890',
    '+1234567890',
    'alice@example.com',
    'Pending Review',
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111'
);

-- Approved Homologation
INSERT INTO homologations (
    id,
    trailer_type,
    trailer_dimensions,
    trailer_number_of_axles,
    trailer_license_plate_number,
    owner_full_name,
    owner_national_id,
    owner_phone,
    owner_email,
    status,
    created_by,
    updated_by,
    updated_at
) VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
    'Rolling Box',
    '12.0x2.6x3.8m',
    3,
    'XYZ789',
    'Bob User',
    '0987654321',
    '+1987654321',
    'bob@example.com',
    'Approved',
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    DATE_SUB(NOW(), INTERVAL 2 DAY)
);

-- Rejected Homologation
INSERT INTO homologations (
    id,
    trailer_type,
    trailer_dimensions,
    trailer_number_of_axles,
    trailer_license_plate_number,
    owner_full_name,
    owner_national_id,
    owner_phone,
    owner_email,
    status,
    created_by,
    updated_by,
    updated_at
) VALUES (
    'cccccccc-cccc-cccc-cccc-ccccccccccc3',
    'Motorhome',
    '7.0x2.3x3.0m',
    2,
    'MOTOR123',
    'Charlie Rejected',
    '1122334455',
    '+14155551234',
    'charlie@example.com',
    'Rejected',
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    DATE_SUB(NOW(), INTERVAL 1 DAY)
);

-- =============================================
-- Sample Audit Logs
-- =============================================
INSERT INTO audit_logs (
    id,
    entity_type,
    entity_id,
    action,
    old_values,
    new_values,
    created_by
) VALUES 
-- Approval of Bob's homologation
('d1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1',
 'homologation',
 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
 'status_change',
 '{"status": "Pending Review"}',
 '{"status": "Approved"}',
 '11111111-1111-1111-1111-111111111111'
),

-- Rejection of Charlie's homologation
('e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2',
 'homologation',
 'cccccccc-cccc-cccc-cccc-ccccccccccc3',
 'status_change',
 '{"status": "Pending Review"}',
 '{"status": "Rejected", "reason": "Incomplete documentation"}',
 '11111111-1111-1111-1111-111111111111'
);

-- =============================================
-- Sample Photos (metadata only - actual files would be handled by the application)
-- =============================================
INSERT INTO photos (
    id,
    homologation_id,
    file_name,
    file_path,
    file_size,
    mime_type,
    is_id_document,
    created_by
) VALUES 
-- Photos for approved homologation
('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1',
 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
 'trailer_front.jpg',
 '/uploads/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2/trailer_front.jpg',
 1024000,
 'image/jpeg',
 FALSE,
 '33333333-3333-3333-3333-333333333333'
),

-- ID document for approved homologation
('f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2',
 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
 'id_document.pdf',
 '/uploads/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2/id_document.pdf',
 512000,
 'application/pdf',
 TRUE,
 '33333333-3333-3333-3333-333333333333'
);

-- =============================================
-- End of Seed Data
-- =============================================
