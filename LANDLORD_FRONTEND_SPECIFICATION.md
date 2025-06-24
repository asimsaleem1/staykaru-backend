# StayKaru Landlord Frontend Specification

## 1. Introduction

### 1.1 Purpose
This document provides comprehensive specifications for developing the StayKaru Landlord frontend. It details all screens, components, functionalities, and integration points with the backend API.

### 1.2 Project Overview
StayKaru is a student accommodation and food service platform designed for Pakistani students. The landlord panel allows property owners to list their accommodations, manage bookings, track revenue, and analyze performance metrics.

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
- **Real-time Data**: Live updates for bookings and notifications from backend API

## 2. Authentication & Profile Management

### 2.1 Authentication Screens

#### Login Screen
- **URL**: `/landlord/login`
- **Components**:
  - StayKaru logo
  - Email input field
  - Password input field with show/hide toggle
  - "Remember me" checkbox
  - Login button
  - "Forgot password" link
  - "Register as Landlord" link
- **API Endpoints**:
  - `POST /api/auth/login` - Authentication
  - `POST /api/auth/forgot-password` - Password recovery
- **Real-time Requirements**:
  - Store JWT token securely
  - Implement token refresh mechanism
  - Handle session timeout gracefully

#### Registration Screen
- **URL**: `/landlord/register`
- **Components**:
  - Multi-step registration form:
    1. Basic Info (name, email, password, phone)
    2. Identity Verification (Pakistani CNIC/passport)
    3. Address & Contact Details
    4. Tax Information (Pakistani NTN if applicable)
    5. Terms & Conditions Acceptance
  - Progress indicator
  - Form validation
  - Document upload functionality
- **API Endpoints**:
  - `POST /api/auth/register` - User registration with role="landlord"
  - `POST /api/landlord/verification` - Submit verification documents
- **Real-time Requirements**:
  - Real-time form validation
  - Upload progress indicators
  - Immediate feedback on submission

### 2.2 Profile Management

#### Profile Overview
- **URL**: `/landlord/profile`
- **Components**:
  - Profile information display
  - Personal details section
  - Contact information
  - Profile photo upload/edit
  - Identity document status
  - Change password option
  - Account settings
- **API Endpoints**:
  - `GET /api/auth/profile` - Get profile information
  - `PUT /api/auth/profile` - Update profile information
  - `PUT /api/auth/change-password` - Change password
  - `GET /api/landlord/verification-status` - Check document status
- **Real-time Requirements**:
  - Immediate feedback on updates
  - Real-time validation of changes
  - Upload progress indicators

#### Bank Account Management
- **URL**: `/landlord/profile/payment`
- **Components**:
  - Bank account information (Pakistani banks)
  - Payment method selection
  - Tax information
  - Payout preferences
  - Transaction history
  - Account verification status
- **API Endpoints**:
  - `GET /api/landlord/payment-info` - Get payment information
  - `PUT /api/landlord/payment-info` - Update payment information
  - `GET /api/landlord/transactions` - Get transaction history
- **Real-time Requirements**:
  - Secure bank information handling
  - Real-time validation with Pakistani banks
  - Immediate status updates

## 3. Dashboard & Analytics

### 3.1 Main Dashboard
- **URL**: `/landlord/dashboard`
- **Components**:
  - Key performance indicators (KPIs):
    - Total properties
    - Active bookings
    - Occupancy rate
    - Monthly revenue (PKR)
    - Average rating
  - Recent bookings feed
  - Revenue chart (daily/weekly/monthly)
  - Property status overview
  - Upcoming check-ins/check-outs
  - Quick action buttons
- **API Endpoints**:
  - `GET /api/accommodations/landlord/dashboard` - Dashboard data
- **Real-time Requirements**:
  - Auto-refresh KPIs every 60 seconds
  - Real-time updates for new bookings
  - Live occupancy status updates
  - Immediate notification of new inquiries

### 3.2 Analytics

#### Booking Analytics
- **URL**: `/landlord/analytics/bookings`
- **Components**:
  - Booking volume charts
  - Seasonal trends
  - Average stay duration
  - Booking source breakdown
  - Cancellation rate analysis
  - Occupancy rate over time
  - Date range selector
- **API Endpoints**:
  - `GET /api/users/landlord/statistics` - Get booking statistics
  - Parameters for time period and specific metrics
- **Real-time Requirements**:
  - Update analytics when parameter changes
  - Export data feature
  - Filter by properties and date ranges

#### Revenue Analytics
- **URL**: `/landlord/analytics/revenue`
- **Components**:
  - Revenue charts (PKR)
  - Daily/weekly/monthly/yearly views
  - Property-wise revenue breakdown
  - Revenue per available room
  - Revenue forecasting
  - Payment method distribution
  - Comparison with previous periods
- **API Endpoints**:
  - `GET /api/bookings/landlord/revenue` - Revenue analytics
  - Parameters for time period and property filters
- **Real-time Requirements**:
  - Currency formatting in PKR
  - Dynamic chart updates based on filters
  - Downloadable reports

#### Performance Metrics
- **URL**: `/landlord/analytics/performance`
- **Components**:
  - Property rating trends
  - Review analysis
  - Competitive positioning
  - Pricing optimization suggestions
  - Market demand indicators
  - Performance by property type
  - Geographical performance (Pakistan regions)
- **API Endpoints**:
  - `GET /api/accommodations/landlord/performance` - Performance metrics
- **Real-time Requirements**:
  - Market comparison updates
  - Review sentiment analysis
  - Dynamic recommendation engine

## 4. Property Management

### 4.1 Property Listing
- **URL**: `/landlord/properties`
- **Components**:
  - Property list with key details
  - Property status indicators
  - Quick actions (view, edit, disable)
  - Occupancy status
  - Rating display
  - Revenue snapshot (PKR)
  - Featured property toggle
  - Search and filter options
  - "Add new property" button
- **API Endpoints**:
  - `GET /api/accommodations/landlord` - Get landlord properties
  - `PUT /api/accommodations/:id/status` - Update property status
- **Real-time Requirements**:
  - Real-time availability updates
  - Immediate status changes
  - Live occupancy indicators

### 4.2 Property Creation
- **URL**: `/landlord/properties/create`
- **Components**:
  - Multi-step property creation form:
    1. Basic Information (name, type, capacity)
    2. Location Details (Pakistani address, map placement)
    3. Amenities & Features
    4. Photo Upload & Gallery
    5. Pricing Structure (PKR)
    6. Availability Calendar
    7. Rules & Policies
  - Progress indicator
  - Form validation
  - Preview functionality
  - Save as draft option
- **API Endpoints**:
  - `POST /api/accommodations` - Create property
  - `POST /api/file-upload` - Upload property photos
  - `POST /api/accommodations/:id/amenities` - Add amenities
  - `POST /api/accommodations/:id/availability` - Set availability
- **Real-time Requirements**:
  - Map location validation for Pakistani addresses
  - Real-time form validation
  - Upload progress indicators
  - Immediate feedback on submission

### 4.3 Property Detail & Edit
- **URL**: `/landlord/properties/:id`
- **Components**:
  - Complete property information
  - Photo gallery management
  - Amenity toggles
  - Location on Pakistan map
  - Pricing editor (PKR)
  - Availability calendar
  - Rules & policies editor
  - Instant booking toggle
  - Verification status
- **API Endpoints**:
  - `GET /api/accommodations/:id` - Get property details
  - `PUT /api/accommodations/:id` - Update property details
  - `PUT /api/accommodations/:id/amenities` - Update amenities
  - `PUT /api/accommodations/:id/availability` - Update availability
  - `DELETE /api/accommodations/:id` - Delete property
- **Real-time Requirements**:
  - Real-time updates to availability
  - Immediate photo gallery updates
  - Live pricing calculation
  - Validation for Pakistani address formats

### 4.4 Amenities Management
- **URL**: `/landlord/properties/:id/amenities`
- **Components**:
  - Categorized amenity selection
  - Custom amenity addition
  - Amenity highlight options
  - Photo attachment for key amenities
  - Detailed description fields
  - Amenity availability toggle
- **API Endpoints**:
  - `GET /api/accommodations/:id/amenities` - Get property amenities
  - `PUT /api/accommodations/:id/amenities` - Update amenities
  - `POST /api/accommodations/:id/amenities/custom` - Add custom amenity
- **Real-time Requirements**:
  - Immediate updates to amenity status
  - Real-time validation of custom amenities
  - Quick batch operations

### 4.5 Pricing Management
- **URL**: `/landlord/properties/:id/pricing`
- **Components**:
  - Base price configuration (PKR)
  - Seasonal pricing adjustments
  - Weekend/weekday differentiation
  - Special event pricing
  - Long-term stay discounts
  - Extra guest charges
  - Cleaning/service fees
  - Currency display in PKR
  - Pricing calendar view
- **API Endpoints**:
  - `GET /api/accommodations/:id/pricing` - Get property pricing
  - `PUT /api/accommodations/:id/pricing` - Update base pricing
  - `POST /api/accommodations/:id/pricing/seasonal` - Add seasonal pricing
  - `POST /api/accommodations/:id/pricing/special` - Add special event pricing
- **Real-time Requirements**:
  - Real-time pricing calculation
  - Calendar-based visual pricing editor
  - Market rate comparison
  - Immediate application of pricing rules

### 4.6 Availability Calendar
- **URL**: `/landlord/properties/:id/availability`
- **Components**:
  - Interactive calendar interface
  - Availability status toggles
  - Booking blocking functionality
  - Minimum/maximum stay settings
  - Advance notice requirements
  - Preparation time between bookings
  - Bulk edit capabilities
  - Import/export calendar
- **API Endpoints**:
  - `GET /api/accommodations/:id/availability` - Get availability
  - `PUT /api/accommodations/:id/availability` - Update availability
  - `POST /api/accommodations/:id/availability/block` - Block dates
  - `DELETE /api/accommodations/:id/availability/block/:blockId` - Remove block
- **Real-time Requirements**:
  - Immediate calendar updates
  - Real-time validation of booking conflicts
  - Synchronization with external calendars
  - Instant availability changes

## 5. Booking Management

### 5.1 Booking Overview
- **URL**: `/landlord/bookings`
- **Components**:
  - Booking list with filterable status
  - Property filter
  - Date range selection
  - Guest information preview
  - Payment status indicators (PKR)
  - Quick action buttons
  - Export functionality
  - Calendar view toggle
- **API Endpoints**:
  - `GET /api/bookings/landlord` - Get landlord bookings
  - Parameters for status, property, and date filters
- **Real-time Requirements**:
  - New booking alerts
  - Real-time status updates
  - Calendar synchronization
  - Live payment status updates

### 5.2 Booking Details
- **URL**: `/landlord/bookings/:id`
- **Components**:
  - Complete booking information
  - Guest details and contact
  - Check-in/check-out times
  - Payment breakdown (PKR)
  - Special requests
  - Communication history
  - Document uploads
  - Status management buttons
  - Issue reporting
- **API Endpoints**:
  - `GET /api/bookings/:id` - Get booking details
  - `PUT /api/bookings/:id/status` - Update booking status
  - `POST /api/bookings/:id/communication` - Add communication entry
  - `POST /api/bookings/:id/issue` - Report booking issue
- **Real-time Requirements**:
  - Real-time chat with guest
  - Live status updates
  - Immediate notification of guest messages
  - Payment status tracking

### 5.3 Calendar View
- **URL**: `/landlord/calendar`
- **Components**:
  - Monthly/weekly/daily calendar views
  - Property selector for multi-property view
  - Booking status color coding
  - Quick booking creation
  - Drag-and-drop date modification
  - Check-in/check-out visualization
  - Availability blocks
  - Export calendar functionality
- **API Endpoints**:
  - `GET /api/landlord/calendar` - Get calendar data
  - `PUT /api/bookings/:id/dates` - Update booking dates
  - `POST /api/accommodations/:id/availability/block` - Block availability
- **Real-time Requirements**:
  - Real-time calendar synchronization
  - Immediate booking updates
  - Conflict detection and prevention
  - Multi-property calendar aggregation

### 5.4 Guest Management
- **URL**: `/landlord/guests`
- **Components**:
  - Guest directory
  - Booking history by guest
  - Guest notes and preferences
  - Contact information
  - Review history
  - Communication log
  - Returning guest indicators
- **API Endpoints**:
  - `GET /api/landlord/guests` - Get guest directory
  - `GET /api/landlord/guests/:guestId` - Get guest details
  - `POST /api/landlord/guests/:guestId/notes` - Add guest notes
  - `GET /api/landlord/guests/:guestId/bookings` - Get guest booking history
- **Real-time Requirements**:
  - Immediate note updates
  - Guest status tracking
  - Communication history logging
  - Privacy protection measures

## 6. Reviews & Feedback

### 6.1 Reviews Dashboard
- **URL**: `/landlord/reviews`
- **Components**:
  - Overall rating display
  - Rating breakdown by category/property
  - Recent reviews list
  - Review response interface
  - Rating trends chart
  - Filter by property/rating/date
  - Sort options
- **API Endpoints**:
  - `GET /api/landlord/reviews` - Get all reviews
  - `GET /api/accommodations/:id/reviews` - Get property-specific reviews
  - `POST /api/reviews/:id/response` - Respond to review
- **Real-time Requirements**:
  - New review notifications
  - Immediate rating updates
  - Real-time response posting
  - Review sentiment analysis

### 6.2 Review Response
- **URL**: `/landlord/reviews/:id/respond`
- **Components**:
  - Original review display
  - Response editor
  - Response guidelines
  - Template responses
  - Preview functionality
  - Submission confirmation
- **API Endpoints**:
  - `GET /api/reviews/:id` - Get review details
  - `POST /api/reviews/:id/response` - Submit response
  - `PUT /api/reviews/:id/response` - Edit existing response
- **Real-time Requirements**:
  - Character count validation
  - Response submission confirmation
  - Real-time preview updates

### 6.3 Feedback Analysis
- **URL**: `/landlord/feedback/analysis`
- **Components**:
  - Feedback categorization
  - Sentiment analysis
  - Common feedback themes
  - Improvement suggestions
  - Comparative analysis with similar properties
  - Actionable insights
  - Trend visualization
- **API Endpoints**:
  - `GET /api/landlord/feedback/analysis` - Get feedback analysis
  - Parameters for property filters and date range
- **Real-time Requirements**:
  - Dynamic analysis updates
  - Interactive feedback exploration
  - Export analysis reports

## 7. Financial Management

### 7.1 Financial Overview
- **URL**: `/landlord/finance`
- **Components**:
  - Revenue summary (PKR)
  - Transaction history
  - Upcoming payouts
  - Payment method breakdown
  - Outstanding balances
  - Fee structure information
  - Daily/Weekly/Monthly/Yearly views
  - Property-specific financial data
- **API Endpoints**:
  - `GET /api/bookings/landlord/revenue` - Get revenue data
  - Parameters for time period and property filters
- **Real-time Requirements**:
  - Real-time revenue calculations
  - Pakistani Rupee (PKR) formatting
  - Live transaction updates
  - Dynamic financial charts

### 7.2 Transactions
- **URL**: `/landlord/finance/transactions`
- **Components**:
  - Detailed transaction list
  - Transaction filters (type, property, status, date)
  - Transaction details view
  - Payment processing status
  - Refund management
  - Export functionality
  - Reconciliation tools
- **API Endpoints**:
  - `GET /api/landlord/transactions` - Get transactions
  - `GET /api/landlord/transactions/:transactionId` - Get transaction details
  - `POST /api/bookings/:id/refund` - Process refund
- **Real-time Requirements**:
  - Live transaction status updates
  - Real-time refund processing
  - Payment confirmation alerts
  - Financial record synchronization

### 7.3 Payout Management
- **URL**: `/landlord/finance/payouts`
- **Components**:
  - Payout schedule
  - Bank account information (Pakistani banks)
  - Payout history
  - Pending payouts
  - Tax information
  - Payout method selection
  - Payment issue resolution
- **API Endpoints**:
  - `GET /api/landlord/payouts` - Get payouts
  - `PUT /api/landlord/payout-method` - Update payout method
  - `GET /api/landlord/payout-schedule` - Get payout schedule
  - `POST /api/landlord/payouts/:payoutId/issue` - Report payout issue
- **Real-time Requirements**:
  - Payout status tracking
  - Immediate bank verification
  - Real-time balance updates
  - Pakistani banking system integration

### 7.4 Financial Reports
- **URL**: `/landlord/finance/reports`
- **Components**:
  - Report generator
  - Standard report templates
  - Custom report builder
  - Date range selection
  - Property selection
  - Export options (CSV, Excel, PDF)
  - Tax report generation
  - Revenue forecasting
- **API Endpoints**:
  - `GET /api/landlord/finance/reports` - Get financial reports
  - Parameters for report type, properties, date range
  - `POST /api/landlord/finance/reports/custom` - Generate custom report
- **Real-time Requirements**:
  - On-demand report generation
  - Data visualization options
  - Pakistani tax report formats
  - Immediate data export functionality

## 8. Maintenance Management

### 8.1 Maintenance Overview
- **URL**: `/landlord/maintenance`
- **Components**:
  - Maintenance request list
  - Status filters (open, in progress, completed)
  - Property filter
  - Priority indicators
  - Quick action buttons
  - Cost tracking (PKR)
  - Calendar view of maintenance schedule
- **API Endpoints**:
  - `GET /api/landlord/maintenance` - Get maintenance requests
  - Parameters for status, property, and priority filters
- **Real-time Requirements**:
  - New maintenance request alerts
  - Status update notifications
  - Cost calculation in PKR
  - Scheduled maintenance reminders

### 8.2 Maintenance Details
- **URL**: `/landlord/maintenance/:id`
- **Components**:
  - Request details
  - Photo/document attachments
  - Communication history
  - Status update form
  - Vendor assignment
  - Cost entry (PKR)
  - Timeline of actions
  - Issue resolution workflow
- **API Endpoints**:
  - `GET /api/landlord/maintenance/:id` - Get maintenance details
  - `PUT /api/landlord/maintenance/:id/status` - Update status
  - `POST /api/landlord/maintenance/:id/comment` - Add comment
  - `PUT /api/landlord/maintenance/:id/assign` - Assign vendor
  - `PUT /api/landlord/maintenance/:id/cost` - Update cost
- **Real-time Requirements**:
  - Real-time status updates
  - Live communication thread
  - Photo upload progress
  - Cost calculation in PKR

### 8.3 Vendor Management
- **URL**: `/landlord/maintenance/vendors`
- **Components**:
  - Vendor directory
  - Service categories
  - Contact information
  - Service history
  - Rating system
  - Cost comparison
  - Add new vendor form
- **API Endpoints**:
  - `GET /api/landlord/maintenance/vendors` - Get vendors
  - `POST /api/landlord/maintenance/vendors` - Add vendor
  - `PUT /api/landlord/maintenance/vendors/:vendorId` - Update vendor
  - `GET /api/landlord/maintenance/vendors/:vendorId/history` - Get service history
- **Real-time Requirements**:
  - Vendor availability status
  - Service quality ratings
  - Cost tracking in PKR
  - Service history updates

## 9. Notification Center

### 9.1 Notifications
- **URL**: `/landlord/notifications`
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

### 9.2 Messages
- **URL**: `/landlord/messages`
- **Components**:
  - Conversation list
  - Chat interface
  - Guest information sidebar
  - Booking context
  - File/photo sharing
  - Message templates
  - Read receipts
  - Typing indicators
- **API Endpoints**:
  - `GET /api/landlord/messages` - Get conversations
  - `GET /api/landlord/messages/:conversationId` - Get conversation history
  - `POST /api/landlord/messages/:conversationId` - Send message
  - `PUT /api/landlord/messages/:messageId/read` - Mark message as read
- **Real-time Requirements**:
  - Real-time message delivery
  - Immediate read receipts
  - Live typing indicators
  - File upload progress
  - Offline message queueing

## 10. System Settings

### 10.1 Account Settings
- **URL**: `/landlord/settings/account`
- **Components**:
  - Password change
  - Email preferences
  - Two-factor authentication
  - Linked accounts
  - Session management
  - Account deletion option
  - Security settings
- **API Endpoints**:
  - `GET /api/auth/settings` - Get account settings
  - `PUT /api/auth/settings` - Update account settings
  - `PUT /api/auth/change-password` - Change password
  - `PUT /api/auth/2fa` - Configure two-factor authentication
- **Real-time Requirements**:
  - Immediate security setting application
  - Session tracking
  - Real-time validation
  - Security event notifications

### 10.2 Business Settings
- **URL**: `/landlord/settings/business`
- **Components**:
  - Business name and details
  - Business logo upload
  - Contact information
  - Tax information (Pakistani NTN)
  - Business verification status
  - Legal document storage
- **API Endpoints**:
  - `GET /api/landlord/business` - Get business settings
  - `PUT /api/landlord/business` - Update business settings
  - `POST /api/file-upload` - Upload business documents
- **Real-time Requirements**:
  - Document upload progress
  - Verification status updates
  - Form validation
  - Business profile synchronization

### 10.3 Booking Preferences
- **URL**: `/landlord/settings/bookings`
- **Components**:
  - Default booking policies
  - Cancellation policy editor
  - Check-in/check-out time settings
  - Minimum/maximum stay defaults
  - Advance notice requirements
  - Instant booking toggle
  - Booking rules configuration
- **API Endpoints**:
  - `GET /api/landlord/booking-preferences` - Get booking preferences
  - `PUT /api/landlord/booking-preferences` - Update booking preferences
  - `GET /api/landlord/cancellation-policies` - Get cancellation policies
  - `PUT /api/landlord/cancellation-policies` - Update cancellation policies
- **Real-time Requirements**:
  - Immediate application of preferences
  - Policy validation
  - Synchronization across properties
  - Default setting propagation

## 11. Non-Functional Requirements

### 11.1 Real-time Data Requirements
- All booking notifications must appear within 5 seconds of creation
- Dashboard metrics should update automatically every 60 seconds
- Booking status changes must reflect immediately
- Financial data should update in real-time based on transactions
- Guest communication should be instantaneous
- Availability calendar must synchronize across platforms within 15 seconds

### 11.2 Performance Requirements
- Page load time under 2 seconds
- Property listing creation response under 3 seconds
- Calendar operations should respond within 1 second
- Map rendering for Pakistan locations under 2 seconds
- Image upload processing under 5 seconds
- Search results should return in under 500ms

### 11.3 Security Requirements
- Secure authentication with JWT tokens
- Role-based access control
- Data encryption for sensitive information
- Session timeout after 30 minutes of inactivity
- Secure password storage with strong hashing
- Input validation for all forms
- Protection against SQL injection and XSS

### 11.4 Usability Requirements
- Responsive design for mobile, tablet, and desktop
- Consistent PKR (₨) formatting for all monetary values
- Intuitive booking management workflow
- Clear status indicators for properties and bookings
- Quick access to frequently used functions
- Comprehensive search capabilities
- User onboarding tutorials

### 11.5 Error Handling
- Clear error messages for failed operations
- Automatic retry for API failures
- Offline mode capability where appropriate
- Data recovery for form submissions
- Graceful degradation for unavailable features
- Detailed error logging for troubleshooting

## 12. Integration Requirements

### 12.1 Maps Integration
- **Technology**: Google Maps/Mapbox with Pakistan focus
- **Features**:
  - Display property locations on Pakistan map
  - Address validation for Pakistani formats
  - Neighborhood/area visualization
  - Distance calculation for points of interest
  - Interactive map for property location selection
  - Support for Pakistani postal codes and landmarks

### 12.2 Payment Gateway Integration
- Support for Pakistani payment methods:
  - EasyPaisa
  - JazzCash
  - Bank transfers (Pakistani banks)
  - Credit/Debit cards
- Transaction reporting in PKR
- Refund processing
- Payment status tracking
- Financial record keeping

### 12.3 Calendar Integration
- Integration with external calendar systems
- iCal support
- Google Calendar sync
- Availability synchronization
- Booking conflict detection
- Multi-platform reservation sync

## Appendix A: API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register with role="landlord"
- `POST /api/auth/forgot-password` - Password recovery
- `GET /api/auth/profile` - Get profile information
- `PUT /api/auth/profile` - Update profile information
- `PUT /api/auth/change-password` - Change password

### Property Management
- `GET /api/accommodations/landlord` - Get landlord properties
- `GET /api/accommodations/:id` - Get property details
- `POST /api/accommodations` - Create property
- `PUT /api/accommodations/:id` - Update property details
- `DELETE /api/accommodations/:id` - Delete property
- `PUT /api/accommodations/:id/status` - Update property status
- `GET /api/accommodations/:id/amenities` - Get property amenities
- `PUT /api/accommodations/:id/amenities` - Update amenities
- `POST /api/accommodations/:id/amenities/custom` - Add custom amenity
- `GET /api/accommodations/:id/pricing` - Get property pricing
- `PUT /api/accommodations/:id/pricing` - Update base pricing
- `POST /api/accommodations/:id/pricing/seasonal` - Add seasonal pricing
- `POST /api/accommodations/:id/pricing/special` - Add special event pricing
- `GET /api/accommodations/:id/availability` - Get availability
- `PUT /api/accommodations/:id/availability` - Update availability
- `POST /api/accommodations/:id/availability/block` - Block dates
- `DELETE /api/accommodations/:id/availability/block/:blockId` - Remove block

### Booking Management
- `GET /api/bookings/landlord` - Get landlord bookings
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id/status` - Update booking status
- `POST /api/bookings/:id/communication` - Add communication entry
- `POST /api/bookings/:id/issue` - Report booking issue
- `PUT /api/bookings/:id/dates` - Update booking dates
- `POST /api/bookings/:id/refund` - Process refund
- `GET /api/landlord/calendar` - Get calendar data
- `GET /api/landlord/guests` - Get guest directory
- `GET /api/landlord/guests/:guestId` - Get guest details
- `POST /api/landlord/guests/:guestId/notes` - Add guest notes
- `GET /api/landlord/guests/:guestId/bookings` - Get guest booking history

### Reviews & Feedback
- `GET /api/landlord/reviews` - Get all reviews
- `GET /api/accommodations/:id/reviews` - Get property-specific reviews
- `GET /api/reviews/:id` - Get review details
- `POST /api/reviews/:id/response` - Submit response
- `PUT /api/reviews/:id/response` - Edit existing response
- `GET /api/landlord/feedback/analysis` - Get feedback analysis

### Financial Management
- `GET /api/bookings/landlord/revenue` - Get revenue data
- `GET /api/landlord/transactions` - Get transactions
- `GET /api/landlord/transactions/:transactionId` - Get transaction details
- `GET /api/landlord/payouts` - Get payouts
- `PUT /api/landlord/payout-method` - Update payout method
- `GET /api/landlord/payout-schedule` - Get payout schedule
- `POST /api/landlord/payouts/:payoutId/issue` - Report payout issue
- `GET /api/landlord/finance/reports` - Get financial reports
- `POST /api/landlord/finance/reports/custom` - Generate custom report

### Maintenance Management
- `GET /api/landlord/maintenance` - Get maintenance requests
- `GET /api/landlord/maintenance/:id` - Get maintenance details
- `PUT /api/landlord/maintenance/:id/status` - Update status
- `POST /api/landlord/maintenance/:id/comment` - Add comment
- `PUT /api/landlord/maintenance/:id/assign` - Assign vendor
- `PUT /api/landlord/maintenance/:id/cost` - Update cost
- `GET /api/landlord/maintenance/vendors` - Get vendors
- `POST /api/landlord/maintenance/vendors` - Add vendor
- `PUT /api/landlord/maintenance/vendors/:vendorId` - Update vendor
- `GET /api/landlord/maintenance/vendors/:vendorId/history` - Get service history

### Dashboard & Analytics
- `GET /api/accommodations/landlord/dashboard` - Dashboard data
- `GET /api/users/landlord/statistics` - Get booking statistics
- `GET /api/accommodations/landlord/performance` - Performance metrics

### System Settings
- `GET /api/auth/settings` - Get account settings
- `PUT /api/auth/settings` - Update account settings
- `PUT /api/auth/2fa` - Configure two-factor authentication
- `GET /api/landlord/business` - Get business settings
- `PUT /api/landlord/business` - Update business settings
- `GET /api/landlord/booking-preferences` - Get booking preferences
- `PUT /api/landlord/booking-preferences` - Update booking preferences
- `GET /api/landlord/cancellation-policies` - Get cancellation policies
- `PUT /api/landlord/cancellation-policies` - Update cancellation policies

### Notifications & Messages
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `GET /api/notifications/preferences` - Get notification preferences
- `PUT /api/notifications/preferences` - Update notification preferences
- `GET /api/landlord/messages` - Get conversations
- `GET /api/landlord/messages/:conversationId` - Get conversation history
- `POST /api/landlord/messages/:conversationId` - Send message
- `PUT /api/landlord/messages/:messageId/read` - Mark message as read

### File Upload
- `POST /api/file-upload` - Upload files (images, documents)
- `DELETE /api/file-upload/:fileId` - Delete uploaded file

## Appendix B: Mock Designs

For implementation, refer to the design assets and wireframes provided separately. All designs should reflect Pakistani cultural context, use PKR as currency, and feature maps focused on Pakistani geography.

---

*Note: This specification is a living document and may be updated as requirements evolve. All features should be implemented with Pakistan-specific considerations in mind, including currency (PKR), locations, language support, and appropriate mapping services for Pakistani cities and regions.*
