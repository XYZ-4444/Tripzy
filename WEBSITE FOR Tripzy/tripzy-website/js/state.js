/**
 * Tripzy - State Management
 * SIH 2026 PS 26204 - AI-Powered Smart Tourism Platform
 */

export class StateManager {
  constructor() {
    this.state = new Map();
    this.listeners = new Map();
    this.persistenceKeys = new Set(['user', 'authToken', 'preferences', 'cart', 'recentSearches']);
    
    // Load persisted state
    this.loadPersistedState();
  }

  loadPersistedState() {
    for (const key of this.persistenceKeys) {
      const value = localStorage.getItem(`tripzy:${key}`);
      if (value) {
        try {
          this.state.set(key, JSON.parse(value));
        } catch {
          localStorage.removeItem(`tripzy:${key}`);
        }
      }
    }
  }

  persist(key) {
    if (this.persistenceKeys.has(key)) {
      const value = this.state.get(key);
      if (value !== undefined) {
        localStorage.setItem(`tripzy:${key}`, JSON.stringify(value));
      } else {
        localStorage.removeItem(`tripzy:${key}`);
      }
    }
  }

  get(key, defaultValue = undefined) {
    const keys = key.split('.');
    let value = this.state;
    
    for (const k of keys) {
      if (value instanceof Map) {
        value = value.get(k);
      } else if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return defaultValue;
      }
      
      if (value === undefined) return defaultValue;
    }
    
    return value;
  }

  set(key, value) {
    const keys = key.split('.');
    const lastKey = keys.pop();
    
    let target = this.state;
    for (const k of keys) {
      if (!target.has(k) || !(target.get(k) instanceof Map)) {
        target.set(k, new Map());
      }
      target = target.get(k);
    }
    
    const oldValue = target.get(lastKey);
    target.set(lastKey, value);
    
    // Persist if needed
    if (keys.length === 0) {
      this.persist(lastKey);
    }
    
    // Notify listeners
    this.notify(key, value, oldValue);
    
    return value;
  }

  update(key, updater) {
    const current = this.get(key);
    const newValue = typeof updater === 'function' ? updater(current) : updater;
    return this.set(key, newValue);
  }

  delete(key) {
    const keys = key.split('.');
    const lastKey = keys.pop();
    
    let target = this.state;
    for (const k of keys) {
      target = target.get(k);
      if (!target) return false;
    }
    
    const hadKey = target.has(lastKey);
    if (hadKey) {
      const oldValue = target.get(lastKey);
      target.delete(lastKey);
      this.persist(lastKey);
      this.notify(key, undefined, oldValue);
    }
    
    return hadKey;
  }

  has(key) {
    const keys = key.split('.');
    let target = this.state;
    
    for (const k of keys) {
      if (target instanceof Map) {
        if (!target.has(k)) return false;
        target = target.get(k);
      } else if (target && typeof target === 'object') {
        if (!(k in target)) return false;
        target = target[k];
      } else {
        return false;
      }
    }
    
    return true;
  }

  subscribe(key, listener) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(listener);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(key);
      if (listeners) listeners.delete(listener);
    };
  }

  notify(key, newValue, oldValue) {
    // Notify exact key listeners
    const exactListeners = this.listeners.get(key);
    if (exactListeners) {
      exactListeners.forEach(listener => listener(newValue, oldValue, key));
    }
    
    // Notify parent key listeners (for nested paths)
    const keyParts = key.split('.');
    for (let i = keyParts.length - 1; i > 0; i--) {
      const parentKey = keyParts.slice(0, i).join('.');
      const parentListeners = this.listeners.get(parentKey);
      if (parentListeners) {
        const parentValue = this.get(parentKey);
        parentListeners.forEach(listener => listener(parentValue, oldValue, parentKey));
      }
    }
    
    // Notify wildcard listeners
    const wildcardListeners = this.listeners.get('*');
    if (wildcardListeners) {
      wildcardListeners.forEach(listener => listener(newValue, oldValue, key));
    }
  }

  // Computed values
  computed(key, computeFn, dependencies = []) {
    const compute = () => {
      const depValues = dependencies.map(dep => this.get(dep));
      return computeFn(...depValues);
    };
    
    // Initial computation
    this.set(key, compute());
    
    // Subscribe to dependencies
    const unsubscribes = dependencies.map(dep => 
      this.subscribe(dep, () => this.set(key, compute()))
    );
    
    return () => unsubscribes.forEach(unsub => unsub());
  }

  // Batch updates
  batch(updates) {
    const changes = [];
    
    for (const [key, value] of Object.entries(updates)) {
      const oldValue = this.get(key);
      const keys = key.split('.');
      const lastKey = keys.pop();
      
      let target = this.state;
      for (const k of keys) {
        if (!target.has(k) || !(target.get(k) instanceof Map)) {
          target.set(k, new Map());
        }
        target = target.get(k);
      }
      
      target.set(lastKey, value);
      changes.push({ key, newValue: value, oldValue });
      
      if (keys.length === 0) {
        this.persist(lastKey);
      }
    }
    
    // Notify all changes
    for (const { key, newValue, oldValue } of changes) {
      this.notify(key, newValue, oldValue);
    }
  }

  // Reset state
  reset(keys = null) {
    if (keys === null) {
      // Clear all except persistence keys
      for (const key of this.state.keys()) {
        if (!this.persistenceKeys.has(key)) {
          this.state.delete(key);
        }
      }
    } else {
      const keyArray = Array.isArray(keys) ? keys : [keys];
      for (const key of keyArray) {
        this.delete(key);
      }
    }
  }

  // Get all state (for debugging)
  toJSON() {
    const result = {};
    for (const [key, value] of this.state) {
      result[key] = this.mapToObject(value);
    }
    return result;
  }

  mapToObject(map) {
    if (!(map instanceof Map)) return map;
    const obj = {};
    for (const [key, value] of map) {
      obj[key] = this.mapToObject(value);
    }
    return obj;
  }
}

// Create singleton instance
export const state = new StateManager();

// Predefined state keys
export const StateKeys = {
  USER: 'user',
  AUTH_TOKEN: 'authToken',
  PREFERENCES: 'preferences',
  CART: 'cart',
  RECENT_SEARCHES: 'recentSearches',
  DESTINATIONS: 'destinations',
  HOTELS: 'hotels',
  GUIDES: 'guides',
  ITINERARY: 'itinerary',
  BOOKINGS: 'bookings',
  NOTIFICATIONS: 'notifications',
  LOADING: 'loading',
  ERROR: 'error',
};