# StayKaru Student Module Frontend Specification

## Overview

The StayKaru Student Module provides comprehensive functionality for student users to discover accommodations, book places, order food, and manage their university living experience in one integrated platform. This document outlines the complete specification for developing the student-facing frontend interface.

## Table of Contents

1. [Design System](#design-system)
2. [Authentication & Onboarding](#authentication--onboarding)
3. [Student Dashboard](#student-dashboard)
4. [Accommodation Module](#accommodation-module)
5. [Booking Management](#booking-management)
6. [Food Service Module](#food-service-module)
7. [Order Management](#order-management)
8. [User Profile & Settings](#user-profile--settings)
9. [Notifications System](#notifications-system)
10. [Chat & Support](#chat--support)
11. [Integration Requirements](#integration-requirements)
12. [Non-Functional Requirements](#non-functional-requirements)
13. [Appendix: API Reference](#appendix-api-reference)

## Design System

### Colors

- **Primary**: `#3498db` (Blue)
- **Secondary**: `#2ecc71` (Green)
- **Accent**: `#e74c3c` (Red)
- **Neutral**:
  - Dark: `#2c3e50`
  - Mid: `#7f8c8d`
  - Light: `#ecf0f1`
- **Background**: `#f9f9f9`

### Typography

- **Headings**: Poppins (Bold, SemiBold)
- **Body**: Inter (Regular, Medium)
- **Sizes**:
  - H1: 32px / 40px line height
  - H2: 24px / 32px line height
  - H3: 20px / 28px line height
  - Body: 16px / 24px line height
  - Small: 14px / 20px line height

### Components

Develop consistent reusable components:

- Buttons (Primary, Secondary, Tertiary, Icon)
- Form elements (Input, Select, Checkbox, Radio, Toggle)
- Cards (Accommodation, Food Item, Booking)
- Navigation (Header, Footer, Sidebar)
- Modals and Dialogs
- Loaders and Skeletons
- Alerts and Notifications

### Responsive Breakpoints

- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px - 1439px
- Large Desktop: 1440px+

## Authentication & Onboarding

### Screens

#### 1. Login Screen

![Login Screen](https://via.placeholder.com/600x400.png?text=Login+Screen+Mockup)

**Requirements:**
- Email/phone and password fields with validation
- "Remember me" option
- Forgot password link
- "Sign up as a student" link
- OAuth login options (Google, Facebook, Apple)
- Error handling for invalid credentials

**API Integration:**
```javascript
POST /api/auth/login
{
  "email": "student@example.com",
  "password": "securepassword"
}
```

#### 2. Registration Screen

![Registration Screen](https://via.placeholder.com/600x400.png?text=Registration+Screen+Mockup)

**Requirements:**
- Multi-step registration form
- Step 1: Basic Info (Name, Email, Password, Phone)
- Step 2: Personal Details (Gender, Date of Birth, Address)
- Step 3: Academic Info (University, Student ID)
- Step 4: Emergency Contact
- Password strength indicator
- Email verification step

**API Integration:**
```javascript
POST /api/auth/register
{
  "name": "Student Name",
  "email": "student@example.com",
  "password": "securePassword123",
  "role": "student",
  "phone": "1234567890",
  "countryCode": "+1",
  "gender": "female",
  "dateOfBirth": "2000-01-15",
  "address": "123 Campus Drive",
  "university": "Example University",
  "studentId": "STU12345",
  "emergencyContact": {
    "name": "Parent Name",
    "phone": "9876543210",
    "relationship": "parent"
  }
}
```

#### 3. Forgot Password Flow

**Requirements:**
- Email/phone entry for reset link
- OTP verification screen
- New password and confirm password fields
- Success confirmation

**API Integration:**
```javascript
POST /api/auth/forgot-password
{
  "email": "student@example.com"
}

POST /api/auth/verify-otp
{
  "email": "student@example.com",
  "otp": "123456"
}

POST /api/auth/reset-password
{
  "email": "student@example.com",
  "token": "reset_token",
  "password": "newSecurePassword123"
}
```

#### 4. Email Verification Screen

**Requirements:**
- Email verification code entry
- Resend code option
- Success confirmation

**API Integration:**
```javascript
POST /api/auth/verify-email
{
  "email": "student@example.com",
  "verificationCode": "123456"
}
```

## Student Dashboard

![Student Dashboard](https://via.placeholder.com/800x600.png?text=Student+Dashboard+Mockup)

### Components

#### 1. Dashboard Header
- Profile avatar and name
- Quick navigation links
- Notification bell with counter
- Search functionality

#### 2. Overview Section
- Welcome message with user's name
- Current/upcoming bookings summary
- Recent food orders
- Important notifications panel

#### 3. Quick Action Cards
- Find Accommodation
- Order Food
- My Bookings
- My Profile

#### 4. Accommodation Highlights
- Featured accommodations carousel
- Recently viewed properties
- Saved/favorited properties

#### 5. Food Services Highlights
- Local restaurants with ratings
- Special offers/discounts
- Recently ordered from restaurants

#### 6. Upcoming Events & Reminders
- Calendar view with booking dates
- Payment due reminders
- University events (if integrated)

**API Integration:**
```javascript
GET /api/dashboard
GET /api/dashboard/student/accommodations
GET /api/dashboard/student/food-options
```

## Accommodation Module

### Screens

#### 1. Accommodation Listing

![Accommodation Listing](https://via.placeholder.com/800x600.png?text=Accommodation+Listing)

**Requirements:**
- Grid/List view toggle
- Advanced filtering panel:
  - Price range slider
  - Property type checkboxes
  - Amenities multiselect
  - Distance from university
  - Availability calendar
- Sorting options (Price, Distance, Rating)
- Map view toggle with property pins
- Pagination or infinite scroll
- Accommodation cards with:
  - Featured image
  - Title and location
  - Price
  - Key amenities icons
  - Rating
  - Availability status
  - Favorite button

**API Integration:**
```javascript
GET /api/accommodations
GET /api/accommodations?price_min=200&price_max=500&amenities=wifi,kitchen
GET /api/accommodations/nearby?lat=40.7128&lng=-74.0060&radius=10
```

#### 2. Accommodation Details

![Accommodation Details](https://via.placeholder.com/800x600.png?text=Accommodation+Details)

**Requirements:**
- Image gallery with lightbox
- Property overview section
- Price breakdown
- Amenities list with icons
- Location with interactive map
- Availability calendar
- Reviews and ratings section
- Similar properties carousel
- Book now button/form
- Contact landlord option
- Virtual tour integration (if available)
- Share property button (social/email)

**API Integration:**
```javascript
GET /api/accommodations/{id}
GET /api/accommodations/{id}/reviews
GET /api/accommodations/{id}/availability
```

#### 3. Map View

**Requirements:**
- Interactive map with property pins
- Clustering for multiple properties
- Filter controls
- Property quick view on pin click
- Current location detection
- Search by address or landmark
- Drawing tools for custom area search

**API Integration:**
```javascript
GET /api/accommodations?location_lat=40.7128&location_lng=-74.0060&radius=5
```

#### 4. Favorites/Saved Accommodations

**Requirements:**
- List of saved properties
- Quick compare view
- Remove from favorites option
- Notes/tags for saved properties
- Availability alerts opt-in

**API Integration:**
```javascript
GET /api/accommodations/favorites
POST /api/accommodations/{id}/favorite
DELETE /api/accommodations/{id}/favorite
```

## Booking Management

### Screens

#### 1. Booking Form

![Booking Form](https://via.placeholder.com/800x600.png?text=Booking+Form)

**Requirements:**
- Date range picker (check-in/check-out)
- Guest count selection
- Special requests text area
- Price breakdown with:
  - Base rate
  - Cleaning fee
  - Service fee
  - Taxes
  - Total amount
- Terms and conditions checkbox
- Payment method selection
- Promo code field
- Booking summary sidebar

**API Integration:**
```javascript
POST /api/bookings
{
  "accommodation": "accommodation_id",
  "start_date": "2025-06-01T00:00:00.000Z",
  "end_date": "2025-06-07T00:00:00.000Z",
  "payment_method": "card",
  "total_amount": 500,
  "guests": 2,
  "special_requests": "Late check-in preferred"
}
```

#### 2. Booking Confirmation

**Requirements:**
- Success animation/illustration
- Booking reference number
- Booking details summary
- Add to calendar button
- Share itinerary option
- Contact host button
- Return to dashboard link

#### 3. My Bookings Screen

![My Bookings](https://via.placeholder.com/800x600.png?text=My+Bookings)

**Requirements:**
- Tabs for:
  - Upcoming bookings
  - Past bookings
  - Cancelled bookings
- Booking cards with:
  - Property image and name
  - Dates
  - Status indicator
  - Price paid
  - Action buttons (cancel, modify, review)
- Filters for date range, property type
- Detailed view expansion

**API Integration:**
```javascript
GET /api/bookings/my-bookings
GET /api/bookings/{id}
PUT /api/bookings/{id}/cancel
```

## Food Service Module

### Screens

#### 1. Food Provider Listing

![Food Provider Listing](https://via.placeholder.com/800x600.png?text=Food+Provider+Listing)

**Requirements:**
- Restaurant/food provider cards with:
  - Featured image
  - Name and cuisine type
  - Rating
  - Distance/delivery time
  - Operating hours
  - Price range indicator
  - Promotion badges
- Filters for:
  - Cuisine type
  - Distance
  - Rating
  - Price range
  - Offering promotions
- Sorting options
- Search by restaurant name or dish
- Quick view of popular items
- Recommended based on past orders

**API Integration:**
```javascript
GET /api/food-providers
GET /api/food-providers?cuisine=italian&rating_min=4
```

#### 2. Restaurant/Menu Detail

![Restaurant Detail](https://via.placeholder.com/800x600.png?text=Restaurant+Detail)

**Requirements:**
- Restaurant info header with:
  - Cover image
  - Logo
  - Name and rating
  - Location and hours
  - Contact info
- Menu categorization
- Menu item cards with:
  - Item image
  - Name and description
  - Price
  - Customization options
  - Add to cart button
  - Quantity selector
- Sticky shopping cart preview
- Reviews and ratings section
- Dietary preference filters (veg, vegan, etc.)

**API Integration:**
```javascript
GET /api/food-providers/{id}
GET /api/menu-items?foodProvider={id}
```

#### 3. Shopping Cart & Checkout

![Food Checkout](https://via.placeholder.com/800x600.png?text=Food+Checkout)

**Requirements:**
- Cart items list with:
  - Item name and image
  - Quantity controls
  - Price
  - Customization options
  - Remove button
- Subtotal calculation
- Delivery fee
- Service fee and taxes
- Delivery address selection/input
- Delivery time selection
  - ASAP option
  - Scheduled option with time picker
- Payment method selection
- Special instructions field
- Promo code application
- Order summary

**API Integration:**
```javascript
POST /api/orders
{
  "food_provider": "provider_id",
  "total_amount": 42.48,
  "items": [{
    "menu_item": "item_id",
    "quantity": 2,
    "special_instructions": "Extra spicy"
  }],
  "delivery_location": {
    "coordinates": {
      "latitude": 12.9716,
      "longitude": 77.5946
    },
    "address": "123 University Ave, Room 123",
    "landmark": "Near Library"
  },
  "delivery_instructions": "Call when you arrive"
}
```

#### 4. Order Tracking

**Requirements:**
- Order status indicators:
  - Confirmed
  - Preparing
  - Out for delivery
  - Delivered
- Estimated delivery time
- Delivery person details (when assigned)
- Interactive map with delivery tracking
- Restaurant and order details
- Support chat/call options
- Rating prompt on delivery

**API Integration:**
```javascript
GET /api/orders/{id}/track
```

#### 5. My Orders Screen

**Requirements:**
- Tabs for:
  - Active orders
  - Past orders
- Order cards with:
  - Restaurant name and image
  - Order number
  - Date and time
  - Status indicator
  - Total price
  - Reorder button
- Order details expansion
- Rating and review submission
- Filter orders by date range
- Search by restaurant or item

**API Integration:**
```javascript
GET /api/orders/my-orders
```

## User Profile & Settings

### Screens

#### 1. Profile Overview

![Profile Screen](https://via.placeholder.com/800x600.png?text=Profile+Screen)

**Requirements:**
- Profile photo with upload option
- Personal information section
- Academic information section
- Contact information section
- Password and security section
- Preferences section
- Save changes button

**API Integration:**
```javascript
GET /api/users/profile
PUT /api/users/profile
```

#### 2. Account Settings

**Requirements:**
- Email preferences
  - Marketing emails
  - Booking notifications
  - Order notifications
- Privacy settings
- Linked accounts (social)
- Application preferences
- Language selection
- Deactivate account option

**API Integration:**
```javascript
GET /api/users/settings
PUT /api/users/settings
```

#### 3. Payment Methods

**Requirements:**
- Saved payment methods list
- Add new payment method form
- Set default payment method
- Remove payment method option
- Payment history with filters

**API Integration:**
```javascript
GET /api/users/payment-methods
POST /api/users/payment-methods
```

## Notifications System

### Components

#### 1. Notification Center

**Requirements:**
- Real-time notifications
- Notification categories:
  - Booking related
  - Order related
  - Account related
  - Promotional
- Mark as read functionality
- Clear all option
- Filter by type
- Notification preference settings

**API Integration:**
```javascript
GET /api/notifications
PUT /api/notifications/{id}/read
```

#### 2. Notification Modals

**Requirements:**
- Important notification pop-ups
- Action buttons within notifications
- Dismissible design
- Don't show again option

#### 3. Push Notifications

**Requirements:**
- Browser push notification integration
- Mobile push notification support
- Quiet hours setting
- Notification grouping

## Chat & Support

### Screens

#### 1. Chat Interface

![Chat Interface](https://via.placeholder.com/800x600.png?text=Chat+Interface)

**Requirements:**
- Conversation list
- Individual chat threads with:
  - Landlords
  - Food delivery providers
  - Customer support
- Message input with attachments
- Read receipts
- Typing indicators
- Chat search function
- Media sharing capabilities

**API Integration:**
```javascript
GET /api/chats
GET /api/chats/{id}/messages
POST /api/chats/{id}/messages
```

#### 2. Support Portal

**Requirements:**
- FAQ section with search
- Support ticket creation form
- Ticket tracking
- Live chat option with support
- Knowledge base articles
- Video tutorials

**API Integration:**
```javascript
GET /api/support/articles
POST /api/support/tickets
```

## Integration Requirements

### 1. Mapping & Location

- Google Maps or Mapbox integration
- Geolocation services
- Address autocomplete
- Distance and ETA calculations
- Campus landmark references

### 2. Payment Processing

- Secure payment gateway integration
- Multiple payment methods:
  - Credit/debit cards
  - Digital wallets
  - Bank transfers
  - Campus card/meal plan integration
- Payment receipt generation
- Refund processing

### 3. Calendar & Scheduling

- Google/Apple Calendar integration
- Booking reminders
- Availability synchronization
- Conflict detection

### 4. Social Integration

- Social sharing capabilities
- Social login options
- Roommate finding integration
- University social groups

## Non-Functional Requirements

### 1. Performance

- Page load time < 3 seconds
- Image optimization strategies
- Lazy loading for content
- API response handling with skeletons
- Bundle size optimization

### 2. Accessibility (WCAG 2.1 AA)

- Semantic HTML
- ARIA attributes
- Keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast
- Focus indicators
- Text resizing support

### 3. Security

- HTTPS implementation
- XSS prevention
- CSRF protection
- Input validation
- Secure authentication flows
- Data encryption
- Privacy policy compliance

### 4. Offline Capability

- Progressive Web App implementation
- Service worker for caching
- Offline content availability
- Background sync for pending actions
- "Add to Home Screen" functionality

### 5. Analytics

- User behavior tracking
- Conversion funnels
- Error tracking
- Performance monitoring
- A/B testing capability

## Appendix: API Reference

### Authentication Endpoints

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh-token
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET /api/auth/profile
```

### Accommodation Endpoints

```
GET /api/accommodations
GET /api/accommodations/{id}
GET /api/accommodations/nearby
GET /api/accommodations/favorites
POST /api/accommodations/{id}/favorite
DELETE /api/accommodations/{id}/favorite
```

### Booking Endpoints

```
POST /api/bookings
GET /api/bookings/my-bookings
GET /api/bookings/{id}
PUT /api/bookings/{id}/cancel
```

### Food Service Endpoints

```
GET /api/food-providers
GET /api/food-providers/{id}
GET /api/menu-items
GET /api/menu-items/{id}
```

### Order Endpoints

```
POST /api/orders
GET /api/orders/my-orders
GET /api/orders/{id}
GET /api/orders/{id}/track
```

### User Profile Endpoints

```
GET /api/users/profile
PUT /api/users/profile
GET /api/users/settings
PUT /api/users/settings
```

### Chat & Support Endpoints

```
GET /api/chats
GET /api/chats/{id}/messages
POST /api/chats/{id}/messages
GET /api/support/articles
POST /api/support/tickets
```

### Notification Endpoints

```
GET /api/notifications
PUT /api/notifications/{id}/read
PUT /api/notifications/settings
```

---

## Conclusion

This comprehensive specification document outlines all the required screens, components, and functionality for the StayKaru Student Module frontend. Development teams should follow this document closely to ensure consistent implementation of all requirements while maintaining flexibility for design creativity and user experience enhancements.

Regular reviews against this specification should be conducted throughout the development process to ensure alignment with project goals and user needs. Any deviations or enhancements should be documented and approved before implementation.
