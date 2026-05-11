#!/bin/bash

# Create Admin User Script

echo "🚀 Creating admin user..."

curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@autodocs.com",
    "password": "admin123",
    "name": "Admin User",
    "role": "admin"
  }'

echo ""
echo "✅ Admin user created!"
echo ""
echo "Login with:"
echo "Email: admin@autodocs.com"
echo "Password: admin123"
echo ""
echo "Visit: http://localhost:3000/login"
