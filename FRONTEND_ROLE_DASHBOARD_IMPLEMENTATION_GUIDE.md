# 📱 Frontend Role-Based Dashboard Implementation Guide

## 🎯 Overview
This guide provides complete instructions for implementing role-based dashboards in the StayKaru mobile app (React Native) for **Landlord** and **Food Provider** roles.

## 🚀 Backend API Status
✅ **All APIs are LIVE and TESTED** on production: `https://staykaru-backend-60ed08adb2a7.herokuapp.com`

## 🔐 Authentication & Authorization

### User Roles
- `student` - Default user role
- `landlord` - Property owners
- `food_provider` - Restaurant/food service owners  
- `admin` - System administrators

### Authentication Headers
```javascript
const headers = {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
};
```

## 📋 API Endpoints Implementation

### 🏠 LANDLORD DASHBOARD ENDPOINTS

#### 1. Get My Accommodations
```javascript
// GET /accommodations/landlord/my-accommodations
const getMyAccommodations = async (token) => {
  const response = await fetch(`${API_BASE_URL}/accommodations/landlord/my-accommodations`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// Response Format:
{
  "accommodations": [
    {
      "_id": "accommodation_id",
      "title": "Property Title",
      "description": "Property description",
      "price": 1500,
      "city": { "name": "Lahore" },
      "amenities": ["WiFi", "Kitchen"],
      "availability": ["2025-06-01", "2025-06-02"],
      "createdAt": "2025-06-19T00:00:00Z"
    }
  ],
  "totalCount": 5
}
```

#### 2. Get Landlord Dashboard Summary
```javascript
// GET /accommodations/landlord/dashboard  
const getLandlordDashboard = async (token) => {
  const response = await fetch(`${API_BASE_URL}/accommodations/landlord/dashboard`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// Response Format:
{
  "totalProperties": 5,
  "totalBookings": 12,
  "activeBookings": 3,
  "monthlyRevenue": 15000,
  "occupancyRate": 75.5,
  "recentBookings": [
    {
      "_id": "booking_id",
      "accommodation": { "title": "Property Name" },
      "user": { "name": "Student Name" },
      "checkIn": "2025-06-20",
      "checkOut": "2025-06-25",
      "status": "confirmed",
      "totalAmount": 2500
    }
  ]
}
```

#### 3. Get Landlord Bookings
```javascript
// GET /accommodations/landlord/bookings
const getLandlordBookings = async (token, status = null) => {
  let url = `${API_BASE_URL}/accommodations/landlord/bookings`;
  if (status) url += `?status=${status}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// Query Parameters:
// ?status=pending|confirmed|cancelled|completed
```

#### 4. Get Landlord Analytics
```javascript
// GET /accommodations/landlord/analytics
const getLandlordAnalytics = async (token, period = 'month') => {
  const response = await fetch(`${API_BASE_URL}/accommodations/landlord/analytics?period=${period}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// Response Format:
{
  "revenue": {
    "total": 45000,
    "thisMonth": 15000,
    "growth": 12.5
  },
  "bookings": {
    "total": 25,
    "thisMonth": 8,
    "growth": 20
  },
  "chartData": [
    { "month": "Jan", "revenue": 12000, "bookings": 4 },
    { "month": "Feb", "revenue": 15000, "bookings": 5 }
  ]
}
```

### 🍽️ FOOD PROVIDER DASHBOARD ENDPOINTS

#### 1. Get My Food Providers
```javascript
// GET /food-providers/owner/my-providers
const getMyFoodProviders = async (token) => {
  const response = await fetch(`${API_BASE_URL}/food-providers/owner/my-providers`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// Response Format:
{
  "providers": [
    {
      "_id": "provider_id",
      "name": "Restaurant Name",
      "description": "Restaurant description",
      "cuisine_type": "Pakistani",
      "location": { "name": "Lahore" },
      "rating": 4.5,
      "total_reviews": 25,
      "is_active": true,
      "operating_hours": { "open": "09:00", "close": "22:00" }
    }
  ],
  "totalCount": 2
}
```

#### 2. Get Food Provider Dashboard
```javascript
// GET /food-providers/owner/dashboard
const getFoodProviderDashboard = async (token) => {
  const response = await fetch(`${API_BASE_URL}/food-providers/owner/dashboard`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// Response Format:
{
  "totalRestaurants": 2,
  "totalOrders": 45,
  "activeOrders": 5,
  "monthlyRevenue": 25000,
  "averageRating": 4.3,
  "recentOrders": [
    {
      "_id": "order_id",
      "user": { "name": "Student Name" },
      "items": [{ "name": "Pizza", "quantity": 1, "price": 800 }],
      "totalAmount": 800,
      "status": "preparing",
      "createdAt": "2025-06-19T10:30:00Z"
    }
  ]
}
```

#### 3. Menu Items Management
```javascript
// GET /food-providers/owner/menu-items/:providerId
const getMenuItems = async (token, providerId) => {
  const response = await fetch(`${API_BASE_URL}/food-providers/owner/menu-items/${providerId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// POST /food-providers/owner/menu-items/:providerId
const createMenuItem = async (token, providerId, menuItem) => {
  const response = await fetch(`${API_BASE_URL}/food-providers/owner/menu-items/${providerId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(menuItem)
  });
  return response.json();
};

// Menu Item Data Structure:
{
  "name": "Chicken Biryani",
  "description": "Delicious chicken biryani with basmati rice",
  "price": 350,
  "category": "Main Course",
  "is_available": true,
  "preparation_time": 30,
  "image_url": "https://example.com/image.jpg"
}

// PUT /food-providers/owner/menu-items/:providerId/:itemId
const updateMenuItem = async (token, providerId, itemId, updates) => {
  const response = await fetch(`${API_BASE_URL}/food-providers/owner/menu-items/${providerId}/${itemId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });
  return response.json();
};

// DELETE /food-providers/owner/menu-items/:providerId/:itemId
const deleteMenuItem = async (token, providerId, itemId) => {
  const response = await fetch(`${API_BASE_URL}/food-providers/owner/menu-items/${providerId}/${itemId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};
```

#### 4. Get Provider Orders
```javascript
// GET /food-providers/owner/orders/:providerId
const getProviderOrders = async (token, providerId, status = null) => {
  let url = `${API_BASE_URL}/food-providers/owner/orders/${providerId}`;
  if (status) url += `?status=${status}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// Query Parameters:
// ?status=pending|confirmed|preparing|ready|delivered|cancelled
```

#### 5. Get Food Provider Analytics
```javascript
// GET /food-providers/owner/analytics
const getFoodProviderAnalytics = async (token, period = 'month') => {
  const response = await fetch(`${API_BASE_URL}/food-providers/owner/analytics?period=${period}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// Response Format:
{
  "revenue": {
    "total": 125000,
    "thisMonth": 25000,
    "growth": 15.2
  },
  "orders": {
    "total": 150,
    "thisMonth": 45,
    "growth": 25
  },
  "popularItems": [
    { "name": "Chicken Biryani", "orders": 25 },
    { "name": "Chicken Karahi", "orders": 20 }
  ],
  "chartData": [
    { "month": "Jan", "revenue": 20000, "orders": 35 },
    { "month": "Feb", "revenue": 25000, "orders": 45 }
  ]
}
```

## 🎨 UI Implementation Guide

### 📱 Screen Structure

#### Landlord Dashboard Screens:
1. **LandlordDashboardScreen** - Main dashboard with overview
2. **MyPropertiesScreen** - List of landlord's properties
3. **PropertyBookingsScreen** - All bookings for properties
4. **LandlordAnalyticsScreen** - Revenue and performance analytics
5. **AddPropertyScreen** - Create new property listing

#### Food Provider Dashboard Screens:
1. **FoodProviderDashboardScreen** - Main dashboard with overview
2. **MyRestaurantsScreen** - List of restaurants
3. **MenuManagementScreen** - Manage menu items
4. **OrdersManagementScreen** - Handle incoming orders
5. **FoodAnalyticsScreen** - Sales and performance analytics

### 🔄 State Management

```javascript
// Redux/Context State Structure
const dashboardState = {
  user: {
    role: 'landlord' | 'food_provider' | 'student',
    id: 'user_id',
    name: 'User Name'
  },
  landlord: {
    accommodations: [],
    dashboard: {},
    bookings: [],
    analytics: {},
    loading: false,
    error: null
  },
  foodProvider: {
    providers: [],
    dashboard: {},
    menuItems: {},
    orders: {},
    analytics: {},
    loading: false,
    error: null
  }
};
```

### 🎯 Navigation Implementation

```javascript
// Add to your navigation stack
const DashboardStack = () => {
  const { user } = useAuth();
  
  return (
    <Stack.Navigator>
      {user?.role === 'landlord' && (
        <>
          <Stack.Screen name="LandlordDashboard" component={LandlordDashboardScreen} />
          <Stack.Screen name="MyProperties" component={MyPropertiesScreen} />
          <Stack.Screen name="PropertyBookings" component={PropertyBookingsScreen} />
          <Stack.Screen name="LandlordAnalytics" component={LandlordAnalyticsScreen} />
        </>
      )}
      
      {user?.role === 'food_provider' && (
        <>
          <Stack.Screen name="FoodProviderDashboard" component={FoodProviderDashboardScreen} />
          <Stack.Screen name="MyRestaurants" component={MyRestaurantsScreen} />
          <Stack.Screen name="MenuManagement" component={MenuManagementScreen} />
          <Stack.Screen name="OrdersManagement" component={OrdersManagementScreen} />
          <Stack.Screen name="FoodAnalytics" component={FoodAnalyticsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
```

## 🛡️ Error Handling

```javascript
const handleApiCall = async (apiFunction, ...args) => {
  try {
    const result = await apiFunction(...args);
    return { success: true, data: result };
  } catch (error) {
    if (error.status === 401) {
      // Token expired, redirect to login
      await logout();
      return { success: false, error: 'Please login again' };
    } else if (error.status === 403) {
      return { success: false, error: 'Access denied for this role' };
    } else {
      return { success: false, error: error.message || 'Something went wrong' };
    }
  }
};
```

## 📊 Sample Dashboard Components

### Landlord Dashboard Card
```javascript
const LandlordStatsCard = ({ title, value, icon, color, growth }) => (
  <View style={[styles.statsCard, { borderLeftColor: color }]}>
    <View style={styles.statsHeader}>
      <Icon name={icon} size={24} color={color} />
      <Text style={styles.statsTitle}>{title}</Text>
    </View>
    <Text style={styles.statsValue}>{value}</Text>
    {growth && (
      <Text style={[styles.growth, { color: growth > 0 ? '#4CAF50' : '#F44336' }]}>
        {growth > 0 ? '↗' : '↘'} {Math.abs(growth)}%
      </Text>
    )}
  </View>
);
```

### Food Provider Order Card
```javascript
const OrderCard = ({ order, onStatusUpdate }) => (
  <View style={styles.orderCard}>
    <View style={styles.orderHeader}>
      <Text style={styles.orderId}>#{order._id.slice(-6)}</Text>
      <Badge status={order.status} />
    </View>
    <Text style={styles.customerName}>{order.user.name}</Text>
    <View style={styles.orderItems}>
      {order.items.map(item => (
        <Text key={item._id}>{item.name} x{item.quantity}</Text>
      ))}
    </View>
    <View style={styles.orderFooter}>
      <Text style={styles.orderAmount}>Rs. {order.totalAmount}</Text>
      <Text style={styles.orderTime}>{formatTime(order.createdAt)}</Text>
    </View>
    <OrderStatusButtons order={order} onUpdate={onStatusUpdate} />
  </View>
);
```

## 🔧 Configuration

### API Base URL
```javascript
// config/api.js
export const API_CONFIG = {
  BASE_URL: 'https://staykaru-backend-60ed08adb2a7.herokuapp.com',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
};
```

### Auth Token Storage
```javascript
// utils/auth.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getAuthToken = async () => {
  return await AsyncStorage.getItem('authToken');
};

export const setAuthToken = async (token) => {
  await AsyncStorage.setItem('authToken', token);
};
```

## 🎨 UI/UX Guidelines

### Color Scheme
- **Landlord**: Blue theme (#2196F3)
- **Food Provider**: Orange theme (#FF9800)
- **Success**: Green (#4CAF50)
- **Warning**: Yellow (#FFC107)
- **Error**: Red (#F44336)

### Dashboard Cards
- Use consistent card layouts
- Include loading states
- Show empty states when no data
- Add pull-to-refresh functionality

### Charts and Analytics
- Use libraries like `react-native-chart-kit` or `victory-native`
- Implement responsive chart sizing
- Add date range selectors

## 🚀 Implementation Steps

1. **Setup API Service Layer** - Create API functions for all endpoints
2. **Implement State Management** - Add Redux/Context for dashboard data
3. **Create Base Components** - Cards, charts, loading states
4. **Build Dashboard Screens** - Implement main dashboard views
5. **Add Navigation** - Role-based navigation setup
6. **Implement Real-time Updates** - For orders and bookings
7. **Add Offline Support** - Cache critical data
8. **Testing** - Test with different user roles

## 📝 Sample Prompt for Frontend Agent

```
Please implement role-based dashboards for the StayKaru mobile app with the following requirements:

CONTEXT: I have a React Native app that needs landlord and food provider dashboards. All backend APIs are ready and tested.

BACKEND APIS: 
- Base URL: https://staykaru-backend-60ed08adb2a7.herokuapp.com
- Authentication: JWT Bearer tokens
- Roles: landlord, food_provider, student, admin

IMPLEMENT:
1. Landlord Dashboard with:
   - My properties list (/accommodations/landlord/my-accommodations)
   - Dashboard overview (/accommodations/landlord/dashboard) 
   - Bookings management (/accommodations/landlord/bookings)
   - Analytics charts (/accommodations/landlord/analytics)

2. Food Provider Dashboard with:
   - My restaurants list (/food-providers/owner/my-providers)
   - Dashboard overview (/food-providers/owner/dashboard)
   - Menu management (/food-providers/owner/menu-items/:providerId)
   - Orders management (/food-providers/owner/orders/:providerId)
   - Analytics charts (/food-providers/owner/analytics)

REQUIREMENTS:
- Role-based navigation (show relevant dashboard based on user role)
- Modern UI with cards, charts, and smooth animations
- Real-time order updates for food providers
- Pull-to-refresh and loading states
- Error handling for API calls
- Responsive design for different screen sizes

TECH STACK: React Native, React Navigation, Redux/Context API, AsyncStorage

Please create all necessary screens, components, and API integration code.
```

This guide provides everything the frontend team needs to implement the role-based dashboards successfully! 🎯
