# API Testing Guide - Updated Location and Accommodation Endpoints

## Overview
This guide demonstrates the updated CRUD operations for locations and the accommodation module changes.

## Location Endpoints

### Countries

#### Create Country
```bash
POST /location/countries
Content-Type: application/json

{
  "name": "Japan",
  "code": "JP"
}
```

#### Get All Countries
```bash
GET /location/countries
```

#### Get Country by ID
```bash
GET /location/countries/{countryId}
```

#### Update Country
```bash
PUT /location/countries/{countryId}
Content-Type: application/json

{
  "name": "Japan Updated",
  "code": "JP"
}
```

#### Delete Country
```bash
DELETE /location/countries/{countryId}
```

### Cities

#### Create City (Fixed 500 Error)
```bash
POST /location/cities
Content-Type: application/json

{
  "name": "Tokyo",
  "country": "{countryId}",
  "latitude": 35.6762,
  "longitude": 139.6503
}
```

#### Get All Cities
```bash
GET /location/cities
```

#### Get City by ID
```bash
GET /location/cities/{cityId}
```

#### Update City (NEW)
```bash
PUT /location/cities/{cityId}
Content-Type: application/json

{
  "name": "Tokyo Updated",
  "country": "{countryId}",
  "latitude": 35.6762,
  "longitude": 139.6503
}
```

#### Delete City (NEW)
```bash
DELETE /location/cities/{cityId}
```

#### Get Cities by Country
```bash
GET /location/countries/{countryId}/cities
```

#### Get Nearby Cities
```bash
GET /location/cities/nearby?latitude=35.6762&longitude=139.6503&maxDistance=100
```

## Accommodation Endpoints (Updated to use City ID)

### Create Accommodation
```bash
POST /accommodations
Content-Type: application/json

{
  "title": "Modern Apartment in Tokyo",
  "description": "Beautiful modern apartment with city views",
  "city": "{cityId}",
  "address": "Shibuya, Tokyo",
  "pricePerNight": 150,
  "maxGuests": 4,
  "amenities": ["wifi", "kitchen", "air_conditioning"],
  "images": ["image1.jpg", "image2.jpg"],
  "roomType": "entire_place",
  "landlord": "{landlordId}"
}
```

### Search Accommodations by City
```bash
GET /accommodations?city={cityId}&priceMin=50&priceMax=200&maxGuests=2
```

### Update Accommodation
```bash
PUT /accommodations/{accommodationId}
Content-Type: application/json

{
  "title": "Updated Apartment Title",
  "city": "{cityId}",
  "pricePerNight": 175
}
```

## Key Changes Made

1. **Fixed Google Maps API Error**: The city creation endpoint now handles missing Google Maps API gracefully
2. **Added PUT/DELETE for Cities**: Complete CRUD operations for cities with comprehensive Swagger documentation
3. **Updated Accommodation Structure**: Changed from `location` to `city` field for better semantic clarity
4. **Enhanced API Documentation**: All endpoints now have proper Swagger documentation with examples
5. **Improved Error Handling**: Better error messages and fallback coordinates when geocoding fails

## Testing Checklist

- [ ] Create a country
- [ ] Create a city with the country ID
- [ ] Update the city
- [ ] Create an accommodation with the city ID
- [ ] Search accommodations by city
- [ ] Update accommodation
- [ ] Delete city (should handle accommodation references)
- [ ] Delete country (should handle city references)

## Swagger Documentation

Visit http://localhost:3001/api to access the complete API documentation with interactive testing capabilities.
