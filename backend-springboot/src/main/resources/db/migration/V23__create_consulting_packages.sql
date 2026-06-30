CREATE TABLE consulting_packages (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    department VARCHAR(100) NOT NULL,
    price DECIMAL(15,2),
    duration VARCHAR(100),
    features JSONB,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE organization_packages (
    organization_id UUID PRIMARY KEY,
    selected_package VARCHAR(255)
);

CREATE TABLE lead_packages (
    lead_id UUID PRIMARY KEY,
    selected_package VARCHAR(255)
);

-- Seed initial packages
INSERT INTO consulting_packages (id, name, description, department, price, duration, features, status)
VALUES
  ('34f24ef3-4623-45f2-9f6b-7dcb468a3561', 'Startup Launch Package', 'End-to-end investment and structuring support for early-stage startups.', 'investment', 150000.00, '3 Months', '["Business Planning", "Financial Structuring", "Pitch Deck Review"]'::jsonb, 'Active'),
  ('a82084df-f2d4-4a41-86ad-c3359d8ab82a', 'Investor Connect', 'Direct introductions and pitch preparation for venture capital matchmaking.', 'investment', 250000.00, '6 Months', '["Investor Matching", "Funding Strategy", "Term Sheet Advisory"]'::jsonb, 'Active'),
  ('9e8cb283-d2d4-4a41-b6ad-c3359d8ab341', 'Standard Investment Advisory', 'Custom investment portfolio strategy and market intelligence.', 'investment', 75000.00, '12 Months', '["Asset Allocation", "Portfolio Rebalancing", "Quarterly Reviews"]'::jsonb, 'Active'),
  ('b09cb432-d2d4-4a41-b6ad-c3359d8ab432', 'Tax Shield Pro', 'Comprehensive tax optimization and mitigation strategy.', 'tax', 50000.00, '12 Months', '["Deduction Optimization", "Audit Protection", "Tax Filing Reviews"]'::jsonb, 'Active'),
  ('c09cb432-d2d4-4a41-b6ad-c3359d8ab433', 'Business Tax Advisory', 'Corporate tax filing, GST audit, and payroll tax management.', 'tax', 120000.00, '12 Months', '["GST Compliance", "Corporate Filing", "Quarterly Audits"]'::jsonb, 'Active'),
  ('d09cb432-d2d4-4a41-b6ad-c3359d8ab434', 'Tax Planning', 'Basic tax planning advice and personal exemption optimization.', 'tax', 25000.00, '12 Months', '["Basic Planning", "80C/80D Guidance", "Form 16 Analysis"]'::jsonb, 'Active'),
  ('e09cb432-d2d4-4a41-b6ad-c3359d8ab435', 'Growth Capital Program', 'Strategic advisory for scaling businesses to raise debt capital.', 'loans', 180000.00, '6 Months', '["Debt Capacity Audit", "Lender Matchmaking", "Financial Modeling"]'::jsonb, 'Active'),
  ('f09cb432-d2d4-4a41-b6ad-c3359d8ab436', 'Business Loan Advisory', 'Liaison with premium banks for corporate expansion credit lines.', 'loans', 100000.00, '6 Months', '["Bank Matchmaking", "Rate Negotiation", "Collateral Optimization"]'::jsonb, 'Active'),
  ('109cb432-d2d4-4a41-b6ad-c3359d8ab437', 'Home Loan Assistance', 'End-to-end guidance and approval processing for property purchases.', 'loans', 30000.00, '3 Months', '["Bank Pre-Approval", "Property Valuations", "Documentation Help"]'::jsonb, 'Active'),
  ('209cb432-d2d4-4a41-b6ad-c3359d8ab438', 'Insurance Planning', 'Personalized risk auditing and optimal coverage structuring.', 'insurance', 15000.00, '12 Months', '["Risk Audit", "LIC Selection", "Premium Minimization"]'::jsonb, 'Active'),
  ('309cb432-d2d4-4a41-b6ad-c3359d8ab439', 'Corporate Insurance Package', 'Group health, keyman, and corporate liability coverage setup.', 'insurance', 80000.00, '12 Months', '["Group Health Setup", "Keyman Insurance", "Director Liability Cover"]'::jsonb, 'Active'),
  ('409cb432-d2d4-4a41-b6ad-c3359d8ab440', 'Wealth Growth Program', 'High-net-worth portfolio management, alternative assets, and estate setup.', 'wealth', 200000.00, '12 Months', '["HNW Allocations", "Estate Planning", "Alternative Investments"]'::jsonb, 'Active'),
  ('509cb432-d2d4-4a41-b6ad-c3359d8ab441', 'Retirement Planning Package', 'Long-term pension planning and secure capital preservation strategies.', 'wealth', 90000.00, '12 Months', '["Pension Allocations", "Annuity Selection", "Inflation Protection"]'::jsonb, 'Active');
