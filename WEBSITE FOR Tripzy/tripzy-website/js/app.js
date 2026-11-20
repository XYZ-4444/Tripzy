/**
 * Tripzy - Main Application Entry Point
 * SIH 2026 PS 26204 - AI-Powered Smart Tourism Platform
 * Router, State Management, Core Utilities
 */

import { Router } from './router.js';
import { StateManager } from './state.js';
import { API } from './api.js';
import { initNavbar } from '../components/navbar.js';
import { initFooter } from '../components/footer.js';
import { initModals } from '../components/modal.js';
import { initToasts } from '../components/toast.js';
import { registerServiceWorker } from './sw-register.js';

// ========================================
// APP INITIALIZATION
// ========================================

class TripzyApp {
  constructor() {
    this.router = new Router();
    this.state = new StateManager();
    this.api = new API();
    this.currentPage = null;
    this.pageModules = {};
  }

  async init() {
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      await registerServiceWorker();
    }

    // Initialize global components
    await this.initGlobalComponents();

    // Setup router
    this.setupRoutes();

    // Start router
    this.router.start();

    // Handle initial route
    this.router.navigate(window.location.pathname);

    // Global error handling
    window.addEventListener('error', this.handleError.bind(this));
    window.addEventListener('unhandledrejection', this.handleError.bind(this));

    console.log('🚀 Tripzy App Initialized');
  }

  async initGlobalComponents() {
    // Initialize navbar
    await initNavbar(this.state, this.router);

    // Initialize footer
    await initFooter();

    // Initialize modals
    initModals();

    // Initialize toasts
    initToasts();
  }

  setupRoutes() {
    // Public routes
    this.router.addRoute('/', () => this.loadPage('home'));
    this.router.addRoute('/home', () => this.loadPage('home'));
    this.router.addRoute('/explore', () => this.loadPage('explore'));
    this.router.addRoute('/hotels', () => this.loadPage('hotels'));
    this.router.addRoute('/guides', () => this.loadPage('guides'));
    this.router.addRoute('/planner', () => this.loadPage('planner'));
    this.router.addRoute('/about', () => this.loadPage('about'));
    this.router.addRoute('/login', () => this.loadPage('login'));
    this.router.addRoute('/signup', () => this.loadPage('signup'));

    // Protected routes (require auth)
    this.router.addRoute('/dashboard', () => this.loadProtectedPage('dashboard'));
    this.router.addRoute('/calendar', () => this.loadProtectedPage('calendar'));
    this.router.addRoute('/vendor', () => this.loadProtectedPage('vendor'));
    this.router.addRoute('/trust', () => this.loadProtectedPage('trust'));
    this.router.addRoute('/profile', () => this.loadProtectedPage('profile'));
    this.router.addRoute('/bookings', () => this.loadProtectedPage('bookings'));
    this.router.addRoute('/settings', () => this.loadProtectedPage('settings'));

    // Dynamic routes
    this.router.addRoute('/destination/:id', (params) => this.loadPage('destination', params));
    this.router.addRoute('/hotel/:id', (params) => this.loadPage('hotel-detail', params));
    this.router.addRoute('/guide/:id', (params) => this.loadPage('guide-detail', params));
  }

  async loadPage(pageName, params = {}) {
    try {
      // Show loading state
      this.showPageLoader();

      // Import page module dynamically
      const module = await this.importPageModule(pageName);
      
      // Unmount previous page
      if (this.currentPage && this.currentPage.unmount) {
        this.currentPage.unmount();
      }

      // Render new page
      const appRoot = document.getElementById('app');
      appRoot.innerHTML = '';
      
      this.currentPage = module.default || module;
      await this.currentPage.mount(appRoot, { state: this.state, api: this.api, router: this.router, params });

      // Update document title
      this.updatePageTitle(pageName);

      // Scroll to top
      window.scrollTo(0, 0);

      // Hide loader
      this.hidePageLoader();

      // Track page view
      this.trackPageView(pageName);

    } catch (error) {
      console.error(`Failed to load page: ${pageName}`, error);
      this.showErrorPage();
    }
  }

  async loadProtectedPage(pageName, params = {}) {
    const user = this.state.get('user');
    
    if (!user) {
      // Redirect to login with return URL
      this.router.navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    await this.loadPage(pageName, params);
  }

  async importPageModule(pageName) {
    // Check cache
    if (this.pageModules[pageName]) {
      return this.pageModules[pageName];
    }

    // Dynamic import
    const module = await import(`../pages/${pageName}.js`);
    this.pageModules[pageName] = module;
    return module;
  }

  updatePageTitle(pageName) {
    const titles = {
      home: 'Tripzy - Har Safar, Smart Safar',
      explore: 'Explore Destinations - Tripzy',
      hotels: 'Hotels & Stays - Tripzy',
      guides: 'Local Guides - Tripzy',
      planner: 'AI Trip Planner - Tripzy',
      about: 'About Us - Tripzy',
      login: 'Login - Tripzy',
      signup: 'Sign Up - Tripzy',
      dashboard: 'Dashboard - Tripzy',
      calendar: 'Trip Calendar - Tripzy',
      vendor: 'Vendor Portal - Tripzy',
      trust: 'Trust & Safety Hub - Tripzy',
      profile: 'Profile - Tripzy',
      bookings: 'My Bookings - Tripzy',
      settings: 'Settings - Tripzy',
    };

    document.title = titles[pageName] || 'Tripzy';
  }

  showPageLoader() {
    const loader = document.getElementById('page-loader');
    if (loader) loader.classList.remove('hidden');
  }

  hidePageLoader() {
    const loader = document.getElementById('page-loader');
    if (loader) loader.classList.add('hidden');
  }

  showErrorPage() {
    const appRoot = document.getElementById('app');
    appRoot.innerHTML = `
      <div class="container py-20 text-center">
        <h1 class="text-4xl font-bold mb-4">Something went wrong</h1>
        <p class="text-secondary mb-6">We couldn't load this page. Please try again.</p>
        <button class="btn btn-primary" onclick="window.location.reload()">Reload Page</button>
      </div>
    `;
    this.hidePageLoader();
  }

  trackPageView(pageName) {
    // Analytics tracking placeholder
    if (window.gtag) {
      window.gtag('event', 'page_view', { page_title: document.title, page_path: window.location.pathname });
    }
  }

  handleError(event) {
    console.error('Global error:', event.error || event.reason);
    
    // Show toast for unhandled errors in production
    if (!window.location.hostname.includes('localhost')) {
      this.showToast('error', 'Something went wrong. Please refresh the page.');
    }
  }

  showToast(type, message, title) {
    const event = new CustomEvent('tripzy:toast', { detail: { type, message, title } });
    window.dispatchEvent(event);
  }
}

// ========================================
// GLOBAL UTILITIES
// ========================================

// Debounce function
export function debounce(fn, delay = 250) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Throttle function
export function throttle(fn, limit = 250) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Format currency (INR)
export function formatINR(amount, options = {}) {
  const { minimumFractionDigits = 0, maximumFractionDigits = 0 } = options;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
}

// Format date
export function formatDate(date, options = {}) {
  const { weekday = 'short', year = 'numeric', month = 'short', day = 'numeric' } = options;
  return new Intl.DateTimeFormat('en-IN', { weekday, year, month, day }).format(new Date(date));
}

// Format relative time
export function formatRelativeTime(date) {
  const rtf = new Intl.RelativeTimeFormat('en-IN', { numeric: 'auto' });
  const now = new Date();
  const diff = new Date(date) - now;
  const absDiff = Math.abs(diff);
  
  if (absDiff < 60000) return rtf.format(-Math.floor(absDiff / 1000), 'second');
  if (absDiff < 3600000) return rtf.format(-Math.floor(absDiff / 60000), 'minute');
  if (absDiff < 86400000) return rtf.format(-Math.floor(absDiff / 3600000), 'hour');
  if (absDiff < 604800000) return rtf.format(-Math.floor(absDiff / 86400000), 'day');
  if (absDiff < 2592000000) return rtf.format(-Math.floor(absDiff / 604800000), 'week');
  return rtf.format(-Math.floor(absDiff / 31536000000), 'year');
}

// Generate unique ID
export function generateId(prefix = '') {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Deep clone
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Get nested value
export function getNested(obj, path, defaultValue = undefined) {
  return path.split('.').reduce((o, k) => (o || {})[k], obj) ?? defaultValue;
}

// Set nested value
export function setNested(obj, path, value) {
  const keys = path.split('.');
  const last = keys.pop();
  const target = keys.reduce((o, k) => o[k] = o[k] || {}, obj);
  target[last] = value;
}

// ========================================
// DOM UTILITIES
// ========================================

export function createElement(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}

export function $(selector, context = document) {
  return context.querySelector(selector);
}

export function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

export function on(element, event, selector, handler) {
  if (typeof selector === 'function') {
    handler = selector;
    selector = null;
  }
  
  element.addEventListener(event, (e) => {
    if (selector) {
      const target = e.target.closest(selector);
      if (target) handler.call(target, e);
    } else {
      handler.call(element, e);
    }
  });
}

export function off(element, event, handler) {
  element.removeEventListener(event, handler);
}

export function emit(element, eventName, detail = {}) {
  element.dispatchEvent(new CustomEvent(eventName, { detail, bubbles: true }));
}

// ========================================
// VALIDATION UTILITIES
// ========================================

export const validators = {
  required: (value) => value && value.toString().trim().length > 0 ? null : 'This field is required',
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'Enter a valid email address',
  phone: (value) => /^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/\s/g, '')) ? null : 'Enter a valid phone number',
  minLength: (min) => (value) => value && value.length >= min ? null : `Minimum ${min} characters required`,
  maxLength: (max) => (value) => value && value.length <= max ? null : `Maximum ${max} characters allowed`,
  pattern: (regex, message) => (value) => regex.test(value) ? null : message,
  match: (field, getValue) => (value) => value === getValue(field) ? null : 'Values do not match',
  number: (value) => !isNaN(parseFloat(value)) && isFinite(value) ? null : 'Enter a valid number',
  integer: (value) => Number.isInteger(Number(value)) ? null : 'Enter a valid integer',
  positive: (value) => parseFloat(value) > 0 ? null : 'Value must be positive',
  url: (value) => {
    try { new URL(value); return null; } catch { return 'Enter a valid URL'; }
  },
};

export function validateForm(formData, rules) {
  const errors = {};
  let isValid = true;
  
  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = formData[field];
    
    for (const rule of fieldRules) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        isValid = false;
        break;
      }
    }
  }
  
  return { isValid, errors };
}

// ========================================
// STORAGE UTILITIES
// ========================================

export const storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
  
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch {
      return false;
    }
  },
};

export const sessionStorageUtil = {
  get(key, defaultValue = null) {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  
  remove(key) {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
};

// ========================================
// DATE UTILITIES
// ========================================

export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function diffDays(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return Math.round((d2 - d1) / 86400000);
}

export function isToday(date) {
  const today = new Date();
  const d = new Date(date);
  return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
}

export function isPast(date) {
  return new Date(date) < new Date();
}

export function isFuture(date) {
  return new Date(date) > new Date();
}

// ========================================
// INITIALIZE APP
// ========================================

const app = new TripzyApp();

// Wait for DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}

// Export for debugging
window.Tripzy = app;
export default app;