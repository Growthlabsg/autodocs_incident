# 🚀 AutoDocs+AutoIncident API Documentation

**Version:** 1.0.0  
**Base URL:** `https://api.autodocs.com`  
**Last Updated:** May 7, 2026

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Rate Limiting](#rate-limiting)
3. [Error Handling](#error-handling)
4. [Incidents API](#incidents-api)
5. [Teams API](#teams-api)
6. [Services API](#services-api)
7. [On-Call API](#on-call-api)
8. [Workflows API](#workflows-api)
9. [Analytics API](#analytics-api)
10. [Slack Integration API](#slack-integration-api)
11. [Incident Roles API](#incident-roles-api)
12. [Status Pages API](#status-pages-api)
13. [Custom Fields API](#custom-fields-api)
14. [Alert Routing API](#alert-routing-api)
15. [Advanced On-Call API](#advanced-on-call-api)
16. [AI Features API](#ai-features-api)
17. [Integrations API](#integrations-api)
18. [Webhooks](#webhooks)
19. [Code Examples](#code-examples)

---

## 🔐 Authentication

All API requests require authentication using JWT tokens or API keys.

### JWT Authentication

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@company.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@company.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "admin"
  }
}
```

### Using the Token

Include the JWT token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### API Key Authentication

For server-to-server integration, use API keys:

```http
X-API-Key: your_api_key_here
```

### SSO/SAML

```http
GET /api/auth/saml/login?org_id=123
```

---

## ⚡ Rate Limiting

- **Standard Plan:** 1,000 requests/hour
- **Professional Plan:** 5,000 requests/hour
- **Enterprise Plan:** 50,000 requests/hour

Rate limit headers are included in every response:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1620000000
```

---

## ❌ Error Handling

### Standard Error Response

```json
{
  "error": {
    "code": "INCIDENT_NOT_FOUND",
    "message": "Incident with ID 123 not found",
    "details": {
      "incident_id": 123
    }
  }
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

### Error Codes

| Code | Description |
|------|-------------|
| `INVALID_TOKEN` | JWT token is invalid or expired |
| `INCIDENT_NOT_FOUND` | Incident does not exist |
| `PERMISSION_DENIED` | User lacks required permissions |
| `VALIDATION_ERROR` | Request validation failed |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTEGRATION_ERROR` | Third-party integration failed |

---

## 🚨 Incidents API

### List Incidents

```http
GET /api/incidents
Authorization: Bearer {token}
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status: `investigating`, `monitoring`, `resolved` |
| `severity` | string | Filter by severity: `SEV1`, `SEV2`, `SEV3`, `SEV4` |
| `team_id` | integer | Filter by team |
| `service_id` | integer | Filter by service |
| `assignee_id` | integer | Filter by assignee |
| `page` | integer | Page number (default: 1) |
| `per_page` | integer | Results per page (default: 20, max: 100) |
| `sort` | string | Sort field: `created_at`, `updated_at`, `severity` |
| `order` | string | Sort order: `asc`, `desc` |

**Response:**
```json
{
  "incidents": [
    {
      "id": 123,
      "incident_number": "INC-2024-0123",
      "title": "Database Connection Timeout",
      "description": "Production database experiencing connection pool exhaustion",
      "severity": "SEV1",
      "status": "investigating",
      "created_at": "2024-05-07T10:45:00Z",
      "updated_at": "2024-05-07T11:30:00Z",
      "resolved_at": null,
      "assignees": [
        {
          "id": 5,
          "first_name": "Jane",
          "last_name": "Smith",
          "email": "jane@company.com"
        }
      ],
      "team": {
        "id": 2,
        "name": "Database Team"
      },
      "service": {
        "id": 10,
        "name": "Production Database"
      },
      "slack_channel_id": "C01ABC123",
      "is_private": false,
      "custom_fields": {
        "affected_region": "US-East",
        "customer_impact": 1500
      }
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 156,
    "total_pages": 8
  }
}
```

---

### Create Incident

```http
POST /api/incidents
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "API Rate Limiting Issues",
  "description": "Users experiencing 429 errors on /api/users endpoint",
  "severity": "SEV2",
  "service_id": 15,
  "team_id": 3,
  "assignee_ids": [5, 8],
  "tags": ["api", "rate-limiting", "performance"],
  "is_private": false
}
```

**Response:**
```json
{
  "id": 124,
  "incident_number": "INC-2024-0124",
  "title": "API Rate Limiting Issues",
  "description": "Users experiencing 429 errors on /api/users endpoint",
  "severity": "SEV2",
  "status": "investigating",
  "created_at": "2024-05-07T11:45:00Z",
  "updated_at": "2024-05-07T11:45:00Z",
  "slack_channel_id": "C02XYZ456",
  "assignees": [
    {
      "id": 5,
      "first_name": "Jane",
      "last_name": "Smith"
    },
    {
      "id": 8,
      "first_name": "Bob",
      "last_name": "Johnson"
    }
  ]
}
```

---

### Get Incident

```http
GET /api/incidents/{id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": 123,
  "incident_number": "INC-2024-0123",
  "title": "Database Connection Timeout",
  "description": "Production database experiencing connection pool exhaustion",
  "severity": "SEV1",
  "status": "investigating",
  "created_at": "2024-05-07T10:45:00Z",
  "updated_at": "2024-05-07T11:30:00Z",
  "mttr_minutes": 45,
  "mttd_minutes": 15,
  "assignees": [...],
  "team": {...},
  "service": {...},
  "timeline": [
    {
      "id": 1,
      "event_type": "created",
      "message": "Incident created",
      "user": {
        "id": 1,
        "first_name": "John",
        "last_name": "Doe"
      },
      "created_at": "2024-05-07T10:45:00Z"
    },
    {
      "id": 2,
      "event_type": "status_change",
      "message": "Status changed from 'investigating' to 'monitoring'",
      "user": {...},
      "created_at": "2024-05-07T11:30:00Z"
    }
  ],
  "roles": [
    {
      "role": "incident_commander",
      "user": {
        "id": 5,
        "first_name": "Jane",
        "last_name": "Smith"
      },
      "assigned_at": "2024-05-07T10:45:00Z"
    }
  ],
  "custom_fields": {
    "affected_region": "US-East",
    "customer_tier": "Enterprise",
    "customer_impact": 1500
  },
  "similar_incidents": [
    {
      "id": 98,
      "title": "Database Connection Pool Exhausted",
      "similarity_score": 0.87,
      "resolved_at": "2024-04-15T14:30:00Z"
    }
  ]
}
```

---

### Update Incident

```http
PATCH /api/incidents/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "monitoring",
  "severity": "SEV2",
  "description": "Updated: Issue has been partially mitigated"
}
```

**Response:**
```json
{
  "id": 123,
  "status": "monitoring",
  "severity": "SEV2",
  "updated_at": "2024-05-07T12:00:00Z"
}
```

---

### Post Incident Update

```http
POST /api/incidents/{id}/updates
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "Root cause identified: connection leak in auth service v2.3.1. Rolling back to v2.3.0.",
  "notify_channels": ["slack", "email"],
  "status": "identified"
}
```

**Response:**
```json
{
  "id": 15,
  "incident_id": 123,
  "message": "Root cause identified...",
  "user": {
    "id": 5,
    "first_name": "Jane",
    "last_name": "Smith"
  },
  "created_at": "2024-05-07T11:15:00Z",
  "notifications_sent": {
    "slack": true,
    "email": true,
    "status_page": false
  }
}
```

---

### Resolve Incident

```http
POST /api/incidents/{id}/resolve
Authorization: Bearer {token}
Content-Type: application/json

{
  "resolution_summary": "Rolled back auth service to v2.3.0. Connection pool stable. Monitoring for 30 minutes.",
  "root_cause": "Connection leak in auth service v2.3.1",
  "generate_postmortem": true
}
```

**Response:**
```json
{
  "id": 123,
  "status": "resolved",
  "resolved_at": "2024-05-07T12:30:00Z",
  "mttr_minutes": 105,
  "resolution_summary": "Rolled back auth service...",
  "postmortem_id": 45
}
```

---

### Escalate Incident

```http
POST /api/incidents/{id}/escalate
Authorization: Bearer {token}
Content-Type: application/json

{
  "escalation_level": 2,
  "notify_users": [10, 15, 20],
  "notify_teams": [3],
  "reason": "Issue persists after initial mitigation attempt"
}
```

---

### AI-Powered Features

#### Classify Incident

```http
POST /api/incidents/{id}/classify
Authorization: Bearer {token}
```

**Response:**
```json
{
  "suggested_severity": "SEV2",
  "confidence": 0.87,
  "category": "Database",
  "tags": ["database", "connection-pool", "performance"],
  "similar_incidents": [
    {
      "id": 98,
      "title": "Database Connection Pool Exhausted",
      "similarity": 0.87
    }
  ],
  "suggested_root_cause": "Connection leak in application layer",
  "estimated_mttr_minutes": 90
}
```

#### Generate Post-Mortem

```http
POST /api/incidents/{id}/postmortem/generate
Authorization: Bearer {token}
```

**Response:**
```json
{
  "postmortem": {
    "summary": "On May 7, 2024, our production database experienced...",
    "timeline": [
      {
        "time": "2024-05-07T10:45:00Z",
        "event": "Incident detected via Datadog alert"
      },
      {
        "time": "2024-05-07T10:47:00Z",
        "event": "Database team paged"
      }
    ],
    "root_cause": "A connection leak was introduced in auth service v2.3.1...",
    "contributing_factors": [
      "Insufficient connection pool monitoring",
      "Missing alerts for connection pool saturation"
    ],
    "what_went_well": [
      "Quick detection through monitoring",
      "Effective team coordination"
    ],
    "what_could_improve": [
      "Add connection leak detection in staging",
      "Implement connection pool alerting"
    ],
    "action_items": [
      {
        "description": "Add connection pool monitoring to staging",
        "owner": "Database Team",
        "due_date": "2024-05-14",
        "priority": "high"
      },
      {
        "description": "Review auth service for other resource leaks",
        "owner": "Backend Team",
        "due_date": "2024-05-21",
        "priority": "medium"
      }
    ],
    "customer_impact": "1,500 users experienced 30-second delays in authentication"
  }
}
```

---

## 👥 Teams API

### List Teams

```http
GET /api/teams
Authorization: Bearer {token}
```

**Response:**
```json
{
  "teams": [
    {
      "id": 1,
      "name": "Backend Team",
      "description": "Backend services and APIs",
      "slack_channel": "#backend",
      "members_count": 8,
      "active_incidents_count": 3,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### Create Team

```http
POST /api/teams
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Mobile Team",
  "description": "iOS and Android applications",
  "slack_channel": "#mobile",
  "member_ids": [5, 8, 12]
}
```

---

### Add Team Member

```http
POST /api/teams/{id}/members
Authorization: Bearer {token}
Content-Type: application/json

{
  "user_id": 15,
  "role": "member"
}
```

---

## ⚙️ Services API

### List Services

```http
GET /api/services
Authorization: Bearer {token}
```

**Response:**
```json
{
  "services": [
    {
      "id": 10,
      "name": "Production Database",
      "description": "PostgreSQL primary database",
      "status": "operational",
      "tier": 1,
      "team": {
        "id": 2,
        "name": "Database Team"
      },
      "slo_target": 99.95,
      "current_uptime": 99.97,
      "region": "us-east-1",
      "runbook_url": "https://wiki.company.com/db-runbook",
      "dependencies": [
        {
          "id": 11,
          "name": "Redis Cache",
          "dependency_type": "hard"
        }
      ]
    }
  ]
}
```

---

### Create Service

```http
POST /api/services
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Payment Service",
  "description": "Handles all payment processing",
  "team_id": 3,
  "tier": 1,
  "slo_target": 99.9,
  "region": "us-east-1",
  "runbook_url": "https://wiki.company.com/payments",
  "dependencies": [
    {
      "service_id": 10,
      "dependency_type": "hard"
    }
  ]
}
```

---

### Get Service Health

```http
GET /api/services/{id}/health
Authorization: Bearer {token}
```

**Response:**
```json
{
  "service_id": 10,
  "status": "operational",
  "uptime_7d": 99.98,
  "uptime_30d": 99.95,
  "uptime_90d": 99.93,
  "incidents_7d": 1,
  "incidents_30d": 4,
  "avg_mttr_minutes": 45,
  "last_incident": {
    "id": 123,
    "title": "Database Connection Timeout",
    "resolved_at": "2024-05-07T12:30:00Z"
  }
}
```

---

## 📞 On-Call API

### Get Current On-Call

```http
GET /api/oncall/current
Authorization: Bearer {token}
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `team_id` | integer | Filter by team |

**Response:**
```json
{
  "oncall": [
    {
      "team": {
        "id": 2,
        "name": "Database Team"
      },
      "user": {
        "id": 5,
        "first_name": "Jane",
        "last_name": "Smith",
        "email": "jane@company.com",
        "phone": "+1-555-0123"
      },
      "shift": {
        "id": 150,
        "start_time": "2024-05-07T00:00:00Z",
        "end_time": "2024-05-08T00:00:00Z",
        "is_shadow": false
      },
      "escalation_policy": {
        "id": 5,
        "name": "Database Escalation",
        "levels": [
          {
            "level": 1,
            "delay_minutes": 0,
            "targets": ["user:5"]
          },
          {
            "level": 2,
            "delay_minutes": 15,
            "targets": ["user:10", "user:15"]
          }
        ]
      }
    }
  ]
}
```

---

### Create On-Call Schedule

```http
POST /api/oncall/schedules
Authorization: Bearer {token}
Content-Type: application/json

{
  "team_id": 2,
  "name": "Database Primary",
  "rotation_type": "weekly",
  "rotation_start": "2024-05-07T00:00:00Z",
  "users": [5, 8, 12, 15],
  "timezone": "America/New_York"
}
```

---

### Create Shift

```http
POST /api/oncall/shifts
Authorization: Bearer {token}
Content-Type: application/json

{
  "user_id": 5,
  "team_id": 2,
  "start_time": "2024-05-14T00:00:00Z",
  "end_time": "2024-05-15T00:00:00Z",
  "is_shadow": false
}
```

---

### Get Upcoming Shifts

```http
GET /api/oncall/shifts/upcoming
Authorization: Bearer {token}
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `user_id` | integer | Filter by user |
| `team_id` | integer | Filter by team |
| `days` | integer | Number of days ahead (default: 30) |

---

## 🔄 Workflows API

### List Workflows

```http
GET /api/workflows
Authorization: Bearer {token}
```

**Response:**
```json
{
  "workflows": [
    {
      "id": 10,
      "name": "Auto-assign SEV1 incidents",
      "description": "Automatically assign critical incidents to on-call engineer",
      "trigger": "incident_created",
      "is_active": true,
      "conditions": {
        "operator": "AND",
        "rules": [
          {
            "field": "severity",
            "operator": "equals",
            "value": "SEV1"
          }
        ]
      },
      "steps": [
        {
          "action": "assign_oncall",
          "config": {
            "team_id": 2
          }
        },
        {
          "action": "notify_slack",
          "config": {
            "channel": "#incidents",
            "message": "Critical incident created and assigned"
          }
        }
      ],
      "executions_24h": 5,
      "success_rate": 100
    }
  ]
}
```

---

### Create Workflow

```http
POST /api/workflows
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Escalate after 30 minutes",
  "description": "Auto-escalate unassigned incidents",
  "trigger": "incident_created",
  "conditions": {
    "operator": "AND",
    "rules": [
      {
        "field": "assignee_count",
        "operator": "equals",
        "value": 0
      }
    ]
  },
  "steps": [
    {
      "action": "wait",
      "config": {
        "minutes": 30
      }
    },
    {
      "action": "check_condition",
      "config": {
        "field": "assignee_count",
        "operator": "equals",
        "value": 0
      }
    },
    {
      "action": "escalate",
      "config": {
        "level": 2,
        "notify_users": [10, 15]
      }
    }
  ]
}
```

---

### Execute Workflow

```http
POST /api/workflows/{id}/execute
Authorization: Bearer {token}
Content-Type: application/json

{
  "context": {
    "incident_id": 123
  }
}
```

---

## 📊 Analytics API

### Get Executive Dashboard

```http
GET /api/analytics/executive
Authorization: Bearer {token}
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `start_date` | string | Start date (ISO format) |
| `end_date` | string | End date (ISO format) |
| `team_id` | integer | Filter by team |

**Response:**
```json
{
  "period": {
    "start": "2024-04-07T00:00:00Z",
    "end": "2024-05-07T00:00:00Z"
  },
  "metrics": {
    "total_incidents": 156,
    "incidents_by_severity": {
      "SEV1": 12,
      "SEV2": 28,
      "SEV3": 64,
      "SEV4": 52
    },
    "avg_mttr_minutes": 192,
    "avg_mttd_minutes": 48,
    "sla_compliance": 94.5,
    "resolved_incidents": 145,
    "active_incidents": 11
  },
  "trends": {
    "incidents_change_pct": -8.5,
    "mttr_change_pct": -12.3,
    "sla_compliance_change_pct": 2.1
  },
  "top_affected_services": [
    {
      "service_id": 10,
      "service_name": "Production Database",
      "incident_count": 15
    }
  ],
  "team_performance": [
    {
      "team_id": 2,
      "team_name": "Database Team",
      "incidents_handled": 32,
      "avg_mttr_minutes": 175,
      "sla_compliance": 96.8
    }
  ]
}
```

---

### Get MTTR Trends

```http
GET /api/analytics/mttr
Authorization: Bearer {token}
```

**Response:**
```json
{
  "mttr_by_day": [
    {
      "date": "2024-05-01",
      "avg_mttr_minutes": 185,
      "incident_count": 5
    },
    {
      "date": "2024-05-02",
      "avg_mttr_minutes": 202,
      "incident_count": 7
    }
  ],
  "mttr_by_severity": {
    "SEV1": 85,
    "SEV2": 145,
    "SEV3": 280,
    "SEV4": 420
  },
  "mttr_by_team": [
    {
      "team_id": 2,
      "team_name": "Database Team",
      "avg_mttr_minutes": 175
    }
  ]
}
```

---

## 💬 Slack Integration API

### Send Notification

```http
POST /api/slack/notify
Authorization: Bearer {token}
Content-Type: application/json

{
  "channel": "#incidents",
  "message": "New SEV1 incident created",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*New SEV1 Incident*\nDatabase Connection Timeout"
      }
    }
  ]
}
```

---

### Create Incident Channel

```http
POST /api/slack/channels/incident
Authorization: Bearer {token}
Content-Type: application/json

{
  "incident_id": 123,
  "is_private": false
}
```

**Response:**
```json
{
  "channel_id": "C01ABC123",
  "channel_name": "inc-2024-0123-database-connection",
  "channel_url": "https://company.slack.com/channels/C01ABC123"
}
```

---

### Handle Slash Command (Webhook)

```http
POST /api/slack/commands
Content-Type: application/x-www-form-urlencoded

command=/incident
text=Database issues in production
trigger_id=12345.67890
user_id=U01ABC123
channel_id=C01XYZ789
```

This endpoint is called by Slack when users use slash commands.

---

## 👨‍✈️ Incident Roles API

### Assign Role

```http
POST /api/incidents/{id}/roles
Authorization: Bearer {token}
Content-Type: application/json

{
  "user_id": 5,
  "role": "incident_commander"
}
```

**Available Roles:**
- `incident_commander` - Leads the response
- `tech_lead` - Technical investigation
- `comms_lead` - Communications
- `scribe` - Documentation

**Response:**
```json
{
  "incident_id": 123,
  "role": "incident_commander",
  "user": {
    "id": 5,
    "first_name": "Jane",
    "last_name": "Smith"
  },
  "assigned_at": "2024-05-07T10:45:00Z",
  "responsibilities": [
    "Lead the incident response",
    "Coordinate team members",
    "Make decisions on escalation"
  ]
}
```

---

### Get Incident Roles

```http
GET /api/incidents/{id}/roles
Authorization: Bearer {token}
```

**Response:**
```json
{
  "roles": [
    {
      "role": "incident_commander",
      "user": {
        "id": 5,
        "first_name": "Jane",
        "last_name": "Smith"
      },
      "assigned_at": "2024-05-07T10:45:00Z"
    },
    {
      "role": "tech_lead",
      "user": {
        "id": 8,
        "first_name": "Bob",
        "last_name": "Johnson"
      },
      "assigned_at": "2024-05-07T10:47:00Z"
    }
  ]
}
```

---

### Auto-Assign Roles

```http
POST /api/incidents/{id}/roles/auto-assign
Authorization: Bearer {token}
```

Automatically assigns roles based on:
- Current on-call rotation
- Incident severity
- Team configuration

---

### Remove Role

```http
DELETE /api/incidents/{id}/roles/{role}
Authorization: Bearer {token}
```

---

## 📊 Status Pages API

### List Status Pages

```http
GET /api/status-pages
Authorization: Bearer {token}
```

**Response:**
```json
{
  "status_pages": [
    {
      "id": 1,
      "name": "Public Status",
      "subdomain": "status",
      "type": "public",
      "custom_domain": "status.company.com",
      "url": "https://status.company.com",
      "components_count": 8,
      "subscribers_count": 1250
    }
  ]
}
```

---

### Create Status Page

```http
POST /api/status-pages/advanced
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Public Status",
  "subdomain": "status",
  "type": "public",
  "custom_domain": "status.company.com",
  "branding": {
    "logo_url": "https://company.com/logo.png",
    "primary_color": "#14b8a6",
    "remove_powered_by": true
  }
}
```

---

### Add Component

```http
POST /api/status-pages/{id}/components
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "API Server",
  "description": "Main REST API endpoint",
  "status": "operational",
  "group": "Core Services",
  "display_order": 1
}
```

**Status Options:**
- `operational` - All systems normal
- `degraded` - Performance issues
- `partial_outage` - Some features unavailable
- `major_outage` - Service down
- `maintenance` - Scheduled maintenance

---

### Update Component Status

```http
PATCH /api/status-pages/components/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "degraded",
  "message": "API experiencing increased latency"
}
```

This will:
- Update component status
- Notify all subscribers
- Update uptime tracking
- Post to incident timeline (if linked)

---

### Get Uptime History

```http
GET /api/status-pages/components/{id}/uptime
Authorization: Bearer {token}
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `days` | integer | Number of days (default: 90) |

**Response:**
```json
{
  "component_id": 5,
  "component_name": "API Server",
  "uptime_percentage": 99.97,
  "history": [
    {
      "date": "2024-05-07",
      "uptime_percentage": 100.0,
      "down_minutes": 0
    },
    {
      "date": "2024-05-06",
      "uptime_percentage": 99.3,
      "down_minutes": 10
    }
  ]
}
```

---

### Subscribe to Status Page

```http
POST /api/status-pages/{id}/subscribe
Content-Type: application/json

{
  "email": "user@company.com",
  "notification_type": "email"
}
```

**Notification Types:**
- `email` - Email notifications
- `slack` - Slack webhook
- `sms` - SMS (requires phone number)

**Response:**
```json
{
  "subscription_id": 1234,
  "email": "user@company.com",
  "status_page_id": 1,
  "confirmation_sent": true
}
```

---

### Unsubscribe

```http
DELETE /api/status-pages/subscriptions/{id}
```

---

## 🏷️ Custom Fields API

### Define Custom Field

```http
POST /api/custom-fields/define
Authorization: Bearer {token}
Content-Type: application/json

{
  "field_name": "Affected Region",
  "field_key": "affected_region",
  "field_type": "select",
  "options": ["US-East", "US-West", "EU", "Asia-Pacific", "Global"],
  "is_required": false,
  "description": "Geographic region affected",
  "applies_to": "incident"
}
```

**Field Types:**
- `text` - Single line text
- `select` - Single selection dropdown
- `multi_select` - Multiple selections
- `number` - Numeric value
- `date` - Date picker
- `boolean` - Yes/No checkbox
- `user` - User selector

**Applies To:**
- `incident` - Incident entities
- `service` - Service entities
- `user` - User profiles

---

### Get Field Definitions

```http
GET /api/custom-fields/incident
Authorization: Bearer {token}
```

**Response:**
```json
{
  "fields": [
    {
      "id": 10,
      "field_name": "Affected Region",
      "field_key": "affected_region",
      "field_type": "select",
      "options": ["US-East", "US-West", "EU", "Asia-Pacific", "Global"],
      "is_required": false,
      "description": "Geographic region affected"
    }
  ]
}
```

---

### Set Field Value

```http
POST /api/custom-fields/incident/123
Authorization: Bearer {token}
Content-Type: application/json

{
  "field_key": "affected_region",
  "value": "US-East"
}
```

---

### Get Field Values

```http
GET /api/custom-fields/incident/123
Authorization: Bearer {token}
```

**Response:**
```json
{
  "incident_id": 123,
  "custom_fields": {
    "affected_region": "US-East",
    "customer_tier": "Enterprise",
    "customer_impact": 1500,
    "revenue_impact": 50000
  }
}
```

---

### Create Common Fields

```http
POST /api/custom-fields/common/create
Authorization: Bearer {token}
```

Creates pre-defined common fields:
- Affected Region
- Customer Tier
- Product Area
- Customer Impact
- Revenue Impact

---

## 🔔 Alert Routing API

### Create Routing Rule

```http
POST /api/alert-routing/rules
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Critical Datadog Alerts",
  "description": "Route critical Datadog alerts to backend team",
  "priority": 10,
  "conditions": {
    "operator": "AND",
    "rules": [
      {
        "field": "source",
        "operator": "equals",
        "value": "datadog"
      },
      {
        "field": "severity",
        "operator": "equals",
        "value": "critical"
      }
    ]
  },
  "actions": [
    {
      "type": "page_team",
      "config": {
        "team_id": 3
      }
    },
    {
      "type": "create_incident",
      "config": {
        "severity": "SEV2"
      }
    },
    {
      "type": "notify_slack",
      "config": {
        "channel": "#backend-alerts"
      }
    }
  ]
}
```

**Condition Operators:**
- `equals`, `not_equals`
- `contains`, `not_contains`
- `greater_than`, `less_than`
- `in`, `not_in`

**Action Types:**
- `page_team` - Page on-call team
- `create_incident` - Auto-create incident
- `notify_slack` - Send Slack notification
- `suppress` - Suppress alert
- `auto_resolve` - Auto-resolve after time

---

### Process Alert (Webhook)

```http
POST /api/alerts/webhook
Content-Type: application/json

{
  "source": "datadog",
  "title": "High CPU Usage on prod-web-01",
  "body": "CPU usage at 95% for 5 minutes",
  "severity": "critical",
  "metadata": {
    "host": "prod-web-01",
    "metric": "cpu.usage",
    "value": 95.3
  },
  "alert_id": "dd-12345"
}
```

**Response:**
```json
{
  "success": true,
  "alert_id": 456,
  "actions_taken": [
    {
      "action": "page_team",
      "team_id": 3,
      "status": "success"
    },
    {
      "action": "create_incident",
      "incident_id": 125,
      "status": "success"
    }
  ],
  "suppressed": false,
  "grouped_with": null
}
```

---

### List Alert Sources

```http
GET /api/alert-routing/sources
Authorization: Bearer {token}
```

**Response:**
```json
{
  "sources": [
    {
      "key": "datadog",
      "name": "Datadog",
      "category": "monitoring",
      "icon": "📊"
    },
    {
      "key": "newrelic",
      "name": "New Relic",
      "category": "monitoring",
      "icon": "📈"
    }
    // ... 38 more sources
  ]
}
```

---

## 📱 Advanced On-Call API

### Request Shift Swap

```http
POST /api/oncall/shift-swaps
Authorization: Bearer {token}
Content-Type: application/json

{
  "shift_id": 150,
  "to_user_id": 8,
  "reason": "Family emergency"
}
```

**Response:**
```json
{
  "swap_id": 45,
  "shift_id": 150,
  "from_user": {
    "id": 5,
    "first_name": "Jane",
    "last_name": "Smith"
  },
  "to_user": {
    "id": 8,
    "first_name": "Bob",
    "last_name": "Johnson"
  },
  "status": "pending",
  "requested_at": "2024-05-07T10:00:00Z",
  "notification_sent": true
}
```

---

### Accept Shift Swap

```http
POST /api/oncall/shift-swaps/{id}/accept
Authorization: Bearer {token}
```

---

### Reject Shift Swap

```http
POST /api/oncall/shift-swaps/{id}/reject
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Already have plans that day"
}
```

---

### Calculate On-Call Pay

```http
GET /api/oncall/pay-calculator
Authorization: Bearer {token}
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `start_date` | string | Start date (ISO format) |
| `end_date` | string | End date (ISO format) |
| `user_id` | integer | User ID (defaults to current user) |

**Response:**
```json
{
  "user_id": 5,
  "period": {
    "start": "2024-04-01T00:00:00Z",
    "end": "2024-05-01T00:00:00Z"
  },
  "total_pay": 2400.00,
  "total_hours": 80,
  "breakdown": [
    {
      "shift_id": 145,
      "team": "Database Team",
      "start": "2024-04-07T00:00:00Z",
      "end": "2024-04-08T00:00:00Z",
      "hours": 24,
      "base_pay": 720.00,
      "multiplier": 1.0,
      "total": 720.00
    },
    {
      "shift_id": 150,
      "team": "Database Team",
      "start": "2024-04-13T00:00:00Z",
      "end": "2024-04-14T00:00:00Z",
      "hours": 24,
      "base_pay": 720.00,
      "multiplier": 1.5,
      "total": 1080.00,
      "note": "Weekend multiplier applied"
    }
  ],
  "config": {
    "hourly_rate": 30.00,
    "weekend_multiplier": 1.5,
    "holiday_multiplier": 2.0
  }
}
```

---

### Create Shadow Shift

```http
POST /api/oncall/shadow-shifts
Authorization: Bearer {token}
Content-Type: application/json

{
  "primary_shift_id": 150,
  "shadow_user_id": 12
}
```

---

### Get On-Call Burden

```http
GET /api/oncall/teams/{teamId}/burden
Authorization: Bearer {token}
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `days` | integer | Number of days to analyze (default: 30) |

**Response:**
```json
{
  "team_id": 2,
  "team_name": "Database Team",
  "period_days": 30,
  "burden_analysis": [
    {
      "user": {
        "id": 5,
        "first_name": "Jane",
        "last_name": "Smith"
      },
      "shift_count": 8,
      "total_hours": 192,
      "avg_hours_per_week": 44.8,
      "burnout_risk": "high"
    },
    {
      "user": {
        "id": 8,
        "first_name": "Bob",
        "last_name": "Johnson"
      },
      "shift_count": 6,
      "total_hours": 144,
      "avg_hours_per_week": 33.6,
      "burnout_risk": "medium"
    }
  ],
  "recommendations": [
    "Jane Smith is at high burnout risk. Consider redistributing shifts.",
    "Add more engineers to the rotation to reduce burden."
  ]
}
```

**Burnout Risk Levels:**
- `low` - < 25 hours/week
- `medium` - 25-40 hours/week
- `high` - > 40 hours/week

---

### Import Holidays

```http
POST /api/oncall/holidays/import
Authorization: Bearer {token}
Content-Type: application/json

{
  "country_code": "US",
  "year": 2024
}
```

---

## 🤖 AI Features API

### AI Chatbot

```http
POST /api/ai/chat
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "Show me recent database incidents",
  "context": {
    "conversation_id": "conv-123",
    "user_role": "engineer"
  }
}
```

**Response:**
```json
{
  "response": "I found 5 database incidents in the past 7 days. Here are the most recent:\n\n1. INC-2024-0123: Database Connection Timeout (SEV1, resolved)\n2. INC-2024-0118: Slow Query Performance (SEV3, monitoring)\n3. INC-2024-0115: Replication Lag (SEV2, resolved)",
  "actions": [
    {
      "type": "view_incident",
      "incident_id": 123,
      "label": "View INC-2024-0123"
    }
  ],
  "conversation_id": "conv-123"
}
```

---

### AI Search

```http
POST /api/ai/search
Authorization: Bearer {token}
Content-Type: application/json

{
  "query": "connection pool issues last month",
  "filters": {
    "entity_types": ["incidents", "postmortems", "runbooks"]
  }
}
```

---

### Predict MTTR

```http
POST /api/ai/predict-mttr
Authorization: Bearer {token}
Content-Type: application/json

{
  "incident_id": 123
}
```

**Response:**
```json
{
  "estimated_mttr_minutes": 90,
  "confidence": 0.85,
  "based_on_similar_incidents": 12,
  "factors": [
    {
      "factor": "Severity",
      "impact": "high"
    },
    {
      "factor": "Service complexity",
      "impact": "medium"
    },
    {
      "factor": "Historical resolution time",
      "impact": "high"
    }
  ]
}
```

---

## 🔌 Integrations API

### List Integrations

```http
GET /api/integrations
Authorization: Bearer {token}
```

**Response:**
```json
{
  "integrations": [
    {
      "id": "slack",
      "name": "Slack",
      "status": "connected",
      "configured_at": "2024-01-15T10:00:00Z"
    },
    {
      "id": "pagerduty",
      "name": "PagerDuty",
      "status": "connected",
      "configured_at": "2024-02-01T14:30:00Z"
    },
    {
      "id": "jira",
      "name": "Jira",
      "status": "not_connected"
    }
  ]
}
```

---

### Configure Integration

```http
POST /api/integrations/{integration_id}/configure
Authorization: Bearer {token}
Content-Type: application/json

{
  "api_key": "your_api_key",
  "webhook_url": "https://hooks.slack.com/...",
  "settings": {
    "default_channel": "#incidents",
    "notify_on_create": true,
    "notify_on_resolve": true
  }
}
```

---

### Test Integration

```http
POST /api/integrations/{integration_id}/test
Authorization: Bearer {token}
```

---

## 🪝 Webhooks

### Register Webhook

```http
POST /api/webhooks
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://your-app.com/webhooks/incident-created",
  "events": ["incident.created", "incident.updated", "incident.resolved"],
  "secret": "your_webhook_secret"
}
```

**Available Events:**
- `incident.created`
- `incident.updated`
- `incident.resolved`
- `incident.escalated`
- `team.created`
- `service.created`
- `workflow.executed`

**Response:**
```json
{
  "webhook_id": 789,
  "url": "https://your-app.com/webhooks/incident-created",
  "events": ["incident.created", "incident.updated", "incident.resolved"],
  "created_at": "2024-05-07T10:00:00Z",
  "signing_secret": "whsec_abc123..."
}
```

---

### Webhook Payload Example

When an incident is created, we'll POST to your webhook URL:

```json
{
  "event": "incident.created",
  "timestamp": "2024-05-07T10:45:00Z",
  "data": {
    "incident": {
      "id": 123,
      "incident_number": "INC-2024-0123",
      "title": "Database Connection Timeout",
      "severity": "SEV1",
      "status": "investigating"
    }
  }
}
```

**Webhook Signature:**

We sign each webhook request with HMAC-SHA256. Verify it:

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return signature === expectedSignature;
}
```

The signature is sent in the `X-Webhook-Signature` header.

---

## 💻 Code Examples

### JavaScript / Node.js

```javascript
const axios = require('axios');

const client = axios.create({
  baseURL: 'https://api.autodocs.com',
  headers: {
    'Authorization': `Bearer ${YOUR_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Create incident
async function createIncident() {
  try {
    const response = await client.post('/api/incidents', {
      title: 'API Rate Limiting Issues',
      description: 'Users experiencing 429 errors',
      severity: 'SEV2',
      service_id: 15
    });
    
    console.log('Incident created:', response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

// Get current on-call
async function getCurrentOnCall() {
  const response = await client.get('/api/oncall/current');
  console.log('On-call:', response.data);
}
```

---

### Python

```python
import requests

BASE_URL = 'https://api.autodocs.com'
TOKEN = 'your_jwt_token'

headers = {
    'Authorization': f'Bearer {TOKEN}',
    'Content-Type': 'application/json'
}

# Create incident
def create_incident():
    response = requests.post(
        f'{BASE_URL}/api/incidents',
        headers=headers,
        json={
            'title': 'API Rate Limiting Issues',
            'description': 'Users experiencing 429 errors',
            'severity': 'SEV2',
            'service_id': 15
        }
    )
    
    if response.status_code == 201:
        print('Incident created:', response.json())
    else:
        print('Error:', response.json())

# Get incidents
def get_incidents():
    response = requests.get(
        f'{BASE_URL}/api/incidents',
        headers=headers,
        params={
            'severity': 'SEV1',
            'status': 'investigating',
            'page': 1,
            'per_page': 20
        }
    )
    
    incidents = response.json()['incidents']
    for incident in incidents:
        print(f"{incident['incident_number']}: {incident['title']}")
```

---

### cURL

```bash
# Create incident
curl -X POST https://api.autodocs.com/api/incidents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "API Rate Limiting Issues",
    "description": "Users experiencing 429 errors",
    "severity": "SEV2",
    "service_id": 15
  }'

# Get current on-call
curl -X GET https://api.autodocs.com/api/oncall/current \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update incident
curl -X PATCH https://api.autodocs.com/api/incidents/123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "resolved",
    "resolution_summary": "Issue fixed by rolling back deployment"
  }'
```

---

### Go

```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
)

const (
    BaseURL = "https://api.autodocs.com"
    Token   = "your_jwt_token"
)

type Incident struct {
    Title       string `json:"title"`
    Description string `json:"description"`
    Severity    string `json:"severity"`
    ServiceID   int    `json:"service_id"`
}

func createIncident() error {
    incident := Incident{
        Title:       "API Rate Limiting Issues",
        Description: "Users experiencing 429 errors",
        Severity:    "SEV2",
        ServiceID:   15,
    }
    
    data, _ := json.Marshal(incident)
    
    req, _ := http.NewRequest("POST", BaseURL+"/api/incidents", bytes.NewBuffer(data))
    req.Header.Set("Authorization", "Bearer "+Token)
    req.Header.Set("Content-Type", "application/json")
    
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return err
    }
    defer resp.Body.Close()
    
    var result map[string]interface{}
    json.NewDecoder(resp.Body).Decode(&result)
    
    fmt.Println("Incident created:", result)
    return nil
}
```

---

## 📚 Additional Resources

- **OpenAPI Spec:** https://api.autodocs.com/openapi.json
- **Postman Collection:** https://api.autodocs.com/postman
- **SDKs:** Available for JavaScript, Python, Go, Ruby, PHP
- **Status:** https://status.autodocs.com
- **Support:** api-support@autodocs.com

---

## 📝 Changelog

### v1.0.0 (May 2024)
- Initial API release
- 100+ endpoints
- Complete incident management
- Slack integration
- Advanced on-call features
- Custom fields
- Alert routing
- Status pages

---

**Questions? Contact us at api-support@autodocs.com**

