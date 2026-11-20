/**
 * Tripzy - AI Planner Page Module
 * AI-powered trip itinerary generator with mock AI integration
 */

import { api } from '../utils/api.js';

// Mock AI service for demonstration
class MockAIService {
  async generateItinerary(preferences) {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate mock itinerary based on preferences
    const { destination, duration, budget, interests, travelers } = preferences;
    
    // Get destination data (mock)
    const destinations = {
      goa: { name: 'Goa', type: 'beach' },
      manali: { name: 'Manali', type: 'mountain' },
      jaipur: { name: 'Jaipur', type: 'heritage' },
      kerala: { name: 'Kerala', type: 'backwater' },
      rishikesh: { name: 'Rishikesh', type: 'adventure' },
      andaman: { name: 'Andaman', type: 'island' }
    };
    
    const dest = destinations[destination.toLowerCase()] || { name: destination, type: 'unknown' };
    
    // Generate day-by-day itinerary
    const itinerary = {
      tripName: `${dest.name} ${duration}-Day Adventure`,
      destination: dest.name,
      duration,
      budget,
      travelers,
      generatedAt: new Date().toISOString(),
      days: []
    };
    
    // Activities based on interests and destination type
    const activitiesMap = {
      beach: ['Beach hopping', 'Sunset cruise', 'Water sports', 'Beach yoga', 'Seafood dinner', 'Island hopping'],
      mountain: ['Trekking', 'Mountain biking', 'Paragliding', 'Rock climbing', 'Camping', 'Monastery visit'],
      heritage: ['Fort exploration', 'Palace tour', 'Heritage walk', 'Museum visit', 'Cultural show', 'Local market'],
      backwater: ['Houseboat cruise', 'Village walk', 'Ayurvedic spa', 'Bird watching', 'Fishing experience', 'Canoeing'],
      adventure: ['River rafting', 'Bungee jumping', 'Zip lining', 'Rock climbing', 'Jungle trek', 'Wildlife safari'],
      island: ['Scuba diving', 'Snorkeling', 'Beach camping', 'Island hopping', 'Sunset sailing', 'Coral reef exploration']
    };
    
    const activities = activitiesMap[dest.type.toLowerCase()] || ['Sightseeing', 'Local cuisine', 'Cultural experience'];
    
    // Generate days
    for (let day = 1; day <= duration; day++) {
      const dayActivities = [];
      const numActivities = Math.min(3 + Math.floor(Math.random() * 2), activities.length);
      
      // Select random activities for the day
      const selected = [];
      const pool = [...activities];
      for (let i = 0; i < numActivities; i++) {
        const idx = Math.floor(Math.random() * pool.length);
        selected.push(pool.splice(idx, 1)[0]);
      }
      
      dayActivities.push({
        time: '09:00',
        activity: selected[0] || 'Breakfast at hotel',
        location: 'Hotel',
        notes: 'Start your day with a hearty breakfast'
      });
      
      if (selected.length > 1) {
        dayActivities.push({
          time: '11:00',
          activity: selected[1],
          location: 'Various',
          notes: 'Guided tour with local expert'
        });
      }
      
      if (selected.length > 2) {
        dayActivities.push({
          time: '15:00',
          activity: selected[2],
          location: 'Various',
          notes: 'Afternoon adventure activity'
        });
      }
      
      // Add evening activity
      dayActivities.push({
        time: '19:00',
        activity: 'Dinner at local restaurant',
        location: 'Local area',
        notes: 'Try regional specialties'
      });
      
      itinerary.days.push({
        day,
        title: `Day ${day}: Exploring ${dest.name}`,
        activities: dayActivities
      });
    }
    
    return itinerary;
  }
}

const aiService = new MockAIService();

export async function initPlanner(container, { state, api, toast }) {
  // Load any existing itinerary from state (if any)
  const existingItinerary = state.get('currentItinerary');
  
  // Render page
  container.innerHTML = renderPlanner(existingItinerary);
  container.hidden = false;
  
  // Initialize components
  initPlannerForm();
  initItineraryActions();
  
  // Return cleanup function
  return () => {
    // Cleanup if needed
  };
}

function renderPlanner(itinerary = null) {
  return `
    <div class="page-content">
      <!-- Planner Header -->
      <section class="planner-header" aria-labelledby="planner-title">
        <div class="container">
          <div class="planner-header__content">
            <h1 id="planner-title" class="planner-header__title">
              AI Trip Planner
            </h1>
            <p class="planner-header__subtitle">
              Tell us about your dream trip and our AI will create a personalized day-by-day itinerary.
            </p>
          </div>
        </div>
      </section>

      <!-- Planner Form -->
      <section class="planner-form-section" aria-labelledby="form-title">
        <div class="container">
          <div class="planner-form-card card" id="planner-form-card">
            <h2 id="form-title" class="planner-form__title">Plan Your Trip</h2>
            <form class="planner-form" id="planner-form" role="form" aria-labelledby="form-title">
              <div class="planner-form__grid grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
                <!-- Destination -->
                <div class="form-group">
                  <label for="planner-destination" class="form-label">Destination</label>
                  <div class="relative">
                    <input
                      type="text"
                      id="planner-destination"
                      class="form-input planner-input"
                      placeholder="e.g., Goa, Manali, Jaipur"
                      list="destination-list"
                      required
                      aria-describedby="destination-help"
                    >
                    <datalist id="destination-list">
                      <option value="Goa"></option>
                      <option value="Manali"></option>
                      <option value="Jaipur"></option>
                      <option value="Kerala"></option>
                      <option value="Rishikesh"></option>
                      <option value="Andaman"></option>
                      <option value="Udaipur"></option>
                      <option value="Leh-Ladakh"></option>
                      <option value="Varanasi"></option>
                      <option value="Darjeeling"></option>
                    </datalist>
                    <span id="destination-help" class="form-hint">Start typing to see suggestions</span>
                    <button type="button" class="planner-form__clear-btn" id="clear-destination" aria-label="Clear destination">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <!-- Duration -->
                <div class="form-group">
                  <label for="planner-duration" class="form-label">Trip Duration (days)</label>
                  <input
                    type="number"
                    id="planner-duration"
                    class="form-input planner-input"
                    min="1"
                    max="30"
                    value="5"
                    required
                    aria-describedby="duration-help"
                  >
                  <span id="duration-help" class="form-hint">How many days will you travel?</span>
                </div>
                
                <!-- Budget -->
                <div class="form-group">
                  <label for="planner-budget" class="form-label">Budget (INR)</label>
                  <input
                    type="number"
                    id="planner-budget"
                    class="form-input planner-input"
                    min="1000"
                    max="500000"
                    value="25000"
                    required
                    aria-describedby="budget-help"
                  >
                  <span id="budget-help" class="form-hint">Total budget for the trip</span>
                </div>
                
                <!-- Travelers -->
                <div class="form-group">
                  <label for="planner-travelers" class="form-label">Number of Travelers</label>
                  <select id="planner-travelers" class="form-select planner-input" aria-describedby="travelers-help">
                    <option value="1">1 (Solo)</option>
                    <option value="2" selected>2 (Couple)</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6+</option>
                  </select>
                  <span id="travelers-help" class="form-hint">How many people are traveling?</span>
                </div>
                
                <!-- Interests -->
                <div class="form-group full-width">
                  <label for="planner-interests" class="form-label">Interests (select up to 3)</label>
                  <div class="interests-grid" id="interests-grid">
                    <label class="interest-checkbox">
                      <input type="checkbox" name="interest" value="beach">
                      <span>Beach & Water</span>
                    </label>
                    <label class="interest-checkbox">
                      <input type="checkbox" name="interest" value="mountain">
                      <span>Mountains & Trekking</span>
                    </label>
                    <label class="interest-checkbox">
                      <input type="checkbox" name="interest" value="heritage">
                      <span>Heritage & Culture</span>
                    </label>
                    <label class="interest-checkbox">
                      <input type="checkbox" name="interest" value="adventure">
                      <span>Adventure & Sports</span>
                    </label>
                    <label class="interest-checkbox">
                      <input type="checkbox" name="interest" value="food">
                      <span>Food & Culinary</span>
                    </label>
                    <label class="interest-checkbox">
                      <input type="checkbox" name="interest" value="relaxation">
                      <span>Relaxation & Wellness</span>
                    </label>
                    <label class="interest-checkbox">
                      <input type="checkbox" name="interest" value="wildlife">
                      <span>Wildlife & Nature</span>
                    </label>
                    <label class="interest-checkbox">
                      <input type="checkbox" name="interest" value="photography">
                      <span>Photography</span>
                    </label>
                  </div>
                  <span id="interests-help" class="form-hint">Select what interests you most (max 3)</span>
                </div>
                
                <!-- Travel Style -->
                <div class="form-group full-width">
                  <label for="planner-style" class="form-label">Travel Style</label>
                  <select id="planner-style" class="form-select planner-input" aria-describedby="style-help">
                    <option value="relaxed" selected>Relaxed & Leisurely</option>
                    <option value="balanced">Balanced Mix</option>
                    <option value="packed">Action-Packed</option>
                    <option value="luxury">Luxury & Comfort</option>
                    <option value="budget">Budget-Friendly</option>
                    <option value="family">Family-Friendly</option>
                  </select>
                  <span id="style-help" class="form-hint">How would you like to travel?</span>
                </div>
              </div>
              
              <div class="planner-form__actions mt-6">
                <button type="submit" class="btn btn--primary btn--lg" id="generate-itinerary-btn">
                  <span class="spinner spinner--sm" id="generate-spinner" hidden></span>
                  <span id="generate-btn-text">Generate My Itinerary</span>
                </button>
                <button type="button" class="btn btn--outline btn--lg ml-4" id="reset-form-btn">
                  Reset Form
                </div>
            </form>
          </div>
        </div>
      </section>

      <!-- Generated Itinerary -->
      <section class="planner-itinerary-section" aria-labelledby="itinerary-title" hidden>
        <div class="container">
          <div class="planner-itinerary-card card" id="planner-itinerary-card">
            <div class="planner-itinerary__header flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 id="itinerary-title" class="planner-itinerary__title">Your Personalized Itinerary</h2>
                <p class="planner-itinerary__subtitle text-secondary" id="itinerary-summary">
                  A custom trip plan generated just for you
                </p>
              </div>
              <div class="planner-itinerary__actions flex gap-3">
                <button class="btn btn--outline btn--sm" id="edit-itinerary-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit
                </button>
                <button class="btn btn--primary btn--sm" id="save-itinerary-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  </svg>
                  Save Trip
                </button>
                <button class="btn btn--secondary btn--sm" id="share-itinerary-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M18 16.08c-7.6 0-9.99-1.54-9.99-4.23 0-2.06 1.08-3.9 2.9-4.6"/>
                    <path d="M22 4.24c-1.34 2.73-3.43 4.76-5.9 4.76-2.46 0-4.43-1.86-4.43-4.26 0-1.17.41-2.26 1.08-3.1"/>
                    <path d="M4.22 12.91a2.83 2.83 0 0 0-.64 4.12c0 1.47.54 2.72 1.27 3.64l2.8 1.8c1.16.73 2.56.43 3.22-.44l1.18-1l1.18 1c.66.87 2.06.21 3.22-.44l2.8-1.8c.73-.92 1.27-2.17 1.27-3.64"/>
                  </svg>
                  Share
                </button>
              </div>
            </div>
            
            <!-- Itinerary Overview -->
            <div class="planner-itinerary__overview grid gap-4" style="grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));" id="itinerary-overview">
              <!-- Overview stats will be filled dynamically -->
            </div>
            
            <!-- Days -->
            <div class="planner-itinerary__days" id="itinerary-days">
              <!-- Days will be filled dynamically -->
            </div>
            
            <!-- Footer Actions -->
            <div class="planner-itinerary__footer-actions flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6">
              <button class="btn btn--outline btn--sm" id="print-itinerary-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M6 9H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h1.5"/>
                  <path d="M6 12l3-3"/>
                  <path d="M18 9h1.5a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H18"/>
                  <path d="M21 15V9a2 2 0 0 0-2-2H9"/>
                  <path d="M12 17V7"/>
                </svg>
                Print
              </button>
              <button class="btn btn--primary btn--sm" id="book-itinerary-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M3 3h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
                  <path d="M3 9h18"/>
                  <path d="M3 14h18"/>
                  <path d="M7 9v11"/>
                  <path d="M17 9v11"/>
                </svg>
                Book This Trip
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

function initPlannerForm() {
  const form = document.getElementById('planner-form');
  const destinationInput = document.getElementById('planner-destination');
  const clearBtn = document.getElementById('clear-destination');
  const generateBtn = document.getElementById('generate-itinerary-btn');
  const resetBtn = document.getElementById('reset-form-btn');
  const spinner = document.getElementById('generate-spinner');
  const btnText = document.getElementById('generate-btn-text');
  const interestsCheckboxes = form.querySelectorAll('input[name="interest"]');
  
  // Clear destination
  clearBtn.addEventListener('click', () => {
    destinationInput.value = '';
    destinationInput.focus();
  });
  
  // Limit interests to 3
  interestsCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const checked = form.querySelectorAll('input[name="interest"]:checked');
      if (checked.length > 3) {
        checkbox.checked = false;
        toast.warning('Maximum 3 interests allowed');
      }
    });
  });
  
  // Reset form
  resetBtn.addEventListener('click', () => {
    form.reset();
    // Hide itinerary section if visible
    const itinerarySection = document.querySelector('.planner-itinerary-section');
    if (itinerarySection) itinerarySection.hidden = true;
  });
  
  // Generate itinerary
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    
    // Show loading
    spinner.hidden = false;
    btnText.textContent = 'Generating...';
    generateBtn.disabled = true;
    
    try {
      // Collect form data
      const formData = new FormData(form);
      const preferences = {
        destination: formData.get('planner-destination'),
        duration: parseInt(formData.get('planner-duration')),
        budget: parseInt(formData.get('planner-budget')),
        travelers: parseInt(formData.get('planner-travelers')),
        interests: Array.from(formData.getAll('interest')),
        style: formData.get('planner-style')
      };
      
      // Generate itinerary using AI service
      const itinerary = await aiService.generateItinerary(preferences);
      
      // Store in state
      state.set('currentItinerary', itinerary);
      
      // Render itinerary
      renderItinerary(itinerary);
      
      // Show itinerary section
      const itinerarySection = document.querySelector('.planner-itinerary-section');
      if (itinerarySection) itinerarySection.hidden = false;
      
      // Scroll to itinerary
      const itineraryCard = document.getElementById('planner-itinerary-card');
      if (itineraryCard) itineraryCard.scrollIntoView({ behavior: 'smooth' });
      
      toast.success('Itinerary generated!', 'Your personalized trip plan is ready');
    } catch (error) {
      console.error('Error generating itinerary:', error);
      toast.error('Failed to generate itinerary', 'Please try again later');
    } finally {
      // Hide loading
      spinner.hidden = true;
      btnText.textContent = 'Generate My Itinerary';
      generateBtn.disabled = false;
    }
  });
}

function renderItinerary(itinerary) {
  // Update summary
  const summaryEl = document.getElementById('itinerary-summary');
  if (summaryEl) {
    summaryEl.textContent = `${itinerary.destination} • ${itinerary.duration} days • ₹${itinerary.budget.toLocaleString()} for ${itinerary.travelers} traveler${itinerary.travelers > 1 ? 's' : ''}`;
  }
  
  // Update overview stats
  const overviewEl = document.getElementById('itinerary-overview');
  if (overviewEl) {
    overviewEl.innerHTML = `
      <div class="text-center">
        <div class="font-bold text-primary" style="font-size: var(--text-lg);">${itinerary.duration}</div>
        <div class="text-sm text-secondary">Days</div>
      </div>
      <div class="text-center">
        <div class="font-bold text-primary" style="font-size: var(--text-lg);">₹${(itinerary.budget / itinerary.duration).toLocaleString()}</div>
        <div class="text-sm text-secondary">Per Day</div>
      </div>
      <div class="text-center">
        <div class="font-bold text-primary" style="font-size: var(--text-lg);">${itinerary.travelers}</div>
        <div class="text-sm text-secondary">Travelers</div>
      </div>
      <div class="text-center">
        <div class="font-bold text-primary" style="font-size: var(--text-lg);">${itinerary.destinations?.length || 1}</div>
        <div class="text-sm text-secondary">Destinations</div>
      </div>
    `;
  }
  
  // Render days
  const daysEl = document.getElementById('itinerary-days');
  if (daysEl) {
    daysEl.innerHTML = itinerary.days.map(day => renderDay(day)).join('');
  }
  
  // Initialize day interactions
  initDayInteractions();
}

function renderDay(day) {
  return `
    <div class="itinerary-day card mb-6" data-day="${day.day}">
      <div class="itinerary-day__header flex items-center justify-between p-4 border-b" style="border-color: var(--color-surface-border);">
        <div class="itinerary-day__title flex items-center gap-3">
          <div class="day-number bg-primary-100 text-primary rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
            ${day.day}
          </div>
          <h3 class="font-semibold">${day.title}</h3>
        </div>
        <button class="btn btn--ghost btn--icon-only day-toggle-btn" aria-label="Toggle day details">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="day-toggle-icon">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>
      <div class="itinerary-day__body" hidden>
        <div class="itinerary-day__activities p-4 space-y-3">
          ${day.activities.map(activity => renderActivity(activity)).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderActivity(activity) {
  return `
    <div class="itinerary-activity flex items-start gap-3">
      <div class="itinerary-activity__time text-secondary text-sm font-medium w-16">
        ${activity.time}
      </div>
      <div class="itinerary-activity__content flex-1">
        <h4 class="itinerary-activity__title font-medium">${activity.activity}</h4>
        <p class="itinerary-activity__location text-xs text-tertiary">${activity.location}</p>
        ${activity.notes ? `<p class="itinerary-activity__notes text-xs text-tertiary italic">${activity.notes}</p>` : ''}
      </div>
    </div>
  `;
}

function initDayInteractions() {
  const toggleButtons = document.querySelectorAll('.day-toggle-btn');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const dayEl = btn.closest('.itinerary-day');
      const bodyEl = dayEl.querySelector('.itinerary-day__body');
      const iconEl = dayEl.querySelector('.day-toggle-icon');
      
      const isHidden = bodyEl.hidden;
      bodyEl.hidden = !isHidden;
      
      // Update icon
      if (isHidden) {
        iconEl.innerHTML = '<polyline points="6 9 12 15 18 9"/>';
      } else {
        iconEl.innerHTML = '<polyline points="6 15 12 9 18 15"/>';
      }
    });
  });
}

function initItineraryActions() {
  const editBtn = document.getElementById('edit-itinerary-btn');
  const saveBtn = document.getElementById('save-itinerary-btn');
  const shareBtn = document.getElementById('share-itinerary-btn');
  const printBtn = document.getElementById('print-itinerary-btn');
  const bookBtn = document.getElementById('book-itinerary-btn');
  
  // Edit itinerary - show form again
  editBtn.addEventListener('click', () => {
    const itinerarySection = document.querySelector('.planner-itinerary-section');
    const formSection = document.querySelector('.planner-form-section');
    if (itinerarySection) itinerarySection.hidden = true;
    if (formSection) formSection.hidden = false;
    
    // Scroll to form
    const formCard = document.getElementById('planner-form-card');
    if (formCard) formCard.scrollIntoView({ behavior: 'smooth' });
  });
  
  // Save itinerary
  saveBtn.addEventListener('click', async () => {
    const itinerary = state.get('currentItinerary');
    if (!itinerary) return;
    
    try {
      // In real app, this would save to backend
      // For demo, we'll simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a trip ID
      const tripId = `trip_${Date.now()}`;
      
      // Store in localStorage as mock persistence
      const savedTrips = JSON.parse(localStorage.getItem('tripzy_saved_trips') || '[]');
      savedTrips.push({
        id: tripId,
        ...itinerary,
        savedAt: new Date().toISOString()
      });
      localStorage.setItem('tripzy_saved_trips', JSON.stringify(savedTrips));
      
      toast.success('Trip saved!', 'Your itinerary has been saved to your dashboard');
      
      // Navigate to dashboard after delay
      setTimeout(() => {
        window.location.hash = '#dashboard';
      }, 1500);
    } catch (error) {
      toast.error('Failed to save', 'Please try again later');
    }
  });
  
  // Share itinerary
  shareBtn.addEventListener('click', () => {
    const itinerary = state.get('currentItinerary');
    if (!itinerary) return;
    
    // Create shareable text
    const shareText = `Check out my trip to ${itinerary.destination} planned with Tripzy AI! ${window.location.origin}#/itinerary/${Date.now()}`;
    
    // Try to use Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: `My ${itinerary.destination} Trip Plan`,
        text: shareText,
        url: window.location.href
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
          toast.success('Link copied to clipboard!');
        });
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        toast.success('Link copied to clipboard!');
      });
    }
  });
  
  // Print itinerary
  printBtn.addEventListener('click', () => {
    window.print();
  });
  
  // Book itinerary
  bookBtn.addEventListener('click', () => {
    const itinerary = state.get('currentItinerary');
    if (!itinerary) return;
    
    // Navigate to booking flow
    window.location.hash = `#booking/${Date.now()}`;
    toast.info('Booking feature coming soon!', 'In the meantime, you can save this itinerary and book manually.');
  });
}