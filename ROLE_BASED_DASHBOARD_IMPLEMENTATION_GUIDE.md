# Role-Based Dashboard Implementation Guide

This guide covers how to implement role-based dashboards for both landlords and food providers in the StayKaru application. The backend now exposes specialized endpoints that allow users with specific roles to view and manage their respective data.

## Overview

StayKaru now supports role-specific dashboards for:

1. **Landlords**: Users who manage accommodations, can view bookings and analytics
2. **Food Providers**: Users who manage food services, can view/edit menu items and orders

Each role has dedicated endpoints with appropriate authorization checks to ensure users can only access and modify their own data.

## Landlord Dashboard

### Available Endpoints

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/accommodations/landlord/my-accommodations` | GET | Get all accommodations owned by the landlord | JWT (Landlord only) |
| `/accommodations/landlord/dashboard` | GET | Get a summary of the landlord's stats and recent activities | JWT (Landlord only) |
| `/accommodations/landlord/bookings` | GET | Get all bookings for accommodations owned by the landlord | JWT (Landlord only) |
| `/accommodations/landlord/analytics` | GET | Get analytics for accommodations (can filter by days) | JWT (Landlord only) |

### Suggested UI Structure

1. **Dashboard Overview**
   - Total accommodations
   - Total bookings
   - Active bookings
   - Booking status distribution
   - Recent booking activity

2. **My Accommodations**
   - List of accommodations
   - Ability to create new accommodations
   - Edit/delete existing accommodations

3. **Bookings Management**
   - View all bookings
   - Filter by accommodation, date, status
   - Accept/reject booking requests

4. **Analytics**
   - Booking trends over time (chart)
   - Performance by accommodation
   - Revenue analysis

## Food Provider Dashboard

### Available Endpoints

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/food-providers/owner/my-providers` | GET | Get all food providers owned by the user | JWT (Food Provider only) |
| `/food-providers/owner/dashboard` | GET | Get a summary of the provider's stats and recent activities | JWT (Food Provider only) |
| `/food-providers/owner/menu-items/:providerId` | GET | Get all menu items for a specific provider | JWT (Food Provider only) |
| `/food-providers/owner/menu-items/:providerId` | POST | Create a new menu item | JWT (Food Provider only) |
| `/food-providers/owner/menu-items/:providerId/:itemId` | PUT | Update an existing menu item | JWT (Food Provider only) |
| `/food-providers/owner/menu-items/:providerId/:itemId` | DELETE | Delete a menu item | JWT (Food Provider only) |
| `/food-providers/owner/orders/:providerId` | GET | Get all orders for a specific provider | JWT (Food Provider only) |
| `/food-providers/owner/analytics` | GET | Get analytics for providers (can filter by days) | JWT (Food Provider only) |

### Suggested UI Structure

1. **Dashboard Overview**
   - Total food providers
   - Total orders
   - Active orders
   - Order status distribution
   - Recent order activity

2. **My Food Providers**
   - List of food services
   - Ability to create new food providers
   - Edit/delete existing providers

3. **Menu Management**
   - View all menu items
   - Add/edit/delete menu items
   - Categorize and organize menu items

4. **Order Management**
   - View all orders
   - Filter by date, status
   - Update order status (preparing, delivered, etc.)

5. **Analytics**
   - Order trends over time (chart)
   - Performance by menu item
   - Revenue analysis

## Implementation Guidelines

### Authentication Flow

1. When a user logs in, their role is returned along with the JWT token
2. Store the user role in your application state
3. Based on the role, render the appropriate dashboard components
4. Include the JWT token in all API requests to the dashboard endpoints

```javascript
// Example API call to get landlord dashboard
const getLandlordDashboard = async () => {
  try {
    const response = await apiClient.get('/accommodations/landlord/dashboard', {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching landlord dashboard:', error);
    throw error;
  }
};
```

### Role-Based Routing

Implement role-based routing to restrict access to dashboard pages:

```javascript
// Example role-based route protection
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};

// Usage
<Routes>
  <Route 
    path="/landlord/dashboard" 
    element={
      <ProtectedRoute allowedRoles={['landlord']}>
        <LandlordDashboard />
      </ProtectedRoute>
    } 
  />
  <Route 
    path="/food-provider/dashboard" 
    element={
      <ProtectedRoute allowedRoles={['food_provider']}>
        <FoodProviderDashboard />
      </ProtectedRoute>
    } 
  />
</Routes>
```

### Error Handling

Implement proper error handling for all API calls:

```javascript
// Example error handling
try {
  const response = await apiClient.get('/food-providers/owner/dashboard');
  setDashboardData(response.data);
} catch (error) {
  if (error.response && error.response.status === 403) {
    // Handle unauthorized access
    navigate('/unauthorized');
  } else {
    // Handle other errors
    setError('Failed to load dashboard data. Please try again later.');
  }
}
```

## UI/UX Recommendations

1. **Dashboard Layout**
   - Use a sidebar navigation for quick access to different sections
   - Implement responsive design for mobile and desktop
   - Use cards to display key metrics and statistics

2. **Data Visualization**
   - Use charts (line, bar, pie) to visualize analytics data
   - Implement date range selectors for filtering analytics
   - Show comparison metrics (e.g., this month vs. last month)

3. **Tables and Lists**
   - Implement sortable and filterable tables for accommodations, bookings, menu items, orders
   - Include search functionality
   - Add pagination for large datasets

4. **Forms**
   - Create user-friendly forms for adding/editing accommodations and menu items
   - Implement validation for all form inputs
   - Provide clear feedback on form submission success/errors

## Testing the Dashboards

A test script (`test-role-dashboards.ps1`) has been provided to test all the new dashboard endpoints. To run it:

1. Ensure the backend server is running
2. Update the test credentials in the script with valid landlord and food provider accounts
3. Run the script from PowerShell:

```powershell
.\test-role-dashboards.ps1
```

The script will test all the dashboard endpoints and report the results.

## Conclusion

By implementing these role-based dashboards, you'll provide landlords and food providers with powerful tools to manage their listings, bookings, menu items, and orders. The specialized endpoints ensure that users can only access and modify their own data, maintaining security and data integrity throughout the application.
