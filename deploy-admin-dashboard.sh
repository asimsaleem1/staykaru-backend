#!/bin/bash

echo "🚀 Deploying Admin Dashboard to Heroku"
echo "===================================="

# Commit the changes
git add .
git commit -m "Fix TypeScript errors in admin dashboard implementation"

# Push to Heroku
git push heroku main

# Check the deployment
echo "✅ Deployment initiated. Checking logs..."
heroku logs --tail
