-- V24__add_custom_requirement.sql
-- Alter secondary tables that are owned by finbridge_svc
ALTER TABLE organization_packages ADD COLUMN IF NOT EXISTS custom_requirement TEXT;
ALTER TABLE lead_packages ADD COLUMN IF NOT EXISTS custom_requirement TEXT;
