# StayKaru Admin Frontend Specification

## 1. Introduction

### 1.1 Purpose
This document provides comprehensive specifications for developing the StayKaru Admin Panel frontend. It details all screens, components, functionalities, and integration points with the backend API.

### 1.2 Project Overview
StayKaru is a student accommodation and food service platform designed for Pakistani students. The admin panel allows platform administrators to manage users, accommodations, food services, bookings, orders, and analyze platform metrics.

### 1.3 Technology Stack
- **Frontend Framework**: React.js with TypeScript
- **UI Library**: Material UI / Ant Design
- **State Management**: Redux / Context API
- **API Communication**: Axios / Fetch API
- **Data Visualization**: Chart.js / Recharts
- **Maps Integration**: Mapbox / Google Maps (for Pakistan-specific locations)

### 1.4 Key Requirements
- **Localization**: Support for English and Urdu languages
- **Currency**: Pakistani Rupee (PKR) for all financial data
- **Maps**: Support for Pakistani locations and addresses
- **Responsive Design**: Works on desktop and tablet devices
- **Real-time Data**: Live data updates from backend API

## 2. Authentication & User Management

### 2.1 Authentication Screen

#### Login Screen
- **URL**: `/admin/login`
- **Components**:
  - StayKaru logo
  - Email input field
  - Password input field with show/hide toggle
  - "Remember me" checkbox
  - Login button
  - "Forgot password" link
- **API Endpoints**:
  - `POST /api/auth/login` - Authentication
  - `POST /api/auth/forgot-password` - Password recovery

#### Account Recovery
- **URL**: `/admin/recover-password`
- **Components**:
  - Email input
  - Security verification
  - New password & confirmation fields
- **API Endpoints**:
  - `POST /api/auth/reset-password` - Reset password

### 2.2 User Management

#### User List
- **URL**: `/admin/users`
- **Components**:
  - Searchable, sortable data table showing:
    - User ID
    - Name
    - Email
    - Phone
    - Role (Student, Landlord, Food Provider)
    - Status (Active/Inactive)
    - Registration date
    - Last login
  - Filters for role, status, date range
  - Pagination controls
  - User detail view button
  - "Export data" button (CSV/Excel/PDF)
- **API Endpoints**:
  - `GET /api/admin/users` - List users with filters and pagination
  - `GET /api/admin/export/users` - Export user data

#### User Detail View
- **URL**: `/admin/users/:userId`
- **Components**:
  - User profile information
  - Activity history
  - Associated bookings/orders
  - Account status toggle
  - Reset password option
  - Delete account button (with confirmation)
- **API Endpoints**:
  - `GET /api/admin/users/:id` - Get user details
  - `PUT /api/admin/users/:id/status` - Update user status
  - `DELETE /api/admin/users/:id` - Delete user account

#### User Statistics
- **URL**: `/admin/users/statistics`
- **Components**:
  - User growth charts (daily/weekly/monthly)
  - Role distribution pie chart
  - Active vs. inactive users
  - Registration source analytics
  - User retention metrics
  - Top active users list
- **API Endpoints**:
  - `GET /api/admin/users/statistics` - Get user statistics
  - `GET /api/admin/analytics/users` - Get user analytics

## 3. Dashboard & Analytics

### 3.1 Main Dashboard
- **URL**: `/admin/dashboard`
- **Components**:
  - Key metrics overview:
    - Total users
    - Active accommodations
    - Pending bookings
    - Total revenue (PKR)
    - New orders today
  - Quick access navigation cards
  - Recent activity feed
  - System status indicators
  - Graph showing platform growth
  - Map of Pakistan showing user distribution
- **API Endpoints**:
  - `GET /api/admin/analytics/dashboard` - Dashboard data

### 3.2 Analytics Hub

#### User Analytics
- **URL**: `/admin/analytics/users`
- **Components**:
  - User acquisition charts
  - Demographics breakdown
  - User behavior metrics
  - Registration trends
  - Geographic distribution (Pakistan map)
  - Device and platform usage
  - Time-series filters (day/week/month/year)
- **API Endpoints**:
  - `GET /api/admin/analytics/users` - User analytics
  - Parameters for time period and filters

#### Revenue Analytics
- **URL**: `/admin/analytics/revenue`
- **Components**:
  - Revenue charts (PKR)
  - Income breakdown by service type
  - Payment method statistics
  - Transaction volume trends
  - Top performing accommodations/food services
  - Revenue forecast
  - Currency displayed in PKR format (₨)
- **API Endpoints**:
  - `GET /api/admin/analytics/revenue` - Revenue analytics
  - `GET /api/admin/financial/overview` - Financial overview

#### Booking & Order Analytics
- **URL**: `/admin/analytics/bookings` and `/admin/analytics/orders`
- **Components**:
  - Booking/order volume charts
  - Completion rates
  - Cancellation analysis
  - Average booking duration
  - Popular accommodation types
  - Seasonal trends
  - Popular food items ordered
- **API Endpoints**:
  - `GET /api/admin/analytics/bookings` - Booking analytics
  - `GET /api/admin/analytics/orders` - Order analytics

## 4. Accommodation Management

### 4.1 Accommodation Listings
- **URL**: `/admin/accommodations`
- **Components**:
  - Data table with:
    - Property ID
    - Title
    - Location (Pakistani cities/areas)
    - Landlord
    - Status (Active/Pending/Rejected)
    - Pricing (PKR)
    - Rating
    - Listed date
  - Filters for status, location, price range
  - Sorting options
  - Approval/rejection actions
  - View detail button
- **API Endpoints**:
  - `GET /api/admin/accommodations` - List accommodations
  - `PUT /api/admin/accommodations/:id/approve` - Approve listing
  - `PUT /api/admin/accommodations/:id/reject` - Reject listing

### 4.2 Accommodation Detail
- **URL**: `/admin/accommodations/:id`
- **Components**:
  - Photo gallery
  - Property details
  - Amenities list
  - Location on Pakistan map
  - Pricing history (PKR)
  - Landlord information
  - Review/rating summary
  - Booking history
  - Status management controls
  - Edit/delete options
- **API Endpoints**:
  - `GET /api/admin/accommodations/:id` - Get accommodation details
  - `PUT /api/admin/accommodations/:id` - Update accommodation
  - `DELETE /api/admin/accommodations/:id` - Delete accommodation

### 4.3 Accommodation Verification
- **URL**: `/admin/accommodations/verification`
- **Components**:
  - Pending verification queue
  - Document viewer
  - Location verification using Pakistan mapping
  - Approval/rejection form
  - Request additional information option
- **API Endpoints**:
  - `GET /api/admin/accommodations/pending` - Get pending verifications
  - `PUT /api/admin/accommodations/:id/verify` - Verify accommodation

## 5. Food Service Management

### 5.1 Food Provider Listings
- **URL**: `/admin/food-providers`
- **Components**:
  - Data table with:
    - Provider ID
    - Business name
    - Location (Pakistani cities/areas)
    - Contact information
    - Status
    - Cuisine types
    - Rating
    - Registration date
  - Filters for status, cuisine type, location
  - View details button
  - Approval/rejection actions
- **API Endpoints**:
  - `GET /api/admin/food-providers` - List food providers
  - `PUT /api/admin/food-services/:id/approve` - Approve provider
  - `PUT /api/admin/food-services/:id/reject` - Reject provider

### 5.2 Food Provider Detail
- **URL**: `/admin/food-providers/:id`
- **Components**:
  - Business information
  - Menu preview
  - Location on Pakistan map
  - Operating hours
  - Documentation status
  - Order history
  - Revenue statistics (PKR)
  - Status management controls
- **API Endpoints**:
  - `GET /api/admin/food-providers/:id` - Get provider details
  - `PUT /api/admin/food-services/:id` - Update provider
  - `DELETE /api/admin/food-services/:id` - Delete provider

### 5.3 Menu Management
- **URL**: `/admin/food-providers/:id/menu`
- **Components**:
  - Menu item list
  - Category management
  - Pricing editor (PKR)
  - Availability toggles
  - Image management
  - Special offer configuration
- **API Endpoints**:
  - `GET /api/admin/food-services/:id/menu` - Get menu
  - `PUT /api/admin/food-services/:id/menu` - Update menu

## 6. Booking Management

### 6.1 Booking List
- **URL**: `/admin/bookings`
- **Components**:
  - Data table with:
    - Booking ID
    - Student name
    - Accommodation
    - Check-in/Check-out dates
    - Status
    - Total amount (PKR)
    - Payment status
    - Booking date
  - Filters for status, date range, payment status
  - View detail button
  - Export data option
- **API Endpoints**:
  - `GET /api/admin/bookings` - List bookings
  - `GET /api/admin/export/bookings` - Export booking data

### 6.2 Booking Detail
- **URL**: `/admin/bookings/:id`
- **Components**:
  - Booking information
  - Student details
  - Accommodation details
  - Pakistani location on map
  - Payment information (PKR)
  - Status history
  - Communication log
  - Status management controls
  - Cancel booking option (with reason)
- **API Endpoints**:
  - `GET /api/admin/bookings/:id` - Get booking details
  - `PUT /api/admin/bookings/:id/cancel` - Cancel booking

### 6.3 Booking Analytics
- **URL**: `/admin/bookings/analytics`
- **Components**:
  - Booking volume trends
  - Location popularity (Pakistani cities)
  - Average stay duration
  - Booking value distribution (PKR)
  - Cancellation rate analysis
  - Seasonal patterns
  - Peak booking periods
- **API Endpoints**:
  - `GET /api/admin/analytics/bookings` - Booking analytics
  - `GET /api/admin/bookings/statistics` - Booking statistics

## 7. Order Management

### 7.1 Order List
- **URL**: `/admin/orders`
- **Components**:
  - Data table with:
    - Order ID
    - Student name
    - Food provider
    - Items summary
    - Total amount (PKR)
    - Status
    - Delivery location (Pakistani address)
    - Order date/time
  - Status filters
  - Date range filters
  - View detail button
  - Export data option
- **API Endpoints**:
  - `GET /api/admin/orders` - List orders
  - `GET /api/admin/export/orders` - Export order data

### 7.2 Order Detail
- **URL**: `/admin/orders/:id`
- **Components**:
  - Order information
  - Student details
  - Food provider details
  - Itemized order list
  - Pricing breakdown (PKR)
  - Delivery information
  - Pakistani location on map
  - Status timeline
  - Status management controls
- **API Endpoints**:
  - `GET /api/admin/orders/:id` - Get order details
  - `PUT /api/admin/orders/:id/status` - Update order status

### 7.3 Order Analytics
- **URL**: `/admin/orders/analytics`
- **Components**:
  - Order volume trends
  - Popular items/categories
  - Average order value (PKR)
  - Peak ordering times
  - Delivery location heat map (Pakistani cities)
  - Food provider performance
- **API Endpoints**:
  - `GET /api/admin/analytics/orders` - Order analytics
  - `GET /api/admin/orders/statistics` - Order statistics

## 8. Content Moderation

### 8.1 Review Management
- **URL**: `/admin/content/reviews`
- **Components**:
  - Review list with:
    - Reviewer
    - Entity reviewed
    - Rating
    - Content
    - Date
    - Status
  - Filter by rating, status, entity type
  - Content moderation actions
  - Flagged content indicators
- **API Endpoints**:
  - `GET /api/admin/content/reviews` - List reviews
  - `PUT /api/admin/content/reviews/:id` - Update review status

### 8.2 Reported Content
- **URL**: `/admin/content/reported`
- **Components**:
  - Reported content queue
  - Report reason
  - Content preview
  - Reporter information
  - Action buttons (approve/remove/flag)
  - Add internal note option
- **API Endpoints**:
  - `GET /api/admin/content/reported` - Get reported content
  - `PUT /api/admin/content/moderation/:id` - Moderate content

### 8.3 Moderation Settings
- **URL**: `/admin/content/settings`
- **Components**:
  - Automated moderation rules
  - Keyword blacklist
  - Content guidelines editor
  - Moderation team assignment
  - Notification settings
- **API Endpoints**:
  - `GET /api/admin/content/moderation-settings` - Get settings
  - `PUT /api/admin/content/moderation-settings` - Update settings

## 9. Financial Management

### 9.1 Financial Overview
- **URL**: `/admin/financial/overview`
- **Components**:
  - Revenue summary (PKR)
  - Transaction volume
  - Payment method breakdown
  - Revenue by service category
  - Outstanding payments
  - Refund summary
  - Financial health indicators
- **API Endpoints**:
  - `GET /api/admin/financial/overview` - Financial overview

### 9.2 Transaction List
- **URL**: `/admin/financial/transactions`
- **Components**:
  - Transaction data table:
    - Transaction ID
    - User
    - Type (booking/order/refund)
    - Amount (PKR)
    - Payment method
    - Status
    - Date/time
  - Filters for transaction type, status, date range
  - View details button
  - Export data option
- **API Endpoints**:
  - `GET /api/admin/financial/transactions` - List transactions
  - `GET /api/admin/export/transactions` - Export transaction data

### 9.3 Payout Management
- **URL**: `/admin/financial/payouts`
- **Components**:
  - Pending payouts list
  - Payout history
  - Provider bank details (Pakistani banks)
  - Payout approval workflow
  - Payout scheduling
  - Batch payout options
- **API Endpoints**:
  - `GET /api/admin/financial/payouts` - List payouts
  - `PUT /api/admin/financial/payouts/:id/process` - Process payout

### 9.4 Financial Reports
- **URL**: `/admin/financial/reports`
- **Components**:
  - Report generator
  - Revenue reports (PKR)
  - Tax reports
  - Commission reports
  - Refund reports
  - Custom date range selection
  - Export options (CSV, Excel, PDF)
- **API Endpoints**:
  - `GET /api/admin/financial/reports` - Generate reports
  - Parameters for report type, date range, format

## 10. System Management

### 10.1 System Health
- **URL**: `/admin/system/health`
- **Components**:
  - Server status indicators
  - API performance metrics
  - Database health
  - Memory/CPU usage
  - Error rate monitoring
  - Active user count
  - System uptime statistics
- **API Endpoints**:
  - `GET /api/admin/system/health` - System health
  - `GET /api/admin/system/stats` - System statistics

### 10.2 Application Logs
- **URL**: `/admin/system/logs`
- **Components**:
  - Log viewer with:
    - Timestamp
    - Level (error, warn, info)
    - Source
    - Message
    - User (if applicable)
  - Log level filters
  - Date range selection
  - Search functionality
  - Export logs option
- **API Endpoints**:
  - `GET /api/admin/system/logs` - View logs
  - Parameters for log level, date range, search terms

### 10.3 System Configuration
- **URL**: `/admin/system/config`
- **Components**:
  - Platform settings
  - Feature toggles
  - Commission rate configuration (PKR/%)
  - Notification settings
  - Integration configuration
  - Maintenance mode toggle
- **API Endpoints**:
  - `GET /api/admin/config/platform` - Get platform config
  - `PUT /api/admin/config/platform` - Update platform config

### 10.4 Backup Management
- **URL**: `/admin/system/backups`
- **Components**:
  - Backup history
  - Manual backup trigger
  - Backup schedule configuration
  - Restore function
  - Download backup option
- **API Endpoints**:
  - `GET /api/admin/system/backups` - List backups
  - `POST /api/admin/system/backup` - Create backup
  - `POST /api/admin/system/restore` - Restore from backup

## 11. Notification Management

### 11.1 Notification Center
- **URL**: `/admin/notifications`
- **Components**:
  - Notification list
  - Read/unread status
  - Notification categories
  - Mark as read/unread actions
  - Delete notifications option
- **API Endpoints**:
  - `GET /api/admin/notifications` - List notifications
  - `PUT /api/admin/notifications/:id/read` - Mark as read

### 11.2 Announcement Management
- **URL**: `/admin/notifications/announcements`
- **Components**:
  - Create announcement form
  - Target audience selection
  - Scheduling options
  - Preview functionality
  - Announcement history
  - Performance metrics
- **API Endpoints**:
  - `POST /api/admin/notifications/broadcast` - Send broadcast
  - `POST /api/admin/notifications/targeted` - Send targeted messages
  - `GET /api/admin/notifications/announcements` - List announcements

## 12. Non-Functional Requirements

### 12.1 Real-time Data Requirements
- All dashboard metrics should update automatically every 60 seconds
- New notifications should appear without page refresh
- Critical alerts should display immediately
- User status changes should reflect in real-time
- Order/booking status changes should update in real-time

### 12.2 Performance Requirements
- Page load time under 2 seconds
- Dashboard rendering under 3 seconds with full data
- Table sorting/filtering response under 500ms
- Export operations should complete within 30 seconds
- Maps should render Pakistan locations within 2 seconds

### 12.3 Security Requirements
- Role-based access control for all features
- Session timeout after 30 minutes of inactivity
- Two-factor authentication option for admin users
- Audit logging for all critical operations
- Input validation for all forms
- CSRF protection for all requests

### 12.4 Usability Requirements
- Responsive design for desktop and tablet devices
- Consistent Pakistani Rupee (PKR) formatting using "₨" symbol
- Date formatting in Pakistani standard (DD/MM/YYYY)
- Support for both English and Urdu interfaces
- Keyboard shortcuts for common operations
- Clear confirmation dialogs for destructive actions
- Tooltips for complex functions

### 12.5 Error Handling
- User-friendly error messages
- Automatic retry for API failures
- Offline mode capabilities where appropriate
- Data recovery options for form submissions
- Detailed error logging for troubleshooting

## 13. Integration Requirements

### 13.1 Maps Integration
- **Technology**: Google Maps/Mapbox with Pakistan focus
- **Features**:
  - Display properties on Pakistan map
  - Show city/area boundaries for Pakistani locations
  - Support for Pakistan postal codes and addresses
  - Heat maps for user/booking distribution across Pakistan
  - Location search with Pakistani place names
  - Distance calculations in kilometers

### 13.2 Payment Gateway Integration
- Support for Pakistani payment methods:
  - Bank transfers (Pakistani banks)
  - EasyPaisa
  - JazzCash
  - Credit/Debit cards
- Transaction reporting in PKR
- Refund processing
- Payment status tracking

### 13.3 Notification Services
- Email notification templates
- SMS integration with Pakistani providers
- In-app notification system
- Push notification capability
- Scheduled announcement system

## 14. Implementation Guidelines

### 14.1 Development Approach
- Component-based architecture
- Reusable UI components
- State management using Redux/Context
- API service layer abstraction
- Error boundary implementation
- Progressive loading for large data sets

### 14.2 API Integration
- RESTful API communication
- JWT authentication token handling
- Axios interceptors for common headers
- Error handling middleware
- Request/response logging
- Caching strategy for frequent data

### 14.3 Testing Strategy
- Unit tests for components and utilities
- Integration tests for complex workflows
- End-to-end testing for critical paths
- Performance testing for data-heavy screens
- Accessibility testing for core functions

## 15. Deployment and Maintenance

### 15.1 Build Process
- Environment-specific configuration
- Asset optimization for Pakistani network conditions
- Code splitting and lazy loading
- Bundle size optimization
- Version tagging

### 15.2 Monitoring
- Performance monitoring
- Error tracking
- User behavior analytics
- API usage statistics
- Real-time alerts for critical issues

## Appendix A: API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh-token` - Refresh authentication token
- `POST /api/auth/forgot-password` - Password recovery
- `POST /api/auth/reset-password` - Reset password

### User Management
- `GET /api/admin/users` - List users
- `GET /api/admin/users/:id` - Get user details
- `PUT /api/admin/users/:id/status` - Update user status
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/users/statistics` - User statistics
- `GET /api/admin/users/activity-report` - User activity report

### Analytics
- `GET /api/admin/analytics/dashboard` - Dashboard analytics
- `GET /api/admin/analytics/users` - User analytics
- `GET /api/admin/analytics/revenue` - Revenue analytics
- `GET /api/admin/analytics/bookings` - Booking analytics
- `GET /api/admin/analytics/orders` - Order analytics
- `GET /api/admin/analytics/performance` - Performance metrics

### Accommodation Management
- `GET /api/admin/accommodations` - List accommodations
- `GET /api/admin/accommodations/:id` - Get accommodation details
- `PUT /api/admin/accommodations/:id/approve` - Approve accommodation
- `PUT /api/admin/accommodations/:id/reject` - Reject accommodation
- `DELETE /api/admin/accommodations/:id` - Delete accommodation
- `GET /api/admin/accommodations/statistics` - Accommodation statistics
- `GET /api/admin/accommodations/pending` - Get pending verifications

### Food Service Management
- `GET /api/admin/food-providers` - List food providers
- `GET /api/admin/food-services` - List food services
- `GET /api/admin/food-providers/:id` - Get provider details
- `PUT /api/admin/food-services/:id/approve` - Approve food service
- `PUT /api/admin/food-services/:id/reject` - Reject food service
- `DELETE /api/admin/food-services/:id` - Delete food service
- `GET /api/admin/food-providers/statistics` - Food provider statistics
- `GET /api/admin/food-providers/analytics` - Food provider analytics
- `GET /api/admin/food-services/:id/menu` - Get menu
- `PUT /api/admin/food-services/:id/menu` - Update menu

### Booking Management
- `GET /api/admin/bookings` - List bookings
- `GET /api/admin/bookings/:id` - Get booking details
- `PUT /api/admin/bookings/:id/cancel` - Cancel booking
- `GET /api/admin/bookings/statistics` - Booking statistics
- `GET /api/admin/bookings/analytics` - Booking analytics

### Order Management
- `GET /api/admin/orders` - List orders
- `GET /api/admin/orders/:id` - Get order details
- `PUT /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/orders/statistics` - Order statistics
- `GET /api/admin/orders/analytics` - Order analytics

### Content Moderation
- `GET /api/admin/content/reviews` - List reviews
- `PUT /api/admin/content/reviews/:id` - Update review status
- `GET /api/admin/content/reported` - Get reported content
- `PUT /api/admin/content/moderation/:id` - Moderate content
- `GET /api/admin/content/moderation-stats` - Moderation statistics
- `GET /api/admin/content/reports` - Get content reports
- `GET /api/admin/content/review-queue` - Get review queue
- `GET /api/admin/content/statistics` - Get moderation statistics

### Financial Management
- `GET /api/admin/financial/overview` - Financial overview
- `GET /api/admin/financial/transactions` - List transactions
- `GET /api/admin/financial/payouts` - List payouts
- `PUT /api/admin/financial/payouts/:id/process` - Process payout
- `GET /api/admin/financial/reports` - Generate reports
- `GET /api/admin/transactions` - All transactions
- `GET /api/admin/payments/statistics` - Payment statistics
- `GET /api/admin/commissions` - Commission reports

### System Management
- `GET /api/admin/system/health` - System health
- `GET /api/admin/system/logs` - View logs
- `GET /api/admin/system/stats` - System statistics
- `GET /api/admin/system/performance` - Performance metrics
- `GET /api/admin/config/platform` - Get platform config
- `PUT /api/admin/config/platform` - Update platform config
- `GET /api/admin/system/backups` - List backups
- `POST /api/admin/system/backup` - Create backup
- `POST /api/admin/system/restore` - Restore from backup

### Data Export
- `GET /api/admin/export/users` - Export users
- `GET /api/admin/export/accommodations` - Export accommodations
- `GET /api/admin/export/bookings` - Export bookings
- `GET /api/admin/export/orders` - Export orders
- `GET /api/admin/export/transactions` - Export transactions

### Notification Management
- `GET /api/admin/notifications` - List notifications
- `PUT /api/admin/notifications/:id/read` - Mark as read
- `POST /api/admin/notifications/broadcast` - Send broadcast
- `POST /api/admin/notifications/targeted` - Send targeted messages
- `GET /api/admin/notifications/announcements` - List announcements

## Appendix B: Mock Designs

For implementation, refer to the design assets and wireframes provided separately. All designs should reflect Pakistani cultural context, use PKR as currency, and feature maps focused on Pakistani geography.

---

*Note: This specification is a living document and may be updated as requirements evolve. All features should be implemented with Pakistan-specific considerations in mind, including currency (PKR), locations, language support, and appropriate mapping services for Pakistani cities and regions.*
