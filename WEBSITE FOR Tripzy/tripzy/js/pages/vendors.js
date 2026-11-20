/**
 * Tripzy - Vendors Page Module
 * Browse and discover verified local vendors and services
 */

import { api } from '../utils/api.js';

let vendors = [];

export async function initVendors(container, { state, api, toast }) {
  // Load vendor data
  try {
    const res = await fetch('/data/vendors.json');
    vendors = await res.json();
  } catch (e) {
    console.error('Failed to load vendor data:', e);
    toast.error('Failed to load vendor data', 'Please try again later');
  }

  // Parse query parameters
  const queryParams = new URLSearchParams(window.location.search);
  
  // Render page
  container.innerHTML = renderVendors();
  container.hidden = false;

  // Initialize components
  initVendorFilters();
  initVendorSort();
  initVendorGrid();
  
  // Apply initial filters from URL
  applyVendorFiltersFromURL();

  // Return cleanup function
  return () => {
    // Cleanup if needed
  };
}

function renderVendors() {
  return `
    <div class="page-content">
      <!-- Vendors Header -->
      <section class="vendors-header" aria-labelledby="vendors-title">
        <div class="container">
          <div class="vendors-header__content flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 id="vendors-title" class="vendors-header__title">
                Discover Trusted Vendors
              </h1>
              <p class="vendors-header__subtitle text-secondary">
                Find verified local vendors, guides, and services across India
              </p>
            </div>
            <div class="vendors-header__actions flex gap-3">
              <a href="#trust" data-page="trust" class="btn btn--outline btn--sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Trust Hub
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Vendors Filters -->
      <section class="vendors-filters-section" aria-labelledby="filters-title">
        <div class="container">
          <div class="vendors-filters card p-6" id="vendors-filters">
            <h2 id="filters-title" class="vendors-filters__title">Filter Vendors</h2>
            <form class="vendors-filters__form" id="vendors-form" role="form">
              <div class="vendors-filters__grid grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));">
                <!-- Search -->
                <div class="form-group full-width">
                  <label for="vendor-search" class="form-label">Search vendors</label>
                  <div class="relative">
                    <input
                      type="text"
                      id="vendor-search"
                      class="form-input vendor-input"
                      placeholder="e.g., Goa beach resort, trekking guide"
                      list="vendor-suggestions"
                      aria-describedby="vendor-search-help"
                    >
                    <datalist id="vendor-suggestions">
                      <!-- Will be populated dynamically -->
                    </datalist>
                    <span id="vendor-search-help" class="form-hint">Search by name, type, or location</span>
                    <button type="button" class="vendors-form__clear-btn" id="clear-vendor-search" aria-label="Clear search">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <!-- Type -->
                <div class="form-group">
                  <label for="vendor-type" class="form-label">Vendor Type</label>
                  <select id="vendor-type" class="form-select vendor-select">
                    <option value="">All Types</option>
                    <option value="hotel">Hotel & Resort</option>
                    <option value="homestay">Homestay</option>
                    <option value="tour">Tour Operator</option>
                    <option value="activity">Activity Provider</option>
                    <option value="houseboat">Houseboat</option>
                    <option value="camp">Adventure Camp</option>
                    <option value="transport">Transport</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="spa">Spa & Wellness</option>
                  </select>
                </div>
                
                <!-- Location -->
                <div class="form-group">
                  <label for="vendor-location" class="form-label">Location</label>
                  <input
                    type="text"
                    id="vendor-location"
                    class="form-input vendor-input"
                    placeholder="e.g., Goa, Manali, Jaipur"
                    list="vendor-locations"
                    aria-describedby="vendor-location-help"
                  >
                  <datalist id="vendor-locations">
                    <!-- Will be populated dynamically -->
                  </datalist>
                  <span id="vendor-location-help" class="form-hint">Search by city, state, or region</span>
                </div>
                
                <!-- Price Range -->
                <div class="form-group">
                  <label for="vendor-price" class="form-label">Price Range (INR/night)</label>
                  <div class="price-slider-wrapper">
                    <input type="range" id="vendor-price-min" class="price-slider" min="0" max="50000" value="0">
                    <input type="range" id="vendor-price-max" class="price-slider" min="0" max="50000" value="50000">
                    <div class="price-slider-labels">
                      <span>₹0</span>
                      <span>₹50,000</span>
                    </div>
                  </div>
                  <div class="price-range-display">
                    <span id="vendor-price-min-value">₹0</span> - <span id="vendor-price-max-value">₹50,000</span>
                  </div>
                </div>
                
                <!-- Rating -->
                <div class="form-group">
                  <label for="vendor-rating" class="form-label">Minimum Rating</label>
                  <select id="vendor-rating" class="form-select vendor-select">
                    <option value="">Any Rating</option>
                    <option value="4">4★ & Up</option>
                    <option value="4.5">4.5★ & Up</option>
                    <option value="5">5★ Only</option>
                  </select>
                </div>
                
                <!-- Verification -->
                <div class="form-group full-width">
                  <div class="flex gap-3 items-center">
                    <label class="flex items-center gap-2">
                      <input type="checkbox" id="vendor-verified" class="vendor-checkbox">
                      <span>Verified Vendors Only</span>
                    </label>
                    <label class="flex items-center gap-2">
                      <input type="checkbox" id="vendor-trust-badge" class="vendor-checkbox">
                      <span>Trust Badge Holders</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <!-- Filter Actions -->
              <div class="vendors-filters__actions mt-6">
                <button type="submit" class="btn btn--primary btn--lg" id="vendor-filter-btn">
                  <span class="spinner spinner--sm" id="vendor-filter-spinner" hidden></span>
                  <span id="vendor-filter-btn-text">Apply Filters</span>
                </button>
                <button type="button" class="btn btn--outline btn--lg ml-4" id="vendor-reset-btn">
                  Reset Filters
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <!-- Vendors Results -->
      <section class="vendors-results-section" aria-labelledby="results-title">
        <div class="container">
          <header class="vendors-results__header flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 id="results-title" class="vendors-results__title">Vendor Results</h2>
              <p class="vendors-results__subtitle text-secondary" id="vendors-count">
                Find your perfect travel experience
              </p>
            </div>
            <div class="vendors-results__sort flex items-center gap-3">
              <label for="vendor-sort-by" class="form-label text-secondary">Sort by:</label>
              <select id="vendor-sort-by" class="form-select sort-select">
                <option value="relevance">Relevance</option>
                <option value="rating">Rating: High to Low</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
                <option value="distance">Distance: Nearest</option>
              </select>
            </div>
          </header>
          
          <!-- Vendors Grid -->
          <div class="vendors-grid grid gap-6" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));" id="vendors-grid">
            <!-- Vendors will be injected here -->
          </div>
          
          <!-- No Results Message -->
          <div class="vendors-no-results" id="vendors-no-results" hidden>
            <div class="no-results-card card text-center py-12">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="no-results-icon mb-4" style="color: var(--color-text-tertiary);">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <h3 class="no-results__title">No vendors found</h3>
              <p class="no-results__text text-secondary">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <button class="btn btn--outline btn--sm mt-6" id="clear-all-vendor-filters">
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

function initVendorFilters() {
  const form = document.getElementById('vendors-form');
  const searchInput = document.getElementById('vendor-search');
  const clearSearchBtn = document.getElementById('clear-vendor-search');
  const resetBtn = document.getElementById('vendor-reset-btn');
  const filterBtn = document.getElementById('vendor-filter-btn');
  const filterSpinner = document.getElementById('vendor-filter-spinner');
  const filterBtnText = document.getElementById('vendor-filter-btn-text');
  
  // Populate search suggestions
  populateVendorSuggestions();
  
  // Clear search
  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchInput.focus();
  });
  
  // Reset filters
  resetBtn.addEventListener('click', () => {
    resetVendorFilters();
    // Trigger search with cleared filters
    filterVendors();
  });
  
  // Filter form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await filterVendors();
  });
  
  // Initialize price range sliders
  initVendorPriceSliders();
}

function populateVendorSuggestions() {
  const searchDatalist = document.getElementById('vendor-suggestions');
  const locationDatalist = document.getElementById('vendor-locations');
  
  if (!searchDatalist || !locationDatalist) return;
  
  // Add vendor names
  vendors.forEach(vendor => {
    // For search
    const searchOption = document.createElement('option');
    searchOption.value = vendor.name;
    searchDatalist.appendChild(searchOption);
    
    // For location
    const locationOption = document.createElement('option');
    locationOption.value = vendor.location;
    locationDatalist.appendChild(locationOption);
  });
  
  // Also add unique locations from destinations for better suggestions
  // (We would normally fetch destinations, but for now we'll use a static list)
  const commonLocations = ['Goa', 'Manali', 'Jaipur', 'Kerala', 'Rishikesh', 'Andaman', 'Udaipur', 'Leh-Ladakh', 'Varanasi', 'Darjeeling'];
  commonLocations.forEach(loc => {
    const locOption = document.createElement('option');
    locOption.value = loc;
    locationDatalist.appendChild(locOption);
  });
}

function initVendorPriceSliders() {
  const minSlider = document.getElementById('vendor-price-min');
  const maxSlider = document.getElementById('vendor-price-max');
  const minValue = document.getElementById('vendor-price-min-value');
  const maxValue = document.getElementById('vendor-price-max-value');
  
  if (minSlider && maxSlider && minValue && maxValue) {
    const updatePriceDisplay = () => {
      minValue.textContent = `₹${parseInt(minSlider.value).toLocaleString()}`;
      maxValue.textContent = `₹${parseInt(maxSlider.value).toLocaleString()}`;
    };
    
    minSlider.addEventListener('input', updatePriceDisplay);
    maxSlider.addEventListener('input', updatePriceDisplay);
    
    // Prevent min from exceeding max
    minSlider.addEventListener('change', () => {
      if (parseInt(minSlider.value) > parseInt(maxSlider.value)) {
        minSlider.value = maxSlider.value;
      }
      updatePriceDisplay();
    });
    
    maxSlider.addEventListener('change', () => {
      if (parseInt(maxSlider.value) < parseInt(minSlider.value)) {
        maxSlider.value = minSlider.value;
      }
      updatePriceDisplay();
    });
    
    // Initialize display
    updatePriceDisplay();
  }
}

function resetVendorFilters() {
  const form = document.getElementById('vendors-form');
  if (form) form.reset();
  
  // Reset price sliders to min/max
  const minSlider = document.getElementById('vendor-price-min');
  const maxSlider = document.getElementById('vendor-price-max');
  if (minSlider) minSlider.value = 0;
  if (maxSlider) maxSlider.value = 50000;
  
  // Update price display
  const minValue = document.getElementById('vendor-price-min-value');
  const maxValue = document.getElementById('vendor-price-max-value');
  if (minValue) minValue.textContent = '₹0';
  if (maxValue) maxValue.textContent = '₹50,000';
  
  // Reset search query
  const searchInput = document.getElementById('vendor-search');
  if (searchInput) searchInput.value = '';
  
  // Reset location
  const locationInput = document.getElementById('vendor-location');
  if (locationInput) locationInput.value = '';
}

function getVendorFilters() {
  const searchInput = document.getElementById('vendor-search');
  const locationInput = document.getElementById('vendor-location');
  const typeSelect = document.getElementById('vendor-type');
  const ratingSelect = document.getElementById('vendor-rating');
  const verifiedCheckbox = document.getElementById('vendor-verified');
  const trustBadgeCheckbox = document.getElementById('vendor-trust-badge');
  const minSlider = document.getElementById('vendor-price-min');
  const maxSlider = document.getElementById('vendor-price-max');
  
  return {
    query: searchInput ? searchInput.value.trim() : '',
    location: locationInput ? locationInput.value.trim() : '',
    type: typeSelect ? typeSelect.value : '',
    rating: ratingSelect ? ratingSelect.value : '',
    verified: verifiedCheckbox ? verifiedCheckbox.checked : false,
    trustBadge: trustBadgeCheckbox ? trustBadgeCheckbox.checked : false,
    priceMin: parseInt(minSlider?.value || '0'),
    priceMax: parseInt(maxSlider?.value || '50000')
  };
}

function matchesVendorFilters(vendor, filters) {
  // If query exists, search in relevant fields
  if (filters.query) {
    const query = filters.query.toLowerCase();
    const searchableText = `${vendor.name} ${vendor.description} ${vendor.type} ${vendor.category} ${vendor.location} ${vendor.amenities.join(' ')}`.toLowerCase();
    if (!searchableText.includes(query)) {
      return false;
    }
  }
  
  // Filter by location
  if (filters.location) {
    const locationQuery = filters.location.toLowerCase();
    if (!vendor.location.toLowerCase().includes(locationQuery)) {
      return false;
    }
  }
  
  // Filter by type
  if (filters.type && filters.type !== '') {
    if (vendor.type !== filters.type) {
      return false;
    }
  }
  
  // Filter by rating
  if (filters.rating && filters.rating !== '') {
    const minRating = parseFloat(filters.rating);
    if (vendor.rating < minRating) {
      return false;
    }
  }
  
  // Filter by verified
  if (filters.verified) {
    if (!vendor.verified) {
      return false;
    }
  }
  
  // Filter by trust badge (we don't have this field in our data, so we'll skip or use verified as proxy)
  // In a real app, we would have a trustBadge or similar field
  if (filters.trustBadge) {
    // For now, we'll treat verified vendors as having trust badge
    if (!vendor.verified) {
      return false;
    }
  }
  
  // Filter by price range
  const pricePerNight = vendor.pricePerNight || 0;
  if (pricePerNight < filters.priceMin || pricePerNight > filters.priceMax) {
    return false;
  }
  
  return true;
}

function filterAndSortVendors(vendors, filters) {
  // Filter vendors
  let filtered = vendors.filter(vendor => matchesVendorFilters(vendor, filters));
  
  // Sort vendors
  const sortBy = document.getElementById('vendor-sort-by')?.value || 'relevance';
  
  if (sortBy !== 'relevance') {
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price-low':
          return (a.pricePerNight || 0) - (b.pricePerNight || 0);
        case 'price-high':
          return (b.pricePerNight || 0) - (a.pricePerNight || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'distance':
          // We don't have distance data, so we'll just sort by name as fallback
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }
  
  return filtered;
}

function renderVendorCard(vendor) {
  return `
    <article class="card card--interactive vendor-card" data-vendor-id="${vendor.id}">
      <img src="${vendor.image}" alt="${vendor.name}" class="card__image vendor-card__image" loading="lazy">
      <div class="card__content">
        <div class="flex items-start justify-between gap-2 mb-2">
          <span class="vendor-card__type badge badge--${vendor.verified ? 'accent' : 'outline'}">${vendor.type}</span>
          <span class="vendor-card__rating" aria-label="Rating: ${vendor.rating} out of 5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="color: var(--color-secondary-500);"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            ${vendor.rating} (${vendor.reviewCount})
          </span>
        </div>
        <h3 class="card__title vendor-card__title">${vendor.name}</h3>
        <p class="card__subtitle vendor-card__subtitle">${vendor.category} • ${vendor.location}</p>
        <div class="vendor-card__meta card__meta">
          <span>${vendor.pricePerNight ? `₹${vendor.pricePerNight.toLocaleString()}/night` : 'Price on request'}</span>
          <span>${vendor.verified ? 'Verified' : ''}</span>
        </div>
        <div class="vendor-card__amenities mt-2 flex flex-wrap gap-2">
          ${vendor.amenities.slice(0, 4).map(amenity => `
            <span class="amenity-tag text-xs text-tertiary bg-neutral-50 px-2 py-1 rounded">${amenity}</span>
          `).join('')}
          ${vendor.amenities.length > 4 ? `
            <span class="amenity-tag text-xs text-tertiary bg-neutral-50 px-2 py-1 rounded">+${vendor.amenities.length - 4} more</span>
          ` : ''}
        </div>
      </div>
      <div class="card__footer">
        <div class="vendor-card__price">
          <span class="vendor-card__amount font-bold" style="font-size: var(--text-xl);">${vendor.pricePerNight ? vendor.pricePerNight.toLocaleString() : '0'}</span>
          <span class="vendor-card__currency text-secondary">${vendor.pricePerNight ? vendor.currency : ''}</span>
          <span class="text-xs text-tertiary">/night</span>
        </div>
        <div class="vendor-card__actions flex gap-2">
          <button class="btn btn--outline btn--sm vendor-view-btn" data-vendor-id="${vendor.id}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M15 2l-3 3m0 0l-3 3m3 3H3m18 0h-3"/>
            </svg>
            View
          </button>
          <button class="btn btn--primary btn--sm vendor-book-btn" data-vendor-id="${vendor.id}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M3 3h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
              <path d="M3 9h18"/>
              <path d="M3 14h18"/>
              <path d="M7 9v11"/>
              <path d="M17 9v11"/>
            </svg>
            Book
          </button>
        </div>
      </div>
    </article>
  `;
}

function initVendorGrid() {
  const grid = document.getElementById('vendors-grid');
  if (!grid) return;
  
  // Initial render
  filterVendors();
}

function initVendorSort() {
  const sortSelect = document.getElementById('vendor-sort-by');
  if (sortSelect) {
    sortSelect.addEventListener('change', filterVendors);
  }
}

async function filterVendors() {
  // Show loading
  const filterBtn = document.getElementById('vendor-filter-btn');
  const filterSpinner = document.getElementById('vendor-filter-spinner');
  const filterBtnText = document.getElementById('vendor-filter-btn-text');
  
  if (filterBtn) {
    filterBtn.disabled = true;
    filterSpinner.hidden = false;
    filterBtnText.textContent = 'Filtering...';
  }
  
  try {
    const filters = getVendorFilters();
    const filteredVendors = filterAndSortVendors(vendors, filters);
    
    // Update results count
    const countEl = document.getElementById('vendors-count');
    if (countEl) {
      countEl.textContent = `${filteredVendors.length} vendors found`;
    }
    
    // Render vendor grid
    const grid = document.getElementById('vendors-grid');
    if (grid) {
      grid.innerHTML = filteredVendors.map(renderVendorCard).join('');
      
      // Add click listeners to vendor cards
      initVendorCardListeners();
    }
    
    // Show/hide no results message
    const noResultsEl = document.getElementById('vendors-no-results');
    if (noResultsEl) {
      noResultsEl.hidden = filteredVendors.length > 0;
    }
    
    // Update URL with current filters (without triggering hashchange)
    updateVendorURL(filters);
    
    toast.success('Filters applied', `${filteredVendors.length} vendors found`);
  } catch (error) {
    console.error('Vendor filtering error:', error);
    toast.error('Failed to apply filters', 'Please try again later');
  } finally {
    if (filterBtn) {
      filterBtn.disabled = false;
      filterSpinner.hidden = true;
      filterBtnText.textContent = 'Apply Filters';
    }
  }
}

function initVendorCardListeners() {
  // View vendor button
  document.querySelectorAll('.vendor-view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const vendorId = btn.dataset.vendorId;
      window.location.hash = `#vendor/${vendorId}`;
    });
  });
  
  // Book vendor button
  document.querySelectorAll('.vendor-book-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const vendorId = btn.dataset.vendorId;
      // In a real app, we'd navigate to booking or show a modal
      toast.info('Booking feature', 'Booking functionality coming soon!');
    });
  });
  
  // Card click (for view)
  document.querySelectorAll('.vendor-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Prevent double trigger if button inside was clicked
      if (e.target.closest('.vendor-view-btn') || e.target.closest('.vendor-book-btn')) {
        return;
      }
      const vendorId = card.dataset.vendorId;
      window.location.hash = `#vendor/${vendorId}`;
    });
  });
}

function updateVendorURL(filters) {
  const params = new URLSearchParams();
  
  if (filters.query) params.set('q', filters.query);
  if (filters.location) params.set('location', filters.location);
  if (filters.type) params.set('type', filters.type);
  if (filters.rating) params.set('rating', filters.rating);
  if (filters.verified) params.set('verified', 'true');
  if (filters.trustBadge) params.set('trust', 'true');
  if (filters.priceMin !== 0) params.set('min', filters.priceMin);
  if (filters.priceMax !== 50000) params.set('max', filters.priceMax);
  
  // Update URL without triggering hashchange
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.pushState({ path: newUrl }, '', newUrl);
}

function applyVendorFiltersFromURL() {
  const queryParams = new URLSearchParams(window.location.search);
  
  // Set search query
  const query = queryParams.get('q');
  if (query) {
    document.getElementById('vendor-search').value = query;
  }
  
  // Set location
  const location = queryParams.get('location');
  if (location) {
    document.getElementById('vendor-location').value = location;
  }
  
  // Set type
  const type = queryParams.get('type');
  if (type) {
    document.getElementById('vendor-type').value = type;
  }
  
  // Set rating
  const rating = queryParams.get('rating');
  if (rating) {
    document.getElementById('vendor-rating').value = rating;
  }
  
  // Set verified
  const verified = queryParams.get('verified');
  if (verified === 'true') {
    document.getElementById('vendor-verified').checked = true;
  }
  
  // Set trust badge
  const trust = queryParams.get('trust');
  if (trust === 'true') {
    document.getElementById('vendor-trust-badge').checked = true;
  }
  
  // Set price min
  const min = queryParams.get('min');
  if (min) {
    document.getElementById('vendor-price-min').value = min;
    document.getElementById('vendor-price-min-value').textContent = `₹${parseInt(min).toLocaleString()}`;
  }
  
  // Set price max
  const max = queryParams.get('max');
  if (max) {
    document.getElementById('vendor-price-max').value = max;
    document.getElementById('vendor-price-max-value').textContent = `₹${parseInt(max).toLocaleString()}`;
  }
  
  // Trigger initial filter
  filterVendors();
}

// Vendor detail page handler (if we navigate to /vendor/:id)
// This would typically be in a separate vendor-detail.js, but for simplicity we'll handle it here
// by checking the hash in the app.js router and calling this function if needed.
// However, since we're only building the vendors list page, we'll leave the detail page for later.
// In a full implementation, we would have a separate vendor-detail.js.

// For now, we'll just note that the vendor detail page would be implemented similarly to other detail pages.