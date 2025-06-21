# Map Functionality Implementation Guide

## Overview

This document outlines the comprehensive map functionality implementation for the StayKaru backend, including property search, route calculation, geocoding, and real-time order tracking.

## Features Implemented

### 1. **Map Services**
- **Property Search**: Find accommodations, hotels, and properties near a specific location
- **Route Calculation**: Get directions, distance, and travel time between two points
- **Geocoding**: Convert addresses to coordinates and vice versa
- **Place Search**: Text-based search for places and establishments
- **Estimated Arrival**: Calculate delivery time based on real-time traffic

### 2. **Order Tracking**
- **Real-time Location Tracking**: Track order location during delivery
- **Delivery History**: Complete tracking history with timestamps
- **Route Optimization**: Optimal routes for multiple deliveries
- **Status Updates**: Real-time order status updates with location data

## API Endpoints

### Map Endpoints (`/api/maps`)

#### 1. Search Nearby Properties
```http
POST /api/maps/search/properties
```
**Request Body:**
```json
{
  "location": {
    "latitude": 24.8607,
    "longitude": 67.0011
  },
  "radius": 5000,
  "type": "lodging",
  "keyword": "hotel",
  "minPrice": 1,
  "maxPrice": 3
}
```

#### 2. Get Route Between Locations
```http
POST /api/maps/route
```
**Request Body:**
```json
{
  "origin": {
    "latitude": 24.8607,
    "longitude": 67.0011
  },
  "destination": {
    "latitude": 24.8615,
    "longitude": 67.0021
  },
  "mode": "driving"
}
```

#### 3. Geocode Address
```http
POST /api/maps/geocode
```
**Request Body:**
```json
{
  "address": "Karachi, Pakistan"
}
```

#### 4. Reverse Geocode Coordinates
```http
POST /api/maps/reverse-geocode
```
**Request Body:**
```json
{
  "location": {
    "latitude": 24.8607,
    "longitude": 67.0011
  }
}
```

#### 5. Search Places by Text
```http
POST /api/maps/search/places
```
**Request Body:**
```json
{
  "query": "restaurants in Karachi",
  "location": {
    "latitude": 24.8607,
    "longitude": 67.0011
  },
  "radius": 5000
}
```

#### 6. Get Estimated Arrival Time
```http
GET /api/maps/estimated-arrival?fromLat=24.8607&fromLng=67.0011&toLat=24.8615&toLng=67.0021&mode=driving
```

### Order Tracking Endpoints (`/api/order-tracking`)

#### 1. Update Order Location
```http
PUT /api/order-tracking/location
```
**Request Body:**
```json
{
  "orderId": "507f1f77bcf86cd799439011",
  "location": {
    "latitude": 24.8607,
    "longitude": 67.0011
  },
  "status": "out_for_delivery",
  "notes": "Driver has picked up the order"
}
```

#### 2. Get Tracking Information
```http
GET /api/order-tracking/{orderId}/tracking
```

#### 3. Set Delivery Location
```http
POST /api/order-tracking/delivery-location
```
**Request Body:**
```json
{
  "orderId": "507f1f77bcf86cd799439011",
  "coordinates": {
    "latitude": 24.8615,
    "longitude": 67.0021
  },
  "address": "House #123, Block A, Gulshan-e-Iqbal, Karachi",
  "landmark": "Near Cafe Coffee Day"
}
```

#### 4. Get Active Deliveries
```http
GET /api/order-tracking/active-deliveries
```

#### 5. Get Delivery History
```http
GET /api/order-tracking/{orderId}/history
```

#### 6. Optimize Delivery Route
```http
POST /api/order-tracking/optimize-route
```
**Request Body:**
```json
{
  "startLocation": {
    "latitude": 24.8600,
    "longitude": 67.0010
  },
  "deliveryLocations": [
    {
      "latitude": 24.8615,
      "longitude": 67.0021
    },
    {
      "latitude": 24.8625,
      "longitude": 67.0031
    }
  ]
}
```

## Database Schema Updates

### Enhanced Order Schema
The order schema has been extended to include location tracking:

```typescript
export class Order {
  // ... existing fields
  
  delivery_location?: {
    coordinates: {
      latitude: number;
      longitude: number;
    };
    address: string;
    landmark?: string;
  };
  
  current_location?: {
    latitude: number;
    longitude: number;
  };
  
  tracking_history: Array<{
    location: {
      latitude: number;
      longitude: number;
    };
    status: OrderStatus;
    timestamp: Date;
    notes?: string;
  }>;
  
  estimated_delivery_time?: Date;
  delivery_person_name?: string;
  delivery_person_phone?: string;
}
```

## Configuration

### Google Maps API Setup

1. **Get API Key**: Obtain a Google Cloud Platform API key
2. **Enable APIs**: Enable the following APIs in Google Cloud Console:
   - Maps JavaScript API
   - Places API
   - Directions API
   - Geocoding API
   - Distance Matrix API

3. **Environment Configuration**: Add to your `.env` file:
```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### Dependencies
The following packages are required:
- `@googlemaps/google-maps-services-js`: Google Maps API client
- `class-validator`: Request validation
- `class-transformer`: Data transformation

## Usage Examples

### Frontend Integration

#### 1. Search for Properties
```javascript
const searchProperties = async (location, radius = 5000) => {
  const response = await fetch('/api/maps/search/properties', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      location,
      radius,
      type: 'lodging',
      keyword: 'hotel'
    })
  });
  return response.json();
};
```

#### 2. Track Order in Real-time
```javascript
const trackOrder = async (orderId) => {
  const response = await fetch(\`/api/order-tracking/\${orderId}/tracking\`);
  return response.json();
};

// Use with real-time updates
const startTracking = (orderId) => {
  setInterval(async () => {
    const trackingInfo = await trackOrder(orderId);
    updateMapWithLocation(trackingInfo.currentLocation);
    updateEstimatedArrival(trackingInfo.estimatedArrival);
  }, 30000); // Update every 30 seconds
};
```

#### 3. Calculate Route
```javascript
const getRoute = async (origin, destination, mode = 'driving') => {
  const response = await fetch('/api/maps/route', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      origin,
      destination,
      mode
    })
  });
  return response.json();
};
```

## Testing

### Running Tests
Use the provided PowerShell test script:
```powershell
./map-functionality-test.ps1
```

### Manual Testing
1. **Start the server**: `npm run start:dev`
2. **Access Swagger UI**: `http://localhost:3000/api`
3. **Test endpoints** using the interactive documentation

## Security Considerations

1. **API Key Protection**: Never expose your Google Maps API key in client-side code
2. **Rate Limiting**: Implement rate limiting for map API calls
3. **Input Validation**: All coordinates and addresses are validated
4. **Authentication**: Consider enabling authentication for tracking endpoints

## Performance Optimization

1. **Caching**: Implement caching for frequently accessed locations
2. **Batch Requests**: Use batch geocoding for multiple addresses
3. **Database Indexing**: Add geospatial indexes for location queries

## Error Handling

The implementation includes comprehensive error handling:
- Google Maps API failures
- Network timeouts
- Invalid coordinates
- Missing order data
- Rate limit exceeded

## Future Enhancements

1. **Real-time WebSocket Updates**: Implement WebSocket for live tracking
2. **Advanced Route Optimization**: Use more sophisticated algorithms
3. **Geofencing**: Add arrival/departure notifications
4. **Traffic Integration**: Real-time traffic data for better estimates
5. **Multi-stop Routing**: Support for complex delivery routes

## Support

For issues or questions:
1. Check the error logs for detailed error messages
2. Verify Google Maps API key configuration
3. Ensure all required APIs are enabled in Google Cloud
4. Review the Swagger documentation for correct request formats

## Deployment

The map functionality is ready for deployment to Heroku with your existing configuration. Ensure the `GOOGLE_MAPS_API_KEY` environment variable is set in your Heroku app settings.
