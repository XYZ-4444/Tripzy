/**
 * Tripzy - Search Page Module
 * Unified search for destinations, packages, and vendors with filters
 */

import { api } from '../utils/api.js';

let destinations = [];
let packages = [];
let vendors = [];

export async function initSearch(container, { state, api, toast }) {
  // Load data
  try {
    const [destRes, pkgRes, venRes] = await Promise.all([
      fetch('/data/destinations.json').then(r => r.json()),
      fetch('/data/packages.json').then(r => r.json()),
      fetch('/data/vendors.json').then(r => r.json()),
    ]);
    destinations = destRes;
    packages = pkgRes;
    vendors = venRes;
  } catch (e) {
    console.error('Failed to load search data:', e);
    toast.error('Failed to load search data', 'Please try again later');
  }

  // Parse query parameters from hash
  const queryParams = new URLSearchParams(window.location.search);
  
  // Render page
  container.innerHTML = renderSearch();
  container.hidden = false;

  // Initialize components
  initSearchForm();
  initFilters();
  initResultsTabs();
  
  // Apply initial search if query params exist
  if (queryParams.toString()) {
    applySearchFromURL();
  } else {
    // Show all results by default
    showResults();
  }

  // Return cleanup function
  return () => {
    // Cleanup if needed
  };
}

function renderSearch() {
  return `
    <div class="page-content">
      <!-- Search Header -->
      <section class="search-header" aria-labelledby="search-title">
        <div class="container">
          <div class="search-header__content">
            <h1 id="search-title" class="search-header__title">
              Search Travel Experiences
            </h1>
            <p class="search-header__subtitle">
              Find destinations, trips, and local vendors across India
            </p>
          </div>
        </div>
      </section>

      <!-- Search Form -->
      <section class="search-form-section" aria-labelledby="form-title">
        <div class="container">
          <div class="search-form-card card" id="search-form-card">
            <h2 id="form-title" class="search-form__title">Search & Filter</h2>
            <form class="search-form" id="search-form" role="form" aria-labelledby="form-title">
              <div class="search-form__row grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
                <!-- Search Input -->
                <div class="form-group full-width">
                  <label for="search-query" class="form-label">Search destinations, trips, or vendors</label>
                  <div class="relative">
                    <input
                      type="text"
                      id="search-query"
                      class="form-input search-input"
                      placeholder="e.g., Goa, beach resort, heritage tour"
                      list="search-suggestions"
                      aria-describedby="search-help"
                    >
                    <datalist id="search-suggestions">
                      <!-- Will be populated dynamically -->
                    </datalist>
                    <span id="search-help" class="form-hint">Search by name, type, or location</span>
                    <button type="button" class="search-form__clear-btn" id="clear-search" aria-label="Clear search">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <!-- Category Tabs (as buttons) -->
                <div class="form-group full-width">
                  <label class="visually-hidden">Search category</label>
                  <div class="search-category-tabs" role="tablist" aria-label="Search category">
                    <button type="button" class="search-tab-btn tab-active" data-category="all" role="tab" aria-selected="true" aria-controls="results-all">
                      All
                    </button>
                    <button type="button" class="search-tab-btn" data-category="destinations" role="tab" aria-selected="false" aria-controls="results-destinations">
                      Destinations
                    </button>
                    <button type="button" class="search-tab-btn" data-category="packages" role="tab" aria-selected="false" aria-controls="results-packages">
                      Trips & Packages
                    </button>
                    <button type="button" class="search-tab-btn" data-category="vendors" role="tab" aria-selected="false" aria-controls="results-vendors">
                      Vendors & Services
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Filters Accordion (collapsible) -->
              <div class="form-group full-width" id="filters-section">
                <button type="button" class="search-filter-toggle btn btn--outline btn--w" id="filter-toggle">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="filter-icon" aria-hidden="true">
                    <path d="M9 5l7 7-7 7"/>
                  </svg>
                  <span>Filters</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="filter-icon-open" aria-hidden="true" hidden>
                    <path d="M18 15l-6-6-6 6"/>
                  </svg>
                </button>
                <div class="search-filters-collapse" id="filters-collapse" hidden>
                  <div class="search-filters card p-4" id="search-filters">
                    <h3 class="search-filters__title mb-4">Refine your search</h3>
                    <div class="search-filters__grid grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));">
                      <!-- Type Filter -->
                      <div class="form-group">
                        <label for="filter-type" class="form-label">Type</label>
                        <select id="filter-type" class="form-select filter-select">
                          <option value="">All Types</option>
                          <option value="beach">Beach</option>
                          <option value="mountain">Mountain</option>
                          <option value="heritage">Heritage</option>
                          <option value="adventure">Adventure</option>
                          <option value="backwater">Backwater</option>
                          <option value="island">Island</option>
                          <option value="hotel">Hotel</option>
                          <option value="homestay">Homestay</option>
                          <option value="tour">Tour</option>
                          <option value="activity">Activity</option>
                        </select>
                      </div>
                      
                      <!-- Price Range -->
                      <div class="form-group">
                        <label for="filter-price" class="form-label">Price Range (INR)</label>
                        <div class="price-slider-wrapper">
                          <input type="range" id="filter-price-min" class="price-slider" min="0" max="50000" value="0">
                          <input type="range" id="filter-price-max" class="price-slider" min="0" max="50000" value="50000">
                          <div class="price-slider-labels">
                            <span>₹0</span>
                            <span>₹50,000</span>
                          </div>
                        </div>
                        <div class="price-range-display">
                          <span id="price-min-value">₹0</span> - <span id="price-max-value">₹50,000</span>
                        </div>
                      </div>
                      
                      <!-- Rating Filter -->
                      <div class="form-group">
                        <label for="filter-rating" class="form-label">Minimum Rating</label>
                        <select id="filter-rating" class="form-select filter-select">
                          <option value="">Any Rating</option>
                          <option value="4">4★ & Up</option>
                          <option value="4.5">4.5★ & Up</option>
                          <option value="5">5★ Only</option>
                        </select>
                      </div>
                      
                      <!-- Availability -->
                      <div class="form-group">
                        <label class="form-label">Availability</label>
                        <div class="flex gap-3 items-center">
                          <label class="flex items-center gap-2">
                            <input type="checkbox" id="filter-verified" class="filter-checkbox">
                            <span>Verified Only</span>
                          </label>
                          <label class="flex items-center gap-2">
                            <input type="checkbox" id="filter-available" class="filter-checkbox">
                            <span>Currently Available</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Search Actions -->
              <div class="search-form__actions mt-6">
                <button type="submit" class="btn btn--primary btn--lg" id="search-btn">
                  <span class="spinner spinner--sm" id="search-spinner" hidden></span>
                  <span id="search-btn-text">Search</span>
                </button>
                <button type="button" class="btn btn--outline btn--lg ml-4" id="reset-search-btn">
                  Reset Filters
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <!-- Results Section -->
      <section class="search-results-section" aria-labelledby="results-title">
        <div class="container">
          <header class="search-results__header flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 id="results-title" class="search-results__title">Search Results</h2>
              <p class="search-results__subtitle text-secondary" id="results-count">
                Find your perfect travel experience
              </p>
            </div>
            <div class="search-results__sort flex items-center gap-3">
              <label for="sort-by" class="form-label text-secondary">Sort by:</label>
              <select id="sort-by" class="form-select sort-select">
                <option value="relevance">Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Rating: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </header>
          
          <!-- Results Tabs -->
          <div class="search-results-tabs" role="tablist">
            <button type="button" class="search-results-tab tab-active" data-tab="all" role="tab" aria-selected="true" aria-controls="panel-all">
              All Results
            </button>
            <button type="button" class="search-results-tab" data-tab="destinations" role="tab" aria-selected="false" aria-controls="panel-destinations">
              Destinations
            </button>
            <button type="button" class="search-results-tab" data-tab="packages" role="tab" aria-selected="false" aria-controls="panel-packages">
              Trips & Packages
            </button>
            <button type="button" class="search-results-tab" data-tab="vendors" role="tab" aria-selected="false" aria-controls="panel-vendors">
              Vendors & Services
            </button>
          </div>
          
          <!-- Tab Panels -->
          <div class="search-results-panels">
            <div class="search-results-panel" id="panel-all" role="tabpanel" aria-labelledby="tab-all">
              <div class="results-grid grid gap-6" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));" id="results-all-grid">
                <!-- Results will be injected here -->
              </div>
            </div>
            <div class="search-results-panel" id="panel-destinations" role="tabpanel" aria-labelledby="tab-destinations" hidden>
              <div class="results-grid grid gap-6" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));" id="results-destinations-grid">
                <!-- Results will be injected here -->
              </div>
            </div>
            <div class="search-results-panel" id="panel-packages" role="tabpanel" aria-labelledby="tab-packages" hidden>
              <div class="results-grid grid gap-6" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));" id="results-packages-grid">
                <!-- Results will be injected here -->
              </div>
            </div>
            <div class="search-results-panel" id="panel-vendors" role="tabpanel" aria-labelledby="tab-vendors" hidden>
              <div class="results-grid grid gap-6" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));" id="results-vendors-grid">
                <!-- Results will be injected here -->
              </div>
            </div>
          </div>
          
          <!-- No Results Message -->
          <div class="search-no-results" id="search-no-results" hidden>
            <div class="no-results-card card text-center py-12">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="no-results-icon mb-4" style="color: var(--color-text-tertiary);">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <h3 class="no-results__title">No results found</h3>
              <p class="no-results__text text-secondary">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <button class="btn btn--outline btn--sm mt-6" id="clear-all-filters">
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

function initSearchForm() {
  const form = document.getElementById('search-form');
  const queryInput = document.getElementById('search-query');
  const clearSearchBtn = document.getElementById('clear-search');
  const categoryTabs = document.querySelectorAll('.search-tab-btn');
  const filterToggle = document.getElementById('filter-toggle');
  const filtersCollapse = document.getElementById('filters-collapse');
  const filterIcons = {
    close: filterToggle.querySelector('.filter-icon'),
    open: filterToggle.querySelector('.filter-icon-open')
  };
  const resetBtn = document.getElementById('reset-search-btn');
  const searchBtn = document.getElementById('search-btn');
  const searchSpinner = document.getElementById('search-spinner');
  const searchBtnText = document.getElementById('search-btn-text');
  
  // Populate search suggestions
  populateSearchSuggestions();
  
  // Clear search
  clearSearchBtn.addEventListener('click', () => {
    queryInput.value = '';
    queryInput.focus();
  });
  
  // Category tabs
  categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      categoryTabs.forEach(t => t.classList.remove('tab-active'));
      tab.classList.add('tab-active');
      
      // Update active tab in results section too
      const category = tab.dataset.category;
      updateResultsTab(category);
    });
  });
  
  // Toggle filters
  filterToggle.addEventListener('click', () => {
    const isHidden = filtersCollapse.hidden;
    filtersCollapse.hidden = !isHidden;
    
    // Toggle icons
    filterIcons.close.hidden = !isHidden;
    filterIcons.open.hidden = isHidden;
    
    // Update button text
    filterToggle.querySelector('span').textContent = isHidden ? 'Filters' : 'Hide Filters';
  });
  
  // Reset filters
  resetBtn.addEventListener('click', () => {
    resetFilters();
    // Trigger search with cleared filters
    performSearch();
  });
  
  // Search form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await performSearch();
  });
  
  // Initialize filter event listeners
  initFilterListeners();
}

function populateSearchSuggestions() {
  const datalist = document.getElementById('search-suggestions');
  if (!datalist) return;
  
  // Add destination names
  destinations.forEach(dest => {
    const option = document.createElement('option');
    option.value = dest.name;
    datalist.appendChild(option);
  });
  
  // Add package titles
  packages.forEach(pkg => {
    const option = document.createElement('option');
    option.value = pkg.title;
    datalist.appendChild(option);
  });
  
  // Add vendor names
  vendors.forEach(vendor => {
    const option = document.createElement('option');
    option.value = vendor.name;
    datalist.appendChild(option);
  });
}

function initFilters() {
  // Price range sliders
  const minSlider = document.getElementById('filter-price-min');
  const maxSlider = document.getElementById('filter-price-max');
  const minValue = document.getElementById('price-min-value');
  const maxValue = document.getElementById('price-max-value');
  
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

function initFilterListeners() {
  const filters = {
    type: document.getElementById('filter-type'),
    rating: document.getElementById('filter-rating'),
    verified: document.getElementById('filter-verified'),
    available: document.getElementById('filter-available')
  };
  
  // Add change listeners to all filters
  Object.values(filters).forEach(filter => {
    if (filter) {
      filter.addEventListener('change', performSearch);
    }
  });
  
  // Price sliders - we'll handle change event (not input) to avoid too many searches
  const minSlider = document.getElementById('filter-price-min');
  const maxSlider = document.getElementById('filter-price-max');
  if (minSlider && maxSlider) {
    minSlider.addEventListener('change', performSearch);
    maxSlider.addEventListener('change', performSearch);
  }
}

function resetFilters() {
  const form = document.getElementById('search-form');
  if (form) form.reset();
  
  // Reset price sliders to min/max
  const minSlider = document.getElementById('filter-price-min');
  const maxSlider = document.getElementById('filter-price-max');
  if (minSlider) minSlider.value = 0;
  if (maxSlider) maxSlider.value = 50000;
  
  // Update price display
  const minValue = document.getElementById('price-min-value');
  const maxValue = document.getElementById('price-max-value');
  if (minValue) minValue.textContent = '₹0';
  if (maxValue) maxValue.textContent = '₹50,000';
  
  // Reset search query
  const queryInput = document.getElementById('search-query');
  if (queryInput) queryInput.value = '';
  
  // Reset category tabs to "all"
  const categoryTabs = document.querySelectorAll('.search-tab-btn');
  categoryTabs.forEach(tab => {
    tab.classList.remove('tab-active');
    if (tab.dataset.category === 'all') tab.classList.add('tab-active');
  });
}

function getFilters() {
  const queryInput = document.getElementById('search-query');
  const categoryTab = document.querySelector('.search-tab-btn.tab-active');
  const filters = {
    query: queryInput ? queryInput.value.trim() : '',
    category: categoryTab ? categoryTab.dataset.category : 'all',
    type: document.getElementById('filter-type')?.value || '',
    rating: document.getElementById('filter-rating')?.value || '',
    verified: document.getElementById('filter-verified')?.checked || false,
    available: document.getElementById('filter-available')?.checked || false,
    priceMin: parseInt(document.getElementById('filter-price-min')?.value || '0'),
    priceMax: parseInt(document.getElementById('filter-price-max')?.value || '50000')
  };
  
  return filters;
}

function matchesFilters(item, filters, type) {
  // If query exists, search in relevant fields
  if (filters.query) {
    const query = filters.query.toLowerCase();
    let searchableText = '';
    
    switch (type) {
      case 'destinations':
        searchableText = `${item.name} ${item.description} ${item.type} ${item.highlights.join(' ')}`.toLowerCase();
        break;
      case 'packages':
        searchableText = `${item.title} ${item.destination} ${item.description} ${item.tags.join(' ')} ${item.highlights.join(' ')}`.toLowerCase();
        break;
      case 'vendors':
        searchableText = `${item.name} ${item.description} ${item.type} ${item.category} ${item.amenities.join(' ')} ${item.highlights.join(' ')}`.toLowerCase();
        break;
      default:
        return false;
    }
    
    if (!searchableText.includes(query)) {
      return false;
    }
  }
  
  // Filter by category (type)
  if (filters.type && filters.type !== '') {
    let itemType = '';
    switch (type) {
      case 'destinations':
        itemType = item.type;
        break;
      case 'packages':
        // For packages, we might need to map tags to type or use a type field
        // Since packages don't have a direct type, we'll check tags
        itemType = item.tags.includes(filters.type) ? filters.type : '';
        break;
      case 'vendors':
        itemType = item.type;
        break;
      default:
        return false;
    }
    
    if (itemType !== filters.type) {
      return false;
    }
  }
  
  // Filter by rating
  if (filters.rating && filters.rating !== '') {
    const minRating = parseFloat(filters.rating);
    let itemRating = 0;
    
    switch (type) {
      case 'destinations':
        itemRating = item.rating;
        break;
      case 'packages':
        itemRating = item.rating;
        break;
      case 'vendors':
        itemRating = item.rating;
        break;
    }
    
    if (itemRating < minRating) {
      return false;
    }
  }
  
  // Filter by verified
  if (filters.verified) {
    let isVerified = false;
    switch (type) {
      case 'destinations':
        // Destinations don't have verified flag in our data, assume all are verified
        isVerified = true;
        break;
      case 'packages':
        // Packages don't have verified flag, assume all are verified
        isVerified = true;
        break;
      case 'vendors':
        isVerified = item.verified || false;
        break;
    }
    
    if (!isVerified) {
      return false;
    }
  }
  
  // Filter by price range
  let itemPrice = 0;
  switch (type) {
    case 'destinations':
      itemPrice = item.startingPrice || 0;
      break;
    case 'packages':
      itemPrice = item.price || 0;
      break;
    case 'vendors':
      // For vendors, we'll use pricePerNight if available, otherwise 0
      itemPrice = item.pricePerNight || 0;
      break;
  }
  
  if (itemPrice < filters.priceMin || itemPrice > filters.priceMax) {
    return false;
  }
  
  // Filter by availability (we don't have real availability data, so skip for now)
  // In a real app, we would check availability dates
  
  return true;
}

function filterAndSortItems(items, filters, type) {
  // Filter items
  let filtered = items.filter(item => matchesFilters(item, filters, type));
  
  // Sort items
  const sortBy = document.getElementById('sort-by')?.value || 'relevance';
  
  if (sortBy !== 'relevance') {
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return getPrice(a, type) - getPrice(b, type);
        case 'price-high':
          return getPrice(b, type) - getPrice(a, type);
        case 'rating':
          return getRating(b, type) - getRating(a, type);
        case 'name':
          return getName(a, type).localeCompare(getName(b, type));
        default:
          return 0;
      }
    });
  }
  
  return filtered;
}

function getPrice(item, type) {
  switch (type) {
    case 'destinations': return item.startingPrice || 0;
    case 'packages': return item.price || 0;
    case 'vendors': return item.pricePerNight || 0;
    default: return 0;
  }
}

function getRating(item, type) {
  switch (type) {
    case 'destinations': return item.rating || 0;
    case 'packages': return item.rating || 0;
    case 'vendors': return item.rating || 0;
    default: return 0;
  }
}

function getName(item, type) {
  switch (type) {
    case 'destinations': return item.name || '';
    case 'packages': return item.title || '';
    case 'vendors': return item.name || '';
    default: return '';
  }
}

function renderResultsGrid(items, type) {
  if (items.length === 0) {
    return '<div class="col-span-1 text-center py-8"><p class="text-secondary">No results found for this category.</p></div>';
  }
  
  return items.map(item => renderResultCard(item, type)).join('');
}

function renderResultCard(item, type) {
  switch (type) {
    case 'destinations':
      return renderDestinationCard(item);
    case 'packages':
      return renderPackageCard(item);
    case 'vendors':
      return renderVendorCard(item);
    default:
      return '';
  }
}

function renderDestinationCard(dest) {
  return `
    <article class="card card--interactive result-card" data-type="destination" data-slug="${dest.slug}">
      <img src="${dest.image}" alt="${dest.name}" class="card__image result-card__image" loading="lazy">
      <div class="card__content">
        <div class="flex items-start justify-between gap-2 mb-2">
          <span class="badge badge--outline">${dest.type}</span>
          <span class="result-card__rating" aria-label="Rating: ${dest.rating} out of 5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="color: var(--color-secondary-500);"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            ${dest.rating}
          </span>
        </div>
        <h3 class="card__title result-card__title">${dest.name}</h3>
        <p class="card__subtitle result-card__subtitle">${dest.description}</p>
        <div class="result-card__meta card__meta">
          <span>From ${dest.startingPrice.toLocaleString()} ${dest.currency}</span>
          <span>${dest.bestTime}</span>
        </div>
      </div>
    </article>
  `;
}

function renderPackageCard(pkg) {
  return `
    <article class="card card--interactive result-card" data-type="package" data-id="${pkg.id}">
      <img src="${pkg.image}" alt="${pkg.title}" class="card__image result-card__image" loading="lazy">
      <div class="card__content">
        <div class="flex items-start justify-between gap-2 mb-2">
          <span class="badge badge--primary">${pkg.type}</span>
          <span class="result-card__rating" aria-label="Rating: ${pkg.rating} out of 5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="color: var(--color-secondary-500);"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            ${pkg.rating} (${pkg.reviewCount})
          </span>
        </div>
        <h3 class="card__title result-card__title">${pkg.title}</h3>
        <p class="card__subtitle result-card__subtitle">${pkg.destination} • ${pkg.duration} days • ${pkg.nights} nights</p>
        <div class="result-card__meta card__meta">
          <span>${pkg.tags.slice(0, 2).join(' · ')}</span>
        </div>
      </div>
      <div class="card__footer">
        <div class="result-card__price">
          <span class="result-card__amount font-bold" style="font-size: var(--text-xl);">${pkg.price.toLocaleString()}</span>
          <span class="result-card__currency text-secondary">${pkg.currency}</span>
        </div>
        <button class="btn btn--primary btn--sm result-card__btn" data-id="${pkg.id}">View Details</button>
      </div>
    </article>
  `;
}

function renderVendorCard(vendor) {
  return `
    <article class="card card--interactive result-card" data-type="vendor" data-id="${vendor.id}">
      <img src="${vendor.image}" alt="${vendor.name}" class="card__image result-card__image" loading="lazy">
      <div class="card__content">
        <div class="flex items-start justify-between gap-2 mb-2">
          <span class="badge badge--${vendor.verified ? 'accent' : 'outline'}">${vendor.type}</span>
          <span class="result-card__rating" aria-label="Rating: ${vendor.rating} out of 5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="color: var(--color-secondary-500);"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            ${vendor.rating} (${vendor.reviewCount})
          </span>
        </div>
        <h3 class="card__title result-card__title">${vendor.name}</h3>
        <p class="card__subtitle result-card__subtitle">${vendor.category} • ${vendor.location}</p>
        <div class="result-card__meta card__meta">
          <span>${vendor.pricePerNight ? `₹${vendor.pricePerNight.toLocaleString()}/night` : 'Price on request'}</span>
          <span>${vendor.verified ? 'Verified' : ''}</span>
        </div>
      </div>
    </article>
  `;
}

function initResultsTabs() {
  const tabs = document.querySelectorAll('.search-results-tab');
  const panels = document.querySelectorAll('.search-results-panel');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update tab active state
      tabs.forEach(t => t.classList.remove('tab-active'));
      tab.classList.add('tab-active');
      
      // Show corresponding panel
      const panelId = tab.dataset.tab;
      panels.forEach(panel => {
        panel.hidden = panel.id !== `panel-${panelId}`;
      });
    });
  });
}

function updateResultsTab(category) {
  // Update the results tabs to match the selected category
  const tabMap = {
    all: 'all',
    destinations: 'destinations',
    packages: 'packages',
    vendors: 'vendors'
  };
  
  const targetTab = tabMap[category] || 'all';
  const tabs = document.querySelectorAll('.search-results-tab');
  
  tabs.forEach(tab => {
    if (tab.dataset.tab === targetTab) {
      tab.classList.add('tab-active');
    } else {
      tab.classList.remove('tab-active');
    }
  });
  
  // Show the corresponding panel
  const panels = document.querySelectorAll('.search-results-panel');
  panels.forEach(panel => {
    panel.hidden = panel.id !== `panel-${targetTab}`;
  });
}

function showResults() {
  const filters = getFilters();
  
  // Filter and sort each category
  const filteredDestinations = filterAndSortItems(destinations, filters, 'destinations');
  const filteredPackages = filterAndSortItems(packages, filters, 'packages');
  const filteredVendors = filterAndSortItems(vendors, filters, 'vendors');
  
  // Update results count
  const totalResults = filteredDestinations.length + filteredPackages.length + filteredVendors.length;
  const resultsCountEl = document.getElementById('results-count');
  if (resultsCountEl) {
    resultsCountEl.textContent = `${totalResults} results found`;
  }
  
  // Update each tab panel
  document.getElementById('results-all-grid').innerHTML = renderResultsGrid([
    ...filteredDestinations.map(d => ({ ...d, __type: 'destination' })),
    ...filteredPackages.map(p => ({ ...p, __type: 'package' })),
    ...filteredVendors.map(v => ({ ...v, __type: 'vendor' }))
  ], 'all'); // We'll handle mixed types in render
  
  document.getElementById('results-destinations-grid').innerHTML = renderResultsGrid(filteredDestinations, 'destinations');
  document.getElementById('results-packages-grid').innerHTML = renderResultsGrid(filteredPackages, 'packages');
  document.getElementById('results-vendors-grid').innerHTML = renderResultsGrid(filteredVendors, 'vendors');
  
  // Show/hide no results message
  const noResultsEl = document.getElementById('search-no-results');
  if (noResultsEl) {
    noResultsEl.hidden = totalResults > 0;
  }
  
  // Add click listeners to result cards
  initResultCardListeners();
}

function initResultCardListeners() {
  // Destination cards
  document.querySelectorAll('.result-card[data-type="destination"]').forEach(card => {
    card.addEventListener('click', () => {
      const slug = card.dataset.slug;
      window.location.hash = `#search?destination=${slug}`;
    });
  });
  
  // Package cards
  document.querySelectorAll('.result-card[data-type="package"]').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      window.location.hash = `#package/${id}`;
    });
  });
  
  // Vendor cards
  document.querySelectorAll('.result-card[data-type="vendor"]').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      window.location.hash = `#vendor/${id}`;
    });
  });
  
  // View details buttons on cards
  document.querySelectorAll('.result-card__btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.result-card');
      const type = card.dataset.type;
      const id = card.dataset.id || card.dataset.slug;
      
      if (type === 'package') {
        window.location.hash = `#package/${id}`;
      } else if (type === 'vendor') {
        window.location.hash = `#vendor/${id}`;
      }
    });
  });
}

async function performSearch() {
  // Show loading
  const searchBtn = document.getElementById('search-btn');
  const searchSpinner = document.getElementById('search-spinner');
  const searchBtnText = document.getElementById('search-btn-text');
  
  if (searchBtn) {
    searchBtn.disabled = true;
    searchSpinner.hidden = false;
    searchBtnText.textContent = 'Searching...';
  }
  
  try {
    // Update URL with current search params (without reloading page)
    const filters = getFilters();
    const params = new URLSearchParams();
    
    if (filters.query) params.set('q', filters.query);
    if (filters.category !== 'all') params.set('cat', filters.category);
    if (filters.type) params.set('type', filters.type);
    if (filters.rating) params.set('rating', filters.rating);
    if (filters.verified) params.set('verified', 'true');
    if (filters.priceMin !== 0) params.set('min', filters.priceMin);
    if (filters.priceMax !== 50000) params.set('max', filters.priceMax);
    
    // Update URL without triggering hashchange
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
    
    // Perform search
    showResults();
    
    toast.success('Search complete', `${document.querySelector('#results-count').textContent}`);
  } catch (error) {
    console.error('Search error:', error);
    toast.error('Search failed', 'Please try again later');
  } finally {
    if (searchBtn) {
      searchBtn.disabled = false;
      searchSpinner.hidden = true;
      searchBtnText.textContent = 'Search';
    }
  }
}

function applySearchFromURL() {
  const queryParams = new URLSearchParams(window.location.search);
  
  // Set search query
  const query = queryParams.get('q');
  if (query) {
    document.getElementById('search-query').value = query;
  }
  
  // Set category tab
  const category = queryParams.get('cat') || 'all';
  const categoryTab = document.querySelector(`.search-tab-btn[data-category="${category}"]`);
  if (categoryTab) {
    document.querySelectorAll('.search-tab-btn').forEach(t => t.classList.remove('tab-active'));
    categoryTab.classList.add('tab-active');
  }
  
  // Set filters
  const type = queryParams.get('type');
  if (type) {
    document.getElementById('filter-type').value = type;
  }
  
  const rating = queryParams.get('rating');
  if (rating) {
    document.getElementById('filter-rating').value = rating;
  }
  
  const verified = queryParams.get('verified');
  if (verified === 'true') {
    document.getElementById('filter-verified').checked = true;
  }
  
  const min = queryParams.get('min');
  if (min) {
    document.getElementById('filter-price-min').value = min;
    document.getElementById('price-min-value').textContent = `₹${parseInt(min).toLocaleString()}`;
  }
  
  const max = queryParams.get('max');
  if (max) {
    document.getElementById('filter-price-max').value = max;
    document.getElementById('price-max-value').textContent = `₹${parseInt(max).toLocaleString()}`;
  }
  
  // Trigger search
  performSearch();
}