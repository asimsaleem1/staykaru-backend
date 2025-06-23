# StayKaru Frontend Development Guide

## Introduction

This guide provides comprehensive instructions for developing the StayKaru frontend application. It is specifically designed to complement the `STUDENT_MODULE_COMPREHENSIVE_TEST.ps1` test script by ensuring all frontend elements correctly integrate with the API endpoints being tested.

## Project Setup

### Prerequisites

- Node.js 16.x or higher
- npm 8.x or higher
- Git
- VS Code or preferred IDE
- Backend API running at `https://staykaru-backend-60ed08adb2a7.herokuapp.com`

### Initial Setup

```bash
# Clone the frontend repository
git clone https://github.com/staykaru/frontend.git

# Navigate to project directory
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with API URL
echo "REACT_APP_API_URL=https://staykaru-backend-60ed08adb2a7.herokuapp.com/api" >> .env

# Start development server
npm start
```

## Architecture

The StayKaru frontend is built using:

- **React**: UI library
- **Redux**: State management
- **React Router**: Navigation
- **Axios**: API requests
- **Material UI**: Component library
- **Styled Components**: CSS-in-JS styling
- **Formik**: Form handling
- **Yup**: Form validation

### Project Structure

```
src/
├── assets/           # Static assets (images, icons, etc.)
├── components/       # Reusable UI components
│   ├── common/       # Generic components (buttons, inputs, etc.)
│   ├── layout/       # Layout components (header, footer, etc.)
│   └── modules/      # Feature-specific components
├── config/           # Configuration files
├── contexts/         # React contexts
├── hooks/            # Custom React hooks
├── pages/            # Page components
├── redux/            # Redux store, actions, reducers
│   ├── actions/
│   ├── reducers/
│   └── store.js
├── services/         # API service functions
├── styles/           # Global styles
├── utils/            # Utility functions
├── App.js            # Main App component
└── index.js          # Entry point
```

## Core Features Implementation

### 1. Authentication Module

#### Login Implementation

```jsx
// src/pages/Login/index.jsx
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../../redux/actions/authActions';
import { useFormik } from 'formik';
import * as Yup from 'yup';
// ... other imports

const Login = () => {
  const dispatch = useDispatch();
  const [error, setError] = useState(null);
  
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email').required('Required'),
      password: Yup.string().required('Required'),
    }),
    onSubmit: async (values) => {
      try {
        await dispatch(login(values));
        // Redirect to dashboard on success
      } catch (err) {
        setError(err.response?.data?.message || 'Login failed');
      }
    },
  });
  
  return (
    <div className="login-container">
      <h1>Login to StayKaru</h1>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={formik.handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
            data-testid="email-input"
          />
          {formik.touched.email && formik.errors.email ? (
            <div className="error">{formik.errors.email}</div>
          ) : null}
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
            data-testid="password-input"
          />
          {formik.touched.password && formik.errors.password ? (
            <div className="error">{formik.errors.password}</div>
          ) : null}
        </div>
        
        <button type="submit" data-testid="login-button">
          Login
        </button>
      </form>
      
      <div className="login-options">
        <a href="/forgot-password">Forgot Password?</a>
        <a href="/register">Register as a Student</a>
      </div>
    </div>
  );
};

export default Login;
```

#### Authentication Service

```javascript
// src/services/authService.js
import axios from 'axios';
import { API_URL } from '../config/constants';

export const authService = {
  login: async (credentials) => {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  register: async (userData) => {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  },
  
  getProfile: async () => {
    const response = await axios.get(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  }
};
```

### 2. Student Dashboard

#### Dashboard Layout

```jsx
// src/pages/Dashboard/index.jsx
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDashboardData } from '../../redux/actions/dashboardActions';
import DashboardHeader from '../../components/modules/dashboard/DashboardHeader';
import OverviewSection from '../../components/modules/dashboard/OverviewSection';
import QuickActionCards from '../../components/modules/dashboard/QuickActionCards';
import AccommodationHighlights from '../../components/modules/dashboard/AccommodationHighlights';
import FoodServicesHighlights from '../../components/modules/dashboard/FoodServicesHighlights';
import UpcomingEvents from '../../components/modules/dashboard/UpcomingEvents';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { loading, data, error } = useSelector(state => state.dashboard);
  const user = useSelector(state => state.auth.user);
  
  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);
  
  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error loading dashboard: {error}</div>;
  
  return (
    <div className="dashboard-container">
      <DashboardHeader user={user} />
      
      <div className="dashboard-content">
        <OverviewSection 
          bookings={data?.bookings}
          orders={data?.orders}
          notifications={data?.notifications}
        />
        
        <QuickActionCards />
        
        <div className="dashboard-highlights">
          <AccommodationHighlights accommodations={data?.accommodations} />
          <FoodServicesHighlights foodProviders={data?.foodProviders} />
        </div>
        
        <UpcomingEvents events={data?.events} />
      </div>
    </div>
  );
};

export default Dashboard;
```

### 3. Accommodation Module

#### Accommodation Listing

```jsx
// src/pages/Accommodations/index.jsx
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchAccommodations,
  setFilters,
  setSortBy
} from '../../redux/actions/accommodationActions';
import AccommodationFilters from '../../components/modules/accommodations/AccommodationFilters';
import AccommodationCard from '../../components/modules/accommodations/AccommodationCard';
import Pagination from '../../components/common/Pagination';
import ViewToggle from '../../components/common/ViewToggle';
import MapView from '../../components/modules/accommodations/MapView';

const Accommodations = () => {
  const dispatch = useDispatch();
  const { accommodations, loading, error, filters, pagination } = useSelector(state => state.accommodations);
  const [viewType, setViewType] = useState('grid'); // 'grid' or 'map'
  
  useEffect(() => {
    dispatch(fetchAccommodations(filters, pagination.page));
  }, [dispatch, filters, pagination.page]);
  
  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
  };
  
  const handleSortChange = (sortBy) => {
    dispatch(setSortBy(sortBy));
  };
  
  const handlePageChange = (page) => {
    dispatch(changePage(page));
  };
  
  if (loading) return <div>Loading accommodations...</div>;
  if (error) return <div>Error loading accommodations: {error}</div>;
  
  return (
    <div className="accommodations-page">
      <div className="page-header">
        <h1>Find Your Accommodation</h1>
        <ViewToggle value={viewType} onChange={setViewType} />
      </div>
      
      <div className="accommodations-container">
        <div className="filters-sidebar">
          <AccommodationFilters 
            filters={filters}
            onChange={handleFilterChange}
          />
        </div>
        
        <div className="accommodations-content">
          <div className="sorting-options">
            <select onChange={(e) => handleSortChange(e.target.value)}>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Rating: High to Low</option>
              <option value="distance_asc">Distance: Nearest</option>
            </select>
          </div>
          
          {viewType === 'grid' ? (
            <div className="accommodations-grid">
              {accommodations.map(accommodation => (
                <AccommodationCard 
                  key={accommodation._id}
                  accommodation={accommodation}
                  data-testid="accommodation-card"
                />
              ))}
            </div>
          ) : (
            <MapView accommodations={accommodations} />
          )}
          
          <Pagination 
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Accommodations;
```

### 4. Booking Management

#### Booking Creation

```jsx
// src/pages/BookingForm/index.jsx
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { createBooking } from '../../redux/actions/bookingActions';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import DateRangePicker from '../../components/common/DateRangePicker';

const BookingForm = () => {
  const { accommodationId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const { accommodation } = useSelector(state => state.accommodationDetail);
  
  const formik = useFormik({
    initialValues: {
      accommodation: accommodationId,
      start_date: '',
      end_date: '',
      guests: 1,
      payment_method: 'card',
      special_requests: '',
    },
    validationSchema: Yup.object({
      start_date: Yup.date().required('Check-in date is required'),
      end_date: Yup.date().required('Check-out date is required')
        .min(Yup.ref('start_date'), 'Check-out date cannot be before check-in date'),
      guests: Yup.number().required('Number of guests is required')
        .min(1, 'At least 1 guest is required')
        .max(10, 'Maximum 10 guests allowed'),
      payment_method: Yup.string().required('Payment method is required'),
    }),
    onSubmit: async (values) => {
      try {
        // Calculate total based on selected dates and accommodation price
        const startDate = new Date(values.start_date);
        const endDate = new Date(values.end_date);
        const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        const total_amount = nights * accommodation.price;
        
        // Create booking with calculated total
        await dispatch(createBooking({
          ...values,
          total_amount
        }));
        
        navigate('/booking-confirmation');
      } catch (err) {
        setError(err.response?.data?.message || 'Booking failed');
      }
    },
  });
  
  const handleDateChange = (range) => {
    formik.setFieldValue('start_date', range.startDate);
    formik.setFieldValue('end_date', range.endDate);
  };
  
  return (
    <div className="booking-form-container">
      <h1>Book Your Stay</h1>
      <h2>{accommodation?.title}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={formik.handleSubmit}>
        <div className="form-group">
          <label>Stay Dates</label>
          <DateRangePicker
            startDateId="check-in"
            endDateId="check-out"
            startDate={formik.values.start_date}
            endDate={formik.values.end_date}
            onDatesChange={handleDateChange}
            data-testid="date-range-picker"
          />
          {(formik.touched.start_date && formik.errors.start_date) || 
           (formik.touched.end_date && formik.errors.end_date) ? (
            <div className="error">
              {formik.errors.start_date || formik.errors.end_date}
            </div>
          ) : null}
        </div>
        
        <div className="form-group">
          <label htmlFor="guests">Number of Guests</label>
          <select
            id="guests"
            name="guests"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.guests}
            data-testid="guests-select"
          >
            {[...Array(10).keys()].map(i => (
              <option key={i+1} value={i+1}>{i+1}</option>
            ))}
          </select>
          {formik.touched.guests && formik.errors.guests ? (
            <div className="error">{formik.errors.guests}</div>
          ) : null}
        </div>
        
        <div className="form-group">
          <label htmlFor="payment_method">Payment Method</label>
          <select
            id="payment_method"
            name="payment_method"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.payment_method}
          >
            <option value="card">Credit/Debit Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="paypal">PayPal</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="special_requests">Special Requests</label>
          <textarea
            id="special_requests"
            name="special_requests"
            onChange={formik.handleChange}
            value={formik.values.special_requests}
            placeholder="Any special requests for your stay?"
          />
        </div>
        
        <div className="booking-summary">
          <h3>Booking Summary</h3>
          <div className="summary-row">
            <span>Accommodation:</span>
            <span>{accommodation?.title}</span>
          </div>
          <div className="summary-row">
            <span>Price per night:</span>
            <span>${accommodation?.price}</span>
          </div>
          <div className="summary-row">
            <span>Total days:</span>
            <span>
              {formik.values.start_date && formik.values.end_date ? 
                Math.ceil((new Date(formik.values.end_date) - new Date(formik.values.start_date)) / (1000 * 60 * 60 * 24)) :
                0
              }
            </span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>
              ${formik.values.start_date && formik.values.end_date ?
                Math.ceil((new Date(formik.values.end_date) - new Date(formik.values.start_date)) / (1000 * 60 * 60 * 24)) * accommodation?.price :
                0
              }
            </span>
          </div>
        </div>
        
        <button 
          type="submit" 
          className="primary-button"
          data-testid="confirm-booking"
        >
          Confirm Booking
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
```

### 5. Food Service Module

#### Food Provider Listing

```jsx
// src/pages/FoodProviders/index.jsx
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFoodProviders } from '../../redux/actions/foodActions';
import FoodProviderCard from '../../components/modules/food/FoodProviderCard';
import FoodFilters from '../../components/modules/food/FoodFilters';

const FoodProviders = () => {
  const dispatch = useDispatch();
  const { foodProviders, loading, error, filters } = useSelector(state => state.food);
  
  useEffect(() => {
    dispatch(fetchFoodProviders(filters));
  }, [dispatch, filters]);
  
  if (loading) return <div>Loading food providers...</div>;
  if (error) return <div>Error loading food providers: {error}</div>;
  
  return (
    <div className="food-providers-page">
      <div className="page-header">
        <h1>Food Providers</h1>
      </div>
      
      <div className="food-providers-container">
        <div className="filters-sidebar">
          <FoodFilters />
        </div>
        
        <div className="food-providers-grid">
          {foodProviders.map(provider => (
            <FoodProviderCard 
              key={provider._id} 
              provider={provider} 
              data-testid="food-provider-card"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FoodProviders;
```

#### Order Creation

```jsx
// src/pages/OrderCheckout/index.jsx
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { createOrder } from '../../redux/actions/orderActions';
import { fetchMenuItems } from '../../redux/actions/foodActions';
import CartItem from '../../components/modules/food/CartItem';
import AddressForm from '../../components/modules/food/AddressForm';
import PaymentMethodSelect from '../../components/common/PaymentMethodSelect';

const OrderCheckout = () => {
  const { providerId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const { cart, foodProvider, menuItems } = useSelector(state => state.food);
  const [deliveryAddress, setDeliveryAddress] = useState({
    address: '',
    landmark: '',
    coordinates: {
      latitude: null,
      longitude: null
    }
  });
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  
  useEffect(() => {
    if (providerId) {
      dispatch(fetchMenuItems(providerId));
    }
  }, [dispatch, providerId]);
  
  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const menuItem = menuItems.find(mi => mi._id === item.menu_item);
      return total + (menuItem?.price || 0) * item.quantity;
    }, 0);
  };
  
  const handleAddressChange = (address) => {
    setDeliveryAddress(address);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const orderData = {
        food_provider: providerId,
        total_amount: calculateTotal(),
        items: cart.map(item => ({
          menu_item: item.menu_item,
          quantity: item.quantity,
          special_instructions: item.special_instructions
        })),
        delivery_location: deliveryAddress,
        delivery_instructions: deliveryInstructions
      };
      
      await dispatch(createOrder(orderData));
      navigate('/order-confirmation');
    } catch (err) {
      setError(err.response?.data?.message || 'Order creation failed');
    }
  };
  
  return (
    <div className="order-checkout-container">
      <h1>Checkout</h1>
      <h2>{foodProvider?.name}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="checkout-container">
          <div className="cart-items-section">
            <h3>Your Order</h3>
            {cart.length === 0 ? (
              <p>Your cart is empty</p>
            ) : (
              <div className="cart-items-list">
                {cart.map((item, index) => {
                  const menuItem = menuItems.find(mi => mi._id === item.menu_item);
                  return (
                    <CartItem 
                      key={index}
                      item={{
                        ...item,
                        name: menuItem?.name,
                        price: menuItem?.price
                      }}
                    />
                  );
                })}
              </div>
            )}
            
            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Fee:</span>
                <span>$3.99</span>
              </div>
              <div className="summary-row">
                <span>Service Fee:</span>
                <span>$2.50</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>${(calculateTotal() + 3.99 + 2.50).toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="delivery-details-section">
            <h3>Delivery Details</h3>
            
            <AddressForm onChange={handleAddressChange} />
            
            <div className="form-group">
              <label htmlFor="delivery_instructions">Delivery Instructions</label>
              <textarea
                id="delivery_instructions"
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                placeholder="E.g. Ring doorbell, call when you arrive, etc."
              />
            </div>
            
            <PaymentMethodSelect />
            
            <button 
              type="submit" 
              className="primary-button"
              disabled={cart.length === 0 || !deliveryAddress.address}
            >
              Place Order
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default OrderCheckout;
```

### 6. API Integration Services

```javascript
// src/services/api.js
import axios from 'axios';
import { API_URL } from '../config/constants';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Add authorization header interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response error interceptor for 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

```javascript
// src/services/accommodationService.js
import api from './api';

export const accommodationService = {
  getAll: async (filters = {}, page = 1, limit = 10) => {
    const response = await api.get('/accommodations', {
      params: {
        page,
        limit,
        ...filters
      }
    });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/accommodations/${id}`);
    return response.data;
  },
  
  getNearby: async (lat, lng, radius = 10) => {
    const response = await api.get(`/accommodations/nearby`, {
      params: { lat, lng, radius }
    });
    return response.data;
  },
  
  toggleFavorite: async (accommodationId) => {
    const response = await api.post(`/accommodations/${accommodationId}/favorite`);
    return response.data;
  }
};
```

```javascript
// src/services/bookingService.js
import api from './api';

export const bookingService = {
  create: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },
  
  getMyBookings: async () => {
    const response = await api.get('/bookings/my-bookings');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },
  
  cancel: async (id, reason) => {
    const response = await api.put(`/bookings/${id}/cancel`, { reason });
    return response.data;
  }
};
```

```javascript
// src/services/foodService.js
import api from './api';

export const foodService = {
  getFoodProviders: async (filters = {}) => {
    const response = await api.get('/food-providers', {
      params: filters
    });
    return response.data;
  },
  
  getFoodProviderById: async (id) => {
    const response = await api.get(`/food-providers/${id}`);
    return response.data;
  },
  
  getMenuItems: async (providerId) => {
    const response = await api.get(`/menu-items`, {
      params: { foodProvider: providerId }
    });
    return response.data;
  },
  
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  
  getMyOrders: async () => {
    const response = await api.get('/orders/my-orders');
    return response.data;
  },
  
  trackOrder: async (orderId) => {
    const response = await api.get(`/orders/${orderId}/track`);
    return response.data;
  }
};
```

## Data Flow & State Management

### Redux Actions and Reducers

```javascript
// src/redux/actions/actionTypes.js
// Authentication
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGOUT = 'LOGOUT';

// Accommodations
export const FETCH_ACCOMMODATIONS_REQUEST = 'FETCH_ACCOMMODATIONS_REQUEST';
export const FETCH_ACCOMMODATIONS_SUCCESS = 'FETCH_ACCOMMODATIONS_SUCCESS';
export const FETCH_ACCOMMODATIONS_FAILURE = 'FETCH_ACCOMMODATIONS_FAILURE';
export const SET_ACCOMMODATION_FILTERS = 'SET_ACCOMMODATION_FILTERS';
export const SET_ACCOMMODATION_SORT = 'SET_ACCOMMODATION_SORT';

// Bookings
export const CREATE_BOOKING_REQUEST = 'CREATE_BOOKING_REQUEST';
export const CREATE_BOOKING_SUCCESS = 'CREATE_BOOKING_SUCCESS';
export const CREATE_BOOKING_FAILURE = 'CREATE_BOOKING_FAILURE';
export const FETCH_MY_BOOKINGS_REQUEST = 'FETCH_MY_BOOKINGS_REQUEST';
export const FETCH_MY_BOOKINGS_SUCCESS = 'FETCH_MY_BOOKINGS_SUCCESS';
export const FETCH_MY_BOOKINGS_FAILURE = 'FETCH_MY_BOOKINGS_FAILURE';

// Food Service
export const FETCH_FOOD_PROVIDERS_REQUEST = 'FETCH_FOOD_PROVIDERS_REQUEST';
export const FETCH_FOOD_PROVIDERS_SUCCESS = 'FETCH_FOOD_PROVIDERS_SUCCESS';
export const FETCH_FOOD_PROVIDERS_FAILURE = 'FETCH_FOOD_PROVIDERS_FAILURE';
export const FETCH_MENU_ITEMS_REQUEST = 'FETCH_MENU_ITEMS_REQUEST';
export const FETCH_MENU_ITEMS_SUCCESS = 'FETCH_MENU_ITEMS_SUCCESS';
export const FETCH_MENU_ITEMS_FAILURE = 'FETCH_MENU_ITEMS_FAILURE';
export const ADD_TO_CART = 'ADD_TO_CART';
export const REMOVE_FROM_CART = 'REMOVE_FROM_CART';
export const UPDATE_CART_ITEM = 'UPDATE_CART_ITEM';
export const CLEAR_CART = 'CLEAR_CART';
export const CREATE_ORDER_REQUEST = 'CREATE_ORDER_REQUEST';
export const CREATE_ORDER_SUCCESS = 'CREATE_ORDER_SUCCESS';
export const CREATE_ORDER_FAILURE = 'CREATE_ORDER_FAILURE';
```

```javascript
// src/redux/actions/authActions.js
import { 
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT
} from './actionTypes';
import { authService } from '../../services/authService';

export const login = (credentials) => {
  return async (dispatch) => {
    dispatch({ type: LOGIN_REQUEST });
    
    try {
      const data = await authService.login(credentials);
      
      dispatch({
        type: LOGIN_SUCCESS,
        payload: {
          user: data.user,
          token: data.access_token
        }
      });
      
      return Promise.resolve(data);
    } catch (error) {
      dispatch({
        type: LOGIN_FAILURE,
        payload: error.response?.data?.message || 'Failed to login'
      });
      
      return Promise.reject(error);
    }
  };
};

export const logout = () => {
  authService.logout();
  return { type: LOGOUT };
};
```

```javascript
// src/redux/actions/bookingActions.js
import {
  CREATE_BOOKING_REQUEST,
  CREATE_BOOKING_SUCCESS,
  CREATE_BOOKING_FAILURE,
  FETCH_MY_BOOKINGS_REQUEST,
  FETCH_MY_BOOKINGS_SUCCESS,
  FETCH_MY_BOOKINGS_FAILURE
} from './actionTypes';
import { bookingService } from '../../services/bookingService';

export const createBooking = (bookingData) => {
  return async (dispatch) => {
    dispatch({ type: CREATE_BOOKING_REQUEST });
    
    try {
      const data = await bookingService.create(bookingData);
      
      dispatch({
        type: CREATE_BOOKING_SUCCESS,
        payload: data
      });
      
      return Promise.resolve(data);
    } catch (error) {
      dispatch({
        type: CREATE_BOOKING_FAILURE,
        payload: error.response?.data?.message || 'Failed to create booking'
      });
      
      return Promise.reject(error);
    }
  };
};

export const fetchMyBookings = () => {
  return async (dispatch) => {
    dispatch({ type: FETCH_MY_BOOKINGS_REQUEST });
    
    try {
      const data = await bookingService.getMyBookings();
      
      dispatch({
        type: FETCH_MY_BOOKINGS_SUCCESS,
        payload: data
      });
      
      return Promise.resolve(data);
    } catch (error) {
      dispatch({
        type: FETCH_MY_BOOKINGS_FAILURE,
        payload: error.response?.data?.message || 'Failed to fetch bookings'
      });
      
      return Promise.reject(error);
    }
  };
};
```

## Testing and Quality Assurance

### Component Testing

```javascript
// src/components/modules/accommodations/AccommodationCard.test.jsx
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AccommodationCard from './AccommodationCard';

describe('AccommodationCard', () => {
  const mockAccommodation = {
    _id: 'acc123',
    title: 'Test Accommodation',
    description: 'A test accommodation',
    price: 100,
    city: {
      name: 'Test City'
    },
    amenities: ['WiFi', 'Kitchen'],
    images: ['https://example.com/image.jpg']
  };
  
  test('renders accommodation details correctly', () => {
    render(
      <BrowserRouter>
        <AccommodationCard accommodation={mockAccommodation} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Test Accommodation')).toBeInTheDocument();
    expect(screen.getByText('Test City')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByAltText('Test Accommodation')).toBeInTheDocument();
  });
  
  test('displays amenities', () => {
    render(
      <BrowserRouter>
        <AccommodationCard accommodation={mockAccommodation} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('WiFi')).toBeInTheDocument();
    expect(screen.getByText('Kitchen')).toBeInTheDocument();
  });
});
```

### Integration Testing

```javascript
// cypress/integration/booking.spec.js
describe('Booking Flow', () => {
  beforeEach(() => {
    // Login first
    cy.visit('/login');
    cy.get('[data-testid=email-input]').type('test@example.com');
    cy.get('[data-testid=password-input]').type('password123');
    cy.get('[data-testid=login-button]').click();
    
    // Wait for login to complete
    cy.url().should('include', '/dashboard');
  });
  
  it('should complete the full booking process', () => {
    // Go to accommodations
    cy.visit('/accommodations');
    
    // Select the first accommodation
    cy.get('[data-testid=accommodation-card]').first().click();
    
    // On accommodation details page, click Book Now
    cy.get('[data-testid=book-now-button]').click();
    
    // Fill booking form
    cy.get('[data-testid=check-in-date]').type('2025-07-01');
    cy.get('[data-testid=check-out-date]').type('2025-07-05');
    cy.get('[data-testid=guests-select]').select('2');
    cy.get('[data-testid=special-requests]')
      .type('Late check-in requested');
    
    // Submit the form
    cy.get('[data-testid=confirm-booking]').click();
    
    // Verify we reach the confirmation page
    cy.url().should('include', '/booking-confirmation');
    cy.get('[data-testid=booking-confirmation]')
      .should('contain', 'Booking Confirmed');
  });
});
```

## Responsive Design Implementation

### Mobile-First Approach

```css
/* src/styles/responsive.css */
/* Base styles (mobile) */
.accommodation-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.booking-container {
  flex-direction: column;
}

/* Tablet styles */
@media screen and (min-width: 768px) {
  .accommodation-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .booking-container {
    flex-direction: row;
  }
}

/* Desktop styles */
@media screen and (min-width: 1024px) {
  .accommodation-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Responsive Component Example

```jsx
// src/components/layout/ResponsiveNavbar.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const ResponsiveNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">StayKaru</Link>
        
        {!isDesktop && (
          <button 
            className="menu-toggle" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="menu-icon"></span>
          </button>
        )}
      </div>
      
      <div className={`navbar-menu ${isDesktop || mobileMenuOpen ? 'active' : ''}`}>
        <Link to="/accommodations">Accommodations</Link>
        <Link to="/food-providers">Food Services</Link>
        <Link to="/bookings/my-bookings">My Bookings</Link>
        <Link to="/orders/my-orders">My Orders</Link>
        <Link to="/profile">Profile</Link>
      </div>
    </nav>
  );
};

export default ResponsiveNavbar;
```

## Performance Optimization

### Code Splitting

```javascript
// src/App.js
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Loader from './components/common/Loader';

// Lazy loaded components
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Accommodations = lazy(() => import('./pages/Accommodations'));
const AccommodationDetail = lazy(() => import('./pages/AccommodationDetail'));
const BookingForm = lazy(() => import('./pages/BookingForm'));
const FoodProviders = lazy(() => import('./pages/FoodProviders'));
const FoodProviderDetail = lazy(() => import('./pages/FoodProviderDetail'));
const OrderCheckout = lazy(() => import('./pages/OrderCheckout'));

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/accommodations" element={<Accommodations />} />
          <Route path="/accommodations/:id" element={<AccommodationDetail />} />
          <Route path="/bookings/new/:accommodationId" element={<BookingForm />} />
          <Route path="/food-providers" element={<FoodProviders />} />
          <Route path="/food-providers/:id" element={<FoodProviderDetail />} />
          <Route path="/orders/checkout/:providerId" element={<OrderCheckout />} />
          {/* Other routes... */}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
```

### Image Optimization

```jsx
// src/components/common/OptimizedImage.jsx
import { useState, useEffect } from 'react';

const OptimizedImage = ({ src, alt, width, height, lazy = true }) => {
  const [imageSrc, setImageSrc] = useState('');
  
  useEffect(() => {
    // Generate image URL with resizing parameters
    const optimizedSrc = `${src}?width=${width}&height=${height}&format=webp`;
    setImageSrc(optimizedSrc);
  }, [src, width, height]);
  
  return (
    <img
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      loading={lazy ? "lazy" : "eager"}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = '/fallback-image.png';
      }}
    />
  );
};

export default OptimizedImage;
```

## Accessibility Implementation

### Focus Management

```jsx
// src/components/common/Modal.jsx
import { useEffect, useRef } from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  
  useEffect(() => {
    if (isOpen) {
      // Store current focus position
      previousFocusRef.current = document.activeElement;
      
      // Focus the modal when opened
      modalRef.current.focus();
      
      // Add key event listener
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Clean up
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        
        // Restore focus when modal closes
        if (previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
    >
      <div 
        className="modal-content"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="modal-title"
        tabIndex={-1}
      >
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button 
            className="close-button"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
```

### ARIA Attributes

```jsx
// src/components/common/Tabs.jsx
import { useState } from 'react';

const Tabs = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);
  
  return (
    <div className="tabs-container">
      <div 
        className="tabs-header" 
        role="tablist" 
        aria-label="Content tabs"
      >
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`tab-button ${index === activeTab ? 'active' : ''}`}
            onClick={() => setActiveTab(index)}
            role="tab"
            aria-selected={index === activeTab}
            aria-controls={`tab-panel-${index}`}
            id={`tab-${index}`}
            tabIndex={index === activeTab ? 0 : -1}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div 
        className="tab-content"
        role="tabpanel"
        id={`tab-panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {tabs[activeTab].content}
      </div>
    </div>
  );
};

export default Tabs;
```

## Deployment & Production Considerations

### Environment Configuration

```javascript
// .env.production
REACT_APP_API_URL=https://staykaru-backend-60ed08adb2a7.herokuapp.com/api
REACT_APP_GOOGLE_MAPS_KEY=your_production_api_key
REACT_APP_SENTRY_DSN=your_sentry_dsn
```

### Production Build Script

```json
// package.json (excerpt)
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "build:production": "env-cmd -f .env.production npm run build",
    "analyze": "source-map-explorer 'build/static/js/*.js'"
  }
}
```

### Nginx Configuration for SPA

```nginx
# nginx.conf
server {
    listen 80;
    server_name frontend.staykaru.com;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip settings
    gzip on;
    gzip_comp_level 5;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # API proxying
    location /api/ {
        proxy_pass https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # For SPA routing - send all non-file requests to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://maps.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://*.staykaru.com https://*.googleapis.com; connect-src 'self' https://staykaru-backend-60ed08adb2a7.herokuapp.com";
}
```

## Conclusion

This comprehensive frontend development guide provides all the necessary components, structures, and implementations to build a robust student module frontend for the StayKaru platform. By following this guide and integrating with the backend API as described in the `STUDENT_MODULE_COMPREHENSIVE_TEST.ps1` script, you can ensure a complete and well-tested frontend experience that meets all functional and non-functional requirements.

For any questions or clarification, please contact the development team lead or refer to the project documentation.
