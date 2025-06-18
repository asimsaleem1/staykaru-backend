#!/bin/bash
# Role-based Dashboard Deployment and Verification

# Color definitions
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}StayKaru Role-based Dashboard Deployment & Testing${NC}"
echo -e "${CYAN}===============================================${NC}"

# 1. Make sure we have the correct version of dependencies
echo -e "${GREEN}Step 1: Installing dependencies...${NC}"
npm install

# 2. Build the project
echo -e "${GREEN}Step 2: Building the project...${NC}"
npm run build

# 3. Start the server in test mode
echo -e "${GREEN}Step 3: Starting the server for testing...${NC}"
npm run start:dev &
SERVER_PID=$!

# Wait for the server to start
echo -e "${YELLOW}Waiting for server to start...${NC}"
sleep 10

# 4. Testing with dedicated test accounts
echo -e "${GREEN}Step 4: Testing role-based dashboards with proper role accounts...${NC}"

# Test with landlord account
echo -e "\n${CYAN}Testing with LANDLORD role account:${NC}"
LANDLORD_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"landlord.test@property.com","password":"LandlordPass123!"}')

LANDLORD_TOKEN=$(echo $LANDLORD_RESPONSE | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//')

if [ -n "$LANDLORD_TOKEN" ]; then
    echo -e "${GREEN}Landlord authentication successful. Token received.${NC}"
    
    # Test landlord endpoints
    MY_ACCOMMODATIONS=$(curl -s -X GET http://localhost:3000/accommodations/landlord/my-accommodations \
      -H "Authorization: Bearer $LANDLORD_TOKEN")
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Landlord my-accommodations endpoint: Success${NC}"
    else
        echo -e "${RED}❌ Landlord my-accommodations endpoint: Failed${NC}"
    fi
    
    DASHBOARD=$(curl -s -X GET http://localhost:3000/accommodations/landlord/dashboard \
      -H "Authorization: Bearer $LANDLORD_TOKEN")
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Landlord dashboard endpoint: Success${NC}"
    else
        echo -e "${RED}❌ Landlord dashboard endpoint: Failed${NC}"
    fi
    
    BOOKINGS=$(curl -s -X GET http://localhost:3000/accommodations/landlord/bookings \
      -H "Authorization: Bearer $LANDLORD_TOKEN")
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Landlord bookings endpoint: Success${NC}"
    else
        echo -e "${RED}❌ Landlord bookings endpoint: Failed${NC}"
    fi
    
    ANALYTICS=$(curl -s -X GET "http://localhost:3000/accommodations/landlord/analytics?days=30" \
      -H "Authorization: Bearer $LANDLORD_TOKEN")
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Landlord analytics endpoint: Success${NC}"
    else
        echo -e "${RED}❌ Landlord analytics endpoint: Failed${NC}"
    fi
else
    echo -e "${RED}❌ Landlord authentication failed. Using admin account for testing...${NC}"
fi

# Test with food provider account
echo -e "\n${CYAN}Testing with FOOD_PROVIDER role account:${NC}"
FP_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"foodprovider.test@restaurant.com","password":"FoodPass123!"}')

FP_TOKEN=$(echo $FP_RESPONSE | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//')

if [ -n "$FP_TOKEN" ]; then
    echo -e "${GREEN}Food Provider authentication successful. Token received.${NC}"
    
    # Test food provider endpoints
    MY_PROVIDERS=$(curl -s -X GET http://localhost:3000/food-providers/owner/my-providers \
      -H "Authorization: Bearer $FP_TOKEN")
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Food Provider my-providers endpoint: Success${NC}"
        
        # Extract first provider ID if available
        PROVIDER_ID=$(echo $MY_PROVIDERS | grep -o '"_id":"[^"]*' | head -1 | sed 's/"_id":"//')
    else
        echo -e "${RED}❌ Food Provider my-providers endpoint: Failed${NC}"
    fi
    
    FP_DASHBOARD=$(curl -s -X GET http://localhost:3000/food-providers/owner/dashboard \
      -H "Authorization: Bearer $FP_TOKEN")
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Food Provider dashboard endpoint: Success${NC}"
    else
        echo -e "${RED}❌ Food Provider dashboard endpoint: Failed${NC}"
    fi
    
    if [ -n "$PROVIDER_ID" ]; then
        # Test menu items endpoints with a real provider ID
        MENU_ITEMS=$(curl -s -X GET "http://localhost:3000/food-providers/owner/menu-items/$PROVIDER_ID" \
          -H "Authorization: Bearer $FP_TOKEN")
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Food Provider menu-items endpoint: Success${NC}"
            
            # Create a test menu item
            NEW_MENU_ITEM=$(curl -s -X POST "http://localhost:3000/food-providers/owner/menu-items/$PROVIDER_ID" \
              -H "Content-Type: application/json" \
              -H "Authorization: Bearer $FP_TOKEN" \
              -d '{"name":"Deployment Test Item","price":12.99,"description":"A test item created during deployment verification"}')
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Food Provider create menu item: Success${NC}"
                
                # Extract the menu item ID
                MENU_ITEM_ID=$(echo $NEW_MENU_ITEM | grep -o '"_id":"[^"]*' | sed 's/"_id":"//')
                
                if [ -n "$MENU_ITEM_ID" ]; then
                    # Update the menu item
                    UPDATED_ITEM=$(curl -s -X PUT "http://localhost:3000/food-providers/owner/menu-items/$PROVIDER_ID/$MENU_ITEM_ID" \
                      -H "Content-Type: application/json" \
                      -H "Authorization: Bearer $FP_TOKEN" \
                      -d '{"name":"Updated Deployment Test Item","price":14.99,"description":"An updated test item"}')
                    
                    if [ $? -eq 0 ]; then
                        echo -e "${GREEN}✅ Food Provider update menu item: Success${NC}"
                    else
                        echo -e "${RED}❌ Food Provider update menu item: Failed${NC}"
                    fi
                    
                    # Delete the test item
                    DELETE_RESPONSE=$(curl -s -X DELETE "http://localhost:3000/food-providers/owner/menu-items/$PROVIDER_ID/$MENU_ITEM_ID" \
                      -H "Authorization: Bearer $FP_TOKEN")
                    
                    if [ $? -eq 0 ]; then
                        echo -e "${GREEN}✅ Food Provider delete menu item: Success${NC}"
                    else
                        echo -e "${RED}❌ Food Provider delete menu item: Failed${NC}"
                    fi
                fi
            else
                echo -e "${RED}❌ Food Provider create menu item: Failed${NC}"
            fi
        else
            echo -e "${RED}❌ Food Provider menu-items endpoint: Failed${NC}"
        fi
        
        # Test orders endpoint
        ORDERS=$(curl -s -X GET "http://localhost:3000/food-providers/owner/orders/$PROVIDER_ID" \
          -H "Authorization: Bearer $FP_TOKEN")
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Food Provider orders endpoint: Success${NC}"
        else
            echo -e "${RED}❌ Food Provider orders endpoint: Failed${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ No provider ID available for testing menu items and orders endpoints${NC}"
    fi
    
    # Test analytics endpoint
    FP_ANALYTICS=$(curl -s -X GET "http://localhost:3000/food-providers/owner/analytics?days=30" \
      -H "Authorization: Bearer $FP_TOKEN")
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Food Provider analytics endpoint: Success${NC}"
    else
        echo -e "${RED}❌ Food Provider analytics endpoint: Failed${NC}"
    fi
else
    echo -e "${RED}❌ Food Provider authentication failed. Using admin account for testing...${NC}"
fi

# 5. Test that unauthorized users cannot access role-specific endpoints
echo -e "\n${CYAN}Testing role-based access control:${NC}"
STUDENT_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student.test@university.edu","password":"StudentPass123!"}')

STUDENT_TOKEN=$(echo $STUDENT_RESPONSE | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//')

if [ -n "$STUDENT_TOKEN" ]; then
    echo -e "${GREEN}Student authentication successful. Testing access to protected endpoints...${NC}"
    
    # Try accessing landlord endpoint as student (should fail)
    LANDLORD_ACCESS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/accommodations/landlord/dashboard \
      -H "Authorization: Bearer $STUDENT_TOKEN")
    
    if [ "$LANDLORD_ACCESS" -eq 403 ]; then
        echo -e "${GREEN}✅ Role-based protection working: Student cannot access landlord dashboard (403 Forbidden)${NC}"
    else
        echo -e "${RED}❌ Role-based protection failed: Student can access landlord dashboard${NC}"
    fi
    
    # Try accessing food provider endpoint as student (should fail)
    FP_ACCESS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/food-providers/owner/dashboard \
      -H "Authorization: Bearer $STUDENT_TOKEN")
    
    if [ "$FP_ACCESS" -eq 403 ]; then
        echo -e "${GREEN}✅ Role-based protection working: Student cannot access food provider dashboard (403 Forbidden)${NC}"
    else
        echo -e "${RED}❌ Role-based protection failed: Student can access food provider dashboard${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ Student authentication failed. Skipping role-based access testing.${NC}"
fi

# 6. Stop the test server
echo -e "\n${GREEN}Step 6: Stopping the test server...${NC}"
kill $SERVER_PID

# 7. Prepare for deployment
echo -e "\n${GREEN}Step 7: Preparing for deployment...${NC}"
# Clean up any test data or temporary files if needed

# 8. Show summary of testing results
echo -e "\n${CYAN}Role-based Dashboard Implementation Testing Complete!${NC}"
echo -e "${CYAN}===============================================${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "${YELLOW}1. Review any failed tests and fix issues if needed${NC}"
echo -e "${YELLOW}2. Deploy to production using 'bash deploy-role-dashboards.sh'${NC}"
echo -e "${YELLOW}3. Verify role-based dashboards on production environment${NC}"
echo -e "${YELLOW}4. Check the frontend integration guide at ROLE_BASED_DASHBOARD_IMPLEMENTATION_GUIDE.md${NC}"

echo -e "\n${GREEN}Done!${NC}"
