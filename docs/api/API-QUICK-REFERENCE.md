# 📖 API Quick Reference Guide

**Quick lookup for common API operations**

---

## 🔥 Most Common Operations

### Create Incident
```bash
POST /api/incidents
{
  "title": "Issue title",
  "severity": "SEV1|SEV2|SEV3|SEV4",
  "service_id": 15
}
```

### List Incidents
```bash
GET /api/incidents?severity=SEV1&status=investigating
```

### Update Incident
```bash
PATCH /api/incidents/{id}
{
  "status": "resolved"
}
```

### Get Current On-Call
```bash
GET /api/oncall/current?team_id=2
```

### Assign Incident Role
```bash
POST /api/incidents/{id}/roles
{
  "user_id": 5,
  "role": "incident_commander"
}
```

---

## 📊 All Endpoints (100+)

### Authentication (3)
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/saml/login` - SSO login

### Incidents (15)
- `GET /api/incidents` - List
- `POST /api/incidents` - Create
- `GET /api/incidents/{id}` - Get
- `PATCH /api/incidents/{id}` - Update
- `DELETE /api/incidents/{id}` - Delete
- `POST /api/incidents/{id}/updates` - Post update
- `POST /api/incidents/{id}/resolve` - Resolve
- `POST /api/incidents/{id}/escalate` - Escalate
- `POST /api/incidents/{id}/classify` - AI classify
- `POST /api/incidents/{id}/postmortem/generate` - Generate post-mortem
- `GET /api/incidents/{id}/timeline` - Get timeline
- `POST /api/incidents/{id}/assign` - Assign users
- `POST /api/incidents/{id}/watchers` - Add watcher
- `POST /api/incidents/{id}/attachments` - Upload file
- `GET /api/incidents/{id}/similar` - Find similar

### Teams (8)
- `GET /api/teams` - List
- `POST /api/teams` - Create
- `GET /api/teams/{id}` - Get
- `PATCH /api/teams/{id}` - Update
- `DELETE /api/teams/{id}` - Delete
- `POST /api/teams/{id}/members` - Add member
- `DELETE /api/teams/{id}/members/{user_id}` - Remove member
- `GET /api/teams/{id}/incidents` - Team incidents

### Services (10)
- `GET /api/services` - List
- `POST /api/services` - Create
- `GET /api/services/{id}` - Get
- `PATCH /api/services/{id}` - Update
- `DELETE /api/services/{id}` - Delete
- `GET /api/services/{id}/health` - Get health
- `GET /api/services/{id}/incidents` - Service incidents
- `POST /api/services/{id}/dependencies` - Add dependency
- `GET /api/services/{id}/dependencies` - List dependencies
- `GET /api/services/dependency-graph` - Get graph

### On-Call (12)
- `GET /api/oncall/current` - Current on-call
- `GET /api/oncall/schedules` - List schedules
- `POST /api/oncall/schedules` - Create schedule
- `GET /api/oncall/shifts` - List shifts
- `POST /api/oncall/shifts` - Create shift
- `GET /api/oncall/shifts/upcoming` - Upcoming shifts
- `PATCH /api/oncall/shifts/{id}` - Update shift
- `DELETE /api/oncall/shifts/{id}` - Delete shift
- `POST /api/oncall/shifts/{id}/override` - Override shift
- `GET /api/oncall/users/{id}/shifts` - User shifts
- `GET /api/oncall/teams/{id}/schedule` - Team schedule
- `POST /api/oncall/escalation-policies` - Create policy

### Workflows (8)
- `GET /api/workflows` - List
- `POST /api/workflows` - Create
- `GET /api/workflows/{id}` - Get
- `PATCH /api/workflows/{id}` - Update
- `DELETE /api/workflows/{id}` - Delete
- `POST /api/workflows/{id}/execute` - Execute
- `GET /api/workflows/{id}/executions` - Execution history
- `POST /api/workflows/{id}/test` - Test workflow

### Analytics (6)
- `GET /api/analytics/executive` - Executive dashboard
- `GET /api/analytics/mttr` - MTTR trends
- `GET /api/analytics/mttd` - MTTD trends
- `GET /api/analytics/sla` - SLA compliance
- `GET /api/analytics/team-performance` - Team metrics
- `POST /api/analytics/reports` - Generate report

### Slack Integration (5)
- `POST /api/slack/commands` - Handle slash commands
- `POST /api/slack/interactions` - Handle interactions
- `POST /api/slack/notify` - Send notification
- `POST /api/slack/channels/incident` - Create incident channel
- `GET /api/slack/channels/{id}/history` - Get channel history

### Incident Roles (5)
- `GET /api/incidents/{id}/roles` - List roles
- `POST /api/incidents/{id}/roles` - Assign role
- `DELETE /api/incidents/{id}/roles/{role}` - Remove role
- `POST /api/incidents/{id}/roles/auto-assign` - Auto-assign
- `GET /api/users/{id}/active-roles` - User active roles

### Status Pages (12)
- `GET /api/status-pages` - List
- `POST /api/status-pages/advanced` - Create
- `GET /api/status-pages/{id}` - Get
- `PATCH /api/status-pages/{id}` - Update
- `POST /api/status-pages/{id}/components` - Add component
- `GET /api/status-pages/components/{id}` - Get component
- `PATCH /api/status-pages/components/{id}/status` - Update status
- `GET /api/status-pages/components/{id}/uptime` - Get uptime
- `POST /api/status-pages/{id}/subscribe` - Subscribe
- `DELETE /api/status-pages/subscriptions/{id}` - Unsubscribe
- `POST /api/status-pages/{id}/views` - Track view
- `PATCH /api/status-pages/{id}/branding` - Update branding

### Custom Fields (6)
- `POST /api/custom-fields/define` - Define field
- `GET /api/custom-fields/{type}` - Get definitions
- `POST /api/custom-fields/{type}/{id}` - Set value
- `GET /api/custom-fields/{type}/{id}` - Get values
- `PATCH /api/custom-fields/definitions/{id}` - Update definition
- `POST /api/custom-fields/common/create` - Create common fields

### Alert Routing (4)
- `POST /api/alert-routing/rules` - Create rule
- `GET /api/alert-routing/rules` - List rules
- `POST /api/alerts/webhook` - Process alert
- `GET /api/alert-routing/sources` - List sources

### Advanced On-Call (8)
- `POST /api/oncall/shift-swaps` - Request swap
- `POST /api/oncall/shift-swaps/{id}/accept` - Accept swap
- `POST /api/oncall/shift-swaps/{id}/reject` - Reject swap
- `GET /api/oncall/pay-calculator` - Calculate pay
- `POST /api/oncall/shadow-shifts` - Create shadow
- `GET /api/oncall/teams/{id}/burden` - Get burden
- `POST /api/oncall/holidays/import` - Import holidays
- `GET /api/oncall/holidays` - List holidays

### AI Features (5)
- `POST /api/ai/chat` - Chatbot
- `POST /api/ai/search` - AI search
- `POST /api/ai/predict-mttr` - Predict MTTR
- `POST /api/ai/suggest-actions` - Suggest actions
- `POST /api/ai/summarize` - Summarize incident

---

## 🔑 Authentication Header

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 Common Response Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `429` - Rate Limited
- `500` - Server Error

---

## 🎯 Quick Start Examples

### Create SEV1 Incident
```bash
curl -X POST https://api.autodocs.com/api/incidents \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Production Database Down",
    "severity": "SEV1",
    "service_id": 10
  }'
```

### Assign Incident Commander
```bash
curl -X POST https://api.autodocs.com/api/incidents/123/roles \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 5,
    "role": "incident_commander"
  }'
```

### Get MTTR Analytics
```bash
curl -X GET "https://api.autodocs.com/api/analytics/mttr?start_date=2024-04-01&end_date=2024-05-01" \
  -H "Authorization: Bearer TOKEN"
```

---

**Full Documentation:** See API-DOCUMENTATION.md

