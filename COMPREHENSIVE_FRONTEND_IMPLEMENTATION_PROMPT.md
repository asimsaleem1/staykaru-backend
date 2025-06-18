# 🚀 COMPREHENSIVE FRONTEND IMPLEMENTATION TASK FOR STAYKARU

## 📋 Task Overview

You are tasked with developing the complete frontend for the StayKaru application using React Native and Expo. The backend has been **fully completed and deployed** to Heroku with a robust JWT-based authentication system, comprehensive API endpoints, and all required functionality.

**Backend URL**: https://staykaru-backend-60ed08adb2a7.herokuapp.com

## 🎯 Key Requirements

### 1. Core Application Development
- Develop a complete React Native/Expo mobile application
- Implement role-based access control for **Students**, **Landlords**, **Food Providers**, and **Admins**
- Create a seamless JWT authentication flow
- Design a modern, intuitive UI following Material Design principles
- Ensure cross-platform compatibility (iOS/Android)

### 2. Authentication System (CRITICAL)
- **JWT-based authentication** (Firebase completely removed from backend)
- User registration with validation
- Secure login/logout functionality
- Profile management with update capabilities
- **Password change functionality** (NEW - just implemented)
- Admin-specific login restrictions
- Token refresh and session management

### 3. Role-Based Features
- **Students**: Accommodation search, booking, food ordering, reviews
- **Landlords**: Property management, booking management, analytics
- **Food Providers**: Menu management, order processing, analytics
- **Admins**: System oversight, user management, comprehensive analytics

## 🔧 Backend Status & Capabilities

### ✅ Completed Backend Features
- **Authentication System**: Full JWT implementation with registration, login, profile management
- **User Management**: Profile updates, password changes, role management
- **Accommodation System**: CRUD operations, search, booking management
- **Food Service**: Menu management, ordering system, provider management
- **Payment Processing**: Secure payment handling and tracking
- **Booking System**: Reservation management and status tracking
- **Review System**: Rating and feedback functionality
- **Analytics**: Comprehensive reporting for all user roles
- **Notifications**: Real-time notification system
- **Cache Management**: Optimized performance with caching

### 🔐 Authentication Endpoints (Ready for Integration)

```
POST /auth/register - User registration
POST /auth/login - User login
GET /auth/profile - Get user profile (JWT protected)
PUT /users/profile - Update user profile (JWT protected)
POST /users/change-password - Change password (JWT protected)
```

### 🏠 Core API Endpoints (All Working)

```
# Accommodations
GET /accommodations - List all accommodations (public)
POST /accommodations - Create accommodation (landlord only)
GET /accommodations/:id - Get specific accommodation
PUT /accommodations/:id - Update accommodation (landlord only)
DELETE /accommodations/:id - Delete accommodation (landlord only)

# Bookings
GET /bookings/my-bookings - Get user's bookings (JWT protected)
POST /bookings - Create new booking (student only)
PUT /bookings/:id/status - Update booking status (landlord only)

# Food Service
GET /food-providers - List food providers (public)
POST /food-providers - Register as food provider (JWT protected)
GET /food-providers/:id/menu - Get provider menu
POST /food-providers/:id/menu-items - Add menu item (provider only)

# Orders
GET /orders/my-orders - Get user's orders (JWT protected)
POST /orders - Place new order (JWT protected)
PUT /orders/:id/status - Update order status (provider only)

# Payments
GET /payments/my-payments - Get user's payments (JWT protected)
POST /payments - Process payment (JWT protected)

# Reviews
GET /reviews/:targetType/:targetId - Get reviews for target
POST /reviews - Create review (JWT protected)

# Analytics (Role-based access)
GET /analytics/bookings - Booking analytics
GET /analytics/orders - Order analytics
GET /analytics/revenue - Revenue analytics
GET /analytics/users - User analytics

# Notifications
GET /notifications - Get user notifications (JWT protected)
POST /notifications/mark-read/:id - Mark notification as read
```

### 🔄 Recent Critical Updates

1. **Password Change Feature**: Fully implemented and tested
2. **Profile Update Feature**: Enhanced with proper validation
3. **Admin Login Security**: Restricted to specific admin account
4. **Error Handling**: Comprehensive error responses for all endpoints
5. **Cache Management**: User data caching for performance
6. **Route Optimization**: Fixed route conflicts and 500 errors

## 📱 Frontend Implementation Requirements

### 1. Project Setup
```bash
# Initialize with Expo
npx create-expo-app StayKaru
cd StayKaru

# Install required dependencies
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-async-storage/async-storage
npm install axios
npm install react-native-elements react-native-vector-icons
npm install @expo/vector-icons
npm install react-native-paper
npm install formik yup
npm install react-native-toast-message
```

### 2. Authentication Implementation

#### API Client Setup
```javascript
// src/api/apiClient.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('jwt_token');
      // Navigate to login screen
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

#### Authentication Context
```javascript
// src/context/AuthContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/apiClient';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    user: null,
    token: null,
  });

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      await AsyncStorage.setItem('jwt_token', token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      const { token, user } = response.data;
      
      await AsyncStorage.setItem('jwt_token', token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('jwt_token');
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await apiClient.put('/users/profile', profileData);
      dispatch({ type: 'UPDATE_PROFILE', payload: response.data });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Profile update failed' 
      };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await apiClient.post('/users/change-password', {
        currentPassword,
        newPassword,
      });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Password change failed' 
      };
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        ...state, 
        login, 
        register, 
        logout, 
        updateProfile, 
        changePassword 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### 3. Screen Structure & Navigation

#### Main App Navigation
```javascript
// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';

const Stack = createStackNavigator();

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
```

### 4. Required Screens by Role

#### 🎓 Student Screens
- **Dashboard**: Overview of bookings, orders, notifications
- **Accommodation Search**: Filter, search, view properties
- **Accommodation Details**: Property info, photos, booking
- **My Bookings**: Current and past accommodation bookings
- **Food Providers**: Browse food providers and menus
- **Place Order**: Select items, customize, checkout
- **My Orders**: Track food orders and history
- **Profile**: View/edit profile, change password
- **Reviews**: Write and view reviews
- **Notifications**: System and booking notifications

#### 🏠 Landlord Screens
- **Dashboard**: Booking overview, revenue, notifications
- **My Properties**: List and manage accommodations
- **Add/Edit Property**: Property details, photos, pricing
- **Booking Requests**: Approve/reject booking requests
- **Booking Management**: View and manage active bookings
- **Analytics**: Occupancy rates, revenue reports
- **Profile**: Landlord profile and settings
- **Reviews**: View and respond to property reviews

#### 🍽️ Food Provider Screens
- **Dashboard**: Order overview, revenue, notifications
- **Menu Management**: Add, edit, remove menu items
- **Order Management**: View and process incoming orders
- **Order History**: Past orders and fulfillment tracking
- **Analytics**: Sales reports, popular items
- **Profile**: Provider details and settings
- **Reviews**: Customer feedback and ratings

#### 👑 Admin Screens
- **Admin Dashboard**: System overview and statistics
- **User Management**: View, edit, suspend users
- **Property Oversight**: Review and manage all properties
- **Order Monitoring**: System-wide order tracking
- **Analytics Hub**: Comprehensive system analytics
- **Content Moderation**: Review reports and content
- **System Settings**: App configuration and management

### 5. Critical Implementation Details

#### Password Change Feature (NEW)
```javascript
// src/screens/ChangePasswordScreen.js
import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

const ChangePasswordScreen = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { changePassword } = useAuth();

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await changePassword(currentPassword, newPassword);
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Password changed successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        label="Current Password"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry
        style={{ marginBottom: 15 }}
      />
      <TextInput
        label="New Password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        style={{ marginBottom: 15 }}
      />
      <TextInput
        label="Confirm New Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={{ marginBottom: 20 }}
      />
      <Button
        mode="contained"
        onPress={handleChangePassword}
        loading={loading}
        disabled={!currentPassword || !newPassword || !confirmPassword}
      >
        Change Password
      </Button>
    </View>
  );
};
```

#### Profile Update Feature
```javascript
// src/screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Card } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    // Add other fields as needed
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleUpdate = async () => {
    setLoading(true);
    const result = await updateProfile(formData);
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Profile updated successfully');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Card style={{ padding: 20, marginBottom: 20 }}>
        <TextInput
          label="Name"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          style={{ marginBottom: 15 }}
        />
        <TextInput
          label="Email"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
          style={{ marginBottom: 15 }}
        />
        <TextInput
          label="Phone"
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          keyboardType="phone-pad"
          style={{ marginBottom: 20 }}
        />
        <Button
          mode="contained"
          onPress={handleUpdate}
          loading={loading}
          style={{ marginBottom: 10 }}
        >
          Update Profile
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('ChangePassword')}
        >
          Change Password
        </Button>
      </Card>
    </ScrollView>
  );
};
```

### 6. API Integration Examples

#### Accommodation Booking
```javascript
// src/services/accommodationService.js
import apiClient from '../api/apiClient';

export const accommodationService = {
  getAccommodations: async (filters = {}) => {
    const response = await apiClient.get('/accommodations', { params: filters });
    return response.data;
  },

  getAccommodationById: async (id) => {
    const response = await apiClient.get(`/accommodations/${id}`);
    return response.data;
  },

  createBooking: async (accommodationId, bookingData) => {
    const response = await apiClient.post('/bookings', {
      accommodationId,
      ...bookingData,
    });
    return response.data;
  },

  getMyBookings: async () => {
    const response = await apiClient.get('/bookings/my-bookings');
    return response.data;
  },
};
```

#### Food Ordering
```javascript
// src/services/foodService.js
import apiClient from '../api/apiClient';

export const foodService = {
  getFoodProviders: async () => {
    const response = await apiClient.get('/food-providers');
    return response.data;
  },

  getProviderMenu: async (providerId) => {
    const response = await apiClient.get(`/food-providers/${providerId}/menu`);
    return response.data;
  },

  placeOrder: async (orderData) => {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  },

  getMyOrders: async () => {
    const response = await apiClient.get('/orders/my-orders');
    return response.data;
  },
};
```

### 7. Error Handling & User Experience

#### Global Error Handler
```javascript
// src/utils/errorHandler.js
import { Alert } from 'react-native';

export const handleApiError = (error) => {
  const message = error.response?.data?.message || 'An unexpected error occurred';
  
  if (error.response?.status === 401) {
    // Handle unauthorized - logout user
    return 'Session expired. Please login again.';
  }
  
  if (error.response?.status === 403) {
    return 'You do not have permission to perform this action.';
  }
  
  if (error.response?.status >= 500) {
    return 'Server error. Please try again later.';
  }
  
  return message;
};

export const showError = (error) => {
  Alert.alert('Error', handleApiError(error));
};
```

### 8. Testing Requirements

#### Manual Testing Checklist
- [ ] User registration with all required fields
- [ ] Login with valid/invalid credentials
- [ ] Password change functionality
- [ ] Profile update capabilities
- [ ] Role-based navigation and features
- [ ] Accommodation search and booking
- [ ] Food ordering process
- [ ] Payment processing
- [ ] Review and rating system
- [ ] Notification handling
- [ ] Error handling and user feedback

#### API Integration Testing
- [ ] All public endpoints work without authentication
- [ ] JWT token is properly sent with authenticated requests
- [ ] Token refresh handling
- [ ] Error responses are handled gracefully
- [ ] Loading states are shown appropriately

### 9. Deployment & Production Readiness

#### Build Configuration
```javascript
// app.config.js
export default {
  expo: {
    name: "StayKaru",
    slug: "staykaru",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#667eea"
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    }
  }
};
```

### 10. Timeline & Deliverables

#### Phase 1 (Week 1): Foundation
- [ ] Project setup and configuration
- [ ] Authentication system implementation
- [ ] Basic navigation structure
- [ ] API client setup

#### Phase 2 (Week 2): Core Features
- [ ] Student dashboard and features
- [ ] Accommodation search and booking
- [ ] Basic profile management

#### Phase 3 (Week 3): Extended Features
- [ ] Food ordering system
- [ ] Landlord dashboard and property management
- [ ] Food provider features

#### Phase 4 (Week 4): Advanced Features
- [ ] Admin panel
- [ ] Analytics and reporting
- [ ] Review and rating system

#### Phase 5 (Week 5): Polish & Testing
- [ ] UI/UX refinement
- [ ] Comprehensive testing
- [ ] Performance optimization

#### Phase 6 (Week 6): Deployment
- [ ] Production build testing
- [ ] App store preparation
- [ ] Final deployment

## 🚀 Getting Started

1. **Review Backend API**: Test all endpoints using the provided examples
2. **Set Up Development Environment**: Install React Native, Expo, and required tools
3. **Initialize Project**: Create new Expo project with required dependencies
4. **Implement Authentication**: Start with login/register functionality
5. **Build Role-Based Navigation**: Create navigation structure for different user types
6. **Develop Core Features**: Implement features according to user roles
7. **Test Integration**: Ensure all API calls work correctly with the backend
8. **Polish UI/UX**: Create a modern, intuitive interface
9. **Comprehensive Testing**: Test all flows and edge cases
10. **Deploy**: Prepare for production deployment

## 📞 Support & Communication

- **Backend URL**: https://staykaru-backend-60ed08adb2a7.herokuapp.com
- **API Documentation**: Available at `/api` endpoint on the backend
- **All endpoints are tested and working**: Ready for immediate integration
- **Password change and profile update**: Recently implemented and tested
- **Admin functionality**: Properly secured and restricted

The backend is **production-ready** with comprehensive error handling, security measures, and optimized performance. Focus on creating an excellent user experience that leverages all the backend capabilities.

**Good luck with the implementation!** 🎉
