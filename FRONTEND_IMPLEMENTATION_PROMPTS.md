# Frontend Implementation Prompts for Landlord Module

## Authentication & Profile Management Prompts

### Prompt 1: Landlord Registration Form
Create a multi-step landlord registration form with the following requirements:
- Step 1: Basic information (name, email, password, phone with country code)
- Step 2: Address and verification documents upload
- Step 3: Payment information setup (bank details, tax ID)
- Include proper validation for all fields
- Password strength indicator
- Terms and conditions acceptance
- Role should be automatically set to 'landlord'
- Responsive design for mobile and desktop
- Progress indicator showing current step
- Ability to save as draft and continue later

### Prompt 2: Landlord Profile Management
Develop a comprehensive profile management interface including:
- Profile picture upload with cropping functionality
- Editable profile information form with validation
- Password change functionality with current password verification
- Verification status display (unverified/pending/verified)
- Document upload section for identity verification
- Payment information management
- Account status display
- Settings for notification preferences
- Profile completion percentage indicator

### Prompt 3: Authentication Flow Integration
Implement the complete authentication flow for landlords:
- Login form with email/password and social login options (Google, Facebook)
- JWT token management with automatic refresh
- Protected routes that require landlord authentication
- Role-based access control ensuring only landlords can access landlord features
- Logout functionality with token cleanup
- Session timeout handling with user notification
- Remember me functionality
- Forgot password and reset password flows

## Dashboard & Overview Prompts

### Prompt 4: Landlord Dashboard Layout
Create a comprehensive landlord dashboard with:
- Header with navigation, profile dropdown, and notification bell
- Summary cards showing: Total Properties, Active Bookings, Pending Approvals, Monthly Revenue
- Quick action buttons: Add Property, View Bookings, Messages, Reports
- Recent activity feed showing latest bookings, reviews, and notifications
- Revenue chart showing monthly trends
- Property performance metrics
- Upcoming check-ins/check-outs
- Responsive grid layout that works on all devices
- Dark/light theme support

### Prompt 5: Navigation System
Develop a navigation system with:
- Sidebar navigation for desktop with collapsible menu
- Bottom navigation for mobile devices
- Breadcrumb navigation for deep pages
- Active state indicators
- Menu items: Dashboard, Properties, Bookings, Messages, Analytics, Profile, Settings
- Notification badges on relevant menu items
- Search functionality in the header
- User profile dropdown with quick actions

## Property Management Prompts

### Prompt 6: Property Creation Form
Build a comprehensive property creation interface:
- Multi-step form with progress indicator (Property Details, Location, Photos, Amenities, Pricing, Rules)
- Property type selection with visual cards
- Address input with Google Maps integration and pin placement
- Photo upload with drag-and-drop, multiple selection, and preview
- Amenities selection with searchable checkboxes
- Pricing configuration with base price, discounts, and additional fees
- Rules and restrictions text area with character count
- Availability calendar setup
- Room configuration (bedrooms, bathrooms, occupancy)
- Save as draft functionality
- Preview mode before publishing
- Validation with helpful error messages

### Prompt 7: Property Management Interface
Create a property management dashboard with:
- Grid and list view toggle for property listings
- Filter options: Status (Active/Inactive), Property Type, Date Created
- Search functionality by property name or address
- Sort options: Date, Name, Rating, Booking Count
- Property cards showing: Photo, Title, Status, Rating, Booking Count, Revenue
- Quick action buttons: Edit, View Details, Manage Bookings, Toggle Status
- Bulk actions for multiple properties
- Pagination with items per page selection
- Export functionality to PDF/CSV

### Prompt 8: Property Details View
Develop a detailed property view with:
- Photo gallery with lightbox and navigation
- Property information in organized tabs: Overview, Amenities, Rules, Location
- Interactive map showing property location
- Booking calendar showing availability and bookings
- Recent reviews section with ratings
- Analytics section with charts (views, bookings, revenue)
- Edit and manage buttons
- Status toggle with confirmation
- Revenue breakdown for this property
- Guest feedback and ratings analysis

### Prompt 9: Photo Management System
Build a comprehensive photo management interface:
- Drag-and-drop upload area with progress indicators
- Photo gallery with thumbnail view
- Drag-to-reorder functionality
- Set featured photo option
- Add/edit captions for photos
- Delete photos with confirmation
- Bulk upload and delete options
- Image compression and optimization
- Preview functionality
- Support for multiple formats (JPEG, PNG, WebP)

## Booking Management Prompts

### Prompt 10: Booking Dashboard
Create a booking management interface with:
- Filterable table view by status (Pending, Confirmed, Completed, Cancelled)
- Search by guest name, booking ID, or property name
- Sort by date, property, guest, amount, status
- Calendar view option showing all bookings
- Status color coding and badges
- Quick action buttons: Approve, Reject, View Details, Message Guest
- Bulk actions for multiple bookings
- Export booking data to CSV/PDF
- Date range picker for filtering
- Pagination with customizable page size

### Prompt 11: Booking Details Interface
Develop a comprehensive booking details view:
- Guest information card with contact details and profile
- Booking timeline showing all status changes
- Property information with photos and details
- Payment status and transaction history
- Special requests and notes section
- Communication history with the guest
- Action buttons: Approve, Reject, Message, Cancel
- Cancellation and refund handling interface
- Check-in/Check-out process management
- Review and rating system post-checkout

### Prompt 12: Booking Approval Workflow
Create an efficient booking approval system:
- Notification-driven approval process
- Quick approve/reject buttons with confirmation dialogs
- Rejection reason selection with custom message option
- Automatic guest notification upon approval/rejection
- Calendar integration to check availability conflicts
- Pricing verification and adjustment options
- Special request handling interface
- Bulk approval for multiple bookings
- Mobile-optimized for quick approvals on the go

## Financial Management Prompts

### Prompt 13: Revenue Dashboard
Build a comprehensive financial dashboard with:
- Revenue summary cards: Monthly, Quarterly, Yearly earnings
- Interactive charts showing revenue trends over time
- Property-wise revenue breakdown with comparison
- Booking vs. revenue correlation charts
- Commission and fee breakdown
- Seasonal analysis with year-over-year comparison
- Top-performing properties ranking
- Revenue forecasting based on current bookings
- Export functionality for financial reports
- Tax information and documentation

### Prompt 14: Payment Management Interface
Develop a payment tracking system with:
- Payment history table with transaction details
- Payment status indicators (Pending, Completed, Failed, Refunded)
- Search and filter by date range, amount, property, guest
- Transaction receipt download functionality
- Payout schedule and history
- Bank account and payment method management
- Tax document generation and download
- Dispute resolution interface
- Refund processing workflow
- Integration with payment gateway for real-time updates

### Prompt 15: Financial Reports Generator
Create a comprehensive reporting system:
- Report type selection (Revenue, Bookings, Tax, Custom)
- Date range selector with preset options
- Property and booking status filters
- Format options (PDF, CSV, Excel)
- Scheduled reports with email delivery
- Report templates for different purposes
- Data visualization options (charts, graphs, tables)
- Report sharing functionality
- Historical report access and management
- Custom report builder with drag-and-drop fields

## Communication & Notifications Prompts

### Prompt 16: Messaging System
Build a real-time messaging interface:
- Chat interface with conversation list
- Message threads organized by booking or property
- Real-time message delivery with WebSocket integration
- Message status indicators (Sent, Delivered, Read)
- File attachment support (images, documents)
- Quick response templates for common scenarios
- Search functionality within conversations
- Message history and archiving
- Typing indicators and online status
- Mobile-optimized chat interface

### Prompt 17: Notification Center
Develop a comprehensive notification system:
- Notification bell with unread count badge
- Notification center with categorized notifications
- Filter options: Type, Read/Unread, Date
- Mark as read/unread functionality
- Bulk mark as read option
- Notification preferences and settings
- Real-time notification delivery
- Push notification support for mobile
- Email notification preferences
- Notification history and archiving

## Analytics & Reporting Prompts

### Prompt 18: Analytics Dashboard
Create a data-driven analytics interface:
- Key performance indicators (KPIs) dashboard
- Occupancy rate charts and trends
- Guest demographics and behavior analysis
- Property performance comparison
- Seasonal booking patterns
- Revenue per available room (RevPAR) metrics
- Market comparison and competitive analysis
- Customer satisfaction scores and trends
- Booking conversion rates
- Interactive data visualization with drill-down capabilities

### Prompt 19: Performance Insights
Build an insights and recommendations system:
- Property performance scoring
- Pricing optimization suggestions
- Availability optimization recommendations
- Photo and description improvement suggestions
- Competitive analysis with market rates
- Seasonal demand forecasting
- Guest preference analysis
- Review sentiment analysis
- Booking pattern insights
- Revenue optimization tips

## Settings & Configuration Prompts

### Prompt 20: Account Settings Interface
Develop a comprehensive settings panel:
- Personal information management
- Privacy settings and data control
- Notification preferences (email, SMS, push)
- Language and region settings
- Currency and timezone configuration
- Account verification status and document upload
- Two-factor authentication setup
- Account deactivation/deletion options
- Data export and download
- Integration settings for third-party services

### Prompt 21: Property Configuration Tools
Create advanced property management tools:
- Bulk property operations interface
- Template creation for similar properties
- Automated pricing rules setup
- Availability calendar bulk management
- Property status automation
- Integration with external booking platforms
- Calendar synchronization tools
- Property duplication functionality
- Batch photo management
- Advanced search and filtering options

## Mobile-Specific Prompts

### Prompt 22: Mobile-First Design Implementation
Optimize the entire landlord interface for mobile:
- Touch-friendly navigation and controls
- Swipe gestures for common actions
- Thumb-zone optimization for critical buttons
- Collapsible sections to save screen space
- Mobile-optimized forms with appropriate input types
- Offline functionality for critical features
- Progressive Web App (PWA) implementation
- Mobile push notifications
- Location-based services integration
- Mobile-specific shortcuts and quick actions

### Prompt 23: Responsive Design System
Create a comprehensive responsive design:
- Breakpoint strategy for mobile, tablet, desktop
- Flexible grid system for all components
- Responsive typography and spacing
- Touch vs. mouse interaction handling
- Adaptive navigation patterns
- Responsive data tables with horizontal scrolling
- Modal and popup optimization for small screens
- Image and media responsive handling
- Performance optimization for mobile networks
- Cross-browser and cross-device compatibility

## Testing & Quality Assurance Prompts

### Prompt 24: Component Testing Strategy
Implement comprehensive testing:
- Unit tests for all React components
- Integration tests for user workflows
- End-to-end tests for critical paths
- Accessibility testing with screen readers
- Performance testing and optimization
- Cross-browser compatibility testing
- Mobile device testing on real devices
- API integration testing
- Error handling and edge case testing
- User acceptance testing scenarios

### Prompt 25: Error Handling & User Experience
Create robust error handling:
- Global error boundary implementation
- Graceful error messages and recovery options
- Form validation with helpful error messages
- Network error handling with retry mechanisms
- Loading states and skeleton screens
- Empty states with actionable content
- Offline mode handling and notifications
- Session timeout and automatic renewal
- Data consistency and conflict resolution
- User-friendly 404 and error pages

## Performance & Optimization Prompts

### Prompt 26: Performance Optimization
Implement performance best practices:
- Code splitting and lazy loading
- Image optimization and lazy loading
- Bundle size optimization
- Caching strategies for API responses
- Virtual scrolling for large lists
- Debounced search and filter inputs
- Optimistic UI updates
- Background data fetching
- Memory leak prevention
- Core Web Vitals optimization

### Prompt 27: SEO & Accessibility
Ensure accessibility and SEO compliance:
- Semantic HTML structure
- ARIA labels and roles implementation
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance (WCAG 2.1 AA)
- Focus management and visible focus indicators
- Text scaling and zoom support
- Meta tags and structured data
- Page title and description optimization
- Alt text for all images and media

## Implementation Notes for Frontend Agent

1. **API Integration**: Use the base URL `https://staykaru-backend-60ed08adb2a7.herokuapp.com/api` for all API calls
2. **Authentication**: Implement JWT token management with automatic refresh
3. **State Management**: Use appropriate state management (Redux, Zustand, or Context API)
4. **Styling**: Implement consistent design system with CSS-in-JS or CSS modules
5. **Testing**: Write comprehensive tests for all components and user flows
6. **Documentation**: Document all components and their props/APIs
7. **Performance**: Optimize for Core Web Vitals and mobile performance
8. **Accessibility**: Ensure WCAG 2.1 AA compliance throughout
9. **Responsive Design**: Mobile-first approach with progressive enhancement
10. **Error Handling**: Implement robust error boundaries and user-friendly error messages

Each prompt should be implemented as a separate feature or component, with proper integration between all parts to create a cohesive landlord experience.
