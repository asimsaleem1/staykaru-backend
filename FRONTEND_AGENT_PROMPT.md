# 🎯 FRONTEND AGENT PROMPT - StayKaru Role-Based Dashboards

## 📋 TASK OVERVIEW
Implement role-based dashboards for **Landlord** and **Food Provider** roles in the StayKaru React Native mobile app.

## 🔗 BACKEND STATUS
✅ **ALL APIs READY & TESTED** on production: `https://staykaru-backend-60ed08adb2a7.herokuapp.com`

## 🎯 WHAT TO IMPLEMENT

### 🏠 LANDLORD DASHBOARD
**API Endpoints:**
- `GET /accommodations/landlord/my-accommodations` - List properties
- `GET /accommodations/landlord/dashboard` - Dashboard overview
- `GET /accommodations/landlord/bookings` - Manage bookings  
- `GET /accommodations/landlord/analytics` - Revenue analytics

**Screens to Create:**
1. **LandlordDashboardScreen** - Overview with stats cards
2. **MyPropertiesScreen** - Properties list with add/edit
3. **PropertyBookingsScreen** - Bookings management
4. **LandlordAnalyticsScreen** - Charts and revenue data

### 🍽️ FOOD PROVIDER DASHBOARD
**API Endpoints:**
- `GET /food-providers/owner/my-providers` - List restaurants
- `GET /food-providers/owner/dashboard` - Dashboard overview
- `GET /food-providers/owner/menu-items/:providerId` - Menu management
- `POST/PUT/DELETE /food-providers/owner/menu-items/:providerId/:itemId` - CRUD menu
- `GET /food-providers/owner/orders/:providerId` - Orders management
- `GET /food-providers/owner/analytics` - Sales analytics

**Screens to Create:**
1. **FoodProviderDashboardScreen** - Overview with stats
2. **MyRestaurantsScreen** - Restaurant list
3. **MenuManagementScreen** - Add/edit menu items
4. **OrdersManagementScreen** - Real-time order handling
5. **FoodAnalyticsScreen** - Sales charts and data

## 🔐 AUTHENTICATION
```javascript
// All API calls need JWT token
const headers = {
  'Authorization': `Bearer ${userToken}`,
  'Content-Type': 'application/json'
};

// User roles: 'student', 'landlord', 'food_provider', 'admin'
```

## 🎨 UI REQUIREMENTS

### Dashboard Cards Design
- **Stats Cards**: Total properties/restaurants, revenue, bookings/orders
- **Recent Activity**: Latest bookings/orders
- **Quick Actions**: Add property/menu item buttons
- **Charts**: Revenue trends, occupancy rates, popular items

### Navigation Flow
- Show relevant dashboard based on user role
- Tab navigation within each dashboard
- Modal screens for adding/editing items

### Visual Design
- **Landlord Theme**: Blue (#2196F3)
- **Food Provider Theme**: Orange (#FF9800)
- **Cards**: Shadow, rounded corners, consistent spacing
- **Charts**: Use react-native-chart-kit or similar
- **Loading States**: Skeleton screens
- **Empty States**: Friendly messages with action buttons

## 📱 TECHNICAL IMPLEMENTATION

### State Management
```javascript
// Redux/Context structure
const dashboardState = {
  user: { role: 'landlord' | 'food_provider', id: '', name: '' },
  landlord: { properties: [], dashboard: {}, bookings: [], analytics: {} },
  foodProvider: { restaurants: [], dashboard: {}, orders: [], analytics: {} }
};
```

### API Service Layer
```javascript
// Create service functions for all endpoints
const landlordService = {
  getDashboard: (token) => fetch(`${API_URL}/accommodations/landlord/dashboard`, {...}),
  getProperties: (token) => fetch(`${API_URL}/accommodations/landlord/my-accommodations`, {...}),
  // ... other endpoints
};

const foodProviderService = {
  getDashboard: (token) => fetch(`${API_URL}/food-providers/owner/dashboard`, {...}),
  getRestaurants: (token) => fetch(`${API_URL}/food-providers/owner/my-providers`, {...}),
  // ... other endpoints
};
```

### Real-time Features
- **Food Providers**: Real-time order notifications
- **Landlords**: Booking status updates
- **Pull-to-refresh**: All data screens
- **Auto-refresh**: Dashboard data every 30 seconds

## 🚀 IMPLEMENTATION STEPS

1. **Setup API Services** - Create all API call functions
2. **Create Base Components** - Stats cards, charts, loading states
3. **Implement Navigation** - Role-based screen routing
4. **Build Dashboard Screens** - Main overview screens
5. **Add Management Screens** - CRUD operations for properties/menu
6. **Implement Charts** - Analytics and data visualization
7. **Add Real-time Updates** - WebSocket or polling for orders
8. **Error Handling** - Network errors, auth failures
9. **Testing** - Different user roles and edge cases

## 🔧 SAMPLE CODE SNIPPETS

### API Call Example:
```javascript
const getLandlordDashboard = async () => {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}/accommodations/landlord/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Dashboard error:', error);
    throw error;
  }
};
```

### Stats Card Component:
```javascript
const StatsCard = ({ title, value, icon, color, growth }) => (
  <View style={[styles.card, { borderLeftColor: color }]}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.value}>{value}</Text>
    <Text style={[styles.growth, { color: growth > 0 ? 'green' : 'red' }]}>
      {growth > 0 ? '↗' : '↘'} {Math.abs(growth)}%
    </Text>
  </View>
);
```

## 📋 DELIVERABLES

**Create these files:**
- `screens/Landlord/` - All landlord screens
- `screens/FoodProvider/` - All food provider screens  
- `services/api/` - API service functions
- `components/Dashboard/` - Reusable dashboard components
- `navigation/DashboardNavigator.js` - Role-based navigation
- `utils/dashboardHelpers.js` - Helper functions

**Features to implement:**
- ✅ Role-based dashboard navigation
- ✅ Stats cards with real data
- ✅ CRUD operations (properties, menu items)
- ✅ Charts and analytics
- ✅ Real-time order management
- ✅ Pull-to-refresh functionality
- ✅ Loading and error states
- ✅ Responsive design

## 🎯 SUCCESS CRITERIA
- Users can see different dashboards based on their role
- All API endpoints are properly integrated
- Real-time updates work for orders/bookings
- Charts display meaningful data
- Smooth navigation and good UX
- Error handling for all edge cases

**Start with the role detection and navigation setup, then build the dashboard screens progressively. Focus on the landlord dashboard first, then food provider dashboard.**
