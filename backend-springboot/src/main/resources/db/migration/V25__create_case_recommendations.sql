CREATE TABLE IF NOT EXISTS case_recommendations (
    id UUID PRIMARY KEY,
    case_id UUID NOT NULL,
    organization_id UUID REFERENCES organizations(id),
    client_id UUID REFERENCES users(id),
    consultant_id UUID REFERENCES users(id),
    department VARCHAR(50) NOT NULL,
    recommendation_data TEXT NOT NULL,
    recommendation_notes TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_case_recs_case_id ON case_recommendations(case_id);
CREATE INDEX IF NOT EXISTS idx_case_recs_client_id ON case_recommendations(client_id);
CREATE INDEX IF NOT EXISTS idx_case_recs_org_id ON case_recommendations(organization_id);
