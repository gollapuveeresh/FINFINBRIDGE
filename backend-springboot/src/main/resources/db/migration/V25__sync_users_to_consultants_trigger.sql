-- One-time backfill to copy all existing consultants from 'users' to 'consultants' table
INSERT INTO consultants (
    id, name, email, password, role, department, phone, 
    company_name, is_active, is_email_verified, created_at, updated_at
)
SELECT 
    id, 
    LEFT(name, 255), 
    LEFT(email, 255), 
    password, 
    LEFT(role, 50), 
    LEFT(department, 100), 
    LEFT(phone, 20), 
    LEFT(company_name, 255), 
    is_active, 
    is_email_verified, 
    created_at, 
    updated_at
FROM users
WHERE role = 'consultant'
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    phone = EXCLUDED.phone,
    company_name = EXCLUDED.company_name,
    is_active = EXCLUDED.is_active,
    is_email_verified = EXCLUDED.is_email_verified,
    updated_at = EXCLUDED.updated_at;
