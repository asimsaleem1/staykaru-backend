#!/bin/bash
# Role-based Dashboard Deployment Script for Heroku (BASH version)

# Color definitions
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}StayKaru Role-based Dashboard Deployment to Heroku${NC}"
echo -e "${CYAN}==================================================${NC}"

# 1. Run verification script if it exists
echo -e "${GREEN}Step 1: Verifying role-based dashboards...${NC}"
if [ -f "./verify-role-dashboards.sh" ]; then
    bash ./verify-role-dashboards.sh
else
    echo -e "${YELLOW}Warning: verify-role-dashboards.sh not found. Running tests manually...${NC}"
    # Start server in background
    npm run start:dev &
    SERVER_PID=$!
    
    # Wait for server to start
    echo "Waiting for server to start..."
    sleep 10
    
    # Run a basic test
    echo "Testing API endpoints..."
    curl -s http://localhost:3000/
    
    # Kill the server
    kill $SERVER_PID
fi

# Ask for confirmation before deploying
echo -e "\n${YELLOW}Ready to deploy to Heroku.${NC}"
read -p "Do you want to continue with deployment? (y/n) " CONFIRMATION
if [ "$CONFIRMATION" != "y" ]; then
    echo -e "${RED}Deployment cancelled.${NC}"
    exit 1
fi

# 2. Build the project
echo -e "\n${GREEN}Step 2: Building the project for production...${NC}"
npm run build

# 3. Ensure we're on the latest code
echo -e "\n${GREEN}Step 3: Committing latest changes...${NC}"
git add .
git commit -m "Deploy role-based dashboards for landlord and food provider"

# 4. Deploy to Heroku
echo -e "\n${GREEN}Step 4: Deploying to Heroku...${NC}"
git push heroku main

# 5. Show deployment logs
echo -e "\n${GREEN}Step 5: Showing deployment logs...${NC}"
heroku logs --tail

echo -e "\n${CYAN}Deployment Complete!${NC}"
echo -e "${CYAN}==================================================${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "${YELLOW}1. Share the deployment status with your team${NC}"
echo -e "${YELLOW}2. Update frontend to integrate with the new dashboard endpoints${NC}"
echo -e "${YELLOW}3. Refer to ROLE_BASED_DASHBOARD_IMPLEMENTATION_GUIDE.md for integration details${NC}"
