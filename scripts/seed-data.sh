#!/bin/bash

# Seed Data Script - Populate with demo data

API_URL="http://localhost:3001/api"

echo "🌱 Seeding database with demo data..."

# 1. Create admin user
echo "Creating admin user..."
curl -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@autodocs.com",
    "password": "admin123",
    "name": "Admin User"
  }' -s > /dev/null

# Get auth token
TOKEN=$(curl -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@autodocs.com",
    "password": "admin123"
  }' -s | grep -o '"token":"[^"]*' | sed 's/"token":"//')

echo "✅ Admin user created"

# 2. Create teams
echo "Creating teams..."
TEAM1=$(curl -X POST $API_URL/teams \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Platform Engineering",
    "description": "Core platform and infrastructure"
  }' -s | grep -o '"id":[0-9]*' | sed 's/"id"://')

TEAM2=$(curl -X POST $API_URL/teams \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Team",
    "description": "Public API development"
  }' -s | grep -o '"id":[0-9]*' | sed 's/"id"://')

echo "✅ Teams created"

# 3. Create services
echo "Creating services..."
curl -X POST $API_URL/services \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Gateway",
    "description": "Main API gateway service",
    "status": "operational"
  }' -s > /dev/null

curl -X POST $API_URL/services \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Database",
    "description": "PostgreSQL database",
    "status": "operational"
  }' -s > /dev/null

curl -X POST $API_URL/services \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Authentication Service",
    "description": "User authentication and authorization",
    "status": "operational"
  }' -s > /dev/null

echo "✅ Services created"

# 4. Create incidents
echo "Creating incidents..."

# SEV1 Critical
curl -X POST $API_URL/incidents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Database Connection Pool Exhausted",
    "description": "All database connections are in use, new requests failing",
    "severity": "sev1",
    "status": "investigating",
    "service_id": 2
  }' -s > /dev/null

# SEV2 High
curl -X POST $API_URL/incidents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "API Response Time Degraded",
    "description": "API endpoints showing 2x normal response time",
    "severity": "sev2",
    "status": "investigating",
    "service_id": 1
  }' -s > /dev/null

# SEV3 Medium
curl -X POST $API_URL/incidents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cache Miss Rate High",
    "description": "Redis cache showing 40% miss rate",
    "severity": "sev3",
    "status": "monitoring",
    "service_id": 1
  }' -s > /dev/null

# SEV4 Low
curl -X POST $API_URL/incidents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Documentation Links Broken",
    "description": "Several documentation links returning 404",
    "severity": "sev4",
    "status": "monitoring",
    "service_id": 1
  }' -s > /dev/null

# Resolved incident
curl -X POST $API_URL/incidents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Login Service Intermittent Failures",
    "description": "Users experiencing occasional login failures",
    "severity": "sev2",
    "status": "resolved",
    "service_id": 3
  }' -s > /dev/null

echo "✅ Incidents created"

echo ""
echo "🎉 Database seeded successfully!"
echo ""
echo "📊 Created:"
echo "  - 1 Admin user"
echo "  - 2 Teams"
echo "  - 3 Services"
echo "  - 5 Incidents (1 SEV1, 1 SEV2, 1 SEV3, 1 SEV4, 1 Resolved)"
echo ""
echo "🔐 Login credentials:"
echo "  Email: admin@autodocs.com"
echo "  Password: admin123"
echo ""
echo "🌐 Visit: http://localhost:3000"
