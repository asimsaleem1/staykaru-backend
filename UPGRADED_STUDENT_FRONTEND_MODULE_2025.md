# Upgraded Student Frontend Module Implementation Guide 2025

## 🎓 Modern Student Platform - Enhanced Features

### Executive Summary
This upgraded student module provides a comprehensive, modern web application designed specifically for university students to discover accommodations, order food, manage bookings, and engage with the community. Built with cutting-edge technology and student-centric design.

---

## 🚀 Technology Stack & Architecture

### Frontend Framework
```typescript
// Core Technologies
- React 18+ with TypeScript
- Next.js 14+ (App Router)
- TailwindCSS + Headless UI + Framer Motion
- React Query (TanStack Query) for state management
- React Hook Form + Zod validation
- PWA capabilities with offline support
- Geolocation & Maps integration
```

### Advanced State Management
```typescript
// Student App Store with Zustand
interface StudentStore {
  profile: StudentProfile;
  preferences: UserPreferences;
  accommodations: Accommodation[];
  bookings: Booking[];
  orders: FoodOrder[];
  favorites: Favorite[];
  social: SocialData;
  
  // Actions
  updateProfile: (profile: Partial<StudentProfile>) => void;
  addFavorite: (type: 'accommodation' | 'restaurant', id: string) => void;
  createBooking: (accommodationId: string, data: BookingData) => void;
  placeOrder: (restaurantId: string, items: OrderItem[]) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
}
```

---

## 🏠 Smart Accommodation Discovery

### 1. AI-Powered Search & Recommendations

```typescript
// Intelligent Accommodation Search
const AccommodationSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [mapView, setMapView] = useState(false);
  
  const { data: accommodations, isLoading } = useQuery({
    queryKey: ['accommodations', searchQuery, filters, sortBy],
    queryFn: () => api.accommodations.search({
      query: searchQuery,
      filters,
      sortBy,
      userPreferences: userPreferences
    })
  });

  // AI-powered recommendations based on user behavior
  const { data: recommendations } = useQuery({
    queryKey: ['accommodation-recommendations'],
    queryFn: () => api.ai.getAccommodationRecommendations({
      userId: user.id,
      preferences: userPreferences,
      history: searchHistory
    })
  });

  return (
    <div className="space-y-6">
      {/* Smart Search Bar */}
      <div className="relative">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by location, university, or property name..."
          suggestions={searchSuggestions}
          onSuggestionSelect={handleSuggestionSelect}
        />
        
        {/* Quick Filters */}
        <QuickFilters
          activeFilters={filters}
          onFilterChange={setFilters}
          popularFilters={['near-campus', 'budget-friendly', 'furnished', 'pet-friendly']}
        />
      </div>

      {/* View Toggle */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <SortDropdown value={sortBy} onChange={setSortBy} />
          <FilterButton onClick={() => setShowAdvancedFilters(true)} />
        </div>
        <ViewToggle
          views={['grid', 'list', 'map']}
          active={mapView ? 'map' : viewMode}
          onChange={(view) => view === 'map' ? setMapView(true) : setViewMode(view)}
        />
      </div>

      {/* Recommendations Section */}
      {recommendations && recommendations.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Recommended for You</h2>
          <RecommendationCarousel
            items={recommendations}
            onItemClick={handleAccommodationClick}
          />
        </section>
      )}

      {/* Search Results */}
      <AnimatePresence mode="wait">
        {mapView ? (
          <AccommodationMap
            accommodations={accommodations}
            onMarkerClick={handleAccommodationClick}
            onBoundsChange={handleMapBoundsChange}
          />
        ) : (
          <AccommodationGrid
            accommodations={accommodations}
            viewMode={viewMode}
            loading={isLoading}
            onLoadMore={loadMoreAccommodations}
          />
        )}
      </AnimatePresence>

      {/* Advanced Filters Modal */}
      <AdvancedFiltersModal
        open={showAdvancedFilters}
        filters={filters}
        onFiltersChange={setFilters}
        onClose={() => setShowAdvancedFilters(false)}
      />
    </div>
  );
};

// Smart Accommodation Card with ML-based insights
const AccommodationCard = ({ accommodation, userPreferences }: AccommodationCardProps) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const { addFavorite, removeFavorite } = useFavorites();
  
  // AI compatibility score
  const compatibilityScore = useMemo(() => 
    calculateCompatibilityScore(accommodation, userPreferences), 
    [accommodation, userPreferences]
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group"
    >
      {/* Image Gallery */}
      <div className="relative h-56">
        <ImageCarousel
          images={accommodation.images}
          alt={accommodation.title}
          showDots={true}
        />
        
        {/* Overlay Actions */}
        <div className="absolute top-4 right-4 space-y-2">
          <FavoriteButton
            isFavorited={isFavorited}
            onToggle={() => toggleFavorite(accommodation.id)}
          />
          <ShareButton accommodation={accommodation} />
        </div>
        
        {/* Compatibility Badge */}
        {compatibilityScore > 80 && (
          <div className="absolute top-4 left-4">
            <Badge variant="success" className="flex items-center space-x-1">
              <SparklesIcon className="h-3 w-3" />
              <span>Perfect Match</span>
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
              {accommodation.title}
            </h3>
            <p className="text-gray-600 text-sm flex items-center mt-1">
              <MapPinIcon className="h-4 w-4 mr-1" />
              {accommodation.location.address}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              ${accommodation.price}
            </p>
            <p className="text-sm text-gray-500">per month</p>
          </div>
        </div>

        {/* Quick Info */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center">
              <BedIcon className="h-4 w-4 mr-1" />
              {accommodation.bedrooms} bed
            </span>
            <span className="flex items-center">
              <BathIcon className="h-4 w-4 mr-1" />
              {accommodation.bathrooms} bath
            </span>
            <span className="flex items-center">
              <UsersIcon className="h-4 w-4 mr-1" />
              {accommodation.maxOccupancy} people
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">
              {accommodation.rating} ({accommodation.reviewCount})
            </span>
          </div>
        </div>

        {/* Amenities Preview */}
        <div className="mb-4">
          <AmenitiesPreview
            amenities={accommodation.amenities}
            maxShow={4}
            className="text-xs"
          />
        </div>

        {/* Distance to University */}
        {accommodation.distanceToUniversity && (
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <AcademicCapIcon className="h-4 w-4 mr-1" />
            <span>{accommodation.distanceToUniversity} from campus</span>
            <span className="mx-2">•</span>
            <span>{accommodation.commuteTimes.walking} walk</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => openQuickView(accommodation)}
          >
            Quick View
          </Button>
          <Button
            className="flex-1"
            onClick={() => navigateToDetails(accommodation.id)}
          >
            View Details
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
```

### 2. Interactive Accommodation Details

```typescript
// Comprehensive Accommodation Details
const AccommodationDetails = ({ accommodationId }: { accommodationId: string }) => {
  const { data: accommodation } = useQuery({
    queryKey: ['accommodation', accommodationId],
    queryFn: () => api.accommodations.getById(accommodationId)
  });

  const { data: reviews } = useQuery({
    queryKey: ['accommodation-reviews', accommodationId],
    queryFn: () => api.reviews.getByAccommodation(accommodationId)
  });

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{accommodation.title}</h1>
            <div className="flex items-center space-x-4 text-gray-600">
              <div className="flex items-center">
                <MapPinIcon className="h-5 w-5 mr-1" />
                <span>{accommodation.location.address}</span>
              </div>
              <div className="flex items-center">
                <StarIcon className="h-5 w-5 mr-1 text-yellow-400" />
                <span>{accommodation.rating} ({accommodation.reviewCount} reviews)</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">${accommodation.price}</p>
            <p className="text-gray-600">per month</p>
          </div>
        </div>
        
        <ActionButtons
          accommodation={accommodation}
          onBook={() => setShowBookingModal(true)}
          onShare={() => shareAccommodation(accommodation)}
          onFavorite={() => toggleFavorite(accommodation.id)}
        />
      </div>

      {/* Image Gallery */}
      <div className="mb-8">
        <ImageGallery
          images={accommodation.images}
          selectedIndex={selectedImageIndex}
          onImageSelect={setSelectedImageIndex}
          className="rounded-xl overflow-hidden"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">About this place</h2>
            <p className="text-gray-700 leading-relaxed">{accommodation.description}</p>
          </section>

          {/* Features & Amenities */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">What this place offers</h2>
            <AmenitiesGrid amenities={accommodation.amenities} />
          </section>

          {/* Location */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Location</h2>
            <div className="space-y-4">
              <InteractiveMap
                center={accommodation.location.coordinates}
                zoom={15}
                markers={[{
                  position: accommodation.location.coordinates,
                  title: accommodation.title
                }]}
                nearbyPoints={accommodation.nearbyPoints}
              />
              <NearbyPlaces places={accommodation.nearbyPoints} />
            </div>
          </section>

          {/* Reviews */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">
                Reviews ({accommodation.reviewCount})
              </h2>
              <Button variant="outline" onClick={() => setShowAllReviews(true)}>
                View All Reviews
              </Button>
            </div>
            <ReviewsList reviews={reviews.slice(0, 3)} />
          </section>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <BookingCard
              accommodation={accommodation}
              onBook={() => setShowBookingModal(true)}
            />
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        accommodation={accommodation}
        open={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onConfirm={handleBookingConfirm}
      />
    </div>
  );
};
```

---

## 🍕 Advanced Food Ordering System

### 1. Restaurant Discovery with Smart Filtering

```typescript
// Food Provider Discovery
const FoodProviderDiscovery = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [filters, setFilters] = useState<FoodFilters>({});
  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup'>('delivery');
  
  // Get user location
  useGeolocation({
    onLocationUpdate: setLocation,
    enableHighAccuracy: true
  });

  const { data: restaurants } = useQuery({
    queryKey: ['restaurants', location, filters, deliveryMode],
    queryFn: () => api.restaurants.search({
      location,
      filters,
      deliveryMode,
      radius: filters.radius || 5
    }),
    enabled: !!location
  });

  return (
    <div className="space-y-6">
      {/* Location & Delivery Mode */}
      <div className="flex justify-between items-center">
        <LocationSelector
          location={location}
          onLocationChange={setLocation}
        />
        <DeliveryModeToggle
          mode={deliveryMode}
          onChange={setDeliveryMode}
        />
      </div>

      {/* Quick Filters */}
      <QuickFilters
        filters={[
          { id: 'fast-delivery', label: 'Fast Delivery (< 30min)', icon: '⚡' },
          { id: 'healthy', label: 'Healthy Options', icon: '🥗' },
          { id: 'budget', label: 'Budget Friendly', icon: '💰' },
          { id: 'highly-rated', label: '4.5+ Rating', icon: '⭐' }
        ]}
        selected={filters.quickFilters || []}
        onChange={(selected) => setFilters(prev => ({ ...prev, quickFilters: selected }))}
      />

      {/* Cuisine Categories */}
      <CuisineCarousel
        categories={cuisineCategories}
        onCategorySelect={(category) => 
          setFilters(prev => ({ ...prev, cuisine: category }))
        }
      />

      {/* Restaurant Grid */}
      <RestaurantGrid
        restaurants={restaurants}
        loading={isLoading}
        onRestaurantClick={handleRestaurantClick}
      />
    </div>
  );
};

// Enhanced Restaurant Card
const RestaurantCard = ({ restaurant }: { restaurant: Restaurant }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-xl shadow-sm border overflow-hidden cursor-pointer"
      onClick={() => navigateToRestaurant(restaurant.id)}
    >
      {/* Restaurant Image */}
      <div className="relative h-48">
        <Image
          src={restaurant.image}
          alt={restaurant.name}
          fill
          className="object-cover"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3">
          {restaurant.isNew && (
            <Badge variant="success">New</Badge>
          )}
        </div>
        
        <div className="absolute top-3 right-3">
          <FavoriteButton
            isFavorited={isFavorited}
            onToggle={() => toggleFavorite(restaurant.id)}
          />
        </div>
        
        {/* Delivery Info */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                {restaurant.deliveryTime} min
              </span>
              <span className="flex items-center">
                <TruckIcon className="h-4 w-4 mr-1" />
                ${restaurant.deliveryFee} delivery
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{restaurant.name}</h3>
          <div className="flex items-center space-x-1">
            <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{restaurant.rating}</span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-1">
          {restaurant.cuisine.join(', ')}
        </p>
        
        {/* Popular Items Preview */}
        <div className="flex space-x-2 mb-3">
          {restaurant.popularItems.slice(0, 3).map(item => (
            <div key={item.id} className="flex-1">
              <div className="bg-gray-100 rounded-lg p-2">
                <p className="text-xs font-medium line-clamp-1">{item.name}</p>
                <p className="text-xs text-gray-600">${item.price}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Promotions */}
        {restaurant.promotions.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-2">
            <p className="text-green-800 text-xs font-medium">
              {restaurant.promotions[0].description}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
```

### 2. Interactive Menu & Order Builder

```typescript
// Restaurant Menu & Order System
const RestaurantMenu = ({ restaurantId }: { restaurantId: string }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: restaurant } = useQuery({
    queryKey: ['restaurant', restaurantId],
    queryFn: () => api.restaurants.getById(restaurantId)
  });

  const { data: menu } = useQuery({
    queryKey: ['restaurant-menu', restaurantId],
    queryFn: () => api.restaurants.getMenu(restaurantId)
  });

  const addToCart = (item: MenuItem, customizations?: ItemCustomization[]) => {
    const cartItem: CartItem = {
      id: generateId(),
      menuItem: item,
      quantity: 1,
      customizations,
      totalPrice: calculateItemPrice(item, customizations)
    };
    
    setCart(prev => [...prev, cartItem]);
    toast.success(`${item.name} added to cart`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Restaurant Header */}
      <RestaurantHeader restaurant={restaurant} />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
        {/* Menu Content */}
        <div className="lg:col-span-3">
          {/* Menu Navigation */}
          <div className="sticky top-0 bg-white z-10 pb-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Menu</h2>
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search menu items..."
                className="w-64"
              />
            </div>
            
            <CategoryTabs
              categories={['all', ...menu.categories.map(c => c.id)]}
              selected={selectedCategory}
              onChange={setSelectedCategory}
            />
          </div>

          {/* Menu Items */}
          <div className="space-y-8">
            {menu.categories
              .filter(category => 
                selectedCategory === 'all' || category.id === selectedCategory
              )
              .map(category => (
                <MenuCategory
                  key={category.id}
                  category={category}
                  items={category.items.filter(item =>
                    searchQuery === '' || 
                    item.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )}
                  onAddToCart={addToCart}
                />
              ))}
          </div>
        </div>

        {/* Cart Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <OrderCart
              items={cart}
              restaurant={restaurant}
              onUpdateQuantity={updateCartQuantity}
              onRemoveItem={removeFromCart}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Advanced Menu Item Component
const MenuItemCard = ({ item, onAddToCart }: MenuItemCardProps) => {
  const [showCustomization, setShowCustomization] = useState(false);
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="flex space-x-4 p-4 bg-white rounded-xl border hover:shadow-md transition-shadow">
      {/* Item Image */}
      <div className="relative w-24 h-24 flex-shrink-0">
        <Image
          src={item.image || '/placeholder-food.jpg'}
          alt={item.name}
          fill
          className="object-cover rounded-lg"
        />
        {!item.available && (
          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-medium">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Item Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="font-semibold line-clamp-2">{item.name}</h3>
            <p className="text-gray-600 text-sm line-clamp-2 mt-1">
              {item.description}
            </p>
          </div>
          <div className="text-right ml-4">
            <p className="font-bold text-lg">${item.price}</p>
            {item.originalPrice && item.originalPrice > item.price && (
              <p className="text-gray-500 text-sm line-through">
                ${item.originalPrice}
              </p>
            )}
          </div>
        </div>

        {/* Item Badges */}
        <div className="flex items-center space-x-2 mb-3">
          {item.isPopular && (
            <Badge variant="success" size="sm">🔥 Popular</Badge>
          )}
          {item.isSpicy && (
            <Badge variant="warning" size="sm">🌶️ Spicy</Badge>
          )}
          {item.isVegetarian && (
            <Badge variant="info" size="sm">🌱 Vegetarian</Badge>
          )}
        </div>

        {/* Customization Options */}
        {item.customizations && item.customizations.length > 0 && (
          <div className="mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCustomization(true)}
            >
              Customize
            </Button>
          </div>
        )}

        {/* Add to Cart */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Prep time:</span>
            <span className="text-sm font-medium">{item.prepTime} min</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <QuantitySelector
              value={quantity}
              onChange={setQuantity}
              min={1}
              max={10}
            />
            <Button
              onClick={() => handleAddToCart(item, quantity)}
              disabled={!item.available}
              size="sm"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </div>

      {/* Customization Modal */}
      <CustomizationModal
        item={item}
        open={showCustomization}
        onClose={() => setShowCustomization(false)}
        onConfirm={handleCustomizationConfirm}
      />
    </div>
  );
};
```

---

## 📱 Smart Student Dashboard

### 1. Personalized Dashboard

```typescript
// Student Dashboard with AI Insights
const StudentDashboard = () => {
  const { data: dashboardData } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: () => api.dashboard.getStudentData()
  });

  const [selectedTab, setSelectedTab] = useState('overview');

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {dashboardData.user.firstName}! 👋
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your bookings and orders
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Active Bookings"
          value={dashboardData.stats.activeBookings}
          icon={<HomeIcon />}
          change="+2 this month"
          trend="up"
        />
        <StatCard
          title="Orders This Month"
          value={dashboardData.stats.monthlyOrders}
          icon={<ShoppingBagIcon />}
          change="+15% from last month"
          trend="up"
        />
        <StatCard
          title="Money Saved"
          value={`$${dashboardData.stats.moneySaved}`}
          icon={<DollarSignIcon />}
          change="with student discounts"
          trend="neutral"
        />
        <StatCard
          title="Loyalty Points"
          value={dashboardData.stats.loyaltyPoints}
          icon={<StarIcon />}
          change="Redeem for rewards"
          trend="neutral"
        />
      </div>

      {/* Tab Navigation */}
      <TabNavigation
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'accommodations', label: 'My Accommodations' },
          { id: 'orders', label: 'Food Orders' },
          { id: 'favorites', label: 'Favorites' },
          { id: 'social', label: 'Community' }
        ]}
        selected={selectedTab}
        onChange={setSelectedTab}
      />

      {/* Tab Content */}
      <div className="mt-8">
        {selectedTab === 'overview' && (
          <OverviewTab data={dashboardData} />
        )}
        {selectedTab === 'accommodations' && (
          <AccommodationsTab bookings={dashboardData.bookings} />
        )}
        {selectedTab === 'orders' && (
          <OrdersTab orders={dashboardData.orders} />
        )}
        {selectedTab === 'favorites' && (
          <FavoritesTab favorites={dashboardData.favorites} />
        )}
        {selectedTab === 'social' && (
          <SocialTab activities={dashboardData.socialActivities} />
        )}
      </div>
    </div>
  );
};

// Overview Tab with Smart Recommendations
const OverviewTab = ({ data }: { data: DashboardData }) => {
  return (
    <div className="space-y-8">
      {/* Recent Activity */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <ActivityFeed activities={data.recentActivity} />
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionCard
            title="Find Housing"
            description="Discover new accommodations"
            icon={<SearchIcon />}
            onClick={() => navigate('/search')}
          />
          <QuickActionCard
            title="Order Food"
            description="From your favorite restaurants"
            icon={<UtensilsIcon />}
            onClick={() => navigate('/food')}
          />
          <QuickActionCard
            title="Pay Rent"
            description="Quick and secure payments"
            icon={<CreditCardIcon />}
            onClick={() => navigate('/payments')}
          />
          <QuickActionCard
            title="Get Help"
            description="Contact support"
            icon={<HelpCircleIcon />}
            onClick={() => openSupportChat()}
          />
        </div>
      </section>

      {/* Personalized Recommendations */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Recommended for You</h2>
        <RecommendationCarousel
          recommendations={data.recommendations}
          onItemClick={handleRecommendationClick}
        />
      </section>

      {/* Upcoming Events */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Upcoming</h2>
        <UpcomingEvents events={data.upcomingEvents} />
      </section>
    </div>
  );
};
```

### 2. Social Features & Community

```typescript
// Student Community Features
const CommunityHub = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const { data: communityData } = useQuery({
    queryKey: ['community-data'],
    queryFn: () => api.community.getData()
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Community Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Student Community</h1>
        <p className="text-gray-600">
          Connect with fellow students, share experiences, and get recommendations
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 rounded-lg p-1">
          {[
            { id: 'feed', label: 'Feed', icon: <FeedIcon /> },
            { id: 'reviews', label: 'Reviews', icon: <StarIcon /> },
            { id: 'groups', label: 'Groups', icon: <UsersIcon /> },
            { id: 'events', label: 'Events', icon: <CalendarIcon /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {activeTab === 'feed' && <CommunityFeed posts={communityData.posts} />}
          {activeTab === 'reviews' && <ReviewsTab reviews={communityData.reviews} />}
          {activeTab === 'groups' && <StudentGroups groups={communityData.groups} />}
          {activeTab === 'events' && <CampusEvents events={communityData.events} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Community Feed Component
const CommunityFeed = ({ posts }: { posts: CommunityPost[] }) => {
  const [newPost, setNewPost] = useState('');
  const { user } = useAuth();

  const createPost = async () => {
    if (!newPost.trim()) return;
    
    try {
      await api.community.createPost({
        content: newPost,
        type: 'general'
      });
      setNewPost('');
      toast.success('Post shared!');
    } catch (error) {
      toast.error('Failed to create post');
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Post */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex space-x-4">
          <Avatar src={user.avatar} size="md" />
          <div className="flex-1">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share something with the community..."
              className="w-full p-3 border border-gray-200 rounded-lg resize-none"
              rows={3}
            />
            <div className="flex justify-between items-center mt-4">
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm">
                  📷 Photo
                </Button>
                <Button variant="ghost" size="sm">
                  📍 Location
                </Button>
                <Button variant="ghost" size="sm">
                  😊 Feeling
                </Button>
              </div>
              <Button
                onClick={createPost}
                disabled={!newPost.trim()}
              >
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.map(post => (
          <CommunityPostCard
            key={post.id}
            post={post}
            onLike={() => likePost(post.id)}
            onComment={() => openComments(post.id)}
            onShare={() => sharePost(post.id)}
          />
        ))}
      </div>
    </div>
  );
};
```

---

## 💳 Smart Payment & Booking System

### 1. Seamless Booking Experience

```typescript
// Enhanced Booking Flow
const BookingFlow = ({ accommodationId }: { accommodationId: string }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingData, setBookingData] = useState<BookingData>({});
  
  const steps = [
    { id: 'dates', title: 'Select Dates', component: DateSelection },
    { id: 'guests', title: 'Guest Details', component: GuestDetails },
    { id: 'payment', title: 'Payment', component: PaymentMethod },
    { id: 'confirmation', title: 'Confirmation', component: BookingConfirmation }
  ];

  const { data: accommodation } = useQuery({
    queryKey: ['accommodation', accommodationId],
    queryFn: () => api.accommodations.getById(accommodationId)
  });

  const { data: availability } = useQuery({
    queryKey: ['availability', accommodationId, bookingData.checkIn, bookingData.checkOut],
    queryFn: () => api.accommodations.checkAvailability({
      accommodationId,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut
    }),
    enabled: !!(bookingData.checkIn && bookingData.checkOut)
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Progress Indicator */}
      <StepProgress
        steps={steps}
        currentStep={currentStep}
        completedSteps={steps.slice(0, currentStep)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Booking Form */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {React.createElement(steps[currentStep].component, {
                data: bookingData,
                onChange: setBookingData,
                accommodation
              })}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            <Button
              onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
              disabled={currentStep === steps.length - 1 || !isStepValid()}
            >
              {currentStep === steps.length - 1 ? 'Complete Booking' : 'Next'}
            </Button>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <BookingSummary
              accommodation={accommodation}
              bookingData={bookingData}
              pricing={calculatePricing(bookingData, accommodation)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Smart Payment Component
const PaymentMethod = ({ data, onChange }: PaymentStepProps) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [paymentData, setPaymentData] = useState<PaymentData>({});
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Payment Method</h2>
        <p className="text-gray-600">Choose how you'd like to pay for your booking</p>
      </div>

      {/* Payment Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: 'card', name: 'Credit/Debit Card', icon: <CreditCardIcon /> },
          { id: 'paypal', name: 'PayPal', icon: <PayPalIcon /> },
          { id: 'bank', name: 'Bank Transfer', icon: <BankIcon /> }
        ].map(method => (
          <PaymentMethodCard
            key={method.id}
            method={method}
            selected={selectedMethod === method.id}
            onSelect={setSelectedMethod}
          />
        ))}
      </div>

      {/* Payment Form */}
      <AnimatePresence mode="wait">
        {selectedMethod === 'card' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <CreditCardForm
              data={paymentData}
              onChange={setPaymentData}
              onValidationChange={handleValidationChange}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Payment Method */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="save-payment"
          checked={savePaymentMethod}
          onChange={(e) => setSavePaymentMethod(e.target.checked)}
          className="rounded border-gray-300"
        />
        <label htmlFor="save-payment" className="text-sm text-gray-600">
          Save this payment method for future bookings
        </label>
      </div>

      {/* Security Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">
            Your payment is secured with 256-bit SSL encryption
          </span>
        </div>
      </div>
    </div>
  );
};
```

---

## 📱 Progressive Web App Features

### 1. Offline Capabilities

```typescript
// PWA Configuration
const PWAConfig = {
  name: 'StayKaru Student',
  short_name: 'StayKaru',
  description: 'Find accommodations and order food as a student',
  theme_color: '#3B82F6',
  background_color: '#FFFFFF',
  display: 'standalone',
  start_url: '/dashboard',
  scope: '/',
  icons: [
    {
      src: '/icons/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any maskable'
    }
  ]
};

// Offline Data Management
const useOfflineData = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData>({});

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      cacheEssentialData();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const cacheEssentialData = async () => {
    // Cache user bookings, favorite accommodations, recent orders
    const essentialData = {
      bookings: await db.bookings.toArray(),
      favorites: await db.favorites.toArray(),
      recentOrders: await db.orders.orderBy('createdAt').reverse().limit(10).toArray()
    };
    
    await db.offlineCache.put({ id: 'essential', data: essentialData, timestamp: Date.now() });
  };

  return { isOnline, offlineData };
};
```

### 2. Push Notifications

```typescript
// Smart Notification System
const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    }
    return false;
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (permission === 'granted') {
      new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        ...options
      });
    }
  };

  // Handle different notification types
  const handleBookingUpdate = (booking: Booking) => {
    showNotification(`Booking Update`, {
      body: `Your booking at ${booking.accommodation.name} has been ${booking.status}`,
      tag: `booking-${booking.id}`,
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'View Details' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    });
  };

  const handleOrderUpdate = (order: Order) => {
    showNotification(`Order Update`, {
      body: `Your order from ${order.restaurant.name} is ${order.status}`,
      tag: `order-${order.id}`,
      requireInteraction: true
    });
  };

  return {
    permission,
    requestPermission,
    showNotification,
    handleBookingUpdate,
    handleOrderUpdate
  };
};
```

---

## 🧪 Comprehensive Testing Strategy

### 1. Component Testing

```typescript
// Accommodation Search Test
describe('AccommodationSearch', () => {
  beforeEach(() => {
    server.use(
      rest.get('/api/accommodations/search', (req, res, ctx) => {
        return res(ctx.json(mockAccommodations));
      })
    );
  });

  it('filters accommodations by price range', async () => {
    const user = userEvent.setup();
    render(<AccommodationSearch />);

    // Open filters
    const filterButton = screen.getByRole('button', { name: /filters/i });
    await user.click(filterButton);

    // Set price range
    const minPrice = screen.getByLabelText(/minimum price/i);
    const maxPrice = screen.getByLabelText(/maximum price/i);
    
    await user.clear(minPrice);
    await user.type(minPrice, '500');
    await user.clear(maxPrice);
    await user.type(maxPrice, '1000');

    // Apply filters
    const applyButton = screen.getByRole('button', { name: /apply/i });
    await user.click(applyButton);

    // Verify filtered results
    await waitFor(() => {
      const prices = screen.getAllByTestId('accommodation-price');
      prices.forEach(price => {
        const value = parseInt(price.textContent?.replace('$', '') || '0');
        expect(value).toBeGreaterThanOrEqual(500);
        expect(value).toBeLessThanOrEqual(1000);
      });
    });
  });
});
```

### 2. E2E User Journey Testing

```typescript
// Complete Student Journey Test
test('student can search, book accommodation and order food', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[data-testid=email]', 'student@university.edu');
  await page.fill('[data-testid=password]', 'password');
  await page.click('[data-testid=login-button]');

  // Search for accommodation
  await page.goto('/search');
  await page.fill('[data-testid=search-input]', 'near campus');
  await page.click('[data-testid=search-button]');

  // Select accommodation
  const firstResult = page.locator('[data-testid=accommodation-card]').first();
  await firstResult.click();

  // Book accommodation
  await page.click('[data-testid=book-now-button]');
  
  // Fill booking details
  await page.fill('[data-testid=check-in-date]', '2025-09-01');
  await page.fill('[data-testid=check-out-date]', '2025-12-15');
  await page.click('[data-testid=next-step]');

  // Complete payment
  await page.fill('[data-testid=card-number]', '4242424242424242');
  await page.fill('[data-testid=expiry]', '12/27');
  await page.fill('[data-testid=cvc]', '123');
  await page.click('[data-testid=complete-booking]');

  // Verify booking confirmation
  await expect(page.locator('[data-testid=booking-confirmation]')).toBeVisible();

  // Order food
  await page.goto('/food');
  const restaurant = page.locator('[data-testid=restaurant-card]').first();
  await restaurant.click();

  // Add items to cart
  await page.click('[data-testid=menu-item-add]');
  await page.click('[data-testid=cart-checkout]');

  // Complete order
  await page.click('[data-testid=place-order]');
  await expect(page.locator('[data-testid=order-confirmation]')).toBeVisible();
});
```

---

## 📚 Implementation Checklist

### Phase 1: Core Foundation ✅
- [ ] Next.js 14+ setup with TypeScript
- [ ] Authentication system integration
- [ ] Design system with TailwindCSS
- [ ] State management with Zustand
- [ ] PWA configuration

### Phase 2: Accommodation Features ✅
- [ ] Smart search with AI recommendations
- [ ] Interactive accommodation details
- [ ] Advanced filtering system
- [ ] Map integration with clustering
- [ ] Booking flow with payment

### Phase 3: Food Ordering ✅
- [ ] Restaurant discovery
- [ ] Interactive menu system
- [ ] Cart management
- [ ] Real-time order tracking
- [ ] Rating and review system

### Phase 4: Student Dashboard ✅
- [ ] Personalized dashboard
- [ ] Booking management
- [ ] Order history
- [ ] Favorites system
- [ ] Notification center

### Phase 5: Social Features ✅
- [ ] Community feed
- [ ] Student groups
- [ ] Review system
- [ ] Event discovery
- [ ] Messaging system

### Phase 6: Mobile Experience ✅
- [ ] PWA features
- [ ] Offline capabilities
- [ ] Push notifications
- [ ] Touch-optimized interface
- [ ] Location services

### Phase 7: Testing & Optimization ✅
- [ ] Unit tests for components
- [ ] Integration tests
- [ ] E2E user journey tests
- [ ] Performance optimization
- [ ] Security testing

---

This upgraded student module provides a comprehensive, modern platform that caters to all aspects of student life with intelligent features, seamless user experience, and robust functionality.
