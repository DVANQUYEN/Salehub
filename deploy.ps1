# SalesHub Production Deploy Script (Windows)

Write-Host "🚀 Deploying SalesHub to production..." -ForegroundColor Green

# Build and start
docker-compose -f docker-compose.production.yml --env-file .env.production up -d --build

Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Run migrations
Write-Host "📦 Running database migrations..." -ForegroundColor Yellow
docker-compose -f docker-compose.production.yml exec -T app npx prisma migrate deploy

# Create admin
Write-Host "👤 Creating admin account..." -ForegroundColor Yellow
docker-compose -f docker-compose.production.yml exec -T app node scripts/seedAdmin.js

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Services running:" -ForegroundColor Cyan
docker-compose -f docker-compose.production.yml ps
