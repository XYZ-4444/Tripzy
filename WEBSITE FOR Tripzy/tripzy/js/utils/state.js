/**
 * Tripzy - State Management
 * Lightweight reactive state manager with subscriptions
 */

export class StateManager {
  constructor(initialState = {}) {
    this.state = { ...initialState };
    this.subscribers = new Map();
    this.history = [];
    this.maxHistory = 50;
  }

  get(key) {
    const keys = key.split('.');
    let value = this.state;
    for (const k of keys) {
      if (value === null || value === undefined) return undefined;
      value = value[k];
    }
    return value;
  }

  set(key, value) {
    const keys = key.split('.');
    const oldValue = this.get(key);

    if (keys.length === 1) {
      this.state[key] = value;
    } else {
      let obj = this.state;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in obj)) obj[keys[i]] = {};
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
    }

    // Record history for debugging
    this.history.push({ key, oldValue, newValue: value, timestamp: Date.now() });
    if (this.history.length > this.maxHistory) this.history.shift();

    this.notify(key, value, oldValue);
    return value;
  }

  update(key, updater) {
    const current = this.get(key);
    const next = typeof updater === 'function' ? updater(current) : updater;
    return this.set(key, next);
  }

  subscribe(key, callback) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key).add(callback);

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(key);
      if (subs) subs.delete(callback);
    };
  }

  notify(key, newValue, oldValue) {
    const subs = this.subscribers.get(key);
    if (subs) {
      subs.forEach(cb => {
        try {
          cb(newValue, oldValue, key);
        } catch (e) {
          console.error('State subscriber error:', e);
        }
      });
    }

    // Also notify wildcard subscribers
    const wildSubs = this.subscribers.get('*');
    if (wildSubs) {
      wildSubs.forEach(cb => {
        try {
          cb(key, newValue, oldValue);
        } catch (e) {
          console.error('Wildcard subscriber error:', e);
        }
      });
    }
  }

  getAll() {
    return { ...this.state };
  }

  reset() {
    this.state = {};
    this.subscribers.clear();
    this.history = [];
  }
}

// Derived state helper
export function derived(stateManager, keys, computeFn) {
  const unsubs = [];
  let currentValue = computeFn(...keys.map(k => stateManager.get(k)));

  const notify = () => {
    const newValue = computeFn(...keys.map(k => stateManager.get(k)));
    if (newValue !== currentValue) {
      const oldValue = currentValue;
      currentValue = newValue;
      // Notify via a pseudo-key
      stateManager.notify(`derived:${keys.join(',')}`, newValue, oldValue);
    }
  };

  keys.forEach(key => {
    unsubs.push(stateManager.subscribe(key, notify));
  });

  return {
    get: () => currentValue,
    subscribe: (callback) => stateManager.subscribe(`derived:${keys.join(',')}`, callback),
    destroy: () => unsubs.forEach(unsub => unsub()),
  };
}