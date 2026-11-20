/**
 * Tripzy - Trust Hub Page Module
 * Trust and safety information, verification stats, and policies
 */

import { api } from '../utils/api.js';

export async function initTrust(container, { state, api, toast }) {
  // Load trust stats
  let trustStats = {};
  try {
    const res = await fetch('/data/trust_stats.json');
    trustStats = await res.json();
  } catch (e) {
    console.error('Failed to load trust stats:', e);
    // Use fallback stats
    trustStats = {
      stats: {
        totalUsers: 50000,
        totalTripsBooked: 100000,
        totalVendorsVerified: 2000,
        averageRating: 4.7,
        responseRate: 95,
        responseTime: "under 2 hours"
      },
      badges: [],
      policies: [],
      security: {}
    };
  }

  // Render page
  container.innerHTML = renderTrust(trustStats);
  container.hidden = false;

  // Initialize components
  initTrustStats();
  initTrustBadges();
  initTrustPolicies();
  initTrustSecurity();

  // Return cleanup function
  return () => {
    // Cleanup if needed
  };
}

function renderTrust(stats) {
  return `
    <div class="page-content">
      <!-- Trust Header -->
      <section class="trust-header" aria-labelledby="trust-title">
        <div class="container">
          <div class="trust-header__content flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 id="trust-title" class="trust-header__title">
                Trust & Safety
              </h1>
              <p class="trust-header__subtitle text-secondary">
                Your safety is our priority. Learn how we ensure secure, reliable, and trustworthy travel experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Trust Stats -->
      <section class="trust-stats-section" aria-labelledby="stats-title">
        <div class="container">
          <h2 id="stats-title" class="section__title">Our Commitment in Numbers</h2>
          <div class="stats-grid grid gap-6" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));" id="trust-stats-grid">
            <!-- Stats will be populated by JS -->
          </div>
        </div>
      </section>

      <!-- Trust Badges -->
      <section class="trust-badges-section" aria-labelledby="badges-title">
        <div class="container">
          <header class="trust-badges__header flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 id="badges-title" class="section__title">Trust Badges & Verifications</h2>
              <p class="section__subtitle text-secondary">How we verify and recognize quality vendors</p>
            </div>
          </header>
          <div class="trust-badges-grid grid gap-6" style="grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));" id="trust-badges-grid">
            <!-- Badges will be populated by JS -->
          </div>
        </div>
      </section>

      <!-- Trust Policies -->
      <section class="trust-policies-section" aria-labelledby="policies-title">
        <div class="container">
          <h2 id="policies-title" class="section__title">Our Policies & Guarantees</h2>
          <div class="trust-policies-grid grid gap-6" style="grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));" id="trust-policies-grid">
            <!-- Policies will be populated by JS -->
          </div>
        </div>
      </section>

      <!-- Trust Security -->
      <section class="trust-security-section" aria-labelledby="security-title">
        <div class="container">
          <div class="trust-security-card card p-6" id="trust-security-card">
            <h2 id="security-title" class="trust-security__title">Security & Privacy</h2>
            <p class="trust-security__subtitle text-secondary mb-6">How we protect your data and transactions</p>
            <div class="trust-security__content grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));" id="trust-security-grid">
              <!-- Security items will be populated by JS -->
            </div>
          </div>
        </div>
      </section>

      <!-- Trust CTA -->
      <section class="trust-cta-section" aria-labelledby="cta-title">
        <div class="container">
          <div class="trust-cta-card card text-center py-12" style="background: linear-gradient(135deg, var(--color-primary-50), var(--color-primary-100)); border: none;">
            <h2 id="cta-title" class="trust-cta__title">Travel with Confidence</h2>
            <p class="trust-cta__text text-secondary max-w-xl mx-auto">
              Join thousands of travelers who trust Tripzy for safe, memorable, and hassle-free adventures across India.
            </p>
            <div class="trust-cta__actions flex flex-col md:flex-row md:items-center md:justify-center gap-4 mt-8">
              <a href="#planner" data-page="planner" class="btn btn--primary btn--lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
                Start Planning
              </a>
              <a href="#vendors" data-page="vendors" class="btn btn--outline btn--lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Browse Vendors
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

function initTrustStats() {
  const statsGrid = document.getElementById('trust-stats-grid');
  if (!statsGrid) return;
  
  const stats = [
    {
      label: 'Travelers Served',
      value: stats.stats.totalUsers?.toLocaleString() || '50K+',
      icon: 'users',
      color: 'var(--color-primary-600)'
    },
    {
      label: 'Trips Booked',
      value: stats.stats.totalTripsBooked?.toLocaleString() || '100K+',
      icon: 'suitcase',
      color: 'var(--color-accent-600)'
    },
    {
      label: 'Verified Vendors',
      value: stats.stats.totalVendorsVerified?.toLocaleString() || '2K+',
      icon: 'shield-check',
      color: 'var(--color-secondary-600)'
    },
    {
      label: 'Average Rating',
      value: `${(stats.stats.averageRating || 4.7).toFixed(1)}★`,
      icon: 'star',
      color: 'var(--color-warning)'
    },
    {
      label: 'Response Rate',
      value: `${(stats.stats.responseRate || 95)}%`,
      icon: 'message-square',
      color: 'var(--color-info)'
    },
    {
      label: 'Avg Response Time',
      value: stats.stats.responseTime || 'under 2 hours',
      icon: 'clock',
      color: 'var(--color-primary-600)'
    }
  ];
  
  statsGrid.innerHTML = stats.map(stat => `
    <div class="trust-stat-card card p-6 text-center border-l-4" style="border-color: ${stat.color};">
      <div class="trust-stat-card__icon mb-3" style="font-size: var(--text-2xl);">${getIcon(stat.icon)}</div>
      <div class="trust-stat-card__value font-bold text-primary" style="font-size: var(--text-2xl);">${stat.value}</div>
      <div class="trust-stat-card__label text-sm text-tertiary">${stat.label}</div>
    </div>
  `).join('');
}

function initTrustBadges() {
  const badgesGrid = document.getElementById('trust-badges-grid');
  if (!badgesGrid) return;
  
  const badges = stats.badges || [
    {
      id: 'verified-badge',
      name: 'Verified Vendor',
      description: 'Vendors who have undergone identity verification and quality checks',
      icon: 'shield-check',
      color: '#22c55e'
    },
    {
      id: 'trust-badge',
      name: 'Trust Badge Holder',
      description: 'Vendors with consistently high ratings and excellent service',
      icon: 'star',
      color: '#f59e0b'
    },
    {
      id: 'superhost-badge',
      name: 'Superhost',
      description: 'Top-rated vendors with exceptional hospitality',
      icon: 'crown',
      color: '#ec4899'
    }
  ];
  
  badgesGrid.innerHTML = badges.map(badge => `
    <div class="trust-badge-card card p-6 border-l-4" style="border-color: ${badge.color};">
      <div class="trust-badge-card__header flex items-start gap-3 mb-4">
        <div class="trust-badge-card__icon" style="font-size: var(--text-2xl);">${getIcon(badge.icon)}</div>
        <div class="trust-badge-card__content">
          <h3 class="trust-badge-card__title font-medium">${badge.name}</h3>
          <p class="trust-badge-card__description text-sm text-tertiary">${badge.description}</p>
        </div>
      </div>
      <div class="trust-badge-card__footer mt-4">
        <p class="text-xs text-tertiary italic">Look for this badge when browsing vendors</p>
      </div>
    </div>
  `).join('');
}

function initTrustPolicies() {
  const policiesGrid = document.getElementById('trust-policies-grid');
  if (!policiesGrid) return;
  
  const policies = stats.policies || [
    {
      id: 'secure-payments',
      title: 'Secure Payments',
      description: 'All transactions are processed through encrypted, PCI-compliant payment gateways.',
      icon: 'lock',
      details: [
        'We use industry-standard SSL encryption',
        'Payment data is never stored on our servers',
        'We comply with PCI DSS Level 1 standards'
      ]
    },
    {
      id: 'cancelation-protection',
      title: 'Flexible Cancellation',
      description: 'Book with confidence knowing you can adjust your plans if needed.',
      icon: 'refresh-cw',
      details: [
        'Most vendors offer free cancellation up to 24-48 hours before check-in',
        'Clear cancellation policies displayed before booking',
        '24/7 support for cancellation assistance'
      ]
    },
    {
      id: '24-7-support',
      title: '24/7 Customer Support',
      description: 'Our support team is available around the clock to assist you.',
      icon: 'headset',
      details: [
        'Live chat, email, and phone support',
        'Average response time under 2 hours',
        'Multilingual support available'
      ]
    },
    {
      id: 'review-integrity',
      title: 'Review Integrity',
      description: 'We ensure all reviews are genuine and trustworthy.',
      icon: 'comments',
      details: [
        'Only verified guests can leave reviews',
        'We use automated and manual fraud detection',
        'We do not allow vendors to incentivize reviews'
      ]
    }
  ];
  
  policiesGrid.innerHTML = policies.map(policy => `
    <div class="trust-policy-card card p-6 border-l-4" style="border-color: var(--color-primary-600);">
      <div class="trust-policy-card__header flex items-start gap-3 mb-4">
        <div class="trust-policy-card__icon" style="font-size: var(--text-2xl);">${getIcon(policy.icon)}</div>
        <div class="trust-policy-card__content">
          <h3 class="trust-policy-card__title font-medium">${policy.title}</h3>
          <p class="trust-policy-card__description text-sm text-tertiary">${policy.description}</p>
        </div>
      </div>
      <div class="trust-policy-card__body mt-4">
        <ul class="list-disc list-inside space-y-2 text-sm text-tertiary">
          ${policy.details.map(detail => `<li>${detail}</li>`).join('')}
        </ul>
      </div>
    </div>
  `).join('');
}

function initTrustSecurity() {
  const securityGrid = document.getElementById('trust-security-grid');
  if (!securityGrid) return;
  
  const security = stats.security || {
    dataProtection: 'We employ bank-level security to protect your personal information.',
    privacyPolicy: 'Our privacy policy complies with GDPR and other data protection regulations.',
    dataEncryption: 'All sensitive data is encrypted both in transit and at rest.',
    regularAudits: 'We undergo regular security audits by third-party experts.'
  };
  
  securityGrid.innerHTML = [
    security.dataProtection,
    security.privacyPolicy,
    security.dataEncryption,
    security.regularAudits
  ].map(item => `
    <div class="trust-security-item card p-4 border-l-2" style="border-color: var(--color-primary-600);">
      <div class="trust-security-item__icon mb-2" style="font-size: var(--text-xl);">🔒</div>
      <p class="trust-security-item__text text-sm text-tertiary leading-relaxed">${item}</p>
    </div>
  `).join('');
}

function getIcon(iconName) {
  // Simple icon mapping - in a real app we'd use an icon library
  const icons = {
    users: '👥',
    suitcase: '🧳',
    'shield-check': '🛡️',
    star: '⭐',
    'message-square': '💬',
    clock: '⏰',
    lock: '🔒',
    'refresh-cw': '🔄',
    headset: '🎧',
    comments: '💬',
    crown: '👑'
  };
  return icons[iconName] || '🔹';
}