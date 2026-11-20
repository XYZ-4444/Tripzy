/**
 * Tripzy - Client-side Router
 * SIH 2026 PS 26204 - AI-Powered Smart Tourism Platform
 */

export class Router {
  constructor() {
    this.routes = new Map();
    this.notFoundHandler = null;
    this.beforeHooks = [];
    this.afterHooks = [];
    this.currentRoute = null;
    this.isStarted = false;
  }

  addRoute(path, handler) {
    const route = this.parseRoute(path);
    this.routes.set(route.pattern, { handler, route });
    return this;
  }

  parseRoute(path) {
    const paramNames = [];
    const pattern = path
      .replace(/:([^/]+)/g, (_, name) => {
        paramNames.push(name);
        return '([^/]+)';
      })
      .replace(/\*/g, '(.*)');
    
    return {
      original: path,
      pattern: new RegExp(`^${pattern}$`),
      paramNames,
    };
  }

  removeRoute(path) {
    const route = this.parseRoute(path);
    this.routes.delete(route.pattern);
    return this;
  }

  beforeEach(hook) {
    this.beforeHooks.push(hook);
    return this;
  }

  afterEach(hook) {
    this.afterHooks.push(hook);
    return this;
  }

  notFound(handler) {
    this.notFoundHandler = handler;
    return this;
  }

  async navigate(path, options = {}) {
    const { replace = false, state = null } = options;
    
    // Run before hooks
    for (const hook of this.beforeHooks) {
      const result = await hook(path, this.currentRoute);
      if (result === false) return false;
      if (typeof result === 'string') {
        return this.navigate(result, { replace, state });
      }
    }

    // Find matching route
    const match = this.match(path);
    
    if (match) {
      this.currentRoute = { path, params: match.params, query: this.parseQuery(path) };
      
      // Update browser history
      if (replace) {
        history.replaceState(state, '', path);
      } else {
        history.pushState(state, '', path);
      }
      
      // Call handler
      await match.route.handler(match.params, this.currentRoute);
      
      // Run after hooks
      for (const hook of this.afterHooks) {
        await hook(this.currentRoute);
      }
      
      return true;
    }
    
    // Handle 404
    if (this.notFoundHandler) {
      await this.notFoundHandler(path);
    } else {
      console.warn(`No route found for: ${path}`);
    }
    
    return false;
  }

  match(path) {
    // Strip query string for matching
    const pathOnly = path.split('?')[0];
    
    for (const [pattern, { handler, route }] of this.routes) {
      const match = pathOnly.match(pattern);
      if (match) {
        const params = {};
        route.paramNames.forEach((name, index) => {
          params[name] = decodeURIComponent(match[index + 1]);
        });
        return { route: { handler, route }, params };
      }
    }
    
    return null;
  }

  parseQuery(path) {
    const queryString = path.split('?')[1] || '';
    const params = new URLSearchParams(queryString);
    const result = {};
    for (const [key, value] of params) {
      result[key] = value;
    }
    return result;
  }

  start() {
    if (this.isStarted) return;
    
    // Handle popstate (browser back/forward)
    window.addEventListener('popstate', () => {
      this.navigate(window.location.pathname + window.location.search, { replace: true });
    });
    
    // Handle link clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      
      const href = link.getAttribute('href');
      if (!href) return;
      
      // Skip external links, anchors, mailto, tel, etc.
      if (
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#') ||
        link.hasAttribute('target') ||
        link.hasAttribute('download')
      ) return;
      
      e.preventDefault();
      this.navigate(href);
    });
    
    this.isStarted = true;
  }

  stop() {
    this.isStarted = false;
  }

  getCurrentRoute() {
    return this.currentRoute;
  }

  getCurrentPath() {
    return this.currentRoute?.path || window.location.pathname;
  }

  buildUrl(routeName, params = {}, query = {}) {
    const route = Array.from(this.routes.values()).find(r => r.route.original === routeName);
    if (!route) return '';
    
    let url = route.route.original;
    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`:${key}`, encodeURIComponent(value));
    }
    
    const queryString = new URLSearchParams(query).toString();
    if (queryString) url += `?${queryString}`;
    
    return url;
  }
}

// Create singleton instance
export const router = new Router();