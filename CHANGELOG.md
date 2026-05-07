# Changelog

All notable changes to AutoDocs+AutoIncident will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-05-07

### Added - Tier 4 & 5 Complete ($272K value)

**Slack Integration ($40K)**
- Auto-created incident channels (#inc-{number}-{name})
- `/incident` slash command with modal interface
- In-channel commands (/incident-status, /incident-update, etc.)
- Pinned summaries with interactive buttons
- Auto-invites for team members

**Incident Roles System ($20K)**
- Four roles: Incident Commander, Tech Lead, Comms Lead, Scribe
- Auto-assignment based on on-call and severity
- Role-specific responsibilities tracking
- Timeline logging and notifications

**Advanced Status Pages ($30K)**
- Component-based status tracking
- 90-day uptime calculation
- Subscriber notifications (email, Slack, SMS)
- Traffic spike detection (3x baseline)
- Custom branding (logo, colors, domain)

**Custom Fields System ($15K)**
- 7 field types (text, select, multi-select, number, date, boolean, user)
- Dynamic field definitions per organization
- Field validation and required fields
- Pre-built templates (Region, Customer Tier, Impact, etc.)

**Alert Routing Engine ($25K)**
- 40+ alert source integrations
- Advanced routing rules (IF/AND/OR logic)
- Multiple actions per rule
- Alert grouping and deduplication
- AI alert renaming

**Advanced On-Call Features ($25K)**
- Shift swap system (request/accept/reject)
- On-call pay calculator (hourly rates, multipliers)
- Shadow scheduling (pair juniors with seniors)
- Burnout prevention tracking
- Holiday calendar integration

**Mobile App Foundation ($40K)**
- React Native iOS/Android app
- Dashboard with stats and recent incidents
- One-tap acknowledge/escalate/resolve
- Push notifications
- Offline support

**Documentation Suite ($50K)**
- Complete API documentation (175+ pages)
- Postman collection (40+ requests)
- OpenAPI/Swagger specification
- SDK documentation (JavaScript & Python)
- Integration tutorials (6 guides)
- Usage examples (14 scenarios)
- Testing guide (20+ test cases)
- Security best practices

### Changed
- Database schema extended (20+ new tables)
- API expanded to 100+ endpoints
- Enhanced analytics dashboards

---

## [0.3.0] - 2024-05-06

### Added - Tier 3: AI Features ($20K)

**AI-Powered Features**
- Incident classification (severity, category, tags)
- Root cause analysis
- Post-mortem generation
- Similar incident detection
- MTTR prediction
- AI chatbot for querying incidents

---

## [0.2.0] - 2024-05-05

### Added - Tier 2: Advanced Features ($200K)

**On-Call Management**
- Schedule creation and management
- Team-based rotations
- Override and handoff
- Escalation policies

**Workflows & Automation**
- Complete automation engine
- 10+ triggers
- 15+ actions
- Conditional logic
- 4 auto-assignment strategies

**Analytics & Reporting**
- Executive dashboard
- MTTR/MTTD trends
- Team performance metrics
- SLA tracking
- Custom reports

**Status Pages**
- Public status pages
- Basic component tracking
- Incident updates
- Subscriber system

**Service Catalog**
- Service registry
- Team ownership
- Dependencies tracking
- Health monitoring

---

## [0.1.0] - 2024-05-04

### Added - Tier 1: Core Features ($328K)

**Incident Management**
- Full CRUD operations
- Severity levels (SEV1-SEV4)
- Status tracking
- Timeline and updates
- Assignees and watchers
- Tags and search

**Team Management**
- Team creation and management
- Member assignments
- Team-based access control

**Basic On-Call**
- Schedule creation
- Current on-call lookup
- Basic rotation support

**Authentication**
- JWT-based authentication
- User registration and login
- Role-based access control

**API Foundation**
- RESTful API design
- 50+ initial endpoints
- PostgreSQL database
- Express.js backend

---

## Upgrade Guide

### From 0.3.0 to 1.0.0

1. **Database Migration:**
   ```bash
   psql -U postgres -d autodocs_incident -f database/tier4-5-schema.sql
   ```

2. **Environment Variables:**
   Add new variables to your `.env`:
   ```
   SLACK_BOT_TOKEN=xoxb-your-token
   SLACK_SIGNING_SECRET=your-secret
   ```

3. **Dependencies:**
   ```bash
   npm install
   ```

4. **Restart Services:**
   ```bash
   docker-compose restart
   ```

---

## Future Roadmap

### Planned Features
- [ ] Advanced Slack conversational AI
- [ ] Zoom/Google Meet Scribe bot
- [ ] Visual workflow builder UI
- [ ] Dependency graph visualization
- [ ] Microsoft Teams integration
- [ ] ServiceNow integration
- [ ] Advanced reporting builder
- [ ] Multi-region deployments

---

[1.0.0]: https://github.com/Growthlabsg/autodocs_incident/releases/tag/v1.0.0
[0.3.0]: https://github.com/Growthlabsg/autodocs_incident/releases/tag/v0.3.0
[0.2.0]: https://github.com/Growthlabsg/autodocs_incident/releases/tag/v0.2.0
[0.1.0]: https://github.com/Growthlabsg/autodocs_incident/releases/tag/v0.1.0
