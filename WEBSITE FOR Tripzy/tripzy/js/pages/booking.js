/**
 * Tripzy - Booking Page Module
 * Booking confirmation and details
 */

import { api } from '../utils/api.js';

export async function initBooking(container, { state, api, toast, routeParams }) {
  const bookingId = routeParams.id;
  
  // Load booking data (mock data for now)
  let bookingData = null;
  try {
    // In a real app, we'd fetch from API using bookingId
    // For demo, we'll create mock data based on the ID
    if (bookingId.startsWith('booking_')) {
      // Mock booking data
      const mockTrips = [
        { id: 1, title: 'Goa Beach Getaway', destination: 'Goa', price: 24999, duration: 5, nights: 4, image: '/images/goa.jpg' },
        { id: 2, title: 'Himalayan Adventure Trek', destination: 'Manali', price: 34999, duration: 7, nights: 6, image: '/images/manali.jpg' },
        { id: 3, title: 'Royal Rajasthan Heritage', destination: 'Jaipur', price: 28999, duration: 6, nights: 5, image: '/images/jaipur.jpg' },
        { id: 4, title: 'Kerala Backwaters & Hills', destination: 'Kerala', price: 32999, duration: 7, nights: 6, image: '/images/kerala.jpg' }
      ];
      
      const tripIndex = Math.abs(bookingId.hashCode() || 0) % mockTrips.length;
      const trip = mockTrips[tripIndex];
      
      bookingData = {
        id: bookingId,
        trip: trip,
        travelers: 2,
        departureDate: '2026-10-15',
        returnDate: '2026-10-20',
        roomType: 'double',
        insurance: false,
        total: 55998, // 2 * 24999 * 1.12 (tax)
        bookingDate: new Date().toISOString(),
        status: 'confirmed'
      };
    }
  } catch (e) {
    console.error('Failed to load booking data:', e);
  }
  
  if (!bookingData) {
    container.innerHTML = `
      <div class="page-content py-12">
        <div class="card text-center py-12">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mb-4" style="color: var(--color-text-tertiary);">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <h3 class="mb-4">Booking Not Found</h3>
          <p class="text-secondary">The booking you're looking for doesn't exist or has been removed.</p>
          <a href="#dashboard" data-page="dashboard" class="btn btn--primary">Go to Dashboard</a>
        </div>
      </div>
    `;
    container.hidden = false;
    return () => {};
  }
  
  // Render page
  container.innerHTML = renderBooking(bookingData);
  container.hidden = false;
  
  // Initialize components
  initBookingActions(bookingData);
  
  // Return cleanup function
  return () => {
    // Cleanup if needed
  };
}

function renderBooking(booking) {
  return `
    <div class="page-content">
      <!-- Booking Header -->
      <section class="booking-header" aria-labelledby="booking-title">
        <div class="container">
          <div class="booking-header__content">
            <div class="booking-header__icon mb-6" style="text-align: center;">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mb-4" style="color: var(--color-accent-600);">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h1 id="booking-title" class="booking-header__title">
              Booking Confirmed!
            </h1>
            <p class="booking-header__subtitle text-secondary mb-6">
              Your trip has been successfully booked. Here are your booking details.
            </p>
          </div>
        </div>
      </section>

      <!-- Booking Details -->
      <section class="booking-details-section" aria-labelledby="details-title">
        <div class="container">
          <h2 id="details-title" class="section__title">Booking Summary</h2>
          <div class="booking-details-card card p-6" id="booking-details-card">
            <div class="booking-details__header flex items-center justify-between pb-4 border-b" style="border-color: var(--color-surface-border);">
              <div class="booking-details__header-content">
                <h3 class="booking-details__title font-medium">${booking.trip.title}</h3>
                <p class="booking-details__subtitle text-sm text-tertiary">
                  ${booking.trip.destination} • ${booking.trip.duration} days • ${booking.trip.nights} nights
                </p>
              </div>
              <div class="booking-details__status-badge bg-accent-100 text-accent-800 px-3 py-1 rounded-full text-xs font-medium">
                Confirmed
              </div>
            </div>
            
            <div class="booking-details__body mt-6">
              <div class="booking-details__grid grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));">
                <!-- Travel Info -->
                <div class="booking-info-card card p-4 border-l-2" style="border-color: var(--color-primary-600);">
                  <h4 class="booking-info-card__title font-medium mb-3">Travel Information</h4>
                  <div class="space-y-2 text-sm text-tertiary">
                    <p><span class="font-medium">Departure:</span> ${formatDate(booking.departureDate)}</p>
                    <p><span class="font-medium">Return:</span> ${formatDate(booking.returnDate)}</p>
                    <p><span class="font-medium">Travelers:</span> ${booking.travelers}</p>
                    <p><span class="font-medium">Room Type:</span> ${booking.roomType}</p>
                    ${booking.insurance ? '<p><span class="font-medium">Travel Insurance:</span> Included</p>' : ''}
                  </div>
                </div>
                
                <!-- Pricing -->
                <div class="booking-info-card card p-4 border-l-2" style="border-color: var(--color-accent-600);">
                  <h4 class="booking-info-card__title font-medium mb-3">Pricing Breakdown</h4>
                  <div class="space-y-2 text-sm text-tertiary">
                    <p><span class="font-medium">Base Price:</span> ₹${(booking.trip.price * booking.travelers).toLocaleString()}</p>
                    <p><span class="font-medium">Taxes & Fees (12%):</span> ₹${Math.round(booking.trip.price * booking.travelers * 0.12).toLocaleString()}</p>
                    ${booking.insurance ? '<p><span class="font-medium">Travel Insurance:</span> ₹1,500</p>' : ''}
                    <div class="border-t pt-3 mt-3">
                      <p class="font-medium text-primary text-lg">
                        <span class="font-medium">Total Paid:</span> ₹${booking.total.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <!-- Booking Info -->
                <div class="booking-info-card card p-4 border-l-2" style="border-color: var(--color-secondary-600);">
                  <h4 class="booking-info-card__title font-medium mb-3">Booking Information</h4>
                  <div class="space-y-2 text-sm text-tertiary">
                    <p><span class="font-medium">Booking ID:</span> <code class="bg-neutral-50 px-2 py-1 rounded">${booking.id}</code></p>
                    <p><span class="font-medium">Booked On:</span> ${formatDateTime(booking.bookingDate)}</p>
                    <p><span class="font-medium">Status:</span> <span class="bg-accent-100 text-accent-800 px-2 py-0 rounded text-xs">${booking.status}</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Trip Preview -->
      <section class="booking-preview-section" aria-labelledby="preview-title">
        <div class="container">
          <h2 id="preview-title" class="section__title">Your Trip Preview</h2>
          <div class="trip-preview-card card" id="trip-preview-card">
            <img src="${booking.trip.image}" alt="${booking.trip.title}" class="trip-preview-card__image" loading="lazy">
            <div class="trip-preview-card__content p-6">
              <h3 class="trip-preview-card__title font-medium mb-3">${booking.trip.title}</h3>
              <p class="trip-preview-card__subtitle text-sm text-tertiary mb-4">
                ${booking.trip.description}
              </p>
              <div class="trip-preview-card__highlights mt-4">
                <h4 class="font-medium mb-2">Trip Highlights:</h4>
                <ul class="list-disc list-inside space-y-1 text-sm text-tertiary">
                  ${booking.trip.highlights.map(item => `<li>${item}</li>`).join('')}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Booking Actions -->
      <section class="booking-actions-section" aria-labelledby="actions-title">
        <div class="container">
          <div class="booking-actions-card card p-6" id="booking-actions-card">
            <h2 id="actions-title" class="section__title">What's Next?</h2>
            <div class="booking-actions__grid grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
              <!-- Add to Calendar -->
              <div class="booking-action-item card p-4 text-center border-l-4" style="border-color: var(--color-primary-600);">
                <div class="booking-action-item__icon mb-3" style="font-size: var(--text-2xl);">📅</div>
                <h3 class="booking-action-item__title font-medium mb-2">Add to Calendar</h3>
                <p class="booking-action-item__text text-sm text-tertiary">
                  Add your trip dates to your calendar so you never forget.
                </p>
                <button class="btn btn--outline btn--block mt-4" id="btn-add-to-calendar">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2" aria-hidden="true">
                    <path d="M8 7V3m10 4l-3-3M6 5l10 7-3 7M6 5l10 7-3-7"/>
                  </svg>
                  Add to Calendar
                </button>
              </div>
              
              <!-- Share Booking -->
              <div class="booking-action-item card p-4 text-center border-l-4" style="border-color: var(--color-accent-600);">
                <div class="booking-action-item__icon mb-3" style="font-size: var(--text-2xl);">📤</div>
                <h3 class="booking-action-item__title font-medium mb-2">Share Booking</h3>
                <p class="booking-action-item__text text-sm text-tertiary">
                  Share your booking details with fellow travelers.
                </p>
                <button class="btn btn--outline btn--block mt-4" id="btn-share-booking">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2" aria-hidden="true">
                    <path d="M18 16.08c-7.6 0-9.99-1.54-9.99-4.23 0-2.06 1.08-3.9 2.9-4.6"/>
                    <path d="M22 4.24c-1.34 2.73-3.43 4.76-5.9 4.76-2.46 0-4.43-1.86-4.43-4.26 0-1.17.41-2.26 1.08-3.1"/>
                    <path d="M4.22 12.91a2.83 2.83 0 0 0-.64 4.12c0 1.47.54 2.72 1.27 3.64l2.8 1.8c1.16.73 2.56.43 3.22-.44l1.18-1l1.18 1c.66.87 2.06.21 3.22-.44l2.8-1.8c.73-.92 1.27-2.17 1.27-3.64"/>
                  </svg>
                  Share Booking
                </button>
              </div>
              
              <!-- View Itinerary -->
              <div class="booking-action-item card p-4 text-center border-l-4" style="border-color: var(--color-secondary-600);">
                <div class="booking-action-item__icon mb-3" style="font-size: var(--text-2xl);">👀</div>
                <h3 class="booking-action-item__title font-medium mb-2">View Itinerary</h3>
                <p class="booking-action-item__text text-sm text-tertiary">
                  See your detailed day-by-day trip plan.
                </p>
                <button class="btn btn--primary btn--block mt-4" id="btn-view-itinerary">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2" aria-hidden="true">
                    <path d="M12 4v16m8-8H4"/>
                  </svg>
                  View Itinerary
                </button>
              </div>
              
              <!-- Need Help -->
              <div class="booking-action-item card p-4 text-center border-l-4" style="border-color: var(--color-warning);">
                <div class="booking-action-item__icon mb-3" style="font-size: var(--text-2xl);">💬</div>
                <h3 class="booking-action-item__title font-medium mb-2">Need Help?</h3>
                <p class="booking-action-item__text text-sm text-tertiary">
                  Our support team is here to help with any questions.
                </p>
                <button class="btn btn--outline btn--block mt-4" id="btn-help-support">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2" aria-hidden="true">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  </svg>
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

function initBookingActions(booking) {
  // Add to Calendar
  const addToCalendarBtn = document.getElementById('btn-add-to-calendar');
  if (addToCalendarBtn) {
    addToCalendarBtn.addEventListener('click', () => {
      // In a real app, we'd generate an .ics file or use calendar API
      toast.success('Added to Calendar', 'Your trip dates have been added to your calendar');
    });
  }
  
  // Share Booking
  const shareBookingBtn = document.getElementById('btn-share-booking');
  if (shareBookingBtn) {
    shareBookingBtn.addEventListener('click', () => {
      const shareText = `I've booked my trip to ${booking.trip.destination} with Tripzy! Booking ID: ${booking.id} ${window.location.origin}/#/booking/${booking.id}`;
      
      if (navigator.share) {
        navigator.share({
          title: `My ${booking.trip.destination} Trip Booking`,
          text: shareText,
          url: window.location.href
        }).catch(() => {
          // Fallback to clipboard
          navigator.clipboard.writeText(shareText).then(() => {
            toast.success('Link copied to clipboard!');
          });
        });
      } else {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
          toast.success('Link copied to clipboard!');
        });
      }
    });
  }
  
  // View Itinerary
  const viewItineraryBtn = document.getElementById('btn-view-itinerary');
  if (viewItineraryBtn) {
    viewItineraryBtn.addEventListener('click', () => {
      // Navigate to trip detail page
      window.location.hash = `#trip/${booking.trip.id}`;
    });
  }
  
  // Help & Support
  const helpSupportBtn = document.getElementById('btn-help-support');
  if (helpSupportBtn) {
    helpSupportBtn.addEventListener('click', () => {
      toast.info('Support Contact', 'Email: support@tripzy.com\nPhone: +91-1800-123-456\nAvailable 24/7');
    });
  }
}

function formatDate(dateString) {
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function formatDateTime(dateString) {
  const options = { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// String hashCode implementation for mock data
String.prototype.hashCode = function() {
  let hash = 0;
  for (let i = 0; i < this.length; i++) {
    const char = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};