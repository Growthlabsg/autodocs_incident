-- TIER 4 & 5 Database Schema Additions
-- Complete incident.io competitor features

-- ============================================
-- SLACK INTEGRATION
-- ============================================

ALTER TABLE incidents 
ADD COLUMN IF NOT EXISTS slack_channel_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS commander_slack_id VARCHAR(255);

-- ============================================
-- INCIDENT ROLES
-- ============================================

CREATE TABLE IF NOT EXISTS incident_roles (
    id SERIAL PRIMARY KEY,
    incident_id INTEGER REFERENCES incidents(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- incident_commander, tech_lead, comms_lead, scribe
    assigned_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(incident_id, role)
);

CREATE INDEX idx_incident_roles_incident ON incident_roles(incident_id);
CREATE INDEX idx_incident_roles_user ON incident_roles(user_id);

-- ============================================
-- INCIDENT TIMELINE
-- ============================================

CREATE TABLE IF NOT EXISTS incident_timeline (
    id SERIAL PRIMARY KEY,
    incident_id INTEGER REFERENCES incidents(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- status_change, role_change, update, escalation, etc.
    message TEXT NOT NULL,
    user_id INTEGER REFERENCES users(id),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_incident_timeline_incident ON incident_timeline(incident_id);
CREATE INDEX idx_incident_timeline_created ON incident_timeline(created_at);

-- ============================================
-- ADVANCED STATUS PAGES
-- ============================================

CREATE TABLE IF NOT EXISTS status_pages_v2 (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(20) DEFAULT 'public', -- public, private, internal
    custom_domain VARCHAR(255),
    branding JSONB, -- {logo_url, primary_color, remove_powered_by}
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS status_page_components (
    id SERIAL PRIMARY KEY,
    status_page_id INTEGER REFERENCES status_pages_v2(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'operational', -- operational, degraded, partial_outage, major_outage, maintenance
    component_group VARCHAR(100),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_status_components_page ON status_page_components(status_page_id);

CREATE TABLE IF NOT EXISTS component_uptime (
    id SERIAL PRIMARY KEY,
    component_id INTEGER REFERENCES status_page_components(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    uptime_percentage DECIMAL(5,2) DEFAULT 100.0,
    total_minutes INTEGER DEFAULT 0,
    down_minutes INTEGER DEFAULT 0,
    UNIQUE(component_id, date)
);

CREATE INDEX idx_component_uptime ON component_uptime(component_id, date);

CREATE TABLE IF NOT EXISTS component_status_history (
    id SERIAL PRIMARY KEY,
    component_id INTEGER REFERENCES status_page_components(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS status_page_subscribers (
    id SERIAL PRIMARY KEY,
    status_page_id INTEGER REFERENCES status_pages_v2(id) ON DELETE CASCADE,
    email VARCHAR(255),
    phone VARCHAR(20),
    slack_webhook TEXT,
    notification_type VARCHAR(20) DEFAULT 'email', -- email, slack, sms
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscribers_page ON status_page_subscribers(status_page_id);
CREATE INDEX idx_subscribers_active ON status_page_subscribers(is_active);

CREATE TABLE IF NOT EXISTS status_page_views (
    id SERIAL PRIMARY KEY,
    status_page_id INTEGER REFERENCES status_pages_v2(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_status_views_page ON status_page_views(status_page_id, viewed_at);

CREATE TABLE IF NOT EXISTS status_page_incidents_v2 (
    id SERIAL PRIMARY KEY,
    status_page_id INTEGER REFERENCES status_pages_v2(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    severity VARCHAR(20),
    status VARCHAR(50) DEFAULT 'investigating',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS incident_affected_components (
    incident_id INTEGER REFERENCES status_page_incidents_v2(id) ON DELETE CASCADE,
    component_id INTEGER REFERENCES status_page_components(id) ON DELETE CASCADE,
    PRIMARY KEY (incident_id, component_id)
);

-- ============================================
-- CUSTOM FIELDS
-- ============================================

CREATE TABLE IF NOT EXISTS custom_field_definitions (
    id SERIAL PRIMARY KEY,
    org_id INTEGER DEFAULT 1,
    field_name VARCHAR(100) NOT NULL,
    field_key VARCHAR(100) NOT NULL,
    field_type VARCHAR(20) NOT NULL, -- text, select, multi_select, number, date, boolean, user
    is_required BOOLEAN DEFAULT false,
    options JSONB, -- For select/multi_select
    default_value TEXT,
    description TEXT,
    applies_to VARCHAR(20) DEFAULT 'incident', -- incident, service, user
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(org_id, field_key, applies_to)
);

CREATE TABLE IF NOT EXISTS custom_field_values (
    id SERIAL PRIMARY KEY,
    field_definition_id INTEGER REFERENCES custom_field_definitions(id) ON DELETE CASCADE,
    entity_type VARCHAR(20) NOT NULL, -- incident, service, user
    entity_id INTEGER NOT NULL,
    field_value JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(field_definition_id, entity_type, entity_id)
);

CREATE INDEX idx_custom_values_entity ON custom_field_values(entity_type, entity_id);

-- ============================================
-- ALERT ROUTING
-- ============================================

CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    source VARCHAR(100) NOT NULL,
    title VARCHAR(500) NOT NULL,
    body TEXT,
    severity VARCHAR(20),
    metadata JSONB,
    external_alert_id VARCHAR(255),
    raw_payload JSONB,
    status VARCHAR(20) DEFAULT 'open', -- open, suppressed, resolved
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

CREATE INDEX idx_alerts_source ON alerts(source);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_created ON alerts(created_at);

CREATE TABLE IF NOT EXISTS alert_routing_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    conditions JSONB NOT NULL, -- {operator: 'AND', rules: [{field, operator, value}]}
    actions JSONB NOT NULL, -- [{type, config}]
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_routing_rules_active ON alert_routing_rules(is_active, priority);

CREATE TABLE IF NOT EXISTS alert_groups (
    id SERIAL PRIMARY KEY,
    primary_alert_id INTEGER REFERENCES alerts(id) ON DELETE CASCADE,
    grouped_alert_ids INTEGER[],
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ADVANCED ON-CALL
-- ============================================

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS slack_user_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_comms_eligible BOOLEAN DEFAULT false;

ALTER TABLE oncall_shifts
ADD COLUMN IF NOT EXISTS is_commander_eligible BOOLEAN DEFAULT true;

CREATE TABLE IF NOT EXISTS shift_swaps (
    id SERIAL PRIMARY KEY,
    shift_id INTEGER REFERENCES oncall_shifts(id) ON DELETE CASCADE,
    from_user_id INTEGER REFERENCES users(id),
    to_user_id INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected
    requested_at TIMESTAMP DEFAULT NOW(),
    responded_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS oncall_pay_config (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    hourly_rate DECIMAL(10,2) DEFAULT 0,
    weekend_multiplier DECIMAL(3,2) DEFAULT 1.5,
    holiday_multiplier DECIMAL(3,2) DEFAULT 2.0,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- WORKFLOW EXECUTION LOG
-- ============================================

CREATE TABLE IF NOT EXISTS workflow_executions (
    id SERIAL PRIMARY KEY,
    workflow_id INTEGER REFERENCES workflows(id) ON DELETE CASCADE,
    incident_id INTEGER REFERENCES incidents(id) ON DELETE CASCADE,
    trigger_event VARCHAR(100),
    steps_executed JSONB, -- [{step, status, output, error}]
    status VARCHAR(20) DEFAULT 'success', -- success, failed, partial
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    error_message TEXT
);

CREATE INDEX idx_workflow_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_incident ON workflow_executions(incident_id);

-- ============================================
-- DEPENDENCIES
-- ============================================

CREATE TABLE IF NOT EXISTS service_dependencies (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    depends_on_service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    dependency_type VARCHAR(50) DEFAULT 'soft', -- hard, soft
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(service_id, depends_on_service_id)
);

CREATE INDEX idx_dependencies_service ON service_dependencies(service_id);

-- ============================================
-- CATALOG ENHANCEMENTS
-- ============================================

ALTER TABLE services
ADD COLUMN IF NOT EXISTS tier INTEGER DEFAULT 3, -- 1, 2, 3
ADD COLUMN IF NOT EXISTS slo_target DECIMAL(5,2), -- e.g., 99.95
ADD COLUMN IF NOT EXISTS region VARCHAR(100),
ADD COLUMN IF NOT EXISTS runbook_url TEXT;

ALTER TABLE teams
ADD COLUMN IF NOT EXISTS slack_channel VARCHAR(100);

-- ============================================
-- SCRIBE TRANSCRIPTS
-- ============================================

CREATE TABLE IF NOT EXISTS scribe_transcripts (
    id SERIAL PRIMARY KEY,
    incident_id INTEGER REFERENCES incidents(id) ON DELETE CASCADE,
    meeting_url TEXT,
    transcript_text TEXT,
    summary TEXT,
    key_moments JSONB, -- [{timestamp, type, content}]
    duration_minutes INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- GRANTS (assuming www-data user)
-- ============================================

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "www-data";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "www-data";

