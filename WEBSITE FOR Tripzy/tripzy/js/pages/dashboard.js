/**
 * Tripzy - Dashboard Page Module
 * User's trips, bookings, and travel stats
 */

import { api } from '../utils/api.js';

export async function initDashboard(container, { state, api, toast }) {
  // Check if user is authenticated
  const user = state.get('user');
  if (!user) {
    // Redirect to login if not authenticated
    window.location.hash = '#login?return=#dashboard';
    return;
  }
  
  // Load user's trips and stats (mock data for now)
  const userTrips = JSON.parse(localStorage.getItem('tripzy_saved_trips') || '[]');
  
  // Render page
  container.innerHTML = renderDashboard(user, userTrips);
  container.hidden = false;
  
  // Initialize components
  initDashboardStats();
  initRecentTrips();
  initQuickActions();
  
  // Return cleanup function
  return () => {
    // Cleanup if needed
  };
}

function renderDashboard(user, trips) {
  return `
    <div class="page-content">
      <!-- Dashboard Header -->
      <section class="dashboard-header" aria-labelledby="dashboard-title">
        <div class="container">
          <div class="dashboard-header__content flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 id="dashboard-title" class="dashboard-header__title">
                Welcome back, ${user.name.split(' ')[0]}!
              </h1>
              <p class="dashboard-header__subtitle text-secondary">
                Here's a snapshot of your travel plans and stats
              </p>
            </div>
            <div class="dashboard-header__actions flex gap-3">
              <button class="btn btn--outline btn--sm" id="btn-add-trip">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M12 4v16m8-8H4"/>
                </svg>
                New Trip
              </button>
              <div class="relative">
                <button class="btn btn--ghost btn--icon-only" id="user-menu-btn" aria-label="User menu" aria-haspopup="true" aria-expanded="false">
                  <img src="${user.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face'}" alt="${user.name}" class="user-avatar" width="32" height="32">
                </button>
                <div class="user-menu" id="user-menu" hidden role="menu" aria-label="User menu">
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
                    <a href="#dashboard" data-page="dashboard" class="user-menu__item flex items-center gap-3 px-4 py-3" role="menuitem" aria-current="page">
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
                    <button class="user-menu__item flex items-center gap-3 w-full text-left px-4 py-3" id="btn-logout" role="menuitem">
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

      <!-- Stats Overview -->
      <section class="dashboard-stats-section" aria-labelledby="stats-title">
        <div class="container">
          <h2 id="stats-title" class="section__title">Your Travel Overview</h2>
          <div class="stats-grid grid gap-4" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));" id="stats-grid">
            <!-- Stats will be populated by JS -->
          </div>
        </div>
      </section>

      <!-- Recent Trips -->
      <section class="dashboard-trips-section" aria-labelledby="trips-title">
        <div class="container">
          <header class="dashboard-trips__header flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 id="trips-title" class="section__title">Your Trips</h2>
              <p class="section__subtitle text-secondary">Upcoming and past travel plans</p>
            </div>
            <a href="#planner" data-page="planner" class="btn btn--outline btn--sm">Plan New Trip</a>
          </header>
          <div class="trips-container" id="trips-container">
            <!-- Trips will be populated by JS -->
          </div>
        </div>
      </section>

      <!-- Travel Insights -->
      <section class="dashboard-insights-section" aria-labelledby="insights-title">
        <div class="container">
          <div class="insights-grid grid gap-6" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));" id="insights-grid">
            <!-- Insights will be populated by JS -->
          </div>
        </div>
      </section>

      <!-- Upcoming Trips Calendar Preview -->
      <section class="dashboard-calendar-preview-section" aria-labelledby="calendar-preview-title">
        <div class="container">
          <header class="dashboard-calendar-preview__header flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 id="calendar-preview-title" class="section__title">Upcoming Trips</h2>
              <p class="section__subtitle text-secondary">View your travel calendar</p>
            </div>
            <a href="#calendar" data-page="calendar" class="btn btn--primary btn--sm">View Full Calendar</a>
          </header>
          <div class="calendar-preview" id="calendar-preview">
            <!-- Calendar will be populated by JS -->
          </div>
        </div>
      </section>
    </div>
  `;
}

function initDashboardStats() {
  const user = state.get('user');
  const trips = JSON.parse(localStorage.getItem('tripzy_saved_trips') || '[]');
  
  // Calculate stats
  const totalTrips = trips.length;
  const upcomingTrips = trips.filter(trip => {
    const startDate = new Date(trip.startDate || trip.dates?.split(' - ')[0] || '2026-01-01');
    return startDate >= new Date();
  }).length;
  
  const pastTrips = totalTrips - upcomingTrips;
  const totalDays = trips.reduce((sum, trip) => {
    const duration = trip.duration || 5; // default
    return sum + duration;
  }, 0);
  
  const favoriteDestination = trips.reduce((acc, trip) => {
    const dest = trip.destination || trip.destinationName || 'Unknown';
    acc[dest] = (acc[dest] || 0) + 1;
    return acc;
  }, {});
  
  const topDestination = Object.entries(favoriteDestination)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';
  
  // Render stats
  const statsGrid = document.getElementById('stats-grid');
  if (statsGrid) {
    statsGrid.innerHTML = `
      <div class="stat-card card text-center p-6">
        <div class="stat-card__icon" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-primary-600);">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div class="stat-card__value font-bold" style="font-size: var(--text-2xl);">${totalTrips}</div>
        <div class="stat-card__label text-secondary text-sm">Total Trips</div>
      </div>
      <div class="stat-card card text-center p-6">
        <div class="stat-card__icon" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-accent-600);">
            <rect x="3" y="4" width="18" height="14" rx="2"/><path d="M7 10h10"/>
          </svg>
        </div>
        <div class="stat-card__value font-bold" style="font-size: var(--text-2xl);">${upcomingTrips}</div>
        <div class="stat-card__label text-secondary text-sm">Upcoming</div>
      </div>
      <div class="stat-card card text-center p-6">
        <div class="stat-card__icon" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-secondary-600);">
            <path d="M9 17l6-6-6-6"/>
          </svg>
        </div>
        <div class="stat-card__value font-bold" style="font-size: var(--text-2xl);">${pastTrips}</div>
        <div class="stat-card__label text-secondary text-sm">Past Trips</div>
      </div>
      <div class="stat-card card text-center p-6">
        <div class="stat-card__icon" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-primary-600);">
            <path d="M12 6v12"/><path d="M6 12h12"/>
          </svg>
        </div>
        <div class="stat-card__value font-bold" style="font-size: var(--text-2xl);">${totalDays}</div>
        <div class="stat-card__label text-secondary text-sm">Days Traveled</div>
      </div>
    `;
  }
}

function initRecentTrips() {
  const trips = JSON.parse(localStorage.getItem('tripzy_saved_trips') || '[]');
  const tripsContainer = document.getElementById('trips-container');
  
  if (!tripsContainer) return;
  
  if (trips.length === 0) {
    tripsContainer.innerHTML = `
      <div class="empty-state card text-center py-12">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mb-4" style="color: var(--color-text-tertiary);">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <h3 class="empty-state__title">No trips saved yet</h3>
        <p class="empty-state__text text-secondary">Use the AI Planner to create your first trip itinerary, then save it to see it here.</p>
        <a href="#planner" data-page="planner" class="btn btn--primary mt-6">Plan Your First Trip</a>
      </div>
    `;
    return;
  }
  
  // Sort trips by date (upcoming first)
  const sortedTrips = [...trips].sort((a, b) => {
    const dateA = new Date(a.startDate || a.savedAt || '2026-01-01');
    const dateB = new Date(b.startDate || b.savedAt || '2026-01-01');
    return dateA - dateB;
  });
  
  tripsContainer.innerHTML = sortedTrips.map(trip => renderTripCard(trip)).join('');
  
  // Add click listeners to trip cards
  document.querySelectorAll('.trip-card').forEach(card => {
    card.addEventListener('click', () => {
      const tripId = card.dataset.tripId;
      // In a real app, we'd navigate to trip details
      // For now, we'll just show a toast
      toast.info('Trip details', 'Feature coming soon!');
    });
  });
}

function renderTripCard(trip) {
  const startDate = trip.startDate || (trip.dates ? trip.dates.split(' - ')[0] : '2026-01-01');
  const endDate = trip.endDate || (trip.dates ? trip.dates.split(' - ')[1] : '2026-01-05');
  const isUpcoming = new Date(startDate) >= new Date();
  
  return `
    <article class="card trip-card" data-trip-id="${trip.id || Date.now()}">
      <div class="trip-card__header flex items-start justify-between gap-3 p-4">
        <div class="trip-card__header-content flex-1">
          <h3 class="trip-card__title font-semibold">${trip.tripName || trip.title || 'Untitled Trip'}</h3>
          <p class="trip-card__subtitle text-sm text-tertiary">
            ${trip.destination || trip.destinationName || 'Unknown Destination'}
          </p>
        </div>
        <div class="trip-card__date-badge ${isUpcoming ? 'bg-accent-100 text-accent-800' : 'bg-secondary-100 text-secondary-800'}" 
             style="padding: var(--space-1) var(--space-3); border-radius: var(--radius-full); font-size: var(--text-xs);">
          ${isUpcoming ? 'Upcoming' : 'Past'}
        </div>
      </div>
      <div class="trip-card__body p-4">
        <div class="trip-card__meta grid gap-3" style="grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));">
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
        <div class="trip-card__dates mt-3">
          <div class="flex items-center gap-2 text-sm text-tertiary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-1" style="opacity: 0.7;">
              <path d="M8 7V3m10 4l-3-3M6 5l10 7-3 7M6 5l10 7-3-7"/>
            </svg>
            <span>${formatDate(startDate)} - ${formatDate(endDate)}</span>
          </div>
        </div>
        ${trip.notes ? `<p class="trip-card__notes mt-3 text-sm text-tertiary italic">${trip.notes}</p>` : ''}
      </div>
      <div class="trip-card__footer flex items-center justify-between p-4 border-t" style="border-color: var(--color-surface-border);">
        <div class="trip-card__actions flex gap-2">
          <button class="btn btn--outline btn--sm trip-view-btn" data-trip-id="${trip.id || Date.now()}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M15 2l-3 3m0 0l-3 3m3 3H3m18 0h-3"/>
            </svg>
            View
          </button>
          ${!isUpcoming ? '' : `
            <button class="btn btn--primary btn--sm trip-remind-btn" data-trip-id="${trip.id || Date.now()}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M12 8v4l3 3"/><path d="M5 21h14"/><path d="M19 21V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z"/>
              </svg>
              Remind Me
            </button>
          `}
        </div>
        <div class="trip-card__price">
          <span class="font-bold text-primary" style="font-size: var(--text-lg);">₹${((trip.budget || 0) / (trip.duration || 1)).toLocaleString()}</span>
          <span class="text-secondary text-xs">/day</span>
        </div>
      </div>
    </article>
  `;
}

function formatDate(dateString) {
  const options = { month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function initQuickActions() {
  const addTripBtn = document.getElementById('btn-add-trip');
  if (addTripBtn) {
    addTripBtn.addEventListener('click', () => {
      window.location.hash = '#planner';
    });
  }
  
  const userMenuBtn = document.getElementById('user-menu-btn');
  const userMenu = document.getElementById('user-menu');
  
  if (userMenuBtn && userMenu) {
    userMenuBtn.addEventListener('click', () => {
      const isHidden = userMenu.hidden;
      userMenu.hidden = !isHidden;
      userMenuBtn.setAttribute('aria-expanded', String(!isHidden));
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!userMenuBtn.contains(e.target) && !userMenu.contains(e.target)) {
        userMenu.hidden = true;
        userMenuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
  
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('tripzy_token');
      state.set('user', null);
      // Update auth UI in app.js
      window.dispatchEvent(new CustomEvent('tripzy:logout'));
      toast.success('Signed out successfully');
      window.location.hash = '#home';
    });
  }
}

function initDashboardInsights() {
  const trips = JSON.parse(localStorage.getItem('tripzy_saved_trips') || '[]');
  const insightsGrid = document.getElementById('insights-grid');
  
  if (!insightsGrid) return;
  
  // Generate insights based on trips
  const insights = [];
  
  if (trips.length > 0) {
    // Favorite type insight
    const types = trips.map(trip => trip.type || trip.tags?.[0] || 'Unknown');
    const favoriteType = types.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    const topType = Object.entries(favoriteType)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';
    
    insights.push({
      title: 'Your Travel Style',
      description: `You most often enjoy ${topType.toLowerCase()} trips`,
      icon: '🎯',
      color: 'var(--color-primary-600)'
    });
    
    // Budget insight
    const avgBudget = trips.reduce((sum, trip) => sum + (trip.budget || 0), 0) / trips.length;
    insights.push({
      title: 'Average Trip Budget',
      description: `You typically spend ₹${Math.round(avgBudget).toLocaleString()} per trip`,
      icon: '💰',
      color: 'var(--color-accent-600)'
    });
    
    // Season insight
    const months = trips.map(trip => {
      const date = trip.startDate ? new Date(trip.startDate) : new Date();
      return date.getMonth();
    });
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const favoriteMonth = months.reduce((acc, month) => {
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});
    const topMonthIndex = Object.entries(favoriteMonth)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 0;
    const topMonth = monthNames[parseInt(topMonthIndex)];
    
    insights.push({
      title: 'Preferred Travel Month',
      description: `You tend to travel most in ${topMonth}`,
      icon: '📅',
      color: 'var(--color-secondary-600)'
    });
  } else {
    // Default insights for new users
    insights.push({
      title: 'Get Started',
      description: 'Create your first trip using the AI Planner to see personalized insights here',
      icon: '🚀',
      color: 'var(--color-primary-600)'
    });
    
    insights.push({
      title: 'Explore Destinations',
      description: 'Browse through our curated destinations to find inspiration for your next trip',
      icon: '🌍',
      color: 'var(--color-accent-600)'
    });
    
    insights.push({
      title: 'Save Your Plans',
      description: 'Once you create an itinerary, save it to your dashboard for easy access',
      icon: '💾',
      color: 'var(--color-secondary-600)'
    });
  }
  
  insightsGrid.innerHTML = insights.map(insight => `
    <div class="insight-card card p-6 border-l-4" style="border-color: ${insight.color};">
      <div class="insight-card__header flex items-start gap-3">
        <div class="insight-card__icon" style="font-size: var(--text-2xl);">${insight.icon}</div>
        <div class="insight-card__content">
          <h3 class="insight-card__title font-medium">${insight.title}</h3>
          <p class="insight-card__description text-sm text-tertiary">${insight.description}</p>
        </div>
      </div>
    </div>
  `).join('');
}

function initCalendarPreview() {
  const trips = JSON.parse(localStorage.getItem('tripzy_saved_trips') || '[]');
  const upcomingTrips = trips.filter(trip => {
    const startDate = trip.startDate || (trip.dates ? trip.dates.split(' - ')[0] : '2026-01-01');
    return new Date(startDate) >= new Date();
  }).sort((a, b) => {
    const dateA = new Date(a.startDate || a.dates.split(' - ')[0]);
    const dateB = new Date(b.startDate || b.dates.split(' - ')[0]);
    return dateA - dateB;
  }).slice(0, 3); // Show max 3 upcoming trips
  
  const calendarPreview = document.getElementById('calendar-preview');
  if (!calendarPreview) return;
  
  if (upcomingTrips.length === 0) {
    calendarPreview.innerHTML = `
      <div class="text-center py-8">
        <p class="text-secondary">No upcoming trips scheduled</p>
        <a href="#planner" data-page="planner" class="btn btn--outline btn--sm mt-4">Plan a Trip</a>
      </div>
    `;
    return;
  }
  
  calendarPreview.innerHTML = `
    <div class="calendar-preview__grid grid gap-3" style="grid-template-columns: repeat(${upcomingTrips.length}, 1fr);">
      ${upcomingTrips.map(trip => {
        const startDate = trip.startDate || (trip.dates ? trip.dates.split(' - ')[0] : '2026-01-01');
        const endDate = trip.endDate || (trip.dates ? trip.dates.split(' - ')[1] : '2026-01-05');
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return `
          <div class="calendar-preview__day bg-primary-50 rounded-lg p-3 text-center" style="min-height: 80px;">
            <div class="calendar-preview__day-number font-bold text-primary" style="font-size: var(--text-lg);">
              ${start.getDate()}
            </div>
            <div class="calendar-preview__day-name text-xs text-tertiary">
              ${start.toLocaleDateString(undefined, { weekday: 'short' })}
            </div>
            ${start.getMonth() !== end.getMonth() || start.getDate() !== end.getDate() ? `
              <div class="calendar-preview__day-range text-xs text-tertiary mt-1">
                ${start.getDate()}-${end.getDate()} ${start.toLocaleDateString(undefined, { month: 'short' })}
              </div>
            ` : ''}
            <div class="calendar-preview__trip-info mt-2">
              <div class="font-medium text-primary text-xs">${trip.tripName || trip.title || 'Trip'}</div>
              <div class="text-xs text-tertiary">${trip.destination || trip.destinationName || ''}</div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// Initialize all dashboard components when the page loads
function initDashboardComponents() {
  initDashboardStats();
  initRecentTrips();
  initQuickActions();
  initDashboardInsights();
  initCalendarPreview();
}

// Call initialization
initDashboardComponents();