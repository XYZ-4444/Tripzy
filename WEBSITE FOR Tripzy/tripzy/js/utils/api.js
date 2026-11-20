/**
 * Tripzy - API Client
 * Fetch wrapper with auth, offline queue, retries, and error handling
 */

const API_BASE = '/api';
const OFFLINE_QUEUE_KEY = 'tripzy_offline_queue';

export class API {
  constructor(options = {}) {
    this.baseURL = options.baseURL || API_BASE;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    this.token = localStorage.getItem('tripzy_token');
    this.offlineQueue = this.loadOfflineQueue();
    this.listeners = new Set();
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('tripzy_token', token);
    } else {
      localStorage.removeItem('tripzy_token');
    }
  }

  getHeaders() {
    const headers = { ...this.defaultHeaders };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(method, endpoint, data = null, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method: method.toUpperCase(),
      headers: this.getHeaders(),
      ...options,
    };

    if (data && !(data instanceof FormData)) {
      config.body = JSON.stringify(data);
    } else if (data instanceof FormData) {
      // Don't set Content-Type for FormData - browser sets it with boundary
      delete config.headers['Content-Type'];
      config.body = data;
    }

    // Handle offline
    if (!navigator.onLine) {
      return this.queueOffline(method, endpoint, data, options);
    }

    let lastError;
    const maxRetries = options.retries ?? 3;
    const retryDelay = options.retryDelay ?? 1000;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, config);

        // Handle auth errors
        if (response.status === 401) {
          this.handleUnauthorized();
          throw new Error('Session expired. Please sign in again.');
        }

        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : retryDelay * Math.pow(2, attempt);
          await this.sleep(delay);
          continue;
        }

        // Parse response
        let responseData;
        const contentType = response.headers.get('Content-Type');
        if (contentType?.includes('application/json')) {
          responseData = await response.json();
        } else {
          responseData = await response.text();
        }

        if (!response.ok) {
          throw new APIError(response.status, responseData.message || 'Request failed', responseData);
        }

        return responseData;
      } catch (error) {
        lastError = error;

        // Don't retry on client errors (4xx except 429)
        if (error instanceof APIError && error.status >= 400 && error.status < 500 && error.status !== 429) {
          throw error;
        }

        // Don't retry on last attempt
        if (attempt === maxRetries) break;

        // Wait before retry
        await this.sleep(retryDelay * Math.pow(2, attempt));
      }
    }

    throw lastError;
  }

  get(endpoint, options) {
    return this.request('GET', endpoint, null, options);
  }

  post(endpoint, data, options) {
    return this.request('POST', endpoint, data, options);
  }

  put(endpoint, data, options) {
    return this.request('PUT', endpoint, data, options);
  }

  patch(endpoint, data, options) {
    return this.request('PATCH', endpoint, data, options);
  }

  delete(endpoint, options) {
    return this.request('DELETE', endpoint, null, options);
  }

  // File upload with progress
  async upload(endpoint, file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${this.baseURL}${endpoint}`);
      xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);

      xhr.upload.addEventListener('progress', e => {
        if (e.lengthComputable && onProgress) {
          onProgress(e.loaded / e.total);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            resolve(xhr.responseText);
          }
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject(new APIError(xhr.status, err.message || 'Upload failed', err));
          } catch {
            reject(new APIError(xhr.status, 'Upload failed'));
          }
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Network error')));
      xhr.send(formData);
    });
  }

  // Offline queue management
  loadOfflineQueue() {
    try {
      return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  saveOfflineQueue() {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(this.offlineQueue));
  }

  queueOffline(method, endpoint, data, options) {
    const request = {
      id: Date.now() + Math.random(),
      method,
      endpoint,
      data,
      options,
      timestamp: Date.now(),
    };

    this.offlineQueue.push(request);
    this.saveOfflineQueue();
    this.notifyOfflineChange();

    // Return a mock response
    return Promise.resolve({
      offline: true,
      queued: true,
      id: request.id,
    });
  }

  async flushOfflineQueue() {
    if (!navigator.onLine || this.offlineQueue.length === 0) return;

    const queue = [...this.offlineQueue];
    const failed = [];

    for (const request of queue) {
      try {
        await this.request(request.method, request.endpoint, request.data, request.options);
        this.removeFromQueue(request.id);
      } catch (error) {
        failed.push(request);
        console.error('Offline request failed:', error);
      }
    }

    if (failed.length > 0) {
      this.offlineQueue = failed;
      this.saveOfflineQueue();
    }

    this.notifyOfflineChange();
  }

  removeFromQueue(id) {
    this.offlineQueue = this.offlineQueue.filter(r => r.id !== id);
    this.saveOfflineQueue();
    this.notifyOfflineChange();
  }

  getOfflineQueue() {
    return [...this.offlineQueue];
  }

  notifyOfflineChange() {
    this.listeners.forEach(cb => cb(this.offlineQueue.length));
  }

  onOfflineChange(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  handleUnauthorized() {
    this.setToken(null);
    // Dispatch event for app to handle
    window.dispatchEvent(new CustomEvent('tripzy:unauthorized'));
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export class APIError extends Error {
  constructor(status, message, data = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

// Mock API for development/offline
export const mockAPI = {
  async get(endpoint) {
    await new Promise(r => setTimeout(r, 300));
    return mockData[endpoint] || { data: [] };
  },

  async post(endpoint, data) {
    await new Promise(r => setTimeout(r, 500));
    return { success: true, id: Date.now(), ...data };
  },

  async put(endpoint, data) {
    await new Promise(r => setTimeout(r, 300));
    return { success: true, ...data };
  },

  async delete(endpoint) {
    await new Promise(r => setTimeout(r, 200));
    return { success: true };
  },
};

// Mock data for offline/demo
const mockData = {
  '/destinations': {
    data: [
      { id: 1, name: 'Goa', image: '/images/goa.jpg', type: 'beach', rating: 4.5, price: 15000 },
      { id: 2, name: 'Manali', image: '/images/manali.jpg', type: 'mountain', rating: 4.7, price: 18000 },
      { id: 3, name: 'Jaipur', image: '/images/jaipur.jpg', type: 'heritage', rating: 4.6, price: 12000 },
      { id: 4, name: 'Kerala', image: '/images/kerala.jpg', type: 'backwater', rating: 4.8, price: 22000 },
      { id: 5, name: 'Rishikesh', image: '/images/rishikesh.jpg', type: 'adventure', rating: 4.4, price: 10000 },
      { id: 6, name: 'Andaman', image: '/images/andaman.jpg', type: 'island', rating: 4.9, price: 35000 },
    ],
  },
  '/trips': {
    data: [
      { id: 1, title: 'Goa Beach Getaway', destination: 'Goa', startDate: '2026-10-15', endDate: '2026-10-20', status: 'upcoming', budget: 25000 },
      { id: 2, title: 'Himalayan Trek', destination: 'Manali', startDate: '2026-11-01', endDate: '2026-11-07', status: 'planned', budget: 35000 },
    ],
  },
  '/vendors': {
    data: [
      { id: 1, name: 'Goa Beach Resorts', type: 'hotel', rating: 4.5, verified: true, location: 'Goa' },
      { id: 2, name: 'Mountain Adventures', type: 'activity', rating: 4.7, verified: true, location: 'Manali' },
      { id: 3, name: 'Heritage Tours India', type: 'tour', rating: 4.6, verified: true, location: 'Jaipur' },
    ],
  },
  '/reviews': {
    data: [
      { id: 1, user: 'Priya S.', rating: 5, text: 'Amazing experience!', date: '2026-09-10', vendorId: 1 },
      { id: 2, user: 'Rahul K.', rating: 4, text: 'Great service, would recommend.', date: '2026-09-08', vendorId: 1 },
    ],
  },
};