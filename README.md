# AutoDocs + AutoIncident Enterprise Platform

**Complete Tier 1 Enterprise-Grade Platform**

Built by GrowthLab | Production-Ready | Deploy in 30 Minutes

---

## 🎯 What You Got

✅ **Complete Backend API** (Node.js + Express)
✅ **PostgreSQL Database** (20+ tables, production-ready schema)
✅ **Authentication System** (JWT, bcrypt, session management)
✅ **Docker Configuration** (One-command deployment)
✅ **Deployment Guide** (Step-by-step AWS/server setup)
✅ **10 API Modules** (All CRUD operations)

---

## 📦 Project Structure

```
autodocs-autoincident-enterprise/
├── backend/                    # Node.js API
│   ├── src/
│   │   ├── config/            # Database, JWT config
│   │   ├── middleware/        # Auth, error handling
│   │   ├── routes/            # All API routes
│   │   ├── controllers/       # Business logic
│   │   └── server.js          # Main server
│   ├── package.json
│   └── .env.example
│
├── database/
│   └── schema.sql             # Complete PostgreSQL schema
│
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml     # Full stack deployment
│   └── nginx.conf
│
└── docs/
    ├── DEPLOYMENT.md          # Deployment guide
    └── API.md                 # API documentation
```

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Server with 4GB RAM
- Domain (optional)

### 3-Step Deploy

```bash
# 1. Configure environment
cd backend
cp .env.example .env
nano .env  # Set DB_PASSWORD, JWT_SECRET

# 2. Start services
cd ../docker
docker-compose up -d

# 3. Verify
curl http://localhost:5000/health
```

**That's it!** Your platform is running.

---

## 📚 Features Implemented

### ✅ AutoIncident (Incident Management)
- **Incidents**: Full CRUD, assignees, updates, severity (SEV1-4)
- **On-call**: Schedules, shifts, rotations
- **Services**: Catalog, dependencies, status tracking
- **Status Pages**: Public status pages, component monitoring
- **Post-mortems**: Incident analysis, root cause, action items
- **Analytics**: MTTR, resolution rates, incident metrics

### ✅ AutoDocs (Documentation)
- **Projects**: Multi-project support
- **Pages**: Hierarchical structure, versioning
- **Search**: Full-text search, analytics
- **Analytics**: Page views, popular searches

### ✅ Core Features
- **Authentication**: Register, login, JWT tokens, sessions
- **Users**: Profile management, roles (admin/user/viewer)
- **Teams**: Team management, members, roles
- **RBAC**: Role-based access control
- **Audit Logs**: Complete activity tracking

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register     # Create account
POST   /api/auth/login        # Login
POST   /api/auth/refresh      # Refresh token
POST   /api/auth/logout       # Logout
GET    /api/auth/me           # Current user
```

### Incidents
```
GET    /api/incidents         # List all
GET    /api/incidents/:id     # Get one
POST   /api/incidents         # Create
PUT    /api/incidents/:id     # Update
DELETE /api/incidents/:id     # Delete
POST   /api/incidents/:id/updates  # Add update
```

### Services
```
GET    /api/services          # List all
GET    /api/services/:id      # Get one
POST   /api/services          # Create
PUT    /api/services/:id      # Update
```

### On-call
```
GET    /api/oncall/current    # Current on-call
GET    /api/oncall/schedules  # All schedules
GET    /api/oncall/schedules/:id/shifts  # Shifts
POST   /api/oncall/shifts     # Create shift
```

### Documentation
```
GET    /api/documentation/projects          # All projects
GET    /api/documentation/projects/:id/pages  # Pages
POST   /api/documentation/pages             # Create page
```

**Full API docs:** See `docs/API.md`

---

## 🗄️ Database Schema

**20+ Tables:**
- users, sessions (auth)
- incidents, incident_assignees, incident_updates
- oncall_schedules, oncall_shifts
- services, service_dependencies
- status_pages, status_page_components
- postmortems
- documentation_projects, documentation_pages
- teams, team_members
- audit_logs, page_views, searches

**Sample Data Included:**
- Admin user: `admin@autodocs.com` / `Admin123!`
- 2 teams (Platform, Engineering)
- 4 services (API Gateway, User Service, Payment, Frontend)

---

## 🔐 Security

✅ **Password Hashing** (bcrypt, 10 rounds)
✅ **JWT Tokens** (Access + Refresh)
✅ **Rate Limiting** (100 requests/15 min)
✅ **Helmet.js** (Security headers)
✅ **CORS** (Configurable origins)
✅ **SQL Injection Prevention** (Parameterized queries)
✅ **Row-Level Security** (PostgreSQL policies)

---

## 📖 Deployment

### Local Development
```bash
# Install dependencies
cd backend
npm install

# Setup database
docker run -d -p 5432:5432 \
  -e POSTGRES_DB=autodocs_autoincident \
  -e POSTGRES_PASSWORD=postgres \
  postgres:14

# Run migrations
psql -h localhost -U postgres -d autodocs_autoincident -f ../database/schema.sql

# Start server
npm run dev
```

### Production (Docker)
```bash
cd docker
docker-compose up -d
```

### AWS/Server Deployment
See `docs/DEPLOYMENT.md` for complete guide

---

## 🧪 Testing

```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","firstName":"Test","lastName":"User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@autodocs.com","password":"Admin123!"}'

# List incidents (use token from login)
curl http://localhost:5000/api/incidents \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📊 What's Included vs What's Not

### ✅ Included (Tier 1)
- Complete backend API
- PostgreSQL database
- JWT authentication
- User management
- Basic RBAC
- Docker setup
- Deployment guide
- All core CRUD operations
- Production-ready code

### ❌ Not Included (Tier 2/3)
- Frontend UI (React/Next.js)
- Real-time features (WebSockets)
- File uploads (S3)
- Email notifications
- SMS alerts
- Real integrations (Slack, PagerDuty, etc.)
- Payment processing
- Advanced analytics
- AI features

---

## 🔧 Configuration

### Environment Variables

**Required:**
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret (32+ characters)
- `JWT_REFRESH_SECRET` - Refresh token secret

**Optional:**
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Frontend URL
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`

**See `.env.example` for full list**

---

## 📈 Performance

- **Connection Pool:** 20 connections max
- **Rate Limiting:** 100 req/15 min per IP
- **Query Optimization:** Indexed all foreign keys
- **Caching:** Ready for Redis integration
- **Compression:** Gzip enabled
- **Load Balancing:** Ready for horizontal scaling

---

## 🛡️ Production Checklist

Before deploying:

- [ ] Change default admin password
- [ ] Set strong DB_PASSWORD (32+ characters)
- [ ] Set random JWT_SECRET (use `openssl rand -hex 32`)
- [ ] Set random JWT_REFRESH_SECRET
- [ ] Configure CORS_ORIGIN to your frontend URL
- [ ] Enable SSL/HTTPS
- [ ] Set up database backups
- [ ] Configure monitoring
- [ ] Review and adjust rate limits
- [ ] Set NODE_ENV=production

---

## 🆘 Support & Troubleshooting

### Common Issues

**"Cannot connect to database"**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Test connection
docker exec autodocs-db psql -U postgres -c "SELECT 1;"
```

**"Port already in use"**
```bash
# Change PORT in .env
echo "PORT=5001" >> backend/.env
```

**"Invalid token"**
```bash
# JWT secrets must match in .env
# Regenerate: openssl rand -hex 32
```

### Logs
```bash
# View all logs
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Database only
docker-compose logs -f postgres
```

---

## 📞 Next Steps

### Deploy This (Tier 1)
1. Follow `docs/DEPLOYMENT.md`
2. Deploy to your server
3. Test all endpoints
4. Configure for production

### Build Frontend (Tier 2)
- React/Next.js UI
- All 17 views
- API integration
- Authentication flow

### Add Integrations (Tier 2)
- Slack notifications
- PagerDuty sync
- Email/SMS alerts
- Webhook system

### Scale Up (Tier 3)
- Load balancing
- Redis caching
- Kubernetes
- Monitoring (Datadog)

---

## 🎉 You're Ready!

This is production-grade code. Deploy it and start using your platform!

**Default Login:**
- Email: `admin@autodocs.com`
- Password: `Admin123!`

**IMPORTANT:** Change the password immediately after first login!

---

## 📄 License

MIT License - Use it however you want!

## 🏗️ Built With

- Node.js 18+
- Express 4.18
- PostgreSQL 14+
- Docker & Docker Compose
- JWT Authentication
- Bcrypt Password Hashing

---

**Questions?** Check `docs/DEPLOYMENT.md` or review the code!

**Ready to deploy?** `cd docker && docker-compose up -d` 🚀
