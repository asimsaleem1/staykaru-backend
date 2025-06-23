#!/bin/bash

# StayKaru Backend Heroku Deployment Script

echo "🚀 Starting StayKaru Backend Heroku Deployment..."

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI is not installed. Please install it first:"
    echo "https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Login to Heroku (if not already logged in)
echo "🔐 Checking Heroku authentication..."
heroku auth:whoami || heroku login

# Create Heroku app
echo "📱 Creating Heroku application..."
APP_NAME="staykaru-backend-$(date +%s)"
heroku create $APP_NAME

echo "✅ Created Heroku app: $APP_NAME"

# Set environment variables
echo "⚙️ Setting environment variables..."

heroku config:set NODE_ENV=production --app $APP_NAME
heroku config:set JWT_SECRET="staykaru-super-secret-jwt-key-production-2025-$(openssl rand -hex 16)" --app $APP_NAME
heroku config:set JWT_EXPIRES_IN=24h --app $APP_NAME
heroku config:set API_PREFIX=api --app $APP_NAME
heroku config:set SWAGGER_TITLE="StayKaru API" --app $APP_NAME
heroku config:set SWAGGER_DESCRIPTION="StayKaru Backend API Documentation" --app $APP_NAME
heroku config:set SWAGGER_VERSION=1.0 --app $APP_NAME
heroku config:set MAX_FILE_SIZE=5242880 --app $APP_NAME
heroku config:set UPLOAD_DIR=./uploads --app $APP_NAME
heroku config:set RATE_LIMIT_TTL=60 --app $APP_NAME
heroku config:set RATE_LIMIT_LIMIT=100 --app $APP_NAME
heroku config:set ENCRYPTION_KEY="$(openssl rand -hex 16)" --app $APP_NAME

# Add MongoDB Atlas addon or set custom MongoDB URI
echo "🗄️ Setting up database..."
echo "Please set your MongoDB URI manually:"
echo "heroku config:set MONGODB_URI=\"your-mongodb-connection-string\" --app $APP_NAME"

# Add Redis addon
echo "💾 Adding Redis addon..."
heroku addons:create heroku-redis:mini --app $APP_NAME

# Deploy to Heroku
echo "🚢 Deploying to Heroku..."
git add .
git commit -m "Deploy StayKaru Backend to Heroku"
git push heroku main

# Open the app
echo "🌐 Opening application..."
heroku open --app $APP_NAME

echo "✅ Deployment completed!"
echo "📱 App Name: $APP_NAME"
echo "🌐 URL: https://$APP_NAME.herokuapp.com"
echo "📊 Logs: heroku logs --tail --app $APP_NAME"
echo "⚙️ Config: heroku config --app $APP_NAME"

echo ""
echo "🔧 Manual steps needed:"
echo "1. Set MongoDB URI: heroku config:set MONGODB_URI=\"your-connection-string\" --app $APP_NAME"
echo "2. Verify all environment variables: heroku config --app $APP_NAME"
echo "3. Check application logs: heroku logs --tail --app $APP_NAME"
