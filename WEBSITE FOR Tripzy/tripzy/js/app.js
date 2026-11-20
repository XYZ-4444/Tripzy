/**
 * Tripzy - Main Application Router
 * SPA router with history API, page lifecycle, and module loading
 */

import { StateManager } from './utils/state.js';
import { Toast } from './utils/toast.js';
import { API } from './utils/api.js';

// ===== ROUTE DEFINITIONS =====
const routes = [
  { path: 'home', title: 'Tripzy - Smart Travel Planning', module: 'pages/home.js', init: 'initHome' },
  { path: 'planner', title: 'AI Planner - Tripzy', module: 'pages/planner.js', init: 'initPlanner', auth: true },
  { path: 'search', title: 'Search - Tripzy', module: 'pages/search.js', init: 'initSearch' },
  { path: 'dashboard', title: 'Dashboard - Tripzy', module: 'pages/dashboard.js', init: 'initDashboard', auth: true },
  { path: 'calendar', title: 'Calendar - Tripzy', module: 'pages/calendar.js', init: 'initCalendar', auth: true },
  { path: 'vendors', title: 'Vendors - Tripzy', module: 'pages/vendors.js', init: 'initVendors' },
  { path: 'trust', title: 'Trust Hub - Tripzy', module: 'pages/trust.js', init: 'initTrust' },
  { path: 'login', title: 'Sign In - Tripzy', module: 'pages/auth.js', init: 'initLogin' },
  { path: 'signup', title: 'Get Started - Tripzy', module: 'pages/auth.js', init: 'initSignup' },
  { path: 'trip/:id', title: 'Trip Details - Tripzy', module: 'pages/trip-detail.js', init: 'initTripDetail', auth: true },
  { path: 'booking/:id', title: 'Booking - Tripzy', module: 'pages/booking.js', init: 'initBooking', auth: true },
];

// ===== APP STATE =====
const state = new StateManager({
  user: null,
  currentPage: 'home',
  currentRoute: null,
  routeParams: {},
  isLoading: false,
  isOnline: navigator.onLine,
});

// ===== DOM ELEMENTS =====
const app = document.getElementById('app');
const mainContent = document.getElementById('main-content');
const toastContainer = document.getElementById('toast-container');
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuClose = document.getElementById('mobile-menu-close');
const mobileMenuPanel = mobileMenu?.querySelector('.mobile-menu__panel');
const menuIconOpen = document.getElementById('menu-icon-open');
const menuIconClose = document.getElementById('menu-icon-close');
const navLinks = document.querySelectorAll('[data-page]');

// ===== INITIALIZATION =====
let currentPageModule = null;
let currentPageCleanup = null;

// Initialize toast system
const toast = new Toast(toastContainer);

// Initialize API client
const api = new API();

// Check auth state on load
async function checkAuth() {
  const token = localStorage.getItem('tripzy_token');
  if (token) {
    try {
      const user = await api.get('/auth/me');
      state.set('user', user);
      updateAuthUI(user);
    } catch (e) {
      localStorage.removeItem('tripzy_token');
      state.set('user', null);
      updateAuthUI(null);
    }
  }
}

// ===== ROUTER =====
function parseRoute(hash) {
  const [path, search] = hash.replace('#', '').split('?');
  const params = new URLSearchParams(search);
  const paramObj = Object.fromEntries(params);

  for (const route of routes) {
    const routeParts = route.path.split('/');
    const pathParts = path.split('/');

    if (routeParts.length !== pathParts.length) continue;

    const routeParams = {};
    let match = true;

    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        routeParams[routeParts[i].slice(1)] = pathParts[i];
      } else if (routeParts[i] !== pathParts[i]) {
        match = false;
        break;
      }
    }

    if (match) {
      return { route, routeParams, queryParams: paramObj };
    }
  }

  return { route: routes[0], routeParams: {}, queryParams: paramObj };
}

async function navigate(hash, replace = false) {
  if (state.get('isLoading')) return;

  state.set('isLoading', true);
  showLoading(true);

  try {
    const { route, routeParams, queryParams } = parseRoute(hash);

    // Check auth requirement
    if (route.auth && !state.get('user')) {
      const returnUrl = encodeURIComponent(hash);
      window.location.hash = `#login?return=${returnUrl}`;
      state.set('isLoading', false);
      showLoading(false);
      return;
    }

    // Cleanup previous page
    if (currentPageCleanup) {
      await currentPageCleanup();
      currentPageCleanup = null;
    }
    currentPageModule = null;

    // Update state
    state.set('currentPage', route.path.split('/')[0]);
    state.set('currentRoute', route);
    state.set('routeParams', routeParams);

    // Update document title
    document.title = route.title;

    // Update active nav link
    updateActiveNav(route.path.split('/')[0]);

    // Load page module
    const module = await import(`/js/${route.module}`);
    const initFn = module[route.init];

    if (typeof initFn === 'function') {
      const pageEl = document.createElement('div');
      pageEl.className = 'page';
      pageEl.setAttribute('role', 'region');
      pageEl.setAttribute('aria-label', route.title);
      pageEl.hidden = true;

      mainContent.innerHTML = '';
      mainContent.appendChild(pageEl);

      // Initialize page
      currentPageCleanup = await initFn(pageEl, { state, api, toast, routeParams, queryParams });

      // Show page with animation
      requestAnimationFrame(() => {
        pageEl.hidden = false;
      });
    }

    // Close mobile menu
    closeMobileMenu();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

  } catch (error) {
    console.error('Navigation error:', error);
    toast.error('Failed to load page. Please try again.');
    // Fallback to home
    if (hash !== '#home') {
      window.location.hash = '#home';
    }
  } finally {
    state.set('isLoading', false);
    showLoading(false);
  }
}

function showLoading(show) {
  const loader = document.getElementById('page-loader');
  if (loader) {
    loader.hidden = !show;
  }
}

// Create loading indicator
const loaderHtml = `
  <div id="page-loader" class="fixed inset-0 flex items-center justify-center" style="z-index: var(--z-fixed); background: var(--color-surface);" hidden>
    <div class="spinner spinner--lg" style="border-top-color: var(--color-primary-600);"></div>
  </div>
`;
document.body.insertAdjacentHTML('beforeend', loaderHtml);

// ===== NAVIGATION HANDLERS =====
function updateActiveNav(page) {
  navLinks.forEach(link => {
    const isActive = link.dataset.page === page;
    link.setAttribute('aria-current', isActive ? 'page' : 'false');
    if (isActive) {
      link.classList.add('nav-link--active');
    } else {
      link.classList.remove('nav-link--active');
    }
  });
}

function handleHashChange() {
  navigate(window.location.hash || '#home');
}

function handleNavClick(e) {
  const link = e.target.closest('[data-page]');
  if (!link) return;

  e.preventDefault();
  const page = link.dataset.page;
  window.location.hash = `#${page}`;
}

// ===== MOBILE MENU =====
function openMobileMenu() {
  mobileMenu.hidden = false;
  mobileMenuPanel.classList.remove('translate-x-full');
  menuIconOpen.classList.add('hidden');
  menuIconClose.classList.remove('hidden');
  menuToggle.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';

  // Focus first link
  const firstLink = mobileMenu.querySelector('.mobile-menu__link');
  firstLink?.focus();

  // Trap focus
  mobileMenuPanel.addEventListener('keydown', trapFocus);
}

function closeMobileMenu() {
  mobileMenuPanel.classList.add('translate-x-full');
  menuIconOpen.classList.remove('hidden');
  menuIconClose.classList.add('hidden');
  menuToggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';

  setTimeout(() => {
    if (!mobileMenuPanel.classList.contains('translate-x-full')) return;
    mobileMenu.hidden = true;
  }, 300);

  mobileMenuPanel.removeEventListener('keydown', trapFocus);
}

function trapFocus(e) {
  if (e.key !== 'Tab') return;

  const focusableElements = mobileMenuPanel.querySelectorAll(
    'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (e.shiftKey && document.activeElement === firstElement) {
    e.preventDefault();
    lastElement.focus();
  } else if (!e.shiftKey && document.activeElement === lastElement) {
    e.preventDefault();
    firstElement.focus();
  }
}

// ===== AUTH UI =====
function updateAuthUI(user) {
  const authButtons = document.querySelectorAll('#btn-login, #btn-signup, #mobile-btn-login, #mobile-btn-signup');
  const userMenu = document.getElementById('user-menu');

  if (user) {
    authButtons.forEach(btn => btn.hidden = true);
    if (userMenu) userMenu.hidden = false;
  } else {
    authButtons.forEach(btn => btn.hidden = false);
    if (userMenu) userMenu.hidden = true;
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const form = e.target;
  const email = form.email.value;
  const password = form.password.value;

  try {
    const { token, user } = await api.post('/auth/login', { email, password });
    localStorage.setItem('tripzy_token', token);
    state.set('user', user);
    updateAuthUI(user);
    toast.success('Welcome back!');

    const returnUrl = new URLSearchParams(window.location.search).get('return') || '#home';
    window.location.hash = returnUrl;
  } catch (error) {
    toast.error(error.message || 'Login failed');
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    name: form.name.value,
    email: form.email.value,
    password: form.password.value,
  };

  try {
    const { token, user } = await api.post('/auth/signup', data);
    localStorage.setItem('tripzy_token', token);
    state.set('user', user);
    updateAuthUI(user);
    toast.success('Account created successfully!');
    window.location.hash = '#planner';
  } catch (error) {
    toast.error(error.message || 'Signup failed');
  }
}

function handleLogout() {
  localStorage.removeItem('tripzy_token');
  state.set('user', null);
  updateAuthUI(null);
  toast.success('Signed out successfully');
  window.location.hash = '#home';
}

// ===== EVENT LISTENERS =====
window.addEventListener('hashchange', handleHashChange);
window.addEventListener('load', () => {
  checkAuth().then(() => handleHashChange());
});

menuToggle?.addEventListener('click', openMobileMenu);
mobileMenuClose?.addEventListener('click', closeMobileMenu);
mobileMenu?.querySelector('.mobile-menu__backdrop')?.addEventListener('click', closeMobileMenu);

navLinks.forEach(link => link.addEventListener('click', handleNavClick));

// Auth form handlers (delegated)
document.addEventListener('submit', e => {
  if (e.target.id === 'login-form') handleLogin(e);
  if (e.target.id === 'signup-form') handleSignup(e);
});

document.addEventListener('click', e => {
  if (e.target.id === 'btn-logout' || e.target.id === 'mobile-btn-logout') {
    handleLogout();
  }
});

// Online/offline detection
window.addEventListener('online', () => {
  state.set('isOnline', true);
  toast.success('You\'re back online!');
});
window.addEventListener('offline', () => {
  state.set('isOnline', false);
  toast.warning('You\'re offline. Some features may be limited.');
});

// Keyboard shortcuts
document.addEventListener('keydown', e => {
  // Escape to close mobile menu
  if (e.key === 'Escape' && !mobileMenu.hidden) {
    closeMobileMenu();
  }
  // Cmd/Ctrl + K for search
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    window.location.hash = '#search';
  }
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered:', reg.scope))
      .catch(err => console.log('SW registration failed:', err));
  });
}

// Export for debugging
window.Tripzy = { state, api, toast, navigate };

console.log('🚀 Tripzy initialized');