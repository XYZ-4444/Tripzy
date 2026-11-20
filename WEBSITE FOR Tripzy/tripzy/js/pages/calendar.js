/**
 * Tripzy - Calendar Page Module
 * Travel calendar view for trips and bookings
 */

import { api } from '../utils/api.js';

export async function initCalendar(container, { state, api, toast }) {
  // Check if user is authenticated
  const user = state.get('user');
  if (!user) {
    // Redirect to login if not authenticated
    window.location.hash = '#login?return=#calendar';
    return;
  }
  
  // Load user's trips and bookings (mock data for now)
  const userTrips = JSON.parse(localStorage.getItem('tripzy_saved_trips') || '[]');
  
  // Render page
  container.innerHTML = renderCalendar(user, userTrips);
  container.hidden = false;
  
  // Initialize components
  initCalendarView();
  initCalendarFilters();
  
  // Return cleanup function
  return () => {
    // Cleanup if needed
  };
}

function renderCalendar(user, trips) {
  return `
    <div class="page-content">
      <!-- Calendar Header -->
      <section class="calendar-header" aria-labelledby="calendar-title">
        <div class="container">
          <div class="calendar-header__content flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 id="calendar-title" class="calendar-header__title">
                Travel Calendar
              </h1>
              <p class="calendar-header__subtitle text-secondary">
                View and manage your upcoming trips and travel plans
              </p>
            </div>
            <div class="calendar-header__actions flex gap-3">
              <button class="btn btn--outline btn--sm" id="btn-add-trip-cal">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M12 4v16m8-8H4"/>
                </svg>
                Add Trip
              </button>
              <div class="relative">
                <button class="btn btn--ghost btn--icon-only" id="user-menu-btn-cal" aria-label="User menu" aria-haspopup="true" aria-expanded="false">
                  <img src="${user.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face'}" alt="${user.name}" class="user-avatar" width="32" height="32">
                </button>
                <div class="user-menu" id="user-menu-cal" hidden role="menu" aria-label="User menu">
                  <div class="user-menu__header flex items-center gap-3 p-4 border-b" style="border-color: var(--color-surface-border);">
                    <img src="${user.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face'}" alt="${user.name}" class="user-avatar" width="48" height="48">
                    <div>
                      <div class="font-medium">${user.name}</div>
                      <div class="text-sm text-secondary">${user.email}</div>
                    </div>
                  </div>
                  <nav class="user-menu__nav" role="none">
                    <a href="#planner" data-page="planner" class="user-menu__item flex items-center gap-3 px-4 py-3" role="menuitem">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <span>AI Planner</span>
                    </a>
                    <a href="#dashboard" data-page="dashboard" class="user-menu__item flex items-center gap-3 px-4 py-3" role="menuitem">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                      </svg>
                      <span>Dashboard</span>
                    </a>
                    <a href="#vendors" data-page="vendors" class="user-menu__item flex items-center gap-3 px-4 py-3" role="menuitem">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                      <span>Vendors</span>
                    </a>
                    <a href="#trust" data-page="trust" class="user-menu__item flex items-center gap-3 px-4 py-3" role="menuitem">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      <span>Trust Hub</span>
                    </a>
                    <hr class="my-2" style="border-color: var(--color-surface-border);">
                    <button class="user-menu__item flex items-center gap-3 w-full text-left px-4 py-3" id="btn-logout-cal" role="menuitem">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Calendar Controls -->
      <section class="calendar-controls-section" aria-labelledby="controls-title">
        <div class="container">
          <div class="calendar-controls card p-6" id="calendar-controls">
            <div class="calendar-controls__header flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h2 id="controls-title" class="calendar-controls__title">Calendar View</h2>
                <p class="calendar-controls__subtitle text-secondary">Switch between month, week, and day views</p>
              </div>
              <div class="calendar-controls__actions flex gap-3">
                <div class="flex gap-2 items-center">
                  <button class="btn btn--outline btn--sm" id="btn-prev">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path d="M15 18l-6-6 6-6"/>
                    </svg>
                  </button>
                  <span id="current-date" class="font-medium" style="font-size: var(--text-lg);">September 2026</span>
                  <button class="btn btn--outline btn--sm" id="btn-next">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </button>
                </div>
                <div class="flex gap-2">
                  <button class="btn btn--outline btn--sm active" data-view="month">Month</button>
                  <button class="btn btn--outline btn--sm" data-view="week">Week</button>
                  <button class="btn btn--outline btn--sm" data-view="day">Day</button>
                </div>
                <button class="btn btn--primary btn--sm" id="btn-today">Today</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Calendar View -->
      <section class="calendar-view-section" aria-labelledby="view-title">
        <div class="container">
          <div class="calendar-view card" id="calendar-view">
            <div class="calendar-view__header" id="calendar-view-header">
              <!-- Calendar grid will be injected here -->
            </div>
          </div>
        </div>
      </section>

      <!-- Calendar List View (Alternative) -->
      <section class="calendar-list-section" aria-labelledby="list-title" hidden>
        <div class="container">
          <div class="calendar-list card" id="calendar-list">
            <div class="calendar-list__header flex items-center justify-between p-4 border-b" style="border-color: var(--color-surface-border);">
              <h2 id="list-title" class="calendar-list__title">Upcoming Trips</h2>
              <button class="btn btn--outline btn--sm" id="toggle-calendar-view">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/>
                </svg>
                View as Calendar
              </button>
            </div>
            <div class="calendar-list__content" id="calendar-list-content">
              <!-- List of trips will be injected here -->
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

function initCalendarView() {
  const user = state.get('user');
  const trips = JSON.parse(localStorage.getItem('tripzy_saved_trips') || '[]');
  
  // Initialize calendar
  renderCalendarGrid(trips);
  renderCalendarList(trips);
  
  // Set current date display
  const now = new Date();
  const options = { month: 'long', year: 'numeric' };
  document.getElementById('current-date').textContent = now.toLocaleDateString(undefined, options);
  
  // Initialize calendar controls
  initCalendarControls(trips);
}

function renderCalendarGrid(trips) {
  const calendarViewHeader = document.getElementById('calendar-view-header');
  if (!calendarViewHeader) return;
  
  // Get current month and year
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-11
  const currentYear = now.getFullYear();
  
  // Get first day of the month
  const firstDay = new Date(currentYear, currentMonth, 1);
  const startingDay = firstDay.getDay(); // 0-6 (Sunday-Saturday)
  
  // Get number of days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // Get trips for this month
  const monthTrips = trips.filter(trip => {
    const startDate = trip.startDate || (trip.dates ? trip.dates.split(' - ')[0] : '2026-01-01');
    const date = new Date(startDate);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });
  
  // Create calendar grid
  let calendarHTML = `
    <div class="calendar-weekdays grid gap-2" style="grid-template-columns: repeat(7, 1fr); text-center text-sm font-medium text-secondary mb-4">
      <div>Sun</div>
      <div>Mon</div>
      <div>Tue</div>
      <div>Wed</div>
      <div>Thu</div>
      <div>Fri</div>
      <div>Sat</div>
    </div>
    <div class="calendar-days grid gap-2" style="grid-template-columns: repeat(7, 1fr);">
  `;
  
  // Add empty cells for days before the 1st
  for (let i = 0; i < startingDay; i++) {
    calendarHTML += '<div class="calendar-day empty"></div>';
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const isToday = date.toDateString() === new Date().toDateString();
    const hasTrips = monthTrips.some(trip => {
      const tripDate = new Date(trip.startDate || (trip.dates ? trip.dates.split(' - ')[0] : '2026-01-01'));
      return tripDate.toDateString() === date.toDateString();
    });
    
    const dayTrips = monthTrips.filter(trip => {
      const tripDate = new Date(trip.startDate || (trip.dates ? trip.dates.split(' - ')[0] : '2026-01-01'));
      return tripDate.toDateString() === date.toDateString();
    });
    
    calendarHTML += `
      <div class="calendar-day ${isToday ? 'today' : ''} ${hasTrips ? 'has-trips' : ''}" 
           data-date="${date.toISOString().split('T')[0]}">
        <div class="calendar-day-number">${day}</div>
        ${dayTrips.length > 0 ? `
          <div class="calendar-day-trips">
            ${dayTrips.map(trip => `
              <div class="calendar-day-trip" title="${trip.tripName || trip.title}">
                <div class="calendar-day-trip__dot" style="background-color: ${getTripColor(trip.type || trip.tags?.[0] || 'primary')};"></div>
                <div class="calendar-day-trip__text text-xs">${trip.tripName || trip.title}</div>
              </div>
            `).join('')}
            ${dayTrips.length > 3 ? `<div class="calendar-day-trip-more">+${dayTrips.length - 3} more</div>` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }
  
  // Add empty cells to complete the last week
  const totalCells = startingDay + daysInMonth;
  const remainingCells = (7 - (totalCells % 7)) % 7;
  for (let i = 0; i < remainingCells; i++) {
    calendarHTML += '<div class="calendar-day empty"></div>';
  }
  
  calendarHTML += '</div>';
  
  calendarViewHeader.innerHTML = calendarHTML;
  
  // Add click listeners to calendar days
  document.querySelectorAll('.calendar-day:not(.empty)').forEach(day => {
    day.addEventListener('click', () => {
      const date = day.dataset.date;
      // Show trips for this date
      showDayTrips(date, trips);
    });
  });
}

function renderCalendarList(trips) {
  const calendarListContent = document.getElementById('calendar-list-content');
  if (!calendarListContent) return;
  
  // Filter upcoming trips
  const upcomingTrips = trips.filter(trip => {
    const startDate = trip.startDate || (trip.dates ? trip.dates.split(' - ')[0] : '2026-01-01');
    return new Date(startDate) >= new Date();
  }).sort((a, b) => {
    const dateA = new Date(a.startDate || a.dates.split(' - ')[0]);
    const dateB = new Date(b.startDate || b.dates.split(' - ')[0]);
    return dateA - dateB;
  });
  
  if (upcomingTrips.length === 0) {
    calendarListContent.innerHTML = `
      <div class="text-center py-12">
        <p class="text-secondary">No upcoming trips scheduled</p>
        <a href="#planner" data-page="planner" class="btn btn--outline btn--sm mt-4">Plan a Trip</a>
      </div>
    `;
    return;
  }
  
  calendarListContent.innerHTML = upcomingTrips.map(trip => renderCalendarTripItem(trip)).join('');
  
  // Add click listeners to trip items
  document.querySelectorAll('.calendar-trip-item').forEach(item => {
    item.addEventListener('click', () => {
      const tripId = item.dataset.tripId;
      // In a real app, navigate to trip details
      toast.info('Trip details', 'Feature coming soon!');
    });
  });
}

function renderCalendarTripItem(trip) {
  const startDate = trip.startDate || (trip.dates ? trip.dates.split(' - ')[0] : '2026-01-01');
  const endDate = trip.endDate || (trip.dates ? trip.dates.split(' - ')[1] : '2026-01-05');
  
  return `
    <div class="calendar-trip-item card p-4 mb-4" data-trip-id="${trip.id || Date.now()}">
      <div class="calendar-trip-item__header flex items-start justify-between gap-3">
        <div class="calendar-trip-item__header-content flex-1">
          <h3 class="calendar-trip-item__title font-medium">${trip.tripName || trip.title || 'Untitled Trip'}</h3>
          <p class="calendar-trip-item__subtitle text-sm text-tertiary">
            ${trip.destination || trip.destinationName || 'Unknown Destination'}
          </p>
        </div>
        <div class="calendar-trip-item__date-badge">
          <span class="font-medium text-primary">${formatDate(startDate)}</span>
          <span class="text-xs text-tertiary">to</span>
          <span class="font-medium text-primary">${formatDate(endDate)}</span>
        </div>
      </div>
      <div class="calendar-trip-item__body mt-3">
        <div class="calendar-trip-item__meta grid gap-3" style="grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));">
          <div class="text-center">
            <div class="font-medium text-primary">${trip.duration || 5}</div>
            <div class="text-xs text-tertiary">Days</div>
          </div>
          <div class="text-center">
            <div class="font-medium text-primary">${trip.travelers || 1}</div>
            <div class="text-xs text-tertiary">Travelers</div>
          </div>
          <div class="text-center">
            <div class="font-medium text-primary">₹${(trip.budget || 0).toLocaleString()}</div>
            <div class="text-xs text-tertiary">Budget</div>
          </div>
        </div>
        ${trip.notes ? `<p class="calendar-trip-item__notes mt-3 text-sm text-tertiary italic">${trip.notes}</p>` : ''}
      </div>
      <div class="calendar-trip-item__footer flex items-center justify-between p-3 border-t" style="border-color: var(--color-surface-border);">
        <div class="calendar-trip-item__actions flex gap-2">
          <button class="btn btn--outline btn--sm" data-trip-id="${trip.id || Date.now()}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M15 2l-3 3m0 0l-3 3m3 3H3m18 0h-3"/>
            </svg>
            View
          </button>
          <button class="btn btn--primary btn--sm" data-trip-id="${trip.id || Date.now()}">
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
        <div class="calendar-trip-item__trip-type">
          <span class="badge badge--${getBadgeColor(trip.type || trip.tags?.[0] || 'primary')}">
            ${trip.type || trip.tags?.[0] || 'Trip'}
          </span>
        </div>
      </div>
    </div>
  `;
}

function getTripColor(type) {
  const colors = {
    beach: 'var(--color-primary-600)',
    mountain: 'var(--color-secondary-600)',
    heritage: 'var(--color-accent-600)',
    adventure: 'var(--color-warning)',
    backwater: 'var(--color-success)',
    island: 'var(--color-info)'
  };
  return colors[type] || 'var(--color-primary-600)';
}

function getBadgeColor(type) {
  const colors = {
    beach: 'primary',
    mountain: 'secondary',
    heritage: 'accent',
    adventure: 'warning',
    backwater: 'success',
    island: 'info'
  };
  return colors[type] || 'primary';
}

function formatDate(dateString) {
  const options = { month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function initCalendarControls(trips) {
  const prevBtn = document.getElementById('btn-prev');
  const nextBtn = document.getElementById('btn-next');
  const todayBtn = document.getElementById('btn-today');
  const currentDateEl = document.getElementById('current-date');
  const viewButtons = document.querySelectorAll('[data-view]');
  const calendarViewSection = document.querySelector('.calendar-view-section');
  const calendarListSection = document.querySelector('.calendar-list-section');
  const toggleViewBtn = document.getElementById('toggle-calendar-view');
  
  let currentDate = new Date();
  
  // Update calendar when month changes
  function updateCalendarDisplay() {
    const options = { month: 'long', year: 'numeric' };
    currentDateEl.textContent = currentDate.toLocaleDateString(undefined, options);
    renderCalendarGrid(trips);
  }
  
  // Prev month
  prevBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendarDisplay();
  });
  
  // Next month
  nextBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendarDisplay();
  });
  
  // Today
  todayBtn.addEventListener('click', () => {
    currentDate = new Date();
    updateCalendarDisplay();
  });
  
  // View buttons
  viewButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      viewButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const view = btn.dataset.view;
      if (view === 'month') {
        calendarViewSection.hidden = false;
        calendarListSection.hidden = true;
      } else {
        calendarViewSection.hidden = true;
        calendarListSection.hidden = false;
        // Render list view for week/day
        if (view === 'week') {
          renderWeekView(currentDate, trips);
        } else if (view === 'day') {
          renderDayView(currentDate, trips);
        }
      }
    });
  });
  
  // Toggle view button
  toggleViewBtn.addEventListener('click', () => {
    const isListHidden = calendarListSection.hidden;
    calendarListSection.hidden = !isListHidden;
    calendarViewSection.hidden = isListHidden;
    
    // Update button icon
    const icon = toggleViewBtn.querySelector('svg');
    if (isListHidden) {
      icon.innerHTML = '<path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/>';
    } else {
      icon.innerHTML = '<rect width="18" height="18" x="3" y="3" rx="2"/>';
    }
  });
  
  // Initialize display
  updateCalendarDisplay();
}

function renderWeekView(date, trips) {
  // Implement week view - for now, just show list
  renderCalendarList(trips);
}

function renderDayView(date, trips) {
  // Implement day view - for now, just show list
  renderCalendarList(trips);
}

function showDayTrips(date, trips) {
  const dayTrips = trips.filter(trip => {
    const tripDate = new Date(trip.startDate || (trip.dates ? trip.dates.split(' - ')[0] : '2026-01-01'));
    return tripDate.toDateString() === new Date(date).toDateString();
  });
  
  if (dayTrips.length === 0) {
    toast.info('No trips', `No trips scheduled for ${new Date(date).toLocaleDateString()}`);
    return;
  }
  
  // Show trips in a modal or list
  const tripsList = dayTrips.map(trip => 
    `• ${trip.tripName || trip.title} - ${trip.destination || trip.destinationName}`
  ).join('\n');
  
  toast.info(`Trips for ${new Date(date).toLocaleDateString()}`, tripsList);
}