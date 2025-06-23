# 🚀 StayKaru Frontend Development Master Guide

## 📋 **Project Overview**

StayKaru is a comprehensive accommodation and food delivery platform serving four distinct user roles:
- **Students**: Browse accommodations, book stays, order food
- **Landlords**: Manage properties, handle bookings, track revenue
- **Food Providers**: Manage restaurants, handle orders, track performance
- **Admins**: Oversee platform operations, manage users, analytics

---

## 🎯 **Complete Module Specifications**

### 👑 **ADMIN MODULE**

#### **Core Functionalities**
**User Management:**
- View all users with advanced filtering
- Change user roles and permissions
- Activate/deactivate user accounts
- Monitor user activity logs
- Handle suspicious activity reports

**Property Management:**
- Review and approve pending accommodations
- Manage all property listings
- Handle property disputes
- Monitor property performance metrics

**Food Provider Management:**
- Approve/reject food provider applications
- Manage restaurant listings
- Oversee menu item approvals
- Monitor food quality reports

**Analytics & Reporting:**
- Platform-wide dashboard with KPIs
- User growth and engagement metrics
- Revenue tracking and forecasting
- Booking and order analytics
- Generate comprehensive reports

**System Operations:**
- Platform configuration settings
- Security monitoring
- Performance optimization
- Backup and maintenance schedules

#### **Required Admin Screens**
1. **Dashboard** - Overview with key metrics
2. **User Management** - User list, roles, permissions
3. **Property Management** - Accommodation approvals, listings
4. **Food Provider Management** - Restaurant approvals, menu oversight
5. **Analytics Hub** - Detailed reports and charts
6. **System Settings** - Platform configuration
7. **Security Center** - Monitoring and alerts
8. **Reports Generator** - Custom report creation

#### **Admin API Endpoints**
```javascript
// User Management
GET    /users/admin/all                    - Get all users
GET    /users/admin/count                  - Get user count
PUT    /users/admin/:id/role               - Change user role
PUT    /users/admin/:id/status             - Change user status
GET    /users/admin/:id/activity-log       - Get user activity

// Property Management
GET    /accommodations/admin/pending       - Get pending accommodations
GET    /accommodations/admin/all           - Get all accommodations
PUT    /accommodations/admin/:id/approve   - Approve accommodation
PUT    /accommodations/admin/:id/reject    - Reject accommodation

// Food Provider Management
GET    /food-providers/admin/pending       - Get pending food providers
GET    /food-providers/admin/all           - Get all food providers
PUT    /food-providers/admin/:id/approve   - Approve food provider
PUT    /food-providers/admin/:id/reject    - Reject food provider

// Analytics
GET    /analytics/dashboard                - Get dashboard analytics
GET    /analytics/users                    - Get user analytics
GET    /analytics/bookings                 - Get booking analytics
GET    /analytics/orders                   - Get order analytics
```

---

### 🎓 **STUDENT MODULE**

#### **Core Functionalities**
**Accommodation Services:**
- Browse accommodations with advanced filters
- View detailed property information
- Compare multiple properties
- Book accommodations with flexible dates
- Manage booking history
- Rate and review accommodations

**Food Delivery Services:**
- Browse food providers and menus
- Filter by cuisine, price, ratings
- Place food orders with customization
- Track order status in real-time
- Manage order history
- Rate and review food providers

**Profile Management:**
- Complete student profile setup
- Manage personal information
- Upload identification documents
- Set preferences and notifications
- Track spending and statistics

**Communication:**
- In-app messaging with landlords
- Customer support chat
- Notification management
- Booking confirmations and updates

#### **Required Student Screens**
1. **Home Dashboard** - Quick actions and recent activity
2. **Accommodation Browser** - Search and filter properties
3. **Property Details** - Detailed property view with booking
4. **Food Providers** - Restaurant listings and menus
5. **Menu & Ordering** - Food ordering interface
6. **My Bookings** - Booking history and management
7. **My Orders** - Order history and tracking
8. **Profile Settings** - Personal information management
9. **Notifications** - System and booking notifications
10. **Support Center** - Help and customer service

#### **Student API Endpoints**
```javascript
// Accommodation Services
GET    /accommodations                     - Get all accommodations
GET    /accommodations/:id                 - Get accommodation details
GET    /accommodations/nearby              - Get nearby accommodations
POST   /bookings                           - Create new booking
GET    /bookings/my-bookings               - Get student's bookings

// Food Services
GET    /food-providers                     - Get all food providers
GET    /food-providers/:id                 - Get food provider details
POST   /orders                             - Create new order
GET    /orders/my-orders                   - Get student's orders
PUT    /orders/:id/status                  - Update order status

// Profile & Communication
GET    /auth/profile                       - Get user profile
PUT    /auth/profile                       - Update user profile
GET    /notifications                      - Get notifications
POST   /reviews                            - Create review
```

---

### 🏠 **LANDLORD MODULE**

#### **Core Functionalities**
**Property Management:**
- Add new property listings
- Edit property details and pricing
- Manage property images and descriptions
- Set availability calendars
- Monitor property performance

**Booking Management:**
- View and manage booking requests
- Accept/decline bookings
- Handle booking modifications
- Process refunds and cancellations
- Communicate with tenants

**Financial Management:**
- Track rental income and expenses
- Generate financial reports
- Manage payment methods
- Monitor revenue trends
- Export financial data

**Analytics & Insights:**
- Property performance metrics
- Booking success rates
- Revenue forecasting
- Market analysis
- Competitive insights

#### **Required Landlord Screens**
1. **Dashboard** - Overview of properties and bookings
2. **Property Management** - Add/edit property listings
3. **Booking Management** - Handle booking requests
4. **Financial Dashboard** - Revenue and expense tracking
5. **Analytics Center** - Performance metrics and insights
6. **Calendar Management** - Availability and scheduling
7. **Tenant Communication** - Messaging and support
8. **Profile Settings** - Business information management
9. **Reports Generator** - Financial and performance reports

#### **Landlord API Endpoints**
```javascript
// Property Management
GET    /accommodations/landlord            - Get landlord's properties
POST   /accommodations                     - Create new property
PUT    /accommodations/:id                 - Update property
DELETE /accommodations/:id                 - Delete property
GET    /accommodations/landlord/dashboard  - Get landlord dashboard

// Booking Management
GET    /bookings/landlord                  - Get landlord's bookings
PUT    /bookings/:id/status                - Update booking status
GET    /bookings/landlord/stats            - Get booking statistics

// Financial Management
GET    /bookings/landlord/revenue          - Get revenue statistics
GET    /users/landlord/statistics          - Get landlord statistics
GET    /users/landlord/revenue             - Get revenue data
```

---

### 🍕 **FOOD PROVIDER MODULE**

#### **Core Functionalities**
**Restaurant Management:**
- Create and manage restaurant profiles
- Update business information
- Manage operating hours
- Handle multiple restaurant locations

**Menu Management:**
- Create comprehensive menus
- Add/edit menu items with descriptions
- Set pricing and availability
- Manage food categories
- Upload food images

**Order Management:**
- Receive and process orders
- Update order status in real-time
- Handle order modifications
- Manage delivery logistics
- Process refunds

**Analytics & Performance:**
- Track order volumes and trends
- Monitor revenue and profits
- Analyze customer preferences
- Performance benchmarking
- Marketing insights

#### **Required Food Provider Screens**
1. **Dashboard** - Overview of orders and performance
2. **Restaurant Management** - Business profile and settings
3. **Menu Management** - Create and edit menu items
4. **Order Management** - Process incoming orders
5. **Analytics Center** - Performance metrics and insights
6. **Financial Dashboard** - Revenue and profit tracking
7. **Customer Reviews** - Review management and responses
8. **Profile Settings** - Business information management
9. **Reports Generator** - Sales and performance reports

#### **Food Provider API Endpoints**
```javascript
// Restaurant Management
POST   /food-providers                     - Create food provider business
GET    /food-providers/owner/my-providers  - Get my food providers
PUT    /food-providers/:id                 - Update food provider
GET    /food-providers/owner/dashboard     - Get provider dashboard

// Menu Management
GET    /food-providers/owner/menu-items/:providerId - Get menu items
POST   /food-providers/owner/menu-items/:providerId - Create menu item
PUT    /food-providers/owner/menu-items/:providerId/:itemId - Update menu item
DELETE /food-providers/owner/menu-items/:providerId/:itemId - Delete menu item

// Order Management
GET    /orders/provider-orders             - Get food provider orders
PUT    /orders/:id/status                  - Update order status
GET    /food-providers/owner/analytics     - Get provider analytics
```

---

## 🎨 **UI/UX Design Specifications**

### **Design Philosophy**
- **Modern & Clean**: Minimalist design with intuitive navigation
- **Mobile-First**: Responsive design for all devices
- **Accessibility**: WCAG 2.1 compliant for all users
- **Performance**: Fast loading with optimized components
- **Consistency**: Unified design language across all modules

### **Color Scheme**
```css
/* Primary Colors */
--primary-blue: #2563eb;
--primary-dark: #1e40af;
--primary-light: #3b82f6;

/* Secondary Colors */
--secondary-green: #10b981;
--secondary-orange: #f59e0b;
--secondary-red: #ef4444;

/* Neutral Colors */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;

/* Status Colors */
--success: #22c55e;
--warning: #eab308;
--error: #ef4444;
--info: #3b82f6;
```

### **Typography**
```css
/* Font Families */
--font-primary: 'Inter', sans-serif;
--font-secondary: 'Poppins', sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
```

### **Component Library**
```javascript
// Button Variants
<Button variant="primary" size="md" />
<Button variant="secondary" size="sm" />
<Button variant="outline" size="lg" />
<Button variant="ghost" size="xs" />

// Card Components
<Card className="shadow-lg">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>

// Navigation Components
<Navbar>
  <NavbarBrand />
  <NavbarNav>
    <NavItem>
      <NavLink href="/dashboard">Dashboard</NavLink>
    </NavItem>
  </NavbarNav>
</Navbar>

// Form Components
<Form>
  <FormGroup>
    <Label>Email</Label>
    <Input type="email" placeholder="Enter email" />
    <FormText>Helper text</FormText>
  </FormGroup>
</Form>
```

---

## 🔧 **Technical Implementation**

### **Frontend Architecture**
```javascript
// Project Structure
src/
├── components/
│   ├── common/          // Shared components
│   ├── admin/           // Admin-specific components
│   ├── student/         // Student-specific components
│   ├── landlord/        // Landlord-specific components
│   └── food-provider/   // Food provider-specific components
├── pages/
│   ├── admin/
│   ├── student/
│   ├── landlord/
│   └── food-provider/
├── services/
│   ├── api/             // API service layer
│   ├── auth/            // Authentication service
│   └── utils/           // Utility functions
├── store/
│   ├── slices/          // Redux slices
│   └── index.js         // Store configuration
├── hooks/               // Custom React hooks
├── utils/               // Helper functions
└── styles/              // Global styles and themes
```

### **State Management**
```javascript
// Redux Store Structure
{
  auth: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false
  },
  accommodations: {
    list: [],
    filters: {},
    loading: false,
    error: null
  },
  bookings: {
    list: [],
    current: null,
    loading: false
  },
  orders: {
    list: [],
    current: null,
    loading: false
  },
  admin: {
    users: [],
    analytics: {},
    loading: false
  }
}
```

### **API Service Layer**
```javascript
// Base API Service
class ApiService {
  constructor() {
    this.baseURL = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api';
    this.token = localStorage.getItem('staykaru_token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

// Service Implementations
class AuthService extends ApiService {
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (data.access_token) {
      this.token = data.access_token;
      localStorage.setItem('staykaru_token', this.token);
    }
    
    return data;
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }
}

class AccommodationService extends ApiService {
  async getAll(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request(`/accommodations?${queryParams}`);
  }

  async getById(id) {
    return this.request(`/accommodations/${id}`);
  }

  async create(data) {
    return this.request('/accommodations', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}
```

---

## 📱 **Screen Specifications**

### **Common Navigation Structure**
```javascript
// Main Navigation Bar
<Navbar className="bg-white shadow-sm border-b">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between h-16">
      <div className="flex items-center">
        <Logo className="h-8 w-auto" />
        <NavigationMenu role={user.role} />
      </div>
      <div className="flex items-center space-x-4">
        <NotificationBell />
        <UserProfileDropdown />
      </div>
    </div>
  </div>
</Navbar>

// Sidebar Navigation (for dashboard pages)
<Sidebar className="w-64 bg-gray-50 min-h-screen">
  <SidebarNav>
    <SidebarItem icon={<DashboardIcon />} href="/dashboard">
      Dashboard
    </SidebarItem>
    <SidebarItem icon={<UsersIcon />} href="/users">
      Users
    </SidebarItem>
    // ... more navigation items
  </SidebarNav>
</Sidebar>
```

### **Admin Dashboard Screen**
```javascript
// Admin Dashboard Layout
<AdminDashboard>
  <DashboardHeader>
    <h1>Admin Dashboard</h1>
    <DateRangePicker />
  </DashboardHeader>
  
  <MetricsGrid>
    <MetricCard
      title="Total Users"
      value="12,345"
      change="+12%"
      icon={<UsersIcon />}
    />
    <MetricCard
      title="Active Properties"
      value="8,901"
      change="+8%"
      icon={<HomeIcon />}
    />
    <MetricCard
      title="Food Providers"
      value="2,345"
      change="+15%"
      icon={<RestaurantIcon />}
    />
    <MetricCard
      title="Total Revenue"
      value="$45,678"
      change="+23%"
      icon={<CurrencyIcon />}
    />
  </MetricsGrid>
  
  <ChartsSection>
    <Card>
      <CardHeader>
        <CardTitle>User Growth</CardTitle>
      </CardHeader>
      <CardContent>
        <LineChart data={userGrowthData} />
      </CardContent>
    </Card>
    
    <Card>
      <CardHeader>
        <CardTitle>Revenue Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <BarChart data={revenueData} />
      </CardContent>
    </Card>
  </ChartsSection>
  
  <RecentActivity>
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ActivityList>
          <ActivityItem
            type="user_registration"
            message="New user registered"
            timestamp="2 minutes ago"
          />
          <ActivityItem
            type="property_approval"
            message="Property approved"
            timestamp="5 minutes ago"
          />
        </ActivityList>
      </CardContent>
    </Card>
  </RecentActivity>
</AdminDashboard>
```

### **Student Accommodation Browser**
```javascript
// Accommodation Browser Screen
<AccommodationBrowser>
  <BrowserHeader>
    <SearchBar
      placeholder="Search accommodations..."
      onSearch={handleSearch}
    />
    <FilterButton onClick={openFilters} />
  </BrowserHeader>
  
  <FilterSidebar isOpen={filtersOpen}>
    <FilterGroup title="Price Range">
      <RangeSlider
        min={0}
        max={5000}
        value={priceRange}
        onChange={setPriceRange}
      />
    </FilterGroup>
    
    <FilterGroup title="Amenities">
      <CheckboxGroup>
        <Checkbox label="WiFi" />
        <Checkbox label="Kitchen" />
        <Checkbox label="AC" />
        <Checkbox label="Parking" />
      </CheckboxGroup>
    </FilterGroup>
    
    <FilterGroup title="Location">
      <Select
        options={cities}
        placeholder="Select city"
        onChange={setSelectedCity}
      />
    </FilterGroup>
  </FilterSidebar>
  
  <AccommodationGrid>
    {accommodations.map(accommodation => (
      <AccommodationCard
        key={accommodation.id}
        accommodation={accommodation}
        onView={handleViewDetails}
        onBookmark={handleBookmark}
      />
    ))}
  </AccommodationGrid>
  
  <Pagination
    currentPage={currentPage}
    totalPages={totalPages}
    onPageChange={setCurrentPage}
  />
</AccommodationBrowser>
```

### **Landlord Property Management**
```javascript
// Property Management Screen
<PropertyManagement>
  <ManagementHeader>
    <h1>My Properties</h1>
    <Button onClick={openAddProperty}>
      <PlusIcon /> Add Property
    </Button>
  </ManagementHeader>
  
  <PropertyList>
    {properties.map(property => (
      <PropertyCard key={property.id}>
        <PropertyImage src={property.images[0]} />
        <PropertyInfo>
          <PropertyTitle>{property.title}</PropertyTitle>
          <PropertyLocation>{property.location}</PropertyLocation>
          <PropertyPrice>₹{property.price}/month</PropertyPrice>
          <PropertyStatus status={property.status} />
        </PropertyInfo>
        <PropertyActions>
          <Button variant="outline" onClick={() => editProperty(property.id)}>
            Edit
          </Button>
          <Button variant="outline" onClick={() => viewBookings(property.id)}>
            Bookings
          </Button>
          <DropdownMenu>
            <DropdownItem onClick={() => toggleStatus(property.id)}>
              {property.isActive ? 'Deactivate' : 'Activate'}
            </DropdownItem>
            <DropdownItem onClick={() => deleteProperty(property.id)}>
              Delete
            </DropdownItem>
          </DropdownMenu>
        </PropertyActions>
      </PropertyCard>
    ))}
  </PropertyList>
  
  <AddPropertyModal
    isOpen={addPropertyOpen}
    onClose={closeAddProperty}
    onSubmit={handleAddProperty}
  />
</PropertyManagement>
```

### **Food Provider Order Management**
```javascript
// Order Management Screen
<OrderManagement>
  <OrderHeader>
    <h1>Order Management</h1>
    <OrderStats>
      <StatCard title="Pending Orders" value={pendingOrders.length} />
      <StatCard title="Completed Today" value={completedToday} />
      <StatCard title="Revenue Today" value={`₹${todayRevenue}`} />
    </OrderStats>
  </OrderHeader>
  
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
              </OrderHeader>
              <OrderItems>
                {order.items.map(item => (
                  <OrderItem key={item.id}>
                    <ItemName>{item.name}</ItemName>
                    <ItemQuantity>x{item.quantity}</ItemQuantity>
                  </OrderItem>
                ))}
              </OrderItems>
              <OrderTotal>Total: ₹{order.total}</OrderTotal>
              <OrderActions>
                <Button onClick={() => acceptOrder(order.id)}>
                  Accept
                </Button>
                <Button variant="outline" onClick={() => rejectOrder(order.id)}>
                  Reject
                </Button>
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

## 🔐 **Authentication & Security**

### **Authentication Flow**
```javascript
// Login Component
<LoginForm>
  <FormGroup>
    <Label>Email</Label>
    <Input
      type="email"
      value={email}
      onChange={setEmail}
      required
    />
  </FormGroup>
  
  <FormGroup>
    <Label>Password</Label>
    <Input
      type="password"
      value={password}
      onChange={setPassword}
      required
    />
  </FormGroup>
  
  <FormGroup>
    <Label>Role</Label>
    <Select
      value={role}
      onChange={setRole}
      options={[
        { value: 'student', label: 'Student' },
        { value: 'landlord', label: 'Landlord' },
        { value: 'food_provider', label: 'Food Provider' },
        { value: 'admin', label: 'Admin' }
      ]}
    />
  </FormGroup>
  
  <Button type="submit" loading={loading}>
    Login
  </Button>
</LoginForm>
```

### **Protected Routes**
```javascript
// Route Protection
<ProtectedRoute
  component={AdminDashboard}
  allowedRoles={['admin']}
  redirectTo="/login"
/>

<ProtectedRoute
  component={StudentDashboard}
  allowedRoles={['student']}
  redirectTo="/login"
/>
```

---

## 📊 **Real-time Features**

### **WebSocket Integration**
```javascript
// WebSocket Service
class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(token) {
    this.ws = new WebSocket(`wss://staykaru-backend-60ed08adb2a7.herokuapp.com?token=${token}`);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };

    this.ws.onclose = () => {
      this.reconnect();
    };
  }

  handleMessage(data) {
    switch (data.type) {
      case 'new_booking':
        // Handle new booking notification
        break;
      case 'order_status_update':
        // Handle order status update
        break;
      case 'user_activity':
        // Handle user activity notification
        break;
    }
  }
}
```

### **Real-time Notifications**
```javascript
// Notification Component
<NotificationCenter>
  <NotificationBell count={unreadCount} />
  <NotificationDropdown>
    {notifications.map(notification => (
      <NotificationItem
        key={notification.id}
        type={notification.type}
        message={notification.message}
        timestamp={notification.timestamp}
        isRead={notification.isRead}
        onClick={() => markAsRead(notification.id)}
      />
    ))}
  </NotificationDropdown>
</NotificationCenter>
```

---

## 🎨 **Advanced UI Components**

### **Data Visualization**
```javascript
// Chart Components
<AnalyticsChart>
  <ChartHeader>
    <ChartTitle>Revenue Trends</ChartTitle>
    <ChartControls>
      <TimeRangeSelector />
      <ExportButton />
    </ChartControls>
  </ChartHeader>
  <ChartContainer>
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={revenueData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="revenue" stroke="#2563eb" />
      </LineChart>
    </ResponsiveContainer>
  </ChartContainer>
</AnalyticsChart>
```

### **Interactive Maps**
```javascript
// Map Component for Accommodation Locations
<AccommodationMap>
  <MapContainer center={[31.5497, 74.3436]} zoom={13}>
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution='&copy; OpenStreetMap contributors'
    />
    {accommodations.map(accommodation => (
      <Marker
        key={accommodation.id}
        position={[
          accommodation.location.coordinates[1],
          accommodation.location.coordinates[0]
        ]}
      >
        <Popup>
          <AccommodationPopup accommodation={accommodation} />
        </Popup>
      </Marker>
    ))}
  </MapContainer>
</AccommodationMap>
```

---

## 🔧 **Performance Optimization**

### **Code Splitting**
```javascript
// Lazy Loading Components
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const LandlordDashboard = lazy(() => import('./pages/landlord/Dashboard'));
const FoodProviderDashboard = lazy(() => import('./pages/food-provider/Dashboard'));

// Route Configuration
<Routes>
  <Route path="/admin/*" element={
    <Suspense fallback={<LoadingSpinner />}>
      <AdminDashboard />
    </Suspense>
  } />
</Routes>
```

### **Data Caching**
```javascript
// React Query Configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false
    }
  }
});

// Custom Hooks
const useAccommodations = (filters) => {
  return useQuery({
    queryKey: ['accommodations', filters],
    queryFn: () => accommodationService.getAll(filters),
    keepPreviousData: true
  });
};
```

---

## 📱 **Mobile Responsiveness**

### **Responsive Design Patterns**
```css
/* Mobile-First Approach */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  padding: 1rem;
}

@media (min-width: 768px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    padding: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    padding: 2rem;
  }
}

@media (min-width: 1280px) {
  .dashboard-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### **Touch-Friendly Interface**
```javascript
// Mobile Navigation
<MobileNav>
  <MobileNavToggle />
  <MobileNavMenu>
    <MobileNavItem href="/dashboard">Dashboard</MobileNavItem>
    <MobileNavItem href="/properties">Properties</MobileNavItem>
    <MobileNavItem href="/bookings">Bookings</MobileNavItem>
    <MobileNavItem href="/profile">Profile</MobileNavItem>
  </MobileNavMenu>
</MobileNav>
```

---

## 🎯 **Success Metrics & KPIs**

### **Performance Metrics**
- **Page Load Time**: < 3 seconds
- **First Contentful Paint**: < 1.5 seconds
- **Time to Interactive**: < 5 seconds
- **Lighthouse Score**: > 90

### **User Experience Metrics**
- **User Satisfaction**: > 4.5/5
- **Task Completion Rate**: > 95%
- **Error Rate**: < 1%
- **Mobile Usability**: 100%

### **Business Metrics**
- **User Retention**: > 80%
- **Conversion Rate**: > 15%
- **Revenue Growth**: 25% YoY
- **Customer Support Tickets**: < 5% of users

---

## 🚀 **Deployment & DevOps**

### **Build Configuration**
```javascript
// Webpack Configuration
module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
};
```

### **Environment Configuration**
```javascript
// Environment Variables
REACT_APP_API_URL=https://staykaru-backend-60ed08adb2a7.herokuapp.com/api
REACT_APP_WS_URL=wss://staykaru-backend-60ed08adb2a7.herokuapp.com
REACT_APP_MAPS_API_KEY=your_maps_api_key
REACT_APP_ENVIRONMENT=production
```

---

## 📋 **Testing Strategy**

### **Unit Testing**
```javascript
// Component Testing
describe('AccommodationCard', () => {
  test('renders accommodation information correctly', () => {
    const accommodation = {
      id: 1,
      title: 'Test Accommodation',
      price: 1000,
      location: 'Test Location'
    };
    
    render(<AccommodationCard accommodation={accommodation} />);
    
    expect(screen.getByText('Test Accommodation')).toBeInTheDocument();
    expect(screen.getByText('₹1000/month')).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
  });
});
```

### **Integration Testing**
```javascript
// API Integration Testing
describe('AccommodationService', () => {
  test('fetches accommodations successfully', async () => {
    const mockAccommodations = [
      { id: 1, title: 'Test Accommodation' }
    ];
    
    jest.spyOn(accommodationService, 'getAll')
      .mockResolvedValue(mockAccommodations);
    
    const result = await accommodationService.getAll();
    
    expect(result).toEqual(mockAccommodations);
  });
});
```

---

## 🎯 **Conclusion**

This comprehensive guide provides everything needed to create a world-class frontend application for the StayKaru platform. The implementation should focus on:

1. **User Experience**: Intuitive, responsive, and accessible design
2. **Performance**: Fast loading and smooth interactions
3. **Scalability**: Modular architecture for future growth
4. **Security**: Robust authentication and data protection
5. **Real-time Features**: Live updates and notifications
6. **Cross-platform**: Works seamlessly on desktop and mobile

The frontend application will serve as the primary interface for all stakeholders, providing a seamless and enjoyable experience while maintaining high performance and security standards.

---

**Total Estimated Development Time**: 12-16 weeks
**Team Size**: 4-6 developers (Frontend, UI/UX, Testing)
**Technology Stack**: React, Redux, TypeScript, Tailwind CSS
**Success Criteria**: 95% user satisfaction, < 3s load time, 100% mobile compatibility
