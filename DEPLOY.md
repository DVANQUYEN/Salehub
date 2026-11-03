# SalesHub - Deployment Guide

## 🚀 Quick Deploy (2 commands)

### Linux/Mac
```bash
chmod +x deploy.sh
./deploy.sh
```

### Windows
```powershell
.\deploy.ps1
```

Or manual:
```bash
docker-compose -f docker-compose.production.yml --env-file .env.production up -d --build
docker-compose -f docker-compose.production.yml exec app npx prisma migrate deploy
docker-compose -f docker-compose.production.yml exec app node scripts/seedAdmin.js
```

## Prerequisites
- Docker & Docker Compose installed
- Domain name (optional but recommended)
- SMTP credentials for emails

## Manual Deployment Steps

### 1. Clone repository
```bash
git clone https://github.com/YOUR_USERNAME/salehub.git
cd salehub
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your values:
# - DATABASE_URL
# - JWT_SECRET (min 32 chars, change from default!)
# - SMTP credentials
# - FRONTEND_URL
```

### 3. Build and start
```bash
docker-compose -f docker-compose.production.yml up -d --build
```

### 4. Run migrations
```bash
docker-compose exec app npx prisma migrate deploy
```

### 5. Seed data (optional)
```bash
docker-compose exec app npx prisma db seed
```

### 6. Create admin
```bash
docker-compose exec app node scripts/seedAdmin.js
```

### 7. Access
- Backend API: http://your-domain.com:3000
- Swagger Docs: http://your-domain.com:3000/api-docs
- Frontend: Run separately or deploy to Vercel

## Production Checklist
- [ ] Change JWT_SECRET from default
- [ ] Setup SSL certificates
- [ ] Configure SMTP for emails
- [ ] Setup database backups
- [ ] Configure firewall (only expose 80, 443)
- [ ] Setup monitoring (optional)

## SSL Setup (Let's Encrypt)
```bash
# Install certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy certs to nginx
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./nginx/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./nginx/ssl/

# Uncomment SSL section in nginx.conf
# Restart
docker-compose -f docker-compose.production.yml restart nginx
```

## Updating
```bash
git pull
docker-compose -f docker-compose.production.yml up -d --build
docker-compose exec app npx prisma migrate deploy
```

## Troubleshooting
- Check logs: `docker-compose logs -f`
- Restart services: `docker-compose restart`
- Reset database: `docker-compose down -v` (WARNING: deletes data)
