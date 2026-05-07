-- AutoDocs + AutoIncident Enterprise Database Schema
-- PostgreSQL 14+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'user', -- admin, user, viewer
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TEAMS & ORGANIZATIONS
-- ============================================

CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- lead, member
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, user_id)
);

-- ============================================
-- AUTOINCIDENT: INCIDENTS
-- ============================================

CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_number VARCHAR(50) UNIQUE NOT NULL, -- INC-001, INC-002
    title VARCHAR(500) NOT NULL,
    description TEXT,
    severity VARCHAR(20) NOT NULL, -- SEV1, SEV2, SEV3, SEV4
    status VARCHAR(50) NOT NULL DEFAULT 'investigating', -- investigating, monitoring, resolved, closed
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    created_by UUID REFERENCES users(id),
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE incident_assignees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(incident_id, user_id)
);

CREATE TABLE incident_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    message TEXT NOT NULL,
    status_change VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE incident_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(incident_id, service_id)
);

-- ============================================
-- AUTOINCIDENT: ON-CALL SCHEDULES
-- ============================================

CREATE TABLE oncall_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    timezone VARCHAR(100) DEFAULT 'UTC',
    rotation_type VARCHAR(50) DEFAULT 'weekly', -- daily, weekly, custom
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE oncall_shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID REFERENCES oncall_schedules(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    is_override BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- AUTOINCIDENT: SERVICES
-- ============================================

CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'operational', -- operational, degraded, outage
    owner_team_id UUID REFERENCES teams(id),
    repository_url TEXT,
    documentation_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE service_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    depends_on_service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(service_id, depends_on_service_id)
);

-- ============================================
-- AUTOINCIDENT: STATUS PAGES
-- ============================================

CREATE TABLE status_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE,
    custom_domain VARCHAR(255),
    is_public BOOLEAN DEFAULT true,
    branding_logo_url TEXT,
    branding_color VARCHAR(7) DEFAULT '#0F7377',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE status_page_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    status_page_id UUID REFERENCES status_pages(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE status_page_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    status_page_id UUID REFERENCES status_pages(id) ON DELETE CASCADE,
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- AUTOINCIDENT: POST-MORTEMS
-- ============================================

CREATE TABLE postmortems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    summary TEXT,
    root_cause TEXT,
    impact TEXT,
    timeline JSONB,
    action_items JSONB,
    lessons_learned TEXT,
    created_by UUID REFERENCES users(id),
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- AUTODOCS: DOCUMENTATION
-- ============================================

CREATE TABLE documentation_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE,
    custom_domain VARCHAR(255),
    repository_url TEXT,
    is_public BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE documentation_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES documentation_projects(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    content TEXT,
    parent_id UUID REFERENCES documentation_pages(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, slug)
);

CREATE TABLE documentation_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID REFERENCES documentation_pages(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    version_number INTEGER NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ANALYTICS
-- ============================================

CREATE TABLE page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID REFERENCES documentation_pages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES documentation_projects(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    results_count INTEGER,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INTEGRATIONS
-- ============================================

CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL, -- slack, pagerduty, datadog, github, jira
    config JSONB NOT NULL, -- API keys, webhooks, etc (encrypted)
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- AUDIT LOGS
-- ============================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- create, update, delete, login, etc
    entity_type VARCHAR(100) NOT NULL, -- incident, user, page, etc
    entity_id UUID,
    changes JSONB,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- Incidents
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_created_at ON incidents(created_at DESC);
CREATE INDEX idx_incidents_number ON incidents(incident_number);
CREATE INDEX idx_incident_updates_incident_id ON incident_updates(incident_id);

-- On-call
CREATE INDEX idx_oncall_shifts_user_id ON oncall_shifts(user_id);
CREATE INDEX idx_oncall_shifts_schedule_id ON oncall_shifts(schedule_id);
CREATE INDEX idx_oncall_shifts_time ON oncall_shifts(start_time, end_time);

-- Documentation
CREATE INDEX idx_documentation_pages_project_id ON documentation_pages(project_id);
CREATE INDEX idx_documentation_pages_slug ON documentation_pages(slug);
CREATE INDEX idx_documentation_pages_published ON documentation_pages(is_published);
CREATE INDEX idx_page_views_page_id ON page_views(page_id);
CREATE INDEX idx_searches_project_id ON searches(project_id);

-- Analytics
CREATE INDEX idx_page_views_viewed_at ON page_views(viewed_at DESC);
CREATE INDEX idx_searches_created_at ON searches(created_at DESC);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documentation_pages_updated_at BEFORE UPDATE ON documentation_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate incident numbers
CREATE SEQUENCE incident_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_incident_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.incident_number IS NULL THEN
        NEW.incident_number := 'INC-' || LPAD(nextval('incident_number_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_incident_number BEFORE INSERT ON incidents
    FOR EACH ROW EXECUTE FUNCTION generate_incident_number();

-- ============================================
-- SAMPLE DATA (for testing)
-- ============================================

-- Insert admin user (password: Admin123!)
INSERT INTO users (email, password_hash, first_name, last_name, role, email_verified) VALUES
('admin@autodocs.com', '$2b$10$rQ8YvV8F.9p0qyX5L7Kt2OmYZKj7qxO8w0b0t8LGxQz0j8K9YzR3K', 'Admin', 'User', 'admin', true);

-- Insert sample teams
INSERT INTO teams (name, description, created_by) VALUES
('Platform Team', 'Infrastructure and platform services', (SELECT id FROM users WHERE email = 'admin@autodocs.com')),
('Engineering Team', 'Product engineering', (SELECT id FROM users WHERE email = 'admin@autodocs.com'));

-- Insert sample services
INSERT INTO services (name, description, status, owner_team_id) VALUES
('API Gateway', 'Main API gateway service', 'operational', (SELECT id FROM teams WHERE name = 'Platform Team')),
('User Service', 'User authentication and management', 'operational', (SELECT id FROM teams WHERE name = 'Platform Team')),
('Payment Service', 'Payment processing', 'operational', (SELECT id FROM teams WHERE name = 'Engineering Team')),
('Frontend', 'Web application frontend', 'operational', (SELECT id FROM teams WHERE name = 'Engineering Team'));

-- ============================================
-- VIEWS FOR REPORTING
-- ============================================

CREATE VIEW incident_metrics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    severity,
    COUNT(*) as count,
    AVG(EXTRACT(EPOCH FROM (resolved_at - started_at))/3600) as avg_resolution_hours
FROM incidents
WHERE resolved_at IS NOT NULL
GROUP BY DATE_TRUNC('day', created_at), severity;

CREATE VIEW oncall_current AS
SELECT 
    s.id as shift_id,
    s.schedule_id,
    sch.name as schedule_name,
    u.id as user_id,
    u.first_name,
    u.last_name,
    u.email,
    s.start_time,
    s.end_time
FROM oncall_shifts s
JOIN users u ON s.user_id = u.id
JOIN oncall_schedules sch ON s.schedule_id = sch.id
WHERE s.start_time <= CURRENT_TIMESTAMP 
  AND s.end_time >= CURRENT_TIMESTAMP
  AND sch.is_active = true;

-- ============================================
-- PERMISSIONS (Row Level Security)
-- ============================================

-- Enable RLS
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentation_pages ENABLE ROW LEVEL SECURITY;

-- Policies (users can see incidents they're assigned to or public ones)
CREATE POLICY incident_access ON incidents
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM incident_assignees 
            WHERE incident_id = incidents.id 
            AND user_id = current_setting('app.current_user_id')::UUID
        )
        OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = current_setting('app.current_user_id')::UUID 
            AND role = 'admin'
        )
    );

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE users IS 'User accounts and authentication';
COMMENT ON TABLE incidents IS 'Incident tracking and management';
COMMENT ON TABLE oncall_schedules IS 'On-call rotation schedules';
COMMENT ON TABLE services IS 'Service catalog and dependencies';
COMMENT ON TABLE documentation_pages IS 'Documentation content pages';
COMMENT ON TABLE audit_logs IS 'System audit trail';

-- ============================================
-- GRANTS (adjust based on your user setup)
-- ============================================

-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;