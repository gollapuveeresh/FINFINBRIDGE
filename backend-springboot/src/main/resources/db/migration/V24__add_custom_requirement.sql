-- V24__add_custom_requirement.sql
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS custom_requirement TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS custom_requirement TEXT;
