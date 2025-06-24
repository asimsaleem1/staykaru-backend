# StayKaru Food Provider Frontend Specification

## 1. Introduction

### 1.1 Purpose
This document provides comprehensive specifications for developing the StayKaru Food Provider frontend. It details all screens, components, functionalities, and integration points with the backend API.

### 1.2 Project Overview
StayKaru is a student accommodation and food service platform designed for Pakistani students. The food provider panel allows restaurant and food service owners to manage their businesses, menus, orders, and analyze performance metrics.

### 1.3 Technology Stack
- **Frontend Framework**: React.js with TypeScript
- **UI Library**: Material UI / Ant Design
- **State Management**: Redux / Context API
- **API Communication**: Axios / Fetch API
- **Data Visualization**: Chart.js / Recharts
- **Maps Integration**: Mapbox / Google Maps (for Pakistan-specific locations)
- **Real-time Updates**: Socket.IO

### 1.4 Key Requirements
- **Localization**: Support for English and Urdu languages
- **Currency**: Pakistani Rupee (PKR) for all financial data
- **Maps**: Support for Pakistani locations and addresses
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Data**: Live updates for orders and notifications from backend API

## 2. Authentication & Profile Management

### 2.1 Authentication Screens

#### Login Screen
- **URL**: `/food-provider/login`
- **Components**:
  - StayKaru logo
  - Email input field
  - Password input field with show/hide toggle
  - "Remember me" checkbox
  - Login button
  - "Forgot password" link
  - "Register as Food Provider" link
- **API Endpoints**:
  - `POST /api/auth/login` - Authentication
  - `POST /api/auth/forgot-password` - Password recovery
- **Real-time Requirements**:
  - Store JWT token securely
  - Implement token refresh mechanism
  - Handle session timeout gracefully

#### Registration Screen
- **URL**: `/food-provider/register`
- **Components**:
  - Multi-step registration form:
    1. Basic Info (name, email, password, phone)
    2. Business Details (business name, type, cuisine)
    3. Location & Hours (Pakistani address, operating hours)
    4. Document Upload (business registration, health certifications)
    5. Review & Submit
  - Progress indicator
  - Form validation
  - Terms & conditions acceptance
- **API Endpoints**:
  - `POST /api/auth/register` - User registration with role="food_provider"
  - `POST /api/food-providers` - Create food provider profile
- **Real-time Requirements**:
  - Real-time form validation
  - Upload progress indicators
  - Immediate feedback on submission

### 2.2 Profile Management

#### Profile Overview
- **URL**: `/food-provider/profile`
- **Components**:
  - Profile information display
  - Business details section
  - Contact information
  - Profile photo upload/edit
  - Business logo upload/edit
  - Change password option
  - Account settings
- **API Endpoints**:
  - `GET /api/auth/profile` - Get profile information
  - `PUT /api/auth/profile` - Update profile information
  - `PUT /api/auth/change-password` - Change password
  - `PUT /api/food-providers/:id` - Update provider details
- **Real-time Requirements**:
  - Immediate feedback on updates
  - Real-time validation of changes
  - Upload progress indicators

#### Business Information
- **URL**: `/food-provider/profile/business`
- **Components**:
  - Business name and type
  - Cuisine categories
  - Business description
  - Operating hours editor
  - Business photos gallery
  - Contact information
  - Social media links
  - Business status toggle (open/closed)
- **API Endpoints**:
  - `GET /api/food-providers/owner/my-providers` - Get provider details
  - `PUT /api/food-providers/:id` - Update business information
  - `POST /api/file-upload` - Upload business photos
- **Real-time Requirements**:
  - Immediate reflection of business status changes
  - Real-time validation of business hours
  - Upload progress for photos

#### Location Management
- **URL**: `/food-provider/profile/location`
- **Components**:
  - Address input fields (Pakistani format)
  - Map with location picker (Pakistan-focused)
  - Delivery radius selector
  - Landmark information
  - Delivery zones setup
  - Service area visualization
- **API Endpoints**:
  - `GET /api/food-providers/:id/location` - Get location information
  - `PUT /api/food-providers/:id/location` - Update location information
  - `GET /api/location/validate` - Validate Pakistani address
- **Real-time Requirements**:
  - Real-time address validation
  - Interactive map with immediate feedback
  - Geocoding and reverse geocoding

## 3. Dashboard & Analytics

### 3.1 Main Dashboard
- **URL**: `/food-provider/dashboard`
- **Components**:
  - Key performance indicators (KPIs):
    - Total orders today
    - Revenue today (PKR)
    - Average rating
    - Active orders
    - Total menu items
  - Recent orders feed
  - Revenue chart (daily/weekly/monthly)
  - Top selling items
  - Customer satisfaction score
  - Quick action buttons
  - Business status toggle
- **API Endpoints**:
  - `GET /api/food-providers/owner/dashboard` - Dashboard data
  - `PUT /api/food-providers/:id/status` - Update business status
- **Real-time Requirements**:
  - Auto-refresh KPIs every 60 seconds
  - Real-time updates for new orders
  - Live order count updates
  - Immediate status change reflection

### 3.2 Analytics

#### Order Analytics
- **URL**: `/food-provider/analytics/orders`
- **Components**:
  - Order volume charts
  - Time-based trends
  - Peak hour visualization
  - Order source breakdown
  - Average preparation time
  - Completion rate
  - Cancellation reasons
  - Date range selector
- **API Endpoints**:
  - `GET /api/food-providers/owner/analytics` - Get analytics data
  - Parameters for time period and specific metrics
- **Real-time Requirements**:
  - Update analytics when parameter changes
  - Export data feature
  - Filter by date ranges

#### Revenue Analytics
- **URL**: `/food-provider/analytics/revenue`
- **Components**:
  - Revenue charts (PKR)
  - Daily/weekly/monthly/yearly views
  - Average order value
  - Item-wise revenue breakdown
  - Peak revenue periods
  - Revenue forecasting
  - Payment method distribution
  - Comparison with previous periods
- **API Endpoints**:
  - `GET /api/food-providers/owner/analytics/revenue` - Revenue analytics
  - Parameters for time period and specific metrics
- **Real-time Requirements**:
  - Currency formatting in PKR
  - Dynamic chart updates based on filters
  - Downloadable reports

#### Customer Analytics
- **URL**: `/food-provider/analytics/customers`
- **Components**:
  - Customer demographics
  - Order frequency
  - Repeat customer rate
  - Average spend per customer (PKR)
  - Customer satisfaction trends
  - Feedback analysis
  - Customer retention rate
  - Top customers list
- **API Endpoints**:
  - `GET /api/food-providers/owner/analytics/customers` - Customer analytics
- **Real-time Requirements**:
  - Anonymized customer data
  - Filter by date ranges
  - Exportable reports

## 4. Menu Management

### 4.1 Menu Overview
- **URL**: `/food-provider/menu`
- **Components**:
  - Menu categories list
  - Items per category
  - Search and filter options
  - Bulk actions (enable/disable items)
  - Quick edit capabilities
  - Menu status indicator
  - "Add new item" button
  - "Add new category" button
- **API Endpoints**:
  - `GET /api/food-providers/:id/menu` - Get complete menu
  - `PUT /api/food-providers/:id/menu/status` - Update menu status
- **Real-time Requirements**:
  - Immediate reflection of item availability
  - Real-time search and filtering
  - Drag-and-drop reordering

### 4.2 Category Management
- **URL**: `/food-provider/menu/categories`
- **Components**:
  - Category list
  - Category creation form
  - Edit functionality
  - Category reordering
  - Category visibility toggle
  - Item count per category
- **API Endpoints**:
  - `GET /api/food-providers/:id/menu/categories` - Get categories
  - `POST /api/food-providers/:id/menu/categories` - Create category
  - `PUT /api/food-providers/:id/menu/categories/:categoryId` - Update category
  - `DELETE /api/food-providers/:id/menu/categories/:categoryId` - Delete category
- **Real-time Requirements**:
  - Immediate updates to category order
  - Real-time validation

### 4.3 Item Management
- **URL**: `/food-provider/menu/items`
- **Components**:
  - Item list with details (name, price in PKR, availability)
  - New item form with:
    - Name and description
    - Price in PKR
    - Category selection
    - Customization options
    - Photo upload
    - Dietary information
    - Availability toggle
    - Preparation time
  - Bulk edit capabilities
  - Search and filter
- **API Endpoints**:
  - `GET /api/food-providers/:id/menu/items` - Get menu items
  - `POST /api/food-providers/:id/menu/items` - Create menu item
  - `PUT /api/food-providers/:id/menu/items/:itemId` - Update item
  - `DELETE /api/food-providers/:id/menu/items/:itemId` - Delete item
  - `POST /api/file-upload` - Upload item photos
- **Real-time Requirements**:
  - Real-time price calculation
  - Image upload progress
  - Immediate availability status updates

### 4.4 Special Offers & Combos
- **URL**: `/food-provider/menu/offers`
- **Components**:
  - Current offers list
  - Offer creation form
  - Discount configuration (percentage/fixed amount in PKR)
  - Validity period selection
  - Combo meal builder
  - Offer visibility settings
  - "Apply to" selections (items/categories)
- **API Endpoints**:
  - `GET /api/food-providers/:id/offers` - Get offers
  - `POST /api/food-providers/:id/offers` - Create offer
  - `PUT /api/food-providers/:id/offers/:offerId` - Update offer
  - `DELETE /api/food-providers/:id/offers/:offerId` - Delete offer
- **Real-time Requirements**:
  - Countdown timers for expiring offers
  - Real-time price calculations with discounts
  - Schedule activation/deactivation

## 5. Order Management

### 5.1 Active Orders
- **URL**: `/food-provider/orders/active`
- **Components**:
  - Real-time order feed
  - New order notifications
  - Order details panel:
    - Customer information
    - Order items
    - Special instructions
    - Payment status
    - Delivery address (Pakistan map)
    - Preparation time countdown
  - Order status workflow buttons:
    - Accept/Reject
    - Preparing
    - Ready for pickup/delivery
    - Completed
    - Cancelled
  - Order sorting and filtering
- **API Endpoints**:
  - `GET /api/orders/provider-orders` - Get orders with status filter
  - `PUT /api/orders/:id/status` - Update order status
- **Real-time Requirements**:
  - Immediate new order alerts
  - Real-time status updates
  - Sound notifications for new orders
  - Auto-refresh every 15 seconds
  - Socket.IO integration for live updates

### 5.2 Order History
- **URL**: `/food-provider/orders/history`
- **Components**:
  - Completed orders table
  - Detailed search and filter options:
    - Date range
    - Order status
    - Customer
    - Payment method
    - Order value range (PKR)
  - Order details view
  - Reorder functionality
  - Export options
  - Analytics summary
- **API Endpoints**:
  - `GET /api/orders/provider-orders/history` - Get order history
  - Parameters for filtering and pagination
- **Real-time Requirements**:
  - Pagination with lazy loading
  - Filter-based search
  - Exportable data (CSV/Excel)

### 5.3 Order Details
- **URL**: `/food-provider/orders/:orderId`
- **Components**:
  - Complete order information
  - Customer details
  - Itemized order list
  - Price breakdown (PKR)
  - Payment information
  - Delivery information with map (Pakistani address)
  - Status history timeline
  - Communication log
  - Issue reporting
  - Refund processing (if applicable)
- **API Endpoints**:
  - `GET /api/orders/:id` - Get order details
  - `PUT /api/orders/:id/refund` - Process refund
  - `POST /api/orders/:id/issue` - Report issue
- **Real-time Requirements**:
  - Live status updates
  - Real-time communication with customer
  - Map tracking for delivery

## 6. Inventory Management

### 6.1 Inventory Overview
- **URL**: `/food-provider/inventory`
- **Components**:
  - Inventory item list
  - Stock levels
  - Low stock alerts
  - Category filters
  - Quick update options
  - Usage trends
- **API Endpoints**:
  - `GET /api/food-providers/:id/inventory` - Get inventory
  - `PUT /api/food-providers/:id/inventory/:itemId` - Update inventory item
- **Real-time Requirements**:
  - Automatic stock deduction based on orders
  - Low stock alerts in real-time
  - Bulk update capabilities

### 6.2 Inventory Management
- **URL**: `/food-provider/inventory/manage`
- **Components**:
  - Add new inventory item
  - Stock adjustment form
  - Supplier information
  - Cost tracking (PKR)
  - Expiration date tracking
  - Wastage recording
  - Inventory history
- **API Endpoints**:
  - `POST /api/food-providers/:id/inventory` - Add inventory item
  - `PUT /api/food-providers/:id/inventory/:itemId/adjust` - Adjust stock
  - `GET /api/food-providers/:id/inventory/history` - Get inventory history
- **Real-time Requirements**:
  - Barcode/QR code scanning support
  - Real-time cost calculations
  - Automated alerts for expiring items

## 7. Delivery Management

### 7.1 Delivery Zones
- **URL**: `/food-provider/delivery/zones`
- **Components**:
  - Pakistan map with zone editor
  - Delivery radius configuration
  - Zone-specific delivery fees (PKR)
  - Minimum order requirements per zone
  - Estimated delivery times
  - Zone status toggle (active/inactive)
- **API Endpoints**:
  - `GET /api/food-providers/:id/delivery/zones` - Get delivery zones
  - `POST /api/food-providers/:id/delivery/zones` - Create zone
  - `PUT /api/food-providers/:id/delivery/zones/:zoneId` - Update zone
  - `DELETE /api/food-providers/:id/delivery/zones/:zoneId` - Delete zone
- **Real-time Requirements**:
  - Interactive map for zone creation
  - Real-time zone validation
  - Pakistani address recognition

### 7.2 Delivery Personnel
- **URL**: `/food-provider/delivery/personnel`
- **Components**:
  - Delivery staff list
  - Add new delivery person form
  - Status tracking (available, on delivery, offline)
  - Performance metrics
  - Document verification
  - Assignment history
- **API Endpoints**:
  - `GET /api/food-providers/:id/delivery/personnel` - Get delivery personnel
  - `POST /api/food-providers/:id/delivery/personnel` - Add personnel
  - `PUT /api/food-providers/:id/delivery/personnel/:personnelId` - Update personnel
- **Real-time Requirements**:
  - Live status updates
  - Real-time location tracking on Pakistan map
  - Immediate availability updates

### 7.3 Delivery Tracking
- **URL**: `/food-provider/delivery/tracking`
- **Components**:
  - Live delivery map (Pakistan)
  - Active deliveries status
  - Delivery person assignment
  - Estimated arrival times
  - Customer communication channel
  - Delivery issue reporting
- **API Endpoints**:
  - `GET /api/food-providers/:id/delivery/active` - Get active deliveries
  - `PUT /api/orders/:id/delivery/assign` - Assign delivery person
  - `PUT /api/orders/:id/delivery/status` - Update delivery status
- **Real-time Requirements**:
  - Live GPS tracking on Pakistan map
  - Real-time ETA updates
  - Immediate status changes
  - Push notifications for delays

## 8. Reviews & Feedback

### 8.1 Reviews Dashboard
- **URL**: `/food-provider/reviews`
- **Components**:
  - Overall rating display
  - Rating breakdown by category
  - Recent reviews list
  - Review response interface
  - Rating trends chart
  - Filter by rating/date
  - Sort options
- **API Endpoints**:
  - `GET /api/food-providers/:id/reviews` - Get reviews
  - `POST /api/food-providers/:id/reviews/:reviewId/response` - Respond to review
- **Real-time Requirements**:
  - New review notifications
  - Immediate rating updates
  - Real-time response posting

### 8.2 Customer Feedback
- **URL**: `/food-provider/feedback`
- **Components**:
  - Feedback categories
  - Issue types breakdown
  - Resolved vs. unresolved issues
  - Response time metrics
  - Individual feedback details
  - Response interface
- **API Endpoints**:
  - `GET /api/food-providers/:id/feedback` - Get feedback
  - `PUT /api/food-providers/:id/feedback/:feedbackId` - Update feedback status
  - `POST /api/food-providers/:id/feedback/:feedbackId/response` - Respond to feedback
- **Real-time Requirements**:
  - New feedback alerts
  - Response time tracking
  - Issue resolution workflows

## 9. Notification Center

### 9.1 Notifications
- **URL**: `/food-provider/notifications`
- **Components**:
  - Real-time notification feed
  - Notification categories
  - Read/unread filters
  - Mark as read functionality
  - Notification preferences
  - Action buttons within notifications
- **API Endpoints**:
  - `GET /api/notifications` - Get notifications
  - `PUT /api/notifications/:id/read` - Mark notification as read
  - `GET /api/notifications/preferences` - Get notification preferences
  - `PUT /api/notifications/preferences` - Update notification preferences
- **Real-time Requirements**:
  - Push notifications
  - Real-time delivery
  - Sound alerts for critical notifications
  - Notification badges

### 9.2 Announcements
- **URL**: `/food-provider/announcements`
- **Components**:
  - Platform announcements
  - System updates information
  - Promotional opportunities
  - Event notifications
  - Policy updates
- **API Endpoints**:
  - `GET /api/announcements` - Get announcements
  - `PUT /api/announcements/:id/read` - Mark announcement as read
- **Real-time Requirements**:
  - Important announcement highlighting
  - Unread indicators
  - Time-sensitive notification features

## 10. Financial Management

### 10.1 Financial Overview
- **URL**: `/food-provider/finance`
- **Components**:
  - Revenue summary (PKR)
  - Transaction history
  - Upcoming payouts
  - Payment method breakdown
  - Outstanding balances
  - Fee structure information
  - Daily/Weekly/Monthly/Yearly views
- **API Endpoints**:
  - `GET /api/food-providers/:id/finance` - Get financial overview
  - Parameters for time period selection
- **Real-time Requirements**:
  - Real-time revenue calculations
  - Pakistani Rupee (PKR) formatting
  - Live transaction updates

### 10.2 Transactions
- **URL**: `/food-provider/finance/transactions`
- **Components**:
  - Detailed transaction list
  - Transaction filters (type, status, date)
  - Transaction details view
  - Payment processing status
  - Refund management
  - Export functionality
- **API Endpoints**:
  - `GET /api/food-providers/:id/finance/transactions` - Get transactions
  - `GET /api/food-providers/:id/finance/transactions/:transactionId` - Get transaction details
  - `POST /api/food-providers/:id/finance/transactions/:transactionId/refund` - Process refund
- **Real-time Requirements**:
  - Live transaction status updates
  - Real-time refund processing
  - Payment confirmation alerts

### 10.3 Payout Management
- **URL**: `/food-provider/finance/payouts`
- **Components**:
  - Payout schedule
  - Bank account information (Pakistani banks)
  - Payout history
  - Pending payouts
  - Tax information
  - Payout method selection
- **API Endpoints**:
  - `GET /api/food-providers/:id/finance/payouts` - Get payouts
  - `PUT /api/food-providers/:id/finance/payout-method` - Update payout method
  - `GET /api/food-providers/:id/finance/payout-schedule` - Get payout schedule
- **Real-time Requirements**:
  - Payout status tracking
  - Immediate bank verification
  - Real-time balance updates

## 11. System Settings

### 11.1 Account Settings
- **URL**: `/food-provider/settings/account`
- **Components**:
  - Password change
  - Email preferences
  - Two-factor authentication
  - Linked accounts
  - Session management
  - Account deletion option
- **API Endpoints**:
  - `GET /api/auth/settings` - Get account settings
  - `PUT /api/auth/settings` - Update account settings
  - `PUT /api/auth/change-password` - Change password
  - `PUT /api/auth/2fa` - Configure two-factor authentication
- **Real-time Requirements**:
  - Immediate security setting application
  - Session tracking
  - Real-time validation

### 11.2 Business Hours
- **URL**: `/food-provider/settings/hours`
- **Components**:
  - Regular business hours editor
  - Special hours (holidays, events)
  - Temporary closure setting
  - Break time configuration
  - Schedule override options
  - Business hours preview
- **API Endpoints**:
  - `GET /api/food-providers/:id/hours` - Get business hours
  - `PUT /api/food-providers/:id/hours` - Update business hours
  - `POST /api/food-providers/:id/hours/special` - Add special hours
- **Real-time Requirements**:
  - Automatic opening/closing based on hours
  - Special hours countdown
  - Real-time availability updates

### 11.3 Integration Settings
- **URL**: `/food-provider/settings/integrations`
- **Components**:
  - Payment gateway settings (Pakistani payment services)
  - POS integration
  - Social media connections
  - External delivery services
  - API access management
- **API Endpoints**:
  - `GET /api/food-providers/:id/integrations` - Get integrations
  - `PUT /api/food-providers/:id/integrations/:integrationType` - Update integration
- **Real-time Requirements**:
  - Immediate connection testing
  - Integration status monitoring
  - API health checks

## 12. Non-Functional Requirements

### 12.1 Real-time Data Requirements
- All order notifications must appear within 5 seconds of creation
- Dashboard metrics should update automatically every 60 seconds
- Order status changes must reflect immediately
- Inventory levels should update in real-time based on orders
- Customer communication should be instantaneous
- Menu availability changes should apply immediately

### 12.2 Performance Requirements
- Page load time under 2 seconds
- Order processing response under 1 second
- Menu updates should apply within 3 seconds
- Map rendering for Pakistan locations under 2 seconds
- Image upload processing under 5 seconds
- Search results should return in under 500ms

### 12.3 Security Requirements
- Secure authentication with JWT tokens
- Role-based access control
- Data encryption for sensitive information
- Session timeout after 30 minutes of inactivity
- Secure password storage with strong hashing
- Input validation for all forms
- Protection against SQL injection and XSS

### 12.4 Usability Requirements
- Responsive design for mobile, tablet, and desktop
- Consistent PKR (₨) formatting for all monetary values
- Intuitive order management workflow
- Clear status indicators for business, orders, and items
- Quick access to frequently used functions
- Comprehensive search capabilities
- User onboarding tutorials

### 12.5 Error Handling
- Clear error messages for failed operations
- Automatic retry for API failures
- Offline mode capability where appropriate
- Data recovery for form submissions
- Graceful degradation for unavailable features
- Detailed error logging for troubleshooting

## 13. Integration Requirements

### 13.1 Maps Integration
- **Technology**: Google Maps/Mapbox with Pakistan focus
- **Features**:
  - Display business location on Pakistan map
  - Show delivery zones and coverage areas
  - Calculate delivery distances for Pakistani addresses
  - Display delivery tracking in real-time
  - Support for Pakistani postal codes and landmarks
  - Geofencing for delivery areas within Pakistan

### 13.2 Payment Gateway Integration
- Support for Pakistani payment methods:
  - EasyPaisa
  - JazzCash
  - Bank transfers (Pakistani banks)
  - Credit/Debit cards
- Transaction reporting in PKR
- Refund processing
- Payment status tracking

### 13.3 Notification Services
- Push notifications
- Email notifications
- SMS alerts (Pakistani mobile carriers)
- In-app notification system
- Sound alerts for new orders

## Appendix A: API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register with role="food_provider"
- `POST /api/auth/forgot-password` - Password recovery
- `GET /api/auth/profile` - Get profile information
- `PUT /api/auth/profile` - Update profile information
- `PUT /api/auth/change-password` - Change password

### Food Provider Management
- `GET /api/food-providers/owner/my-providers` - Get provider businesses
- `GET /api/food-providers/:id` - Get provider details
- `PUT /api/food-providers/:id` - Update provider details
- `GET /api/food-providers/:id/location` - Get location information
- `PUT /api/food-providers/:id/location` - Update location information
- `PUT /api/food-providers/:id/status` - Update business status

### Menu Management
- `GET /api/food-providers/:id/menu` - Get complete menu
- `PUT /api/food-providers/:id/menu/status` - Update menu status
- `GET /api/food-providers/:id/menu/categories` - Get categories
- `POST /api/food-providers/:id/menu/categories` - Create category
- `PUT /api/food-providers/:id/menu/categories/:categoryId` - Update category
- `DELETE /api/food-providers/:id/menu/categories/:categoryId` - Delete category
- `GET /api/food-providers/:id/menu/items` - Get menu items
- `POST /api/food-providers/:id/menu/items` - Create menu item
- `PUT /api/food-providers/:id/menu/items/:itemId` - Update item
- `DELETE /api/food-providers/:id/menu/items/:itemId` - Delete item
- `GET /api/food-providers/:id/offers` - Get offers
- `POST /api/food-providers/:id/offers` - Create offer
- `PUT /api/food-providers/:id/offers/:offerId` - Update offer
- `DELETE /api/food-providers/:id/offers/:offerId` - Delete offer

### Order Management
- `GET /api/orders/provider-orders` - Get orders with status filter
- `PUT /api/orders/:id/status` - Update order status
- `GET /api/orders/provider-orders/history` - Get order history
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/refund` - Process refund
- `POST /api/orders/:id/issue` - Report issue
- `PUT /api/orders/:id/delivery/assign` - Assign delivery person
- `PUT /api/orders/:id/delivery/status` - Update delivery status

### Inventory Management
- `GET /api/food-providers/:id/inventory` - Get inventory
- `PUT /api/food-providers/:id/inventory/:itemId` - Update inventory item
- `POST /api/food-providers/:id/inventory` - Add inventory item
- `PUT /api/food-providers/:id/inventory/:itemId/adjust` - Adjust stock
- `GET /api/food-providers/:id/inventory/history` - Get inventory history

### Delivery Management
- `GET /api/food-providers/:id/delivery/zones` - Get delivery zones
- `POST /api/food-providers/:id/delivery/zones` - Create zone
- `PUT /api/food-providers/:id/delivery/zones/:zoneId` - Update zone
- `DELETE /api/food-providers/:id/delivery/zones/:zoneId` - Delete zone
- `GET /api/food-providers/:id/delivery/personnel` - Get delivery personnel
- `POST /api/food-providers/:id/delivery/personnel` - Add personnel
- `PUT /api/food-providers/:id/delivery/personnel/:personnelId` - Update personnel
- `GET /api/food-providers/:id/delivery/active` - Get active deliveries

### Reviews & Feedback
- `GET /api/food-providers/:id/reviews` - Get reviews
- `POST /api/food-providers/:id/reviews/:reviewId/response` - Respond to review
- `GET /api/food-providers/:id/feedback` - Get feedback
- `PUT /api/food-providers/:id/feedback/:feedbackId` - Update feedback status
- `POST /api/food-providers/:id/feedback/:feedbackId/response` - Respond to feedback

### Financial Management
- `GET /api/food-providers/:id/finance` - Get financial overview
- `GET /api/food-providers/:id/finance/transactions` - Get transactions
- `GET /api/food-providers/:id/finance/transactions/:transactionId` - Get transaction details
- `POST /api/food-providers/:id/finance/transactions/:transactionId/refund` - Process refund
- `GET /api/food-providers/:id/finance/payouts` - Get payouts
- `PUT /api/food-providers/:id/finance/payout-method` - Update payout method
- `GET /api/food-providers/:id/finance/payout-schedule` - Get payout schedule

### Analytics
- `GET /api/food-providers/owner/dashboard` - Dashboard data
- `GET /api/food-providers/owner/analytics` - Get analytics data
- `GET /api/food-providers/owner/analytics/revenue` - Revenue analytics
- `GET /api/food-providers/owner/analytics/customers` - Customer analytics

### System Settings
- `GET /api/auth/settings` - Get account settings
- `PUT /api/auth/settings` - Update account settings
- `PUT /api/auth/2fa` - Configure two-factor authentication
- `GET /api/food-providers/:id/hours` - Get business hours
- `PUT /api/food-providers/:id/hours` - Update business hours
- `POST /api/food-providers/:id/hours/special` - Add special hours
- `GET /api/food-providers/:id/integrations` - Get integrations
- `PUT /api/food-providers/:id/integrations/:integrationType` - Update integration

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `GET /api/notifications/preferences` - Get notification preferences
- `PUT /api/notifications/preferences` - Update notification preferences
- `GET /api/announcements` - Get announcements
- `PUT /api/announcements/:id/read` - Mark announcement as read

## Appendix B: Mock Designs

For implementation, refer to the design assets and wireframes provided separately. All designs should reflect Pakistani cultural context, use PKR as currency, and feature maps focused on Pakistani geography.

---

*Note: This specification is a living document and may be updated as requirements evolve. All features should be implemented with Pakistan-specific considerations in mind, including currency (PKR), locations, language support, and appropriate mapping services for Pakistani cities and regions.*
