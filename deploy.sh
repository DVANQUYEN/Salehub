#!/bin/bash
# SalesHub Production Deploy Script

echo "🚀 Deploying SalesHub to production..."

# Build and start
docker-compose -f docker-compose.production.yml --env-file .env.production up -d --build

echo "⏳ Waiting for services to start..."
sleep 10

# Run migrations
echo "📦 Running database migrations..."
docker-compose -f docker-compose.production.yml exec -T app npx prisma migrate deploy

# Seed data (optional, uncomment if needed)
# echo "🌱 Seeding database..."
# docker-compose -f docker-compose.production.yml exec -T app npx prisma db seed

# Create admin
echo "👤 Creating admin account..."
docker-compose -f docker-compose.production.yml exec -T app node scripts/seedAdmin.js

echo "✅ Deployment complete!"
echo ""
echo "📊 Services running:"
docker-compose -f docker-compose.production.yml ps
