# React Native Mobile App Development Prompts for StayKaru

## Prompt 1: Project Initialization and Setup
Create a new React Native project named "StayKaru" using Expo CLI. Set up the following dependencies:
- @react-navigation/native for navigation
- @react-navigation/bottom-tabs for bottom tab navigation
- @react-navigation/stack for stack navigation
- @react-native-async-storage/async-storage for local storage
- @reduxjs/toolkit and react-redux for state management
- axios for API calls
- react-native-vector-icons for icons
- react-native-elements for UI components
- react-native-maps for map functionality
- @expo/vector-icons for additional icons
- expo-location for location services
- expo-image-picker for image handling
- react-native-paper for Material Design components

Set up the basic folder structure with components, screens, services, store, and utils folders. Create a basic App.js with navigation setup.

## Prompt 2: Authentication System Implementation
Create a complete authentication system with the following screens and functionality:
1. **SplashScreen** - App loading screen with StayKaru logo
2. **WelcomeScreen** - Onboarding screen with app introduction
3. **LoginScreen** - Email/password login with validation
4. **RegisterScreen** - User registration with role selection (Student, Landlord, Food Provider)
5. **ForgotPasswordScreen** - Password reset functionality

Implement Redux slices for authentication state management. Create API service functions to integrate with the backend auth endpoints (/auth/login, /auth/register). Include form validation, loading states, error handling, and secure token storage using AsyncStorage. Add proper navigation flow between auth screens.

## Prompt 3: User Profile and Settings
Create user profile management functionality:
1. **ProfileScreen** - Display user information with edit capability
2. **EditProfileScreen** - Form to update user details (name, phone, address)
3. **SettingsScreen** - App settings including notifications, language, theme
4. **ChangePasswordScreen** - Password change functionality

Implement profile image upload using expo-image-picker. Create API integration for user endpoints (/users/:id). Add validation for profile updates and proper error handling. Include loading states and success/error messages.

## Prompt 4: Location Services and Management
Implement location-based functionality:
1. **LocationPermissionScreen** - Request location permissions
2. **LocationSelectScreen** - Allow users to select/search cities
3. Create a LocationService utility for:
   - Getting current location
   - Reverse geocoding
   - Location permissions handling
   - Distance calculations

Integrate with backend location endpoints (/location/countries, /location/cities). Implement location caching and offline support. Add map view with current location marker using react-native-maps.

## Prompt 5: Accommodation Listing and Search
Create accommodation browsing functionality:
1. **AccommodationListScreen** - Display all accommodations with search/filter
2. **AccommodationDetailScreen** - Detailed view of accommodation
3. **AccommodationMapScreen** - Map view of accommodations
4. **SearchFiltersScreen** - Advanced search filters (price, amenities, dates)

Implement search functionality with filters for:
- Price range
- Check-in/check-out dates
- Amenities
- Location proximity
- Accommodation type

Add pull-to-refresh, infinite scrolling, and favorites functionality. Integrate with backend accommodation endpoints.

## Prompt 6: Accommodation Management (Landlord)
Create landlord-specific screens for managing accommodations:
1. **MyAccommodationsScreen** - List landlord's properties
2. **AddAccommodationScreen** - Form to add new accommodation
3. **EditAccommodationScreen** - Edit existing accommodation
4. **AccommodationPhotosScreen** - Manage accommodation photos
5. **AccommodationAvailabilityScreen** - Manage availability calendar

Implement image upload for accommodation photos, calendar component for availability management, and comprehensive forms with validation. Add map integration for location selection.

## Prompt 7: Booking Management System
Create booking functionality for both students and landlords:
1. **BookingFormScreen** - Create new booking with date selection
2. **MyBookingsScreen** - List user's bookings
3. **BookingDetailScreen** - Detailed booking view
4. **BookingCalendarScreen** - Calendar view of bookings
5. **BookingManagementScreen** - Landlord view for managing booking requests

Implement date picker for check-in/check-out dates, booking status management (pending, confirmed, cancelled), and real-time updates. Add calendar components and booking conflict detection.

## Prompt 8: Food Service Discovery
Create food service browsing functionality:
1. **FoodProvidersScreen** - List all food providers
2. **FoodProviderDetailScreen** - Detailed view with menu
3. **MenuScreen** - Display food provider's menu
4. **MenuItemDetailScreen** - Detailed view of menu item
5. **SearchFoodScreen** - Search food providers and menu items

Implement filtering by cuisine type, location, ratings, and price range. Add favorites functionality and recently viewed items. Include nutritional information display and allergen warnings.

## Prompt 9: Food Provider Management
Create food provider-specific screens:
1. **MyFoodProviderScreen** - Manage food provider profile
2. **MenuManagementScreen** - Manage menu items
3. **AddMenuItemScreen** - Add new menu item
4. **EditMenuItemScreen** - Edit menu item
5. **OrderManagementScreen** - Manage incoming orders

Implement menu item image upload, inventory management, order status updates, and operating hours management. Add analytics dashboard for food providers.

## Prompt 10: Food Ordering System
Create food ordering functionality:
1. **CartScreen** - Shopping cart with items
2. **CheckoutScreen** - Order review and placement
3. **OrderTrackingScreen** - Track order status
4. **MyOrdersScreen** - List user's orders
5. **OrderDetailScreen** - Detailed order view

Implement cart management with Redux, order total calculations, delivery address selection, and real-time order tracking. Add order history and reorder functionality.

## Prompt 11: Payment Integration
Create payment processing functionality:
1. **PaymentMethodsScreen** - Manage payment methods
2. **PaymentScreen** - Process payments
3. **PaymentHistoryScreen** - View payment history
4. **AddPaymentMethodScreen** - Add new payment method

Implement integration with payment gateways (JazzCash, Credit Card), secure payment forms, payment status tracking, and receipt generation. Add support for multiple currencies and payment method validation.

## Prompt 12: Review and Rating System
Create review functionality:
1. **ReviewsScreen** - Display reviews for accommodations/food providers
2. **WriteReviewScreen** - Create new review
3. **EditReviewScreen** - Edit existing review
4. **MyReviewsScreen** - User's reviews

Implement star rating components, photo upload for reviews, review filters and sorting, and review helpfulness voting. Add moderation features and inappropriate content reporting.

## Prompt 13: Notifications and Real-time Updates
Create notification system:
1. **NotificationsScreen** - List all notifications
2. **NotificationDetailScreen** - Detailed notification view
3. **NotificationSettingsScreen** - Manage notification preferences

Implement push notifications using Expo Notifications, real-time updates for bookings and orders, notification categorization, and mark as read functionality. Add notification scheduling and badge counts.

## Prompt 14: Chat and Communication
Create in-app messaging system:
1. **ChatListScreen** - List of conversations
2. **ChatScreen** - Chat interface
3. **ChatSettingsScreen** - Chat preferences

Implement real-time messaging, file/image sharing, message status indicators (sent, delivered, read), and conversation search. Add user blocking and reporting features.

## Prompt 15: Analytics and Dashboard
Create analytics screens for different user types:
1. **StudentDashboardScreen** - Student overview with recent bookings/orders
2. **LandlordDashboardScreen** - Landlord analytics and property performance
3. **FoodProviderDashboardScreen** - Food provider analytics and order insights
4. **AdminDashboardScreen** - Admin analytics and system overview

Implement charts and graphs using react-native-chart-kit, revenue tracking, booking/order analytics, and performance metrics. Add data export functionality.

## Prompt 16: Advanced Search and Filters
Create advanced search functionality:
1. **UniversalSearchScreen** - Search across accommodations and food
2. **SearchHistoryScreen** - Recent searches
3. **SavedSearchesScreen** - Saved search criteria
4. **SearchSuggestionsScreen** - Search suggestions and autocomplete

Implement search autocomplete, voice search using Expo Speech, barcode scanning for food items, and AI-powered search suggestions. Add search analytics and trending searches.

## Prompt 17: Offline Support and Synchronization
Implement offline functionality:
1. Create offline data storage using SQLite
2. Implement data synchronization when connection restored
3. Add offline indicators in UI
4. Create conflict resolution for data sync

Add offline maps caching, form data persistence, and queue for API calls when offline. Implement background sync and data compression for efficient storage.

## Prompt 18: Accessibility and Internationalization
Implement accessibility and multi-language support:
1. Add accessibility labels and hints throughout the app
2. Implement screen reader support
3. Create language selection screen
4. Add RTL (Right-to-Left) language support

Implement i18n using react-native-localize, dynamic font sizing, high contrast mode, and voice navigation. Add support for multiple currencies and date formats.

## Prompt 19: Security and Privacy
Implement security features:
1. **SecuritySettingsScreen** - Security preferences
2. **PrivacySettingsScreen** - Privacy controls
3. **TwoFactorAuthScreen** - 2FA setup and management
4. **BiometricAuthScreen** - Fingerprint/Face ID authentication

Implement biometric authentication using expo-local-authentication, secure storage for sensitive data, certificate pinning for API calls, and privacy controls for data sharing. Add security audit logging.

## Prompt 20: Testing, Performance, and App Store Deployment
Create comprehensive testing and deployment setup:
1. Set up unit testing with Jest
2. Implement integration testing with Detox
3. Add performance monitoring with Flipper
4. Create automated testing pipeline

Implement app performance optimization, memory leak detection, crash reporting with Sentry, and analytics with Firebase Analytics. Set up CI/CD pipeline for automated builds and deployments to both iOS App Store and Google Play Store.

## Additional Implementation Guidelines

### State Management Structure
```javascript
// Redux store structure
store/
  auth/
    authSlice.js
  user/
    userSlice.js
  accommodations/
    accommodationsSlice.js
  bookings/
    bookingsSlice.js
  food/
    foodSlice.js
  orders/
    ordersSlice.js
  notifications/
    notificationsSlice.js
```

### API Service Structure
```javascript
// API service structure
services/
  api.js (base API configuration)
  authService.js
  userService.js
  accommodationService.js
  bookingService.js
  foodService.js
  orderService.js
  paymentService.js
  notificationService.js
```

### Screen Navigation Structure
```javascript
// Navigation structure
navigation/
  AuthNavigator.js
  MainNavigator.js
  AccommodationNavigator.js
  FoodNavigator.js
  ProfileNavigator.js
```

### Component Organization
```javascript
// Component structure
components/
  common/
    Button.js
    Input.js
    LoadingSpinner.js
    ErrorMessage.js
  accommodation/
    AccommodationCard.js
    AccommodationGallery.js
  food/
    MenuItemCard.js
    FoodProviderCard.js
  booking/
    DatePicker.js
    BookingCard.js
```

### Utility Functions
```javascript
// Utils structure
utils/
  validation.js
  dateUtils.js
  locationUtils.js
  formatUtils.js
  constants.js
  helpers.js
```

Remember to follow React Native best practices, implement proper error boundaries, optimize for both iOS and Android platforms, and ensure the app meets accessibility standards throughout development.
