# 🚀 Deployment Guide - AutoDocs + AutoIncident Enterprise

## Prerequisites

- Server (AWS EC2, DigitalOcean, etc.) with:
  - 2+ CPU cores
  - 4GB+ RAM
  - Ubuntu 20.04+ or similar
- Domain name (optional but recommended)
- SSH access to your server

## Quick Start (5 Steps)

### 1. Install Docker & Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 2. Upload Codebase

```bash
# On your local machine
scp -r autodocs-autoincident-enterprise user@your-server:/home/user/

# Or clone from Git
git clone your-repo-url
cd autodocs-autoincident-enterprise
```

### 3. Configure Environment

```bash
cd /home/user/autodocs-autoincident-enterprise/backend

# Copy and edit environment variables
cp .env.example .env
nano .env

# Set these CRITICAL variables:
# - DB_PASSWORD (strong password)
# - JWT_SECRET (random 32+ character string)
# - JWT_REFRESH_SECRET (different random string)
```

### 4. Start Services

```bash
cd /home/user/autodocs-autoincident-enterprise/docker

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
```

### 5. Verify Installation

```bash
# Test health endpoint
curl http://localhost:5000/health

# Should return:
# {"status":"ok","timestamp":"..."}

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@autodocs.com","password":"Admin123!"}'
```

## Production Configuration

### SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal is configured automatically
```

### Firewall Setup

```bash
# Allow necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### Database Backup

```bash
# Create backup script
cat > /home/user/backup-db.sh << 'BACKUP'
#!/bin/bash
docker exec autodocs-db pg_dump -U postgres autodocs_autoincident > /home/user/backups/db-$(date +%Y%m%d).sql
BACKUP

chmod +x /home/user/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /home/user/backup-db.sh
```

## AWS Deployment

### Launch EC2 Instance

1. **Go to AWS Console** → EC2 → Launch Instance
2. **Choose AMI:** Ubuntu Server 20.04 LTS
3. **Instance Type:** t3.medium (2 vCPU, 4GB RAM)
4. **Security Group:** Allow ports 22, 80, 443
5. **Launch** and download key pair

### Connect and Deploy

```bash
# Connect to instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Follow Quick Start steps 1-5 above
```

### RDS Database (Optional - Better Performance)

1. Create RDS PostgreSQL instance
2. Update backend/.env:
   ```
   DB_HOST=your-rds-endpoint.amazonaws.com
   DB_PORT=5432
   DB_NAME=autodocs
   DB_USER=postgres
   DB_PASSWORD=your-password
   ```
3. Run schema manually:
   ```bash
   psql -h your-rds-endpoint -U postgres -d autodocs -f database/schema.sql
   ```

## Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Health Checks

```bash
# Backend health
curl http://localhost:5000/health

# Database connection
docker exec autodocs-db psql -U postgres -c "SELECT version();"

# View running containers
docker ps
```

### Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df

# Clean up unused resources
docker system prune -a
```

## Scaling

### Horizontal Scaling

Use a load balancer (AWS ELB, Nginx) with multiple backend instances:

```yaml
# docker-compose.yml
services:
  backend1:
    # ... backend config
    container_name: autodocs-backend-1
  
  backend2:
    # ... backend config
    container_name: autodocs-backend-2
    ports:
      - "5001:5000"
```

### Database Connection Pooling

Already configured in backend (max 20 connections).
For higher load, increase in `src/config/database.js`:

```javascript
max: 50, // Increase pool size
```

## Troubleshooting

### Backend won't start

```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. Database not ready → Wait 30 seconds and restart
# 2. Port already in use → Change PORT in .env
# 3. Invalid DB credentials → Check .env file
```

### Cannot connect to database

```bash
# Test connection
docker exec autodocs-db psql -U postgres -d autodocs_autoincident -c "SELECT 1;"

# Reset database
docker-compose down -v
docker-compose up -d
```

### 502 Bad Gateway

```bash
# Backend not responding
docker-compose restart backend

# Check if backend is running
docker ps | grep backend

# Test direct connection
curl http://localhost:5000/health
```

## Updating

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
cd docker
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Verify
docker-compose ps
```

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| NODE_ENV | No | development | production or development |
| PORT | No | 5000 | Backend port |
| DB_HOST | Yes | localhost | Database host |
| DB_PORT | No | 5432 | Database port |
| DB_NAME | Yes | autodocs_autoincident | Database name |
| DB_USER | Yes | postgres | Database user |
| DB_PASSWORD | Yes | - | Database password |
| JWT_SECRET | Yes | - | JWT secret key |
| JWT_REFRESH_SECRET | Yes | - | Refresh token secret |
| CORS_ORIGIN | No | http://localhost:3000 | Frontend URL |

## Support

- Check logs: `docker-compose logs -f`
- Test endpoints: `curl http://localhost:5000/api`
- Database issues: See "Database Backup" section
- Performance: Check `docker stats` for resource usage

## Security Checklist

- [ ] Changed default admin password
- [ ] Set strong DB_PASSWORD
- [ ] Set random JWT secrets (32+ characters)
- [ ] Enabled firewall (ufw)
- [ ] SSL certificate installed
- [ ] Regular backups configured
- [ ] Updated all packages: `apt update && apt upgrade`
- [ ] Restricted SSH access
- [ ] Monitoring configured

---

**Your platform is now deployed!** 🎉

Access at: http://your-domain.com/api
Default login: admin@autodocs.com / Admin123! (CHANGE THIS!)
