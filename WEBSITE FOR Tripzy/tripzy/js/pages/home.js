/**
 * Tripzy - Home Page Module
 * Hero, featured packages, destinations, trust indicators, CTA
 */

import { api } from '../utils/api.js';

let destinations = [];
let packages = [];

export async function initHome(container, { state, api, toast }) {
  // Load data
  try {
    const [destRes, pkgRes] = await Promise.all([
      fetch('/data/destinations.json').then(r => r.json()),
      fetch('/data/packages.json').then(r => r.json()),
    ]);
    destinations = destRes;
    packages = pkgRes;
  } catch (e) {
    console.error('Failed to load home data:', e);
  }

  // Render page
  container.innerHTML = renderHome();
  container.hidden = false;

  // Initialize components
  initHeroSearch();
  initPackageCards();
  initDestinationCards();
  initTrustIndicators();
  initNewsletterForm();

  // Return cleanup function
  return () => {
    // Cleanup if needed
  };
}

function renderHome() {
  return `
    <div class="page-content">
      <!-- Hero Section -->
      <section class="hero" aria-labelledby="hero-title">
        <div class="container">
          <div class="hero__content">
            <h1 id="hero-title" class="hero__title">
              Plan Your Perfect <span class="hero__highlight">Getaway</span>
            </h1>
            <p class="hero__subtitle">
              Discover curated travel experiences, AI-powered itineraries, and trusted local vendors.
              Your next adventure starts here.
            </p>
            <form class="hero__search" id="hero-search-form" role="search" aria-label="Trip search">
              <div class="hero__search-fields">
                <div class="form-group">
                  <label for="hero-destination" class="visually-hidden">Destination</label>
                  <input
                    type="text"
                    id="hero-destination"
                    class="form-input hero__input"
                    placeholder="Where to?"
                    list="destinations-list"
                    autocomplete="off"
                    aria-describedby="dest-suggestions"
                  >
                  <datalist id="destinations-list">
                    ${destinations.map(d => `<option value="${d.name}">`).join('')}
                  </datalist>
                  <span id="dest-suggestions" class="visually-hidden">Type to see suggested destinations</span>
                </div>
                <div class="form-group">
                  <label for="hero-dates" class="visually-hidden">Travel dates</label>
                  <input
                    type="text"
                    id="hero-dates"
                    class="form-input hero__input"
                    placeholder="Dates"
                    readonly
                    aria-describedby="dates-hint"
                  >
                  <span id="dates-hint" class="visually-hidden">Select check-in and check-out dates</span>
                </div>
                <div class="form-group">
                  <label for="hero-guests" class="visually-hidden">Guests</label>
                  <select id="hero-guests" class="form-select hero__input" aria-describedby="guests-hint">
                    <option value="1">1 Guest</option>
                    <option value="2" selected>2 Guests</option>
                    <option value="3">3 Guests</option>
                    <option value="4">4 Guests</option>
                    <option value="5">5 Guests</option>
                    <option value="6">6+ Guests</option>
                  </select>
                  <span id="guests-hint" class="visually-hidden">Number of travelers</span>
                </div>
              </div>
              <button type="submit" class="btn btn--primary btn--lg hero__submit" aria-label="Search trips">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <span>Search</span>
              </button>
            </form>
            <p class="hero__hint">Or <a href="#planner" data-page="planner">let AI plan your trip</a></p>
          </div>
          <div class="hero__visual" aria-hidden="true">
            <div class="hero__illustration">
              <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Simplified illustration -->
                <defs>
                  <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#60a5fa"/>
                    <stop offset="100%" stop-color="#fbbf24"/>
                  </linearGradient>
                </defs>
                <rect width="400" height="300" rx="16" fill="url(#skyGradient)" opacity="0.15"/>
                <path d="M50 220 Q100 180 150 200 Q200 220 250 180 Q300 140 350 160 Q380 180 400 220 L400 300 L0 300 Z" fill="#fef3c7" opacity="0.5"/>
                <circle cx="320" cy="60" r="35" fill="#fbbf24" opacity="0.3"/>
                <circle cx="340" cy="50" r="20" fill="#fbbf24" opacity="0.4"/>
                <path d="M80 200 Q100 160 120 190 Q140 220 160 190" stroke="#fbbf24" stroke-width="3" fill="none" opacity="0.6"/>
                <path d="M200 200 Q220 150 240 180 Q260 210 280 180" stroke="#fbbf24" stroke-width="3" fill="none" opacity="0.6"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      <!-- Trust Indicators -->
      <section class="trust-bar" aria-labelledby="trust-title">
        <div class="container">
          <h2 id="trust-title" class="visually-hidden">Why travelers trust Tripzy</h2>
          <div class="trust-bar__grid grid gap-6" style="grid-template-columns: repeat(4, 1fr);">
            <div class="trust-item flex flex-col items-center text-center p-4">
              <div class="trust-item__icon" aria-hidden="true">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-primary-600);">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div class="trust-item__value font-bold" style="font-size: var(--text-3xl); color: var(--color-primary-600);">50K+</div>
              <div class="trust-item__label text-secondary text-sm">Happy Travelers</div>
            </div>
            <div class="trust-item flex flex-col items-center text-center p-4">
              <div class="trust-item__icon" aria-hidden="true">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-accent-600);">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div class="trust-item__value font-bold" style="font-size: var(--text-3xl); color: var(--color-accent-600);">2,000+</div>
              <div class="trust-item__label text-secondary text-sm">Verified Vendors</div>
            </div>
            <div class="trust-item flex flex-col items-center text-center p-4">
              <div class="trust-item__icon" aria-hidden="true">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-secondary-600);">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <div class="trust-item__value font-bold" style="font-size: var(--text-3xl); color: var(--color-secondary-600);">4.8/5</div>
              <div class="trust-item__label text-secondary text-sm">Average Rating</div>
            </div>
            <div class="trust-item flex flex-col items-center text-center p-4">
              <div class="trust-item__icon" aria-hidden="true">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-primary-600);">
                  <rect x="2" y="3" width="20" height="14" rx="2"/>
                  <path d="M8 21h8M12 17v4"/>
                </svg>
              </div>
              <div class="trust-item__value font-bold" style="font-size: var(--text-3xl); color: var(--color-primary-600);">24/7</div>
              <div class="trust-item__label text-secondary text-sm">Support</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Featured Packages -->
      <section class="section packages-section" aria-labelledby="packages-title">
        <div class="container">
          <header class="section__header flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <h2 id="packages-title" class="section__title">Featured Packages</h2>
              <p class="section__subtitle text-secondary">Handpicked experiences with great reviews</p>
            </div>
            <a href="#search" data-page="search" class="btn btn--outline btn--sm">View All</a>
          </header>
          <div class="packages-grid grid gap-6" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));" id="packages-grid">
            ${renderPackageCards(packages.filter(p => p.featured).slice(0, 4))}
          </div>
        </div>
      </section>

      <!-- Popular Destinations -->
      <section class="section destinations-section" aria-labelledby="destinations-title">
        <div class="container">
          <header class="section__header flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <h2 id="destinations-title" class="section__title">Popular Destinations</h2>
              <p class="section__subtitle text-secondary">Explore India's most loved travel spots</p>
            </div>
            <a href="#search" data-page="search" class="btn btn--outline btn--sm">Explore All</a>
          </header>
          <div class="destinations-grid grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));" id="destinations-grid">
            ${renderDestinationCards(destinations.slice(0, 6))}
          </div>
        </div>
      </section>

      <!-- AI Planner CTA -->
      <section class="section cta-section" aria-labelledby="cta-title">
        <div class="container">
          <div class="cta-card card" style="background: linear-gradient(135deg, var(--color-primary-600), var(--color-primary-800)); color: var(--color-text-inverse); border: none;">
            <div class="cta-card__content" style="max-width: 800px; margin: 0 auto; text-align: center;">
              <h2 id="cta-title" class="cta-card__title" style="color: var(--color-text-inverse); font-size: var(--text-3xl); margin-bottom: var(--space-4);">
                Don't know where to start?
              </h2>
              <p class="cta-card__text" style="font-size: var(--text-lg); opacity: 0.9; margin-bottom: var(--space-6); max-width: 600px; margin-left: auto; margin-right: auto;">
                Tell us your vibe, budget, and dates. Our AI creates a personalized day-by-day itinerary with bookings, local tips, and real-time adjustments.
              </p>
              <a href="#planner" data-page="planner" class="btn btn--lg" style="background: var(--color-secondary-500); color: var(--color-text-inverse); box-shadow: var(--shadow-secondary);">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
                Try AI Trip Planner
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Newsletter -->
      <section class="section newsletter-section" aria-labelledby="newsletter-title">
        <div class="container">
          <div class="newsletter-card card" style="max-width: 600px; margin: 0 auto; text-align: center;">
            <h2 id="newsletter-title" class="newsletter__title">Get Travel Inspiration</h2>
            <p class="newsletter__text text-secondary">Weekly travel tips, hidden gems, and exclusive deals. No spam, unsubscribe anytime.</p>
            <form class="newsletter__form" id="newsletter-form">
              <div class="flex gap-2">
                <input
                  type="email"
                  id="newsletter-email"
                  class="form-input flex-1"
                  placeholder="Enter your email"
                  required
                  aria-label="Email address"
                >
                <button type="submit" class="btn btn--primary">Subscribe</button>
              </div>
              <p class="form-hint" style="margin-top: var(--space-2);">By subscribing, you agree to our <a href="#">Privacy Policy</a>.</p>
            </form>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderPackageCards(packages) {
  return packages.map(pkg => `
    <article class="card card--interactive package-card" data-package-id="${pkg.id}">
      <img src="${pkg.image}" alt="" class="card__image package-card__image" loading="lazy">
      <div class="card__content">
        <div class="flex items-start justify-between gap-2 mb-2">
          <span class="badge badge--primary">${pkg.type}</span>
          <span class="package-card__rating" aria-label="Rating: ${pkg.rating} out of 5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="color: var(--color-secondary-500);"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            ${pkg.rating} (${pkg.reviewCount})
          </span>
        </div>
        <h3 class="card__title package-card__title">${pkg.title}</h3>
        <p class="card__subtitle package-card__destination">${pkg.destination} • ${pkg.duration} days</p>
        <div class="package-card__meta card__meta">
          <span>${pkg.nights} nights</span>
          <span>${pkg.tags.slice(0, 2).join(' · ')}</span>
        </div>
      </div>
      <div class="card__footer">
        <div class="package-card__price">
          <span class="package-card__amount font-bold" style="font-size: var(--text-xl);">${pkg.price.toLocaleString()}</span>
          <span class="package-card__currency text-secondary">${pkg.currency}</span>
        </div>
        <button class="btn btn--primary btn--sm package-card__btn" data-package-id="${pkg.id}">View Details</button>
      </div>
    </article>
  `).join('');
}

function renderDestinationCards(destinations) {
  return destinations.map(dest => `
    <article class="card card--interactive destination-card" data-destination="${dest.slug}">
      <img src="${dest.image}" alt="" class="card__image destination-card__image" loading="lazy">
      <div class="card__content">
        <div class="flex items-center justify-between">
          <span class="badge badge--outline destination-card__type">${dest.type}</span>
          <span class="destination-card__rating" aria-label="Rating: ${dest.rating} out of 5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="color: var(--color-secondary-500);"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            ${dest.rating}
          </span>
        </div>
        <h3 class="card__title destination-card__name">${dest.name}</h3>
        <p class="card__subtitle destination-card__desc">${dest.description}</p>
        <div class="destination-card__meta card__meta">
          <span>From ${dest.startingPrice.toLocaleString()} ${dest.currency}</span>
          <span>${dest.bestTime}</span>
        </div>
      </div>
    </article>
  `).join('');
}

function initHeroSearch() {
  const form = document.getElementById('hero-search-form');
  const destinationInput = document.getElementById('hero-destination');
  const datesInput = document.getElementById('hero-dates');
  const guestsSelect = document.getElementById('hero-guests');

  // Date picker functionality (simplified - would use a proper date picker lib in production)
  datesInput.addEventListener('click', () => {
    // For demo, just set a default range
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const format = d => d.toISOString().split('T')[0];
    datesInput.value = `${format(today)} - ${format(nextWeek)}`;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const params = new URLSearchParams({
      destination: destinationInput.value,
      dates: datesInput.value,
      guests: guestsSelect.value,
    });
    window.location.hash = `#search?${params.toString()}`;
  });
}

function initPackageCards() {
  const grid = document.getElementById('packages-grid');
  if (!grid) return;

  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.package-card');
    const btn = e.target.closest('.package-card__btn');

    if (btn) {
      e.stopPropagation();
      const id = btn.dataset.packageId;
      window.location.hash = `#package/${id}`;
    } else if (card) {
      const id = card.dataset.packageId;
      window.location.hash = `#package/${id}`;
    }
  });
}

function initDestinationCards() {
  const grid = document.getElementById('destinations-grid');
  if (!grid) return;

  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.destination-card');
    if (card) {
      const slug = card.dataset.destination;
      window.location.hash = `#search?destination=${slug}`;
    }
  });
}

function initTrustIndicators() {
  // Animate counters on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.trust-item__value').forEach(el => observer.observe(el));
}

function animateCounters(container) {
  const values = container.querySelectorAll('.trust-item__value');
  values.forEach(el => {
    const text = el.textContent;
    const num = parseFloat(text.replace(/[^0-9.]/g, ''));
    const suffix = text.replace(/[0-9.,]/g, '');
    let current = 0;
    const increment = num / 30;
    const timer = setInterval(() => {
      current += increment;
      if (current >= num) {
        current = num;
        clearInterval(timer);
      }
      el.textContent = Math.floor(current).toLocaleString() + suffix;
    }, 30);
  });
}

function initNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('newsletter-email').value;
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner spinner--sm"></span>';

    try {
      // Simulate API call
      await new Promise(r => setTimeout(r, 1000));
      toast.success('Subscribed!', 'Check your inbox for confirmation.');
      form.reset();
    } catch (err) {
      toast.error('Failed to subscribe', 'Please try again later.');
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
}