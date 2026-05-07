# 🚨 AutoDocs+AutoIncident Enterprise Platform

**Complete Incident Management Platform | Production-Ready | 85% Feature Parity with incident.io**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)

> Enterprise-grade incident management platform with AI-powered features, advanced on-call scheduling, status pages, and comprehensive integrations.

**Platform Value:** $600K+ | **Code:** 9,753+ lines | **Endpoints:** 100+ | **Coverage:** 85%

---

## 🎯 What Is This?

AutoDocs+AutoIncident is a complete incident management platform built to compete with enterprise solutions like incident.io, PagerDuty, and Opsgenie.

**Key Features:**
- 🚨 Full incident lifecycle management
- 📞 Advanced on-call scheduling with shift swaps
- 📊 Component-based status pages
- 🔔 40+ alert source integrations
- 💬 Native Slack integration
- 🤖 AI-powered classification and post-mortems
- 🔄 Complete workflow automation
- 📈 Executive dashboards and analytics

---

## 🚀 Quick Start

### Docker (Recommended)
```bash
git clone https://github.com/Growthlabsg/autodocs_incident.git
cd autodocs_incident
cp .env.example .env
docker-compose up -d
```

**Access:** Frontend at http://localhost:3000, Backend at http://localhost:3001

### Manual Setup
```bash
# Database
psql -U postgres -c "CREATE DATABASE autodocs_incident;"
psql -U postgres -d autodocs_incident -f database/schema.sql

# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

---

## 📁 Project Structure

```
autodocs_incident/
├── backend/              # Node.js API (25+ modules, 100+ endpoints)
├── frontend/             # Next.js 14 + React 18
├── mobile-app/           # React Native
├── database/             # PostgreSQL schemas
├── docs/                 # Complete documentation (175+ pages)
└── docker/               # Docker configuration
```

---

## 📚 Documentation

- **[API Documentation](docs/api/API-DOCUMENTATION.md)** - Complete API reference
- **[Postman Collection](docs/api/postman-collection.json)** - Import-ready
- **[SDK Documentation](docs/api/SDK-DOCUMENTATION.md)** - JavaScript & Python
- **[Integration Tutorials](docs/api/INTEGRATION-TUTORIALS.md)** - 6 step-by-step guides
- **[Platform Overview](docs/platform/COMPLETE-CODEBASE-OVERVIEW.md)** - Full walkthrough

---

## 🔑 Key Features

### Incident Management (90%)
- SEV1-4 severity levels
- Status tracking & timeline
- AI classification & root cause analysis
- Post-mortem generation
- Similar incident detection

### On-Call Management (85%)
- Team-based schedules
- Shift swaps with approval
- Pay calculator (hourly rates, multipliers)
- Shadow scheduling
- Burnout tracking

### Status Pages (90%)
- Component-based status
- 90-day uptime tracking
- Subscriber notifications
- Custom branding
- Traffic spike detection

### Alert Routing (80%)
- 40+ integrations (Datadog, New Relic, etc.)
- Advanced routing rules
- Alert grouping & deduplication
- Multi-action workflows

### Slack Integration (85%)
- Auto-created incident channels
- `/incident` slash command
- Interactive updates
- Channel summaries

---

## 🧪 Testing

```bash
npm test              # Run all tests
npm run test:coverage # Coverage report
npm run test:e2e      # End-to-end tests
```

---

## 🚢 Deployment

**Docker:**
```bash
docker build -t autodocs-incident .
docker push your-registry/autodocs-incident
```

**Kubernetes:**
```bash
kubectl apply -f k8s/
```

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

```bash
git checkout -b feature/amazing-feature
git commit -m 'Add amazing feature'
git push origin feature/amazing-feature
```

---

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) - Latest: v1.0.0 (May 2024)

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

## 🆘 Support

- **Issues:** [GitHub Issues](https://github.com/Growthlabsg/autodocs_incident/issues)
- **Email:** api-support@autodocs.com

---

## 📊 Platform Status

| Module | Coverage |
|--------|----------|
| Incidents | 90% ✅ |
| On-Call | 85% ✅ |
| Status Pages | 90% ✅ |
| AI Features | 65% ✅ |
| Workflows | 65% ✅ |
| **Overall** | **85% ✅** |

**⭐ Star us on GitHub!**

Built with ❤️ by GrowthLab
