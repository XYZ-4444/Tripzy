/**
 * Tripzy - Toast Notification System
 * Accessible, animated notifications with auto-dismiss
 */

export class Toast {
  constructor(container) {
    this.container = container;
    this.toasts = new Map();
    this.idCounter = 0;
  }

  show(options) {
    const {
      type = 'info',
      title,
      message,
      duration = 5000,
      action,
      persistent = false,
    } = options;

    const id = ++this.idCounter;
    const toastEl = this.createToast(id, type, title, message, action);

    this.container.appendChild(toastEl);
    this.toasts.set(id, { element: toastEl, timeout: null });

    // Trigger animation
    requestAnimationFrame(() => {
      toastEl.style.animation = 'toast-in var(--transition-spring)';
    });

    // Auto-dismiss
    if (!persistent && duration > 0) {
      const timeout = setTimeout(() => this.dismiss(id), duration);
      this.toasts.get(id).timeout = timeout;
    }

    // Pause on hover
    toastEl.addEventListener('mouseenter', () => {
      if (this.toasts.has(id)) {
        clearTimeout(this.toasts.get(id).timeout);
      }
    });

    toastEl.addEventListener('mouseleave', () => {
      if (this.toasts.has(id) && !persistent) {
        const timeout = setTimeout(() => this.dismiss(id), duration);
        this.toasts.get(id).timeout = timeout;
      }
    });

    return id;
  }

  createToast(id, type, title, message, action) {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    toast.dataset.toastId = id;

    const icons = {
      info: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
      success: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
      error: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
      warning: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    };

    let actionHtml = '';
    if (action) {
      actionHtml = `
        <button class="toast__action btn btn--sm btn--${type}" data-toast-action="${id}">
          ${action.label}
        </button>
      `;
    }

    toast.innerHTML = `
      <div class="toast__icon" aria-hidden="true">${icons[type] || icons.info}</div>
      <div class="toast__content">
        ${title ? `<div class="toast__title">${this.escapeHtml(title)}</div>` : ''}
        ${message ? `<div class="toast__message">${this.escapeHtml(message)}</div>` : ''}
      </div>
      <button class="toast__close" aria-label="Dismiss notification" data-toast-close="${id}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      ${actionHtml}
    `;

    // Event listeners
    toast.querySelector('[data-toast-close]').addEventListener('click', () => this.dismiss(id));
    if (action) {
      toast.querySelector('[data-toast-action]').addEventListener('click', () => {
        action.onClick();
        this.dismiss(id);
      });
    }

    return toast;
  }

  dismiss(id) {
    const toastData = this.toasts.get(id);
    if (!toastData) return;

    clearTimeout(toastData.timeout);
    const toastEl = toastData.element;

    toastEl.classList.add('toast--exiting');
    toastEl.addEventListener('animationend', () => {
      toastEl.remove();
      this.toasts.delete(id);
    }, { once: true });
  }

  dismissAll() {
    this.toasts.forEach((_, id) => this.dismiss(id));
  }

  info(title, message, options = {}) {
    return this.show({ type: 'info', title, message, ...options });
  }

  success(title, message, options = {}) {
    return this.show({ type: 'success', title, message, ...options });
  }

  error(title, message, options = {}) {
    return this.show({ type: 'error', title, message, duration: 8000, ...options });
  }

  warning(title, message, options = {}) {
    return this.show({ type: 'warning', title, message, ...options });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}