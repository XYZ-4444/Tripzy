# Tripzy — Har Safar, Smart Safar

A local, editable prototype of an Indian smart-tourism platform. Built with semantic HTML, CSS and vanilla JavaScript. No framework, package installation, build step, API key or server is needed.

## Open the prototype

1. Open this `tripzy` folder in VS Code using **File → Open Folder**.
2. Double-click `index.html` in Finder to open the website in a browser.
3. Edit any HTML file, `css/style.css`, `css/pages.css` or `js/data.js`, save, and refresh the browser.

The development preview has been stopped after testing. Double-click `index.html` to run the project directly, or use VS Code’s optional Live Server extension if you already have it installed.

## Smart India Hackathon problem statement

**Student Innovation — A solution/idea that can boost the current situation of the tourism industries including hotels, travel and others.**

Tripzy brings destinations, independent stays, local guides and personalised trip planning into one approachable experience. The intended platform addresses fragmented services, trust, language barriers, traveler safety and local business visibility.

## Included

- Eight linked pages with a consistent navigation and footer.
- Mountain hero, destination autocomplete with keyboard controls, date validation and a 1–20 traveler stepper.
- Thirteen destinations with search, sorting and live multi-select filters. Groups combine with AND; choices within a group combine with OR.
- Eight fictional stays with price, rating, location, type and amenity filters, plus a mobile filter drawer and booking confirmation demo.
- Eight fictional local guide profiles, language/city/specialisation filters, individual biographies and a 14-day sample availability strip.
- A five-step planner that uses destination, dates, traveler count, budget, interests and pace. Back preserves choices; regenerate rotates activities; save downloads a text itinerary; print uses a clean print layout.
- A reusable accessible dialog, keyboard focus handling, toast notifications and inline form errors.
- Ten language examples, including Hindi, Gujarati, Tamil and Bengali in native scripts.
- Food discovery, culture panels, impact counters, sample travel intelligence and an SOS confirmation flow.
- Testimonial carousel with buttons, dots, arrow keys, swipe and pause on hover/focus.
- Contact and newsletter validation, FAQ accordion, responsive layouts and reduced-motion support.

## Files

```text
tripzy/
├── index.html
├── explore.html
├── hotels.html
├── guides.html
├── guide-profile.html
├── trip-planner.html
├── about.html
├── contact.html
├── css/
│   ├── style.css        # Tokens, base styles and shared components
│   └── pages.css        # Page layouts, responsive adjustments and print
├── js/
│   ├── data.js          # Mock datasets, translations, icons and photo URLs
│   └── script.js        # Shared behaviour and page interactions
├── assets/
│   ├── images/          # Available for your own local photos
│   ├── icons/           # Icons currently live as inline SVG
│   └── logo/favicon.svg
├── PHOTO-CREDITS.md
└── README.md
```

## Assumptions and demo limitations

This is a simple local prototype, not a connected travel service. The supplied visual brief and eight-page structure are retained, with concise copy and representative photography.

- The planner is a transparent, local rules-based demonstration, not an AI API call. Its suggested activities are starting points, not verified schedules or live travel advice.
- Day count includes arrival and departure days. The demo supports 2–30 days. Budget = number of days × per-person daily tier rate × travelers. Transport to/from the destination is excluded. Pace produces 2, 3 or 5 stops per day.
- Hotel businesses, guide identities, ratings, reviews, availability, prices and verification badges are mock data. Photos are illustrative stock images, not evidence of a listed business or guide.
- The 40%, 10+, 3× and 24/7 figures are illustrative project goals, not measured results or a staffed service commitment.
- Weather, crowd levels, routes and exchange rates are fixed sample values, not live information.
- Booking, contact, guide connection, newsletter and store buttons show demo results. They do not send messages, subscribe users, reserve rooms, collect money or contact emergency services.
- SOS never calls a number, requests location or shares data. The confirmation describes an intended future capability only.
- State is held in the page while you use it; it resets when the page reloads. Save itinerary creates a file on your device.
- `data.js` exposes `window.Tripzy` through a classic script rather than ES module exports. This intentionally avoids module/CORS restrictions when opened using `file://`.
- Team cards show roles ready for the actual SIH team’s names.
- Photography is reused in some demo cards. Region images, hotel scenes, meal photos and guide portraits are representative; replace them with matched assets before a real launch.

## Offline behaviour

Every page, filter, dialog and planner works from local files. No page fetches local JSON or HTML fragments. Navigation uses relative links.

Google Fonts and Unsplash images require a connection. If fonts are unavailable, Arial/system fonts keep the layout readable. Every photograph has fixed dimensions, alt text and a teal-tinted caption fallback. Image failures are caught by `imageFallbacks()`; the text and card actions remain available. External network failures can appear in browser network diagnostics while offline, but do not stop the app.

For a completely self-contained visual demo, replace remote image URLs with your licensed local files under `assets/images/`, and use locally licensed fonts or retain the system fallback.

## Browser support

Designed for current desktop and mobile Chrome, Edge, Safari and Firefox with support for native `dialog`, CSS Grid, IntersectionObserver and modern JavaScript. The prototype was exercised in the in-app Chromium preview. Other browser families have not been independently tested. Native date controls may look different across browsers.

## Five-minute presentation script

1. **0:00–0:40 — Home:** Introduce “Har Safar, Smart Safar,” the local tourism focus and the teal/coral design. Mention that this is a working offline-capable prototype.
2. **0:40–1:15 — Search:** Type Goa, choose the autocomplete result, enter future check-in/check-out dates, change travelers and select **Explore now**. Open a destination detail.
3. **1:15–2:30 — Planner:** Choose Goa, three travelers, five inclusive travel days, Premium, Food + Nature, and Relaxed. Generate the plan. Explain the estimate, show two stops per day, regenerate, and try save or print.
4. **2:30–3:20 — Explore:** Combine region, budget and experience filters. Demonstrate the live count, individual removable chips, sort order and reset after an empty result.
5. **3:20–4:00 — Local ecosystem:** Filter a stay and open the demo booking. Filter guides by Gujarati and open Arjun Patel’s profile. Select an available day.
6. **4:00–4:30 — Safety and language:** Open SOS, continue to the clearly marked demo notice, close it, and switch the chat to Gujarati or Hindi.
7. **4:30–5:00 — Impact:** Show the animated project goals, explaining that they are targets. Finish with the SIH mission and the role of local businesses.

## Design review

- Kept a single strong mountain hero, a distinct floating search and a warm Indian travel voice instead of a generic software dashboard landing page.
- Used varied component shapes and editorial culture imagery, with restrained coral actions.
- Corrected an intrinsic-width issue in the guide availability calendar so it scrolls inside its own area instead of widening the page.
- Chose dark text on coral buttons and darker orange for small text to improve contrast.
- Remaining intentional prototype shortcuts are disclosed above: representative repeated stock imagery, role-based team cards and rules-based itinerary content.

## Validation performed

- JavaScript syntax checks pass for both scripts.
- All eight page files, relative links and in-page anchors were checked; images include alt text and dimensions.
- All eight pages were checked for horizontal document overflow at 360, 768, 1024, 1440 and 1920 pixels. The guide calendar issue was fixed and rechecked at each width.
- Browser checks covered search validation/autocomplete, combined destination filters and empty state, stay filters and demo booking totals, guide filtering/profile links, planner validation/back/regeneration and calculated budget, SOS confirmation, Gujarati switching, contact validation/success and mobile navigation/filter drawers.
- The tested five-day, three-traveler Premium/Relaxed itinerary produced ten stops and an ₹82,500 estimate, as expected.
- No application JavaScript warnings or errors were reported in the exercised browser flows.
- Automated direct `file://` navigation was unavailable due to the browser tool’s URL policy. Server-free operation is supported by the classic-script, relative-link implementation, but that launch method was not independently browser-tested. Print and download controls are implemented; their native dialogs/download completion were not automated.
