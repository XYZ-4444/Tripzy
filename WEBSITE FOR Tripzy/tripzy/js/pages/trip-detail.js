/**
 * Tripzy - Trip Detail Page Module
 * Detailed view of a specific trip/package
 */

import { api } from '../utils/api.js';

export async function initTripDetail(container, { state, api, toast, routeParams }) {
  const tripId = routeParams.id;
  
  // Load trip data (mock data for now)
  let tripData = null;
  try {
    // In a real app, we'd fetch from API
    // For demo, we'll get from our packages data
    const res = await fetch('/data/packages.json');
    const packages = await res.json();
    tripData = packages.find(pkg => pkg.id === parseInt(tripId)) || null;
  } catch (e) {
    console.error('Failed to load trip data:', e);
    toast.error('Failed to load trip details', 'Please try again later');
  }
  
  if (!tripData) {
    container.innerHTML = `
      <div class="page-content py-12">
        <div class="card text-center py-12">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mb-4" style="color: var(--color-text-tertiary);">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <h3 class="mb-4">Trip Not Found</h3>
          <p class="text-secondary">The trip you're looking for doesn't exist or has been removed.</p>
          <a href="#search" data-page="search" class="btn btn--primary">Browse Trips</a>
        </div>
      </div>
    `;
    container.hidden = false;
    return () => {};
  }
  
  // Render page
  container.innerHTML = renderTripDetail(tripData);
  container.hidden = false;
  
  // Initialize components
  initTripDetailActions(tripData);
  
  // Return cleanup function
  return () => {
    // Cleanup if needed
  };
}

function renderTripDetail(trip) {
  return `
    <div class="page-content">
      <!-- Trip Header -->
      <section class="trip-detail-header" aria-labelledby="trip-title">
        <div class="container">
          <div class="trip-detail-header__content">
            <div class="trip-detail-header__image-ratio" style="--ratio: 16/9;">
              <img src="${trip.image}" alt="${trip.title}" class="trip-detail-header__image" loading="lazy">
            </div>
            <div class="trip-detail-header__content-overlay">
              <div class="trip-detail-header__info">
                <h1 id="trip-title" class="trip-detail-header__title">${trip.title}</h1>
                <div class="trip-detail-header__meta flex items-center gap-4 mt-2">
                  <div class="trip-detail-header__badge badge badge--primary">${trip.type}</div>
                  <div class="trip-detail-header__rating" aria-label="Rating: ${trip.rating} out of 5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="color: var(--color-secondary-500);"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    ${trip.rating} (${trip.reviewCount})
                  </div>
                </div>
                <p class="trip-detail-header__subtitle text-sm text-tertiary mt-2">
                  ${trip.destination} • ${trip.duration} days • ${trip.nights} nights
                </p>
                <p class="trip-detail-header__price text-2xl font-bold mt-4">
                  ₹${trip.price.toLocaleString()} <span class="text-sm text-secondary">${trip.currency}</span>
                </p>
                <p class="trip-detail-header__text text-sm text-tertiary mt-2 max-w-xl">
                  ${trip.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Trip Overview -->
      <section class="trip-overview-section" aria-labelledby="overview-title">
        <div class="container">
          <h2 id="overview-title" class="section__title">Trip Overview</h2>
          <div class="trip-overview__grid grid gap-6" style="grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));">
            <div class="trip-overview__card card p-6 border-l-4" style="border-color: var(--color-primary-600);">
              <h3 class="trip-overview__card__title font-medium mb-3">What's Included</h3>
              <ul class="list-disc list-inside space-y-2 text-sm text-tertiary">
                ${trip.inclusions.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
            <div class="trip-overview__card card p-6 border-l-4" style="border-color: var(--color-accent-600);">
              <h3 class="trip-overview__card__title font-medium mb-3">What's Not Included</h3>
              <ul class="list-disc list-inside space-y-2 text-sm text-tertiary">
                ${trip.exclusions.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
            <div class="trip-overview__card card p-6 border-l-4" style="border-color: var(--color-secondary-600);">
              <h3 class="trip-overview__card__title font-medium mb-3">Trip Highlights</h3>
              <ul class="list-disc list-inside space-y-2 text-sm text-tertiary">
                ${trip.highlights.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
            <div class="trip-overview__card card p-6 border-l-4" style="border-color: var(--color-warning);">
              <h3 class="trip-overview__card__title font-medium mb-3">Best Time to Visit</h3>
              <p class="text-sm text-tertiary">${trip.bestTime}</p>
              <h3 class="trip-overview__card__title font-medium mb-3 mt-4">Difficulty</h3>
              <span class="badge badge--${trip.difficulty === 'easy' ? 'accent' : trip.difficulty === 'moderate' ? 'warning' : 'error'}">
                ${trip.difficulty}
              </span>
              <h3 class="trip-overview__card__title font-medium mb-3 mt-4">Group Size</h3>
              <span class="badge badge--outline">${trip.groupSize}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Detailed Itinerary -->
      <section class="trip-itinerary-section" aria-labelledby="itinerary-title">
        <div class="container">
          <h2 id="itinerary-title" class="section__title">Day-by-Day Itinerary</h2>
          <div class="trip-itinerary__days" id="trip-itinerary-days">
            ${trip.itinerary.map(day => renderTripDay(day)).join('')}
          </div>
        </div>
      </section>

      <!-- Booking Section -->
      <section class="trip-booking-section" aria-labelledby="booking-title">
        <div class="container">
          <div class="trip-booking-card card p-6" id="trip-booking-card">
            <h2 id="booking-title" class="trip-booking__title">Book This Trip</h2>
            <p class="trip-booking__subtitle text-secondary mb-6">
              Secure your spot with a deposit. Full payment due 30 days before departure.
            </p>
            <form class="trip-booking-form" id="trip-booking-form" role="form">
              <div class="trip-booking__form-grid grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
                <!-- Travelers -->
                <div class="form-group">
                  <label for="booking-travelers" class="form-label">Number of Travelers</label>
                  <select id="booking-travelers" class="form-select booking-input" required>
                    <option value="1">1 Traveler</option>
                    <option value="2" selected>2 Travelers</option>
                    <option value="3">3 Travelers</option>
                    <option value="4">4 Travelers</option>
                    <option value="5">5 Travelers</option>
                    <option value="6">6+ Travelers</option>
                  </select>
                </div>
                
                <!-- Departure Date -->
                <div class="form-group">
                  <label for="booking-departure" class="form-label">Preferred Departure Date</label>
                  <input
                    type="date"
                    id="booking-departure"
                    class="form-input booking-input"
                    min="${new Date().toISOString().split('T')[0]}"
                    required
                  >
                </div>
                
                <!-- Room Type -->
                <div class="form-group">
                  <label for="booking-room-type" class="form-label">Room Type</label>
                  <select id="booking-room-type" class="form-select booking-input" required>
                    <option value="single">Single Occupancy</option>
                    <option value="double" selected>Double Occupancy</option>
                    <option value="triple">Triple Occupancy</option>
                    <option value="quad">Quad Occupancy</option>
                  </select>
                </div>
                
                <!-- Travel Insurance -->
                <div class="form-group full-width">
                  <label class="flex items-center gap-2">
                    <input type="checkbox" id="booking-insurance" class="booking-checkbox">
                    <span>Add Travel Insurance (₹1,500)</span>
                  </div>
                </div>
              </div>
              
              <div class="trip-booking__summary mt-6 p-4 bg-neutral-50 rounded-lg">
                <div class="trip-booking__summary-row flex justify-between text-sm">
                  <span>Base Price:</span>
                  <span>₹${trip.price.toLocaleString()}</span>
                </div>
                <div class="trip-booking__summary-row flex justify-between text-sm">
                  <span>Taxes & Fees:</span>
                  <span>₹${Math.round(trip.price * 0.12).toLocaleString()}</span>
                </div>
                <div class="trip-booking__summary-row flex justify-between text-sm font-medium">
                  <span>Total Estimated:</span>
                  <span id="booking-total">₹${Math.round(trip.price * 1.12).toLocaleString()}</span>
                </div>
              </div>
              
              <div class="trip-booking__actions mt-6">
                <button type="submit" class="btn btn--primary btn--lg w-full" id="booking-submit-btn">
                  <span class="spinner spinner--sm" id="booking-spinner" hidden></span>
                  <span id="booking-btn-text">Book Now</span>
                </button>
                <p class="trip-booking__note text-xs text-tertiary mt-4">
                  * Prices are per person based on double occupancy. Taxes and fees may vary.
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>

      <!-- Similar Trips -->
      <section class="trip-similar-section" aria-labelledby="similar-title">
        <div class="container">
          <h2 id="similar-title" class="section__title">You Might Also Like</h2>
          <div class="similar-trips-grid grid gap-6" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));" id="similar-trips-grid">
            <!-- Similar trips will be populated by JS -->
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderTripDay(day) {
  return `
    <div class="trip-day card mb-6" data-day="${day.day}">
      <div class="trip-day__header flex items-center justify-between p-4 border-b" style="border-color: var(--color-surface-border);">
        <div class="trip-day__title flex items-center gap-3">
          <div class="day-number bg-primary-100 text-primary rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
            ${day.day}
          </div>
          <h3 class="font-semibold">${day.title}</h3>
        </div>
        <button class="btn btn--ghost btn--icon-only day-toggle-btn" aria-label="Toggle day details">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="day-toggle-icon">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>
      <div class="trip-day__body" hidden>
        <div class="trip-day__activities p-4 space-y-3">
          ${day.activities.map(activity => renderTripActivity(activity)).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderTripActivity(activity) {
  return `
    <div class="trip-activity flex items-start gap-3">
      <div class="trip-activity__time text-secondary text-sm font-medium w-16">
        ${activity.time}
      </div>
      <div class="trip-activity__content flex-1">
        <h4 class="trip-activity__title font-medium">${activity.activity}</h4>
        <p class="trip-activity__location text-xs text-tertiary">${activity.location}</p>
        ${activity.notes ? `<p class="trip-activity__notes text-xs text-tertiary italic">${activity.notes}</p>` : ''}
      </div>
    </div>
  `;
}

function initTripDetailActions(trip) {
  const dayToggleButtons = document.querySelectorAll('.day-toggle-btn');
  dayToggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const dayEl = btn.closest('.trip-day');
      const bodyEl = dayEl.querySelector('.trip-day__body');
      const iconEl = dayEl.querySelector('.day-toggle-icon');
      
      const isHidden = bodyEl.hidden;
      bodyEl.hidden = !isHidden;
      
      // Update icon
      if (isHidden) {
        iconEl.innerHTML = '<polyline points="6 9 12 15 18 9"/>';
      } else {
        iconEl.innerHTML = '<polyline points="6 15 12 9 18 15"/>';
      }
    });
  });
  
  // Booking form
  const bookingForm = document.getElementById('trip-booking-form');
  const submitBtn = document.getElementById('booking-submit-btn');
  const spinner = document.getElementById('booking-spinner');
  const btnText = document.getElementById('booking-btn-text');
  const totalDisplay = document.getElementById('booking-total');
  
  // Update total when form changes
  const travelersSelect = document.getElementById('booking-travelers');
  const insuranceCheckbox = document.getElementById('booking-insurance');
  
  if (travelersSelect && insuranceCheckbox && totalDisplay) {
    const updateTotal = () => {
      const basePrice = trip.price;
      const travelers = parseInt(travelersSelect.value);
      const insuranceCost = insuranceCheckbox.checked ? 1500 : 0;
      const total = ((basePrice * travelers) + insuranceCost) * 1.12; // Adding 12% tax
      totalDisplay.textContent = `₹${Math.round(total).toLocaleString()}`;
    };
    
    travelersSelect.addEventListener('change', updateTotal);
    insuranceCheckbox.addEventListener('change', updateTotal);
    
    // Initialize total
    updateTotal();
  }
  
  if (bookingForm && submitBtn) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Validate form
      if (!bookingForm.checkValidity()) {
        bookingForm.reportValidity();
        return;
      }
      
      // Show loading
      submitBtn.disabled = true;
      spinner.hidden = false;
      btnText.textContent = 'Processing...';
      
      try {
        // Collect form data
        const formData = new FormData(bookingForm);
        const bookingData = {
          tripId: trip.id,
          travelers: parseInt(formData.get('booking-travelers')),
          departureDate: formData.get('booking-departure'),
          roomType: formData.get('booking-room-type'),
          insurance: formData.get('booking-insurance') === 'on',
          // In a real app, we'd also collect passenger details, payment info, etc.
        };
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate booking confirmation
        const bookingId = `booking_${Date.now()}`;
        
        toast.success('Booking Confirmed!', `Your booking ID is ${bookingId}`);
        
        // Redirect to booking confirmation or dashboard
        setTimeout(() => {
          window.location.hash = `#booking/${bookingId}`;
        }, 1500);
      } catch (error) {
        console.error('Booking error:', error);
        toast.error('Booking failed', 'Please try again later');
      } finally {
        // Hide loading
        submitBtn.disabled = false;
        spinner.hidden = true;
        btnText.textContent = 'Book Now';
      }
    });
  }
  
  // Load similar trips
  loadSimilarTrips(trip);
}

function loadSimilarTrips(currentTrip) {
  const similarGrid = document.getElementById('similar-trips-grid');
  if (!similarGrid) return;
  
  // In a real app, we'd fetch similar trips based on destination, type, etc.
  // For demo, we'll show other trips from our data
  fetch('/data/packages.json')
    .then(res => res.json())
    .then(packages => {
      // Filter out current trip and get similar ones
      const similar = packages
        .filter(pkg => pkg.id !== currentTrip.id)
        .filter(pkg => 
          pkg.destination === currentTrip.destination || 
          pkg.type === currentTrip.type
        )
        .slice(0, 3); // Show max 3 similar trips
      
      if (similar.length === 0) {
        // Fallback to any other trips
        const fallback = packages
          .filter(pkg => pkg.id !== currentTrip.id)
          .slice(0, 3);
        similarGrid.innerHTML = fallback.map(renderSimilarTripCard).join('');
      } else {
        similarGrid.innerHTML = similar.map(renderSimilarTripCard).join('');
      }
      
      // Add click listeners
      document.querySelectorAll('.similar-trip-card').forEach(card => {
        card.addEventListener('click', () => {
          const tripId = card.dataset.tripId;
          window.location.hash = `#trip/${tripId}`;
        });
      });
    })
    .catch(err => {
      console.error('Failed to load similar trips:', err);
      similarGrid.innerHTML = '<div class="col-span-1 text-center py-8"><p class="text-secondary">Unable to load similar trips</p></div>';
    });
}

function renderSimilarTripCard(trip) {
  return `
    <article class="card similar-trip-card" data-trip-id="${trip.id}">
      <img src="${trip.image}" alt="${trip.title}" class="card__image similar-trip-card__image" loading="lazy">
      <div class="card__content">
        <div class="flex items-start justify-between gap-2 mb-2">
          <span class="badge badge--primary">${trip.type}</span>
          <span class="similar-trip-card__rating" aria-label="Rating: ${trip.rating} out of 5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="color: var(--color-secondary-500);"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            ${trip.rating}
          </span>
        </div>
        <h3 class="card__title similar-trip-card__title font-medium">${trip.title}</h3>
        <p class="card__subtitle similar-trip-card__destination text-sm text-tertiary">
          ${trip.destination} • ${trip.duration} days
        </p>
        <div class="similar-trip-card__meta card__meta text-xs text-tertiary">
          <span>${trip.nights} nights</span>
          <span>${trip.tags.slice(0, 1).join('')}</span>
        </div>
      </div>
      <div class="card__footer">
        <div class="similar-trip-card__price">
          <span class="similar-trip-card__amount font-bold text-primary" style="font-size: var(--text-lg);">${trip.price.toLocaleString()}</span>
          <span class="similar-trip-card__currency text-secondary">${trip.currency}</span>
        </div>
      </div>
    </article>
  `;
}