/**
 * Tripzy - Auth Page Module
 * Login and signup forms
 */

import { api } from '../utils/api.js';

export async function initAuth(container, { state, api, toast }) {
  // Determine if we're in login or signup mode based on route
  const path = window.location.pathname || window.location.hash.replace('#', '');
  const isLogin = path.includes('login') || !path.includes('signup');
  
  // Render page
  container.innerHTML = renderAuth(isLogin);
  container.hidden = false;
  
  // Initialize components
  initAuthForm(isLogin);
  
  // Return cleanup function
  return () => {
    // Cleanup if needed
  };
}

function renderAuth(isLogin) {
  return `
    <div class="page-content">
      <!-- Auth Header -->
      <section class="auth-header" aria-labelledby="auth-title">
        <div class="container">
          <div class="auth-header__content">
            <h1 id="auth-title" class="auth-header__title">
              ${isLogin ? 'Sign In to Tripzy' : 'Create Your Tripzy Account'}
            </h1>
            <p class="auth-header__subtitle text-secondary">
              ${isLogin ? 'Access your trips, preferences, and saved itineraries' : 'Join thousands of travelers planning their perfect adventures'}
            </p>
            <p class="auth-header__toggle text-sm mt-4" id="auth-toggle">
              ${isLogin ? "Don't have an account? <a href='#signup' data-page='signup'>Sign up</a>" : "Already have an account? <a href='#login' data-page='login'>Sign in</a>"}
            </p>
          </div>
        </div>
      </section>

      <!-- Auth Form -->
      <section class="auth-form-section" aria-labelledby="form-title">
        <div class="container">
          <div class="auth-form-card card" id="auth-form-card">
            <h2 id="form-title" class="auth-form__title">${isLogin ? 'Sign In' : 'Create Account'}</h2>
            <form class="auth-form" id="auth-form" role="form" aria-labelledby="form-title" ${isLogin ? '' : 'novalidate'}>
              ${isLogin ? renderLoginForm() : renderSignupForm()}
              
              <div class="auth-form__actions mt-6">
                <button type="submit" class="btn btn--primary btn--lg" id="auth-submit-btn">
                  <span class="spinner spinner--sm" id="auth-spinner" hidden></span>
                  <span id="auth-btn-text">${isLogin ? 'Sign In' : 'Create Account'}</span>
                </button>
                ${isLogin ? `
                  <button type="button" class="btn btn--outline btn--lg ml-4" id="auth-forgot-btn">
                    Forgot Password?
                  </button>
                ` : ''}
              </div>
              
              <p class="auth-form__footer text-sm text-center mt-6">
                ${isLogin ? '' : 'By creating an account, you agree to our '}
                <a href="#" class="text-primary">Terms of Service</a>
                ${isLogin ? '' : ' and '}
                <a href="#" class="text-primary">Privacy Policy</a>
                ${isLogin ? '' : '.'}
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderLoginForm() {
  return `
    <div class="auth-form__group grid gap-4" style="grid-template-columns: 1fr;">
      <div class="form-group">
        <label for="login-email" class="form-label">Email Address</label>
        <input
          type="email"
          id="login-email"
          class="form-input auth-input"
          placeholder="Enter your email"
          required
          aria-describedby="email-help"
        >
        <span id="email-help" class="form-hint">We'll use this to sign you in</span>
      </div>
      
      <div class="form-group">
        <label for="login-password" class="form-label">Password</label>
        <div class="relative">
          <input
            type="password"
            id="login-password"
            class="form-input auth-input"
            placeholder="Enter your password"
            required
            aria-describedby="password-help"
          >
          <button type="button" class="auth-form__toggle-password" id="toggle-login-password" aria-label="Show password">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="toggle-icon">
              <path d="M12 4.5v2.25m8.955-3.555a2.25 2.25 0 0 1-1.41 1.41l-2.25 2.25M12 15l-3 3m0 0-3-3m3 3V4.5m11.25 0a9 9 0 1 0-18 0 9 9 0 0 0 18 0z"/>
            </svg>
          </button>
        </div>
        <span id="password-help" class="form-hint">At least 8 characters</span>
      </div>
      
      <div class="form-group full-width">
        <label class="flex items-center gap-2">
          <input type="checkbox" id="login-remember" class="auth-checkbox">
          <span>Remember me</span>
        </label>
      </div>
    </div>
  `;
}

function renderSignupForm() {
  return `
    <div class="auth-form__group grid gap-4" style="grid-template-columns: 1fr;">
      <div class="form-group">
        <label for="signup-name" class="form-label">Full Name</label>
        <input
          type="text"
          id="signup-name"
          class="form-input auth-input"
          placeholder="Enter your full name"
          required
          aria-describedby="name-help"
        >
        <span id="name-help" class="form-hint">This will be shown on your profile</span>
      </div>
      
      <div class="form-group">
        <label for="signup-email" class="form-label">Email Address</label>
        <input
          type="email"
          id="signup-email"
          class="form-input auth-input"
          placeholder="Enter your email"
          required
          aria-describedby="signup-email-help"
        >
        <span id="signup-email-help" class="form-hint">We'll use this to verify your account</span>
      </div>
      
      <div class="form-group">
        <label for="signup-password" class="form-label">Password</label>
        <div class="relative">
          <input
            type="password"
            id="signup-password"
            class="form-input auth-input"
            placeholder="Create a password"
            required
            aria-describedby="signup-password-help"
            minlength="8"
          >
          <button type="button" class="auth-form__toggle-password" id="toggle-signup-password" aria-label="Show password">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="toggle-icon">
              <path d="M12 4.5v2.25m8.955-3.555a2.25 2.25 0 0 1-1.41 1.41l-2.25 2.25M12 15l-3 3m0 0-3-3m3 3V4.5m11.25 0a9 9 0 1 0-18 0 9 9 0 0 0 18 0z"/>
            </svg>
          </button>
        </div>
        <div id="password-strength" class="password-strength mt-2" aria-live="polite"></div>
        <span id="signup-password-help" class="form-hint text-xs">Use at least 8 characters</span>
      </div>
      
      <div class="form-group">
        <label for="signup-phone" class="form-label">Phone Number (Optional)</label>
        <input
          type="tel"
          id="signup-phone"
          class="form-input auth-input"
          placeholder="+91 XXXXXXXXXX"
          aria-describedby="phone-help"
        >
        <span id="phone-help" class="form-hint">For SMS verification and trip updates</span>
      </div>
    </div>
  `;
}

function initAuthForm(isLogin) {
  const form = document.getElementById('auth-form');
  const submitBtn = document.getElementById('auth-submit-btn');
  const spinner = document.getElementById('auth-spinner');
  const btnText = document.getElementById('auth-btn-text');
  const toggleBtn = document.getElementById(`toggle-${isLogin ? 'login' : 'signup'}-password`);
  const forgotBtn = document.getElementById('auth-forgot-btn');
  const toggleLink = document.getElementById('auth-toggle');
  
  // Password toggle
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const passwordInput = document.getElementById(`${isLogin ? 'login' : 'signup'}-password`);
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      toggleBtn.classList.toggle('btn--outline');
      toggleBtn.classList.toggle('btn--ghost');
      
      // Update icon
      const icon = toggleBtn.querySelector('.toggle-icon');
      if (isPassword) {
        icon.innerHTML = '<path d="M12 4.5v2.25M4.5 12h15M10.5 8l3 3m-3 0 3-3M10.5 16l3-3m-3 0 3 3"/>';
      } else {
        icon.innerHTML = '<path d="M12 4.5v2.25m8.955-3.555a2.25 2.25 0 0 1-1.41 1.41l-2.25 2.25M12 15l-3 3m0 0-3-3m3 3V4.5m11.25 0a9 9 0 1 0-18 0 9 9 0 0 0 18 0z"/>';
      }
    });
  }
  
  // Password strength indicator (for signup)
  if (!isLogin) {
    const passwordInput = document.getElementById('signup-password');
    const strengthIndicator = document.getElementById('password-strength');
    
    if (passwordInput && strengthIndicator) {
      passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const strength = calculatePasswordStrength(password);
        strengthIndicator.textContent = strength.text;
        strengthIndicator.style.color = strength.color;
      });
    }
  }
  
  // Forgot password (basic implementation)
  if (forgotBtn) {
    forgotBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      if (!email) {
        toast.warning('Please enter your email', 'We need your email to send a reset link');
        return;
      }
      
      // In a real app, we'd call an API to send reset link
      toast.info('Reset link sent', `We've sent a password reset link to ${email} (demo)`);
    });
  }
  
  // Toggle between login/signup
  if (toggleLink) {
    toggleLink.addEventListener('click', (e) => {
      e.preventDefault();
      const link = toggleLink.querySelector('a');
      if (link) {
        window.location.hash = link.getAttribute('href');
      }
    });
  }
  
  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!form.checkValidity() && !isLogin) {
      form.reportValidity();
      return;
    }
    
    // Show loading
    submitBtn.disabled = true;
    spinner.hidden = false;
    btnText.textContent = isLogin ? 'Signing in...' : 'Creating account...';
    
    try {
      if (isLogin) {
        // Login
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock successful login
        const mockUser = {
          id: 1,
          name: 'Demo User',
          email: email,
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face'
        };
        const mockToken = 'demo-jwt-token-' + Date.now();
        
        // Save token and user
        localStorage.setItem('tripzy_token', mockToken);
        state.set('user', mockUser);
        
        // Update auth UI in app.js
        window.dispatchEvent(new CustomEvent('tripzy:login', { detail: { user: mockUser } }));
        
        toast.success('Welcome back!', `Hello, ${mockUser.name}!`);
        
        // Redirect to intended page or dashboard
        const returnUrl = new URLSearchParams(window.location.search).get('return') || '#dashboard';
        window.location.hash = returnUrl;
      } else {
        // Signup
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const phone = document.getElementById('signup-phone').value || undefined;
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock successful signup
        const mockUser = {
          id: Date.now(),
          name,
          email,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
        };
        const mockToken = 'demo-jwt-token-' + Date.now();
        
        // Save token and user
        localStorage.setItem('tripzy_token', mockToken);
        state.set('user', mockUser);
        
        // Update auth UI in app.js
        window.dispatchEvent(new CustomEvent('tripzy:login', { detail: { user: mockUser } }));
        
        toast.success('Account created!', `Welcome to Tripzy, ${name}!`);
        
        // Redirect to planner to start planning
        window.location.hash = '#planner';
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Authentication failed', 'Please check your credentials and try again');
    } finally {
      // Hide loading
      submitBtn.disabled = false;
      spinner.hidden = true;
      btnText.textContent = isLogin ? 'Sign In' : 'Create Account';
    }
  });
}

function calculatePasswordStrength(password) {
  let score = 0;
  
  // Length
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  
  // Letters
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  
  // Numbers
  if (/\d/.test(password)) score++;
  
  // Special characters
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
  
  // Determine strength
  let text = 'Very Weak';
  let color = '#ef4444'; // red
  
  if (score >= 4) {
    text = 'Strong';
    color = '#10b981'; // green
  } else if (score >= 3) {
    text = 'Medium';
    color = '#f59e0b'; // yellow
  } else if (score >= 2) {
    text = 'Weak';
    color = '#ef4444'; // red
  }
  
  return { text, color };
}