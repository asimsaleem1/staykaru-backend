# 🎯 Frontend Development Prompt for StayKaru Platform

## 📋 **Project Brief**

You are tasked with creating a modern, responsive, and feature-rich frontend application for **StayKaru** - a comprehensive accommodation booking and food delivery platform. The application serves four distinct user roles with complete functionality for each.

---

## 🎨 **Design Requirements**

### **Visual Design Philosophy**
- **Ultra-Modern**: Clean, minimalist design with premium feel
- **Intuitive Navigation**: Easy-to-use interface for all user types
- **Mobile-First**: Fully responsive across all devices
- **Professional**: Business-grade quality with attention to detail
- **Accessible**: WCAG 2.1 compliant for inclusive design

### **Color Palette & Branding**
```css
/* Primary Brand Colors */
--primary-blue: #2563eb;
--primary-dark: #1e40af;
--accent-green: #10b981;
--accent-orange: #f59e0b;

/* UI Colors */
--background: #ffffff;
--surface: #f9fafb;
--border: #e5e7eb;
--text-primary: #111827;
--text-secondary: #6b7280;

/* Status Colors */
--success: #22c55e;
--warning: #eab308;
--error: #ef4444;
--info: #3b82f6;
```

### **Typography System**
- **Primary Font**: Inter (Google Fonts)
- **Secondary Font**: Poppins (for headings)
- **Font Sizes**: Use responsive scale (rem units)
- **Font Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

---

## 🏗️ **Technical Stack Requirements**

### **Core Technologies**
- **Framework**: React 18+ with TypeScript
- **State Management**: Redux Toolkit + RTK Query
- **Styling**: Tailwind CSS + styled-components
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Headless UI + custom components
- **Charts**: Recharts for analytics
- **Maps**: React Leaflet for location features
- **Icons**: Heroicons + Lucide React

### **Additional Libraries**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "@reduxjs/toolkit": "^1.9.0",
    "react-redux": "^8.1.0",
    "react-router-dom": "^6.14.0",
    "react-hook-form": "^7.45.0",
    "zod": "^3.21.0",
    "tailwindcss": "^3.3.0",
    "@headlessui/react": "^1.7.0",
    "@heroicons/react": "^2.0.0",
    "recharts": "^2.7.0",
    "react-leaflet": "^4.2.0",
    "date-fns": "^2.30.0",
    "react-query": "^3.39.0",
    "socket.io-client": "^4.7.0"
  }
}
```

---

## 🎯 **Module Implementation Requirements**

### **1. ADMIN MODULE** 👑

#### **Core Features to Implement**
- **Dashboard**: Analytics overview with KPI cards, charts, recent activity
- **User Management**: User list, role changes, account status management
- **Property Oversight**: Accommodation approval/rejection workflow
- **Food Provider Management**: Restaurant approval and menu oversight
- **Analytics Hub**: Detailed reports with interactive charts
- **System Settings**: Platform configuration and security settings

#### **Key Screens**
```javascript
// Screen Structure
/admin
├── /dashboard           // Main analytics dashboard
├── /users              // User management interface
├── /properties         // Property approval system
├── /food-providers     // Restaurant management
├── /analytics          // Detailed analytics and reports
├── /settings           // System configuration
└── /security           // Security monitoring
```

#### **Design Specifications**
- **Layout**: Sidebar navigation with collapsible menu
- **Dashboard**: 4-column metric cards, 2x2 chart grid, activity feed
- **Tables**: Sortable, filterable with pagination (50 items per page)
- **Charts**: Line charts for trends, bar charts for comparisons, pie charts for distributions
- **Actions**: Bulk actions, quick approve/reject buttons, status toggles

#### **Sample Component Structure**
```jsx
<AdminDashboard>
  <MetricsGrid>
    <MetricCard title="Total Users" value="12,345" change="+12%" />
    <MetricCard title="Active Properties" value="8,901" change="+8%" />
    <MetricCard title="Food Providers" value="2,345" change="+15%" />
    <MetricCard title="Revenue" value="$45,678" change="+23%" />
  </MetricsGrid>
  
  <ChartsGrid>
    <UserGrowthChart />
    <RevenueChart />
    <BookingTrendsChart />
    <OrderAnalyticsChart />
  </ChartsGrid>
  
  <RecentActivityFeed />
</AdminDashboard>
```

---

### **2. STUDENT MODULE** 🎓

#### **Core Features to Implement**
- **Home Dashboard**: Quick actions, recent bookings, food orders
- **Accommodation Browser**: Search, filter, view details, book stays
- **Food Delivery**: Browse restaurants, view menus, place orders
- **Booking Management**: View history, modify bookings, cancellations
- **Order Tracking**: Real-time order status, delivery tracking
- **Profile Management**: Personal info, preferences, payment methods

#### **Key Screens**
```javascript
// Screen Structure
/student
├── /dashboard          // Personal dashboard
├── /accommodations     // Browse and search accommodations
├── /accommodation/:id  // Detailed property view
├── /food-providers     // Browse restaurants
├── /menu/:providerId   // Restaurant menu and ordering
├── /bookings          // Booking history and management
├── /orders            // Order history and tracking
├── /profile           // Profile settings
└── /notifications     // Notification center
```

#### **Design Specifications**
- **Layout**: Top navigation with user menu, full-width content
- **Search Interface**: Prominent search bar with advanced filters
- **Card Design**: Property cards with images, amenities, pricing
- **Booking Flow**: Multi-step booking with date picker, guest selection
- **Order Interface**: Menu categories, item customization, cart management

#### **Sample Component Structure**
```jsx
<AccommodationBrowser>
  <SearchHeader>
    <SearchBar placeholder="Where do you want to stay?" />
    <FilterToggle />
  </SearchHeader>
  
  <FilterSidebar>
    <PriceRangeFilter />
    <AmenitiesFilter />
    <LocationFilter />
    <RatingFilter />
  </FilterSidebar>
  
  <AccommodationGrid>
    {accommodations.map(property => (
      <PropertyCard
        key={property.id}
        images={property.images}
        title={property.title}
        location={property.location}
        price={property.price}
        rating={property.rating}
        amenities={property.amenities}
        onView={() => navigate(`/accommodation/${property.id}`)}
        onBookmark={() => toggleBookmark(property.id)}
      />
    ))}
  </AccommodationGrid>
</AccommodationBrowser>
```

---

### **3. LANDLORD MODULE** 🏠

#### **Core Features to Implement**
- **Property Dashboard**: Overview of all properties, performance metrics
- **Property Management**: Add, edit, delete property listings
- **Booking Management**: Handle booking requests, calendar management
- **Financial Dashboard**: Revenue tracking, expense management
- **Analytics Center**: Property performance, booking success rates
- **Calendar Management**: Availability settings, blocked dates
- **Tenant Communication**: Messaging system, support requests

#### **Key Screens**
```javascript
// Screen Structure
/landlord
├── /dashboard          // Properties overview dashboard
├── /properties         // Property management
├── /add-property       // Add new property form
├── /edit-property/:id  // Edit existing property
├── /bookings          // Booking requests and management
├── /calendar          // Availability calendar
├── /financials        // Revenue and expense tracking
├── /analytics         // Performance analytics
├── /messages          // Tenant communication
└── /settings          // Account and business settings
```

#### **Design Specifications**
- **Layout**: Dashboard-style with sidebar navigation
- **Property Cards**: Large image, key metrics, action buttons
- **Calendar View**: Month/week view with booking overlays
- **Financial Charts**: Revenue trends, expense breakdowns
- **Form Design**: Multi-step property addition with image upload

#### **Sample Component Structure**
```jsx
<PropertyManagement>
  <PageHeader>
    <h1>My Properties</h1>
    <AddPropertyButton />
  </PageHeader>
  
  <PropertyGrid>
    {properties.map(property => (
      <PropertyCard key={property.id}>
        <PropertyImageGallery images={property.images} />
        <PropertyInfo>
          <PropertyTitle>{property.title}</PropertyTitle>
          <PropertyLocation>{property.location}</PropertyLocation>
          <PropertyMetrics>
            <Metric label="Bookings" value={property.bookings} />
            <Metric label="Revenue" value={property.revenue} />
            <Metric label="Rating" value={property.rating} />
          </PropertyMetrics>
        </PropertyInfo>
        <PropertyActions>
          <EditButton onClick={() => editProperty(property.id)} />
          <ViewBookingsButton onClick={() => viewBookings(property.id)} />
          <MoreOptionsMenu property={property} />
        </PropertyActions>
      </PropertyCard>
    ))}
  </PropertyGrid>
</PropertyManagement>
```

---

### **4. FOOD PROVIDER MODULE** 🍕

#### **Core Features to Implement**
- **Restaurant Dashboard**: Order overview, performance metrics
- **Restaurant Management**: Business profile, operating hours
- **Menu Management**: Add, edit, delete menu items with categories
- **Order Management**: Incoming orders, status updates, order history
- **Analytics Center**: Sales analytics, popular items, customer insights
- **Financial Dashboard**: Revenue tracking, profit analysis
- **Customer Reviews**: Review management and responses

#### **Key Screens**
```javascript
// Screen Structure
/food-provider
├── /dashboard          // Orders and performance overview
├── /restaurant         // Restaurant profile management
├── /menu              // Menu items management
├── /add-item          // Add new menu item
├── /orders            // Order management interface
├── /analytics         // Sales and performance analytics
├── /financials        // Revenue and profit tracking
├── /reviews           // Customer reviews management
└── /settings          // Business settings
```

#### **Design Specifications**
- **Layout**: Dashboard with real-time order notifications
- **Order Interface**: Tab-based (Pending, Preparing, Ready, Completed)
- **Menu Management**: Drag-and-drop categories, inline editing
- **Analytics**: Sales charts, popular items, customer feedback
- **Order Cards**: Clear order details, action buttons, timer displays

#### **Sample Component Structure**
```jsx
<OrderManagement>
  <OrderStats>
    <StatCard title="Pending Orders" value={pendingCount} color="orange" />
    <StatCard title="Preparing" value={preparingCount} color="blue" />
    <StatCard title="Ready" value={readyCount} color="green" />
    <StatCard title="Today's Revenue" value={todayRevenue} color="purple" />
  </OrderStats>
  
  <OrderTabs>
    <TabList>
      <Tab>Pending ({pendingOrders.length})</Tab>
      <Tab>Preparing ({preparingOrders.length})</Tab>
      <Tab>Ready ({readyOrders.length})</Tab>
      <Tab>Completed</Tab>
    </TabList>
    
    <TabPanels>
      <TabPanel>
        <OrderList>
          {pendingOrders.map(order => (
            <OrderCard key={order.id}>
              <OrderHeader>
                <OrderId>#{order.id}</OrderId>
                <OrderTime>{formatTime(order.createdAt)}</OrderTime>
                <OrderTimer duration={order.maxPrepTime} />
              </OrderHeader>
              <OrderItems>
                {order.items.map(item => (
                  <OrderItem key={item.id}>
                    <ItemName>{item.name}</ItemName>
                    <ItemQuantity>×{item.quantity}</ItemQuantity>
                    <ItemPrice>₹{item.price}</ItemPrice>
                  </OrderItem>
                ))}
              </OrderItems>
              <OrderCustomer>
                <CustomerName>{order.customer.name}</CustomerName>
                <CustomerPhone>{order.customer.phone}</CustomerPhone>
                <DeliveryAddress>{order.deliveryAddress}</DeliveryAddress>
              </OrderCustomer>
              <OrderActions>
                <AcceptButton onClick={() => acceptOrder(order.id)} />
                <RejectButton onClick={() => rejectOrder(order.id)} />
                <ViewDetailsButton onClick={() => viewOrder(order.id)} />
              </OrderActions>
            </OrderCard>
          ))}
        </OrderList>
      </TabPanel>
    </TabPanels>
  </OrderTabs>
</OrderManagement>
```

---

## 🔧 **Implementation Guidelines**

### **Code Structure**
```
src/
├── components/
│   ├── common/              // Shared components
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Modal/
│   │   ├── Table/
│   │   └── Charts/
│   ├── forms/              // Form components
│   ├── layout/             // Layout components
│   └── ui/                 // UI primitives
├── pages/
│   ├── admin/              // Admin pages
│   ├── student/            // Student pages
│   ├── landlord/           // Landlord pages
│   └── food-provider/      // Food provider pages
├── hooks/                  // Custom React hooks
├── services/              // API services
├── store/                 // Redux store
├── utils/                 // Utility functions
├── types/                 // TypeScript types
└── styles/                // Global styles
```

### **Component Development Standards**

#### **1. Component Architecture**
```tsx
// Use functional components with TypeScript
interface ComponentProps {
  title: string;
  data: DataType[];
  onAction: (id: string) => void;
}

const Component: React.FC<ComponentProps> = ({ title, data, onAction }) => {
  const [state, setState] = useState<StateType>();
  
  return (
    <div className="component-container">
      {/* Component content */}
    </div>
  );
};

export default Component;
```

#### **2. Styling Approach**
```tsx
// Use Tailwind CSS classes with conditional styling
const Card: React.FC<CardProps> = ({ variant, children, className }) => {
  const baseClasses = "rounded-lg border shadow-sm p-6";
  const variantClasses = {
    default: "bg-white border-gray-200",
    elevated: "bg-white border-gray-200 shadow-md",
    outlined: "bg-transparent border-gray-300"
  };
  
  const classes = cn(
    baseClasses,
    variantClasses[variant],
    className
  );
  
  return <div className={classes}>{children}</div>;
};
```

#### **3. State Management**
```tsx
// Use Redux Toolkit for global state
const accommodationSlice = createSlice({
  name: 'accommodations',
  initialState,
  reducers: {
    setAccommodations: (state, action) => {
      state.list = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
    }
  }
});

// Use React Query for server state
const useAccommodations = (filters: FilterType) => {
  return useQuery({
    queryKey: ['accommodations', filters],
    queryFn: () => accommodationService.getAll(filters),
    staleTime: 5 * 60 * 1000
  });
};
```

---

## 📱 **Responsive Design Requirements**

### **Breakpoint System**
```css
/* Mobile First Approach */
.container {
  padding: 1rem;
}

/* Tablet: 768px and up */
@media (min-width: 768px) {
  .container {
    padding: 1.5rem;
    max-width: 768px;
    margin: 0 auto;
  }
}

/* Desktop: 1024px and up */
@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
    padding: 2rem;
  }
}

/* Large Desktop: 1280px and up */
@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
  }
}
```

### **Mobile Navigation**
```tsx
// Mobile-friendly navigation
<MobileNav>
  <MobileNavToggle />
  <MobileNavMenu>
    <MobileNavItem icon={<HomeIcon />} href="/dashboard">
      Dashboard
    </MobileNavItem>
    <MobileNavItem icon={<BuildingIcon />} href="/properties">
      Properties
    </MobileNavItem>
    <MobileNavItem icon={<CalendarIcon />} href="/bookings">
      Bookings
    </MobileNavItem>
    <MobileNavItem icon={<UserIcon />} href="/profile">
      Profile
    </MobileNavItem>
  </MobileNavMenu>
</MobileNav>
```

---

## 🔐 **Authentication & Security**

### **Authentication Service**
```typescript
class AuthService {
  private baseURL = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api';
  private token: string | null = localStorage.getItem('staykaru_token');

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();
    
    if (data.access_token) {
      this.token = data.access_token;
      localStorage.setItem('staykaru_token', this.token);
    }
    
    return data;
  }

  getAuthHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` })
    };
  }
}
```

### **Protected Routes**
```tsx
// Route protection based on user roles
<Route
  path="/admin/*"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout />
    </ProtectedRoute>
  }
/>

<Route
  path="/student/*"
  element={
    <ProtectedRoute allowedRoles={['student']}>
      <StudentLayout />
    </ProtectedRoute>
  }
/>
```

---

## 🎯 **Performance Requirements**

### **Optimization Targets**
- **Initial Load**: < 3 seconds
- **Route Transitions**: < 500ms
- **API Response Handling**: < 200ms
- **Image Loading**: Progressive with lazy loading
- **Bundle Size**: < 500KB (gzipped)

### **Implementation Strategies**
```tsx
// Code splitting by routes
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));

// Image optimization
<Image
  src={accommodation.image}
  alt={accommodation.title}
  width={400}
  height={300}
  loading="lazy"
  className="object-cover rounded-lg"
/>

// Data fetching optimization
const { data, isLoading, error } = useQuery({
  queryKey: ['accommodations', page, filters],
  queryFn: () => fetchAccommodations(page, filters),
  keepPreviousData: true,
  staleTime: 5 * 60 * 1000
});
```

---

## 🧪 **Testing Requirements**

### **Testing Strategy**
- **Unit Tests**: 80% coverage for components and utilities
- **Integration Tests**: API integration and user flows
- **E2E Tests**: Critical user journeys
- **Accessibility Tests**: WCAG compliance

### **Testing Tools**
```json
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.0",
    "@testing-library/user-event": "^14.4.0",
    "jest": "^29.6.0",
    "cypress": "^12.17.0",
    "@axe-core/react": "^4.7.0"
  }
}
```

---

## 🚀 **Deployment & Build**

### **Build Configuration**
```javascript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@headlessui/react', '@heroicons/react']
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://staykaru-backend-60ed08adb2a7.herokuapp.com',
        changeOrigin: true
      }
    }
  }
});
```

### **Environment Configuration**
```env
VITE_API_URL=https://staykaru-backend-60ed08adb2a7.herokuapp.com/api
VITE_WS_URL=wss://staykaru-backend-60ed08adb2a7.herokuapp.com
VITE_MAPS_API_KEY=your_maps_api_key
VITE_ENVIRONMENT=production
```

---

## 📋 **Delivery Checklist**

### **Phase 1: Foundation (Weeks 1-2)**
- [ ] Project setup with TypeScript and Tailwind CSS
- [ ] Authentication system implementation
- [ ] Protected routing setup
- [ ] Basic layout components
- [ ] API service layer

### **Phase 2: Core Modules (Weeks 3-8)**
- [ ] Admin module complete with dashboard and management
- [ ] Student module with accommodation browsing and booking
- [ ] Landlord module with property management
- [ ] Food provider module with order management

### **Phase 3: Advanced Features (Weeks 9-12)**
- [ ] Real-time notifications with WebSocket
- [ ] Advanced analytics and charts
- [ ] Mobile optimization
- [ ] Performance optimization
- [ ] Accessibility compliance

### **Phase 4: Testing & Polish (Weeks 13-16)**
- [ ] Comprehensive testing suite
- [ ] UI/UX refinements
- [ ] Performance optimization
- [ ] Documentation
- [ ] Deployment setup

---

## 🎯 **Success Criteria**

### **Technical Requirements**
- ✅ All API endpoints integrated successfully
- ✅ Real-time features working (notifications, order updates)
- ✅ Mobile responsive on all screen sizes
- ✅ Loading states and error handling implemented
- ✅ Form validation and user feedback
- ✅ Performance metrics met (< 3s load time)

### **User Experience Requirements**
- ✅ Intuitive navigation for all user roles
- ✅ Consistent design language across modules
- ✅ Accessibility standards met (WCAG 2.1)
- ✅ Smooth animations and transitions
- ✅ Clear feedback for user actions
- ✅ Error states handled gracefully

### **Business Requirements**
- ✅ All user stories implemented
- ✅ Multi-role functionality working
- ✅ Real-time data synchronization
- ✅ Secure authentication and authorization
- ✅ Analytics and reporting features
- ✅ Scalable architecture for future growth

---

## 📞 **Support & Resources**

### **API Documentation**
- **Base URL**: https://staykaru-backend-60ed08adb2a7.herokuapp.com/api
- **WebSocket**: wss://staykaru-backend-60ed08adb2a7.herokuapp.com
- **Swagger Documentation**: Available at base URL

### **Design Resources**
- **Figma Designs**: [To be provided]
- **Brand Guidelines**: [To be provided]
- **Asset Library**: [To be provided]

### **Technical Support**
- **Backend Team**: Available for API questions
- **DevOps Team**: Available for deployment support
- **QA Team**: Available for testing coordination

---

## 🎉 **Final Notes**

This project represents a significant opportunity to create a world-class platform that will serve thousands of users. Focus on creating an exceptional user experience while maintaining high code quality and performance standards.

**Remember**: The success of this platform depends on delivering a seamless, intuitive, and powerful interface that serves all user roles effectively. Every component, every interaction, and every screen should reflect the quality and professionalism expected from a leading marketplace platform.

**Good luck, and let's build something amazing! 🚀**

---

**Document Version**: 1.0  
**Last Updated**: June 23, 2025  
**Contact**: [Development Team Lead]
