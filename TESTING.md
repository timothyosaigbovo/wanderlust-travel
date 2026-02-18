# Testing - Wanderlust Travel

## Table of Contents
- [Automated vs Manual Testing](#automated-vs-manual-testing)
- [Code Validation](#code-validation)
- [Manual Testing](#manual-testing)
- [Responsiveness Testing](#responsiveness-testing)
- [Browser Compatibility](#browser-compatibility)
- [Lighthouse Audit](#lighthouse-audit)
- [Bugs Found and Fixes](#bugs-found-and-fixes)

---

## Automated vs Manual Testing

### Manual Testing
Manual testing involves a human tester interacting with the application, following test scripts, and checking expected outcomes against actual results. Manual testing is best suited for:
- User experience (UX) testing
- Visual and layout testing
- Exploratory testing to find unexpected issues
- Accessibility testing with screen readers and keyboard navigation

### Automated Testing
Automated testing uses test scripts and frameworks (such as Jasmine or Jest) to run predefined assertions without human input. Automated testing is best suited for:
- Unit testing individual JavaScript functions
- Regression testing to ensure new changes don't break existing features
- Testing the same conditions repeatedly across different environments

### Approach Chosen
Manual testing was chosen as the primary testing approach for this project because it best suits testing user interactions, visual responsiveness, and real-world browser behaviour. Each feature was tested systematically against the user stories and acceptance criteria defined during the planning phase.

---

## Code Validation

### HTML Validation (W3C Markup Validator)
All HTML pages were validated using the [W3C Markup Validation Service](https://validator.w3.org/).

| Page | Result | Screenshot |
|------|--------|------------|
| index.html | Pass - No errors | ![index validation](docs/testing/html-index.png) |
| destinations.html | Pass - No errors | ![destinations validation](docs/testing/html-destinations.png) |
| contact.html | Pass - No errors | ![contact validation](docs/testing/html-contact.png) |
| 404.html | Pass - No errors | ![404 validation](docs/testing/html-404.png) |

### CSS Validation (W3C Jigsaw Validator)
CSS was validated using the [W3C CSS Validation Service](https://jigsaw.w3.org/css-validator/).

| File | Result | Screenshot |
|------|--------|------------|
| style.css | Pass - No errors | ![css validation](docs/testing/css-validation.png) |

### JavaScript Validation (JSHint)
JavaScript files were validated using [JSHint](https://jshint.com/) with ES8 configuration enabled. The following directives were used at the top of each file during validation:
- script.js: `/* jshint esversion: 8, browser: true */ /* global L, AbortController */`
- contact.js: `/* jshint esversion: 8, browser: true */ /* global emailjs */`

| File | Result | Notes | Screenshot |
|------|--------|-------|------------|
| script.js | Pass - No major issues | 8 warnings for misleading line breaks (style preference only) | ![script validation](docs/testing/js-script.png) |
| contact.js | Pass - No major issues | 1 warning for function in loop (non-critical) | ![contact validation](docs/testing/js-contact.png) |

---

## Manual Testing

### Navigation Testing

| # | Test | Steps | Expected Result | Actual Result | Pass/Fail |
|---|------|-------|-----------------|---------------|-----------|
| 1 | Home link | Click "Home" in navbar | index.html loads | index.html loads correctly | Pass |
| 2 | Destinations link | Click "Destinations" in navbar | destinations.html loads | destinations.html loads correctly | Pass |
| 3 | Contact link | Click "Contact" in navbar | contact.html loads | contact.html loads correctly | Pass |
| 4 | Logo navigates home | Click the Wanderlust logo from any page | Returns to index.html | Returns to index.html | Pass |
| 5 | Mobile hamburger menu | Resize browser to mobile width, click hamburger icon | Menu opens and shows links | Menu opens and shows all links | Pass |
| 6 | Mobile menu closes | Click a link in the mobile menu | Menu closes and page navigates | Menu closes, page loads | Pass |
| 7 | Active page highlighted | Visit each page | Current page link has different styling | Current page link is highlighted | Pass |
| 8 | GitHub footer link | Click "GitHub" in footer | Opens GitHub repo in new tab | Opens in new tab | Pass |
| 9 | Back to top button | Scroll down, click up arrow button | Scrolls smoothly to top | Scrolls to top smoothly | Pass |
| 10 | Back to top hidden at top | Load any page (at top) | Up arrow button is not visible | Button is hidden | Pass |

### Search Functionality Testing (index.html)

| # | Test | Steps | Expected Result | Actual Result | Pass/Fail |
|---|------|-------|-----------------|---------------|-----------|
| 11 | Valid country search | Type "Japan", click Search | Japan card and map marker appear | Japan card displayed, marker on map | Pass |
| 12 | Multiple results | Type "United", click Search | Multiple countries shown (UK, US, UAE, etc.) | Multiple cards and markers displayed | Pass |
| 13 | Empty search | Leave field empty, click Search | Error: "Please enter a country name" | Error message shown | Pass |
| 14 | Single character | Type "a", click Search | Error: "at least 2 characters" | Error message shown | Pass |
| 15 | Numbers in search | Type "123", click Search | Error: "valid country name (letters only)" | Error message shown | Pass |
| 16 | Special characters | Type "@#$", click Search | Error: "valid country name (letters only)" | Error message shown | Pass |
| 17 | Non-existent country | Type "Xyzzyland", click Search | Info: "No countries found" | Info message shown | Pass |
| 18 | Loading spinner | Search any valid country | Spinner appears during loading | Spinner visible while fetching data | Pass |
| 19 | New search clears old | Search "France", then search "Japan" | Old results replaced with new | Previous results cleared, new shown | Pass |
| 20 | Map markers appear | Search "Italy" | Marker appears on Italy on the map | Marker placed correctly | Pass |
| 21 | View on Map button | Click "View on Map" on a card | Map zooms to that country | Map flies to country location | Pass |

### Search Functionality Testing (destinations.html)

| # | Test | Steps | Expected Result | Actual Result | Pass/Fail |
|---|------|-------|-----------------|---------------|-----------|
| 22 | Destinations search works | Type "Brazil", click Search | Brazil card and map marker appear | Card and marker displayed | Pass |
| 23 | Destinations empty search | Submit empty field | Error message shown | Error message displayed | Pass |
| 24 | Destinations invalid input | Type "999", submit | Error message shown | Error message displayed | Pass |
| 25 | Map loads on page | Open destinations.html | Map is visible and interactive | Map loads with world view | Pass |

### Contact Form Testing

| # | Test | Steps | Expected Result | Actual Result | Pass/Fail |
|---|------|-------|-----------------|---------------|-----------|
| 26 | All fields empty | Click "Send Message" with all empty | All 3 error messages appear | All error messages shown | Pass |
| 27 | Name too short | Enter "A" as name, fill others correctly | Name error shown | Name error displayed | Pass |
| 28 | Invalid email format | Enter "notanemail" as email | Email error shown | Email error displayed | Pass |
| 29 | Message too short | Enter "Hi" as message | Message error shown | Message error displayed | Pass |
| 30 | Valid submission | Fill all fields correctly, submit | Success message, form clears | Success message shown, form reset | Pass |
| 31 | Loading state | Submit valid form | Button shows "Sending..." | Button text changes to "Sending..." | Pass |
| 32 | Error clears on typing | Trigger name error, then start typing | Error disappears | Error removed on input | Pass |
| 33 | Email error clears | Trigger email error, then type valid email | Error disappears | Error removed on input | Pass |
| 34 | Message error clears | Trigger message error, then type more | Error disappears | Error removed on input | Pass |

### 404 Page Testing

| # | Test | Steps | Expected Result | Actual Result | Pass/Fail |
|---|------|-------|-----------------|---------------|-----------|
| 35 | 404 page displays | Navigate to /nonexistent-page | 404 page appears | 404 page shown with styling | Pass |
| 36 | Countdown works | Watch the countdown number | Counts down from 10 to 0 | Numbers decrease every second | Pass |
| 37 | Auto-redirect | Wait 10 seconds on 404 page | Redirects to homepage | Redirected to index.html | Pass |
| 38 | Manual home link | Click "Back to Homepage" button | Goes to index.html | Navigated to homepage | Pass |
| 39 | 404 navigation works | Click nav links on 404 page | Navigate to correct pages | All nav links work | Pass |

### Featured Destinations Testing (index.html)

| # | Test | Steps | Expected Result | Actual Result | Pass/Fail |
|---|------|-------|-----------------|---------------|-----------|
| 40 | Featured cards load | Open index.html | 6 featured country cards appear | All 6 cards loaded | Pass |
| 41 | Flag images display | Check featured cards | Each card shows country flag | Flags displayed correctly | Pass |
| 42 | Country data correct | Check card details | Capital, population, currency shown | Data displayed accurately | Pass |

---

## Responsiveness Testing

Testing was performed using Chrome DevTools device emulation.

| Device / Width | index.html | destinations.html | contact.html | 404.html |
|---------------|------------|-------------------|--------------|----------|
| iPhone SE (375px) | Pass | Pass | Pass | Pass |
| iPhone 12 (390px) | Pass | Pass | Pass | Pass |
| iPad (768px) | Pass | Pass | Pass | Pass |
| iPad Pro (1024px) | Pass | Pass | Pass | Pass |
| Laptop (1366px) | Pass | Pass | Pass | Pass |
| Desktop (1920px) | Pass | Pass | Pass | Pass |

### Key Responsive Checks

| # | Test | Expected | Result |
|---|------|----------|--------|
| 43 | Mobile shows hamburger menu | Hamburger icon visible below 768px | Pass |
| 44 | Desktop shows full nav | All links visible above 768px | Pass |
| 45 | Cards stack on mobile | Single column on small screens | Pass |
| 46 | Cards grid on desktop | 3+ columns on large screens | Pass |
| 47 | Search bar stacks on mobile | Input and button stack vertically | Pass |
| 48 | Map resizes correctly | Map adjusts to container width | Pass |
| 49 | No horizontal scrollbar | No overflow on any screen size | Pass |
| 50 | Touch targets 44px+ | All buttons/links are tappable | Pass |

---

## Browser Compatibility

| Browser | Version | Result | Notes |
|---------|---------|--------|-------|
| Google Chrome | Latest | Pass | Primary development browser |
| Mozilla Firefox | Latest | Pass | All features working |
| Microsoft Edge | Latest | Pass | All features working |

---

## Lighthouse Audit

Lighthouse audits were run using Google Chrome DevTools on the deployed site. All pages scored 90+ in every category.

### Mobile Results

| Page | Performance | Accessibility | Best Practices | SEO | Screenshot |
|------|-------------|---------------|----------------|-----|------------|
| index.html | 90 | 96 | 100 | 100 | ![lighthouse index](docs/testing/lh-index-mobile.png) |
| destinations.html | 96 | 96 | 96 | 100 | ![lighthouse dest](docs/testing/lh-dest-mobile.png) |
| contact.html | 99 | 95 | 100 | 100 | ![lighthouse contact](docs/testing/lh-contact-mobile.png) |
| 404.html | 99 | 94 | 100 | 90 | ![lighthouse 404](docs/testing/lh-404-mobile.png) |

### Desktop Results

| Page | Performance | Accessibility | Best Practices | SEO | Screenshot |
|------|-------------|---------------|----------------|-----|------------|
| index.html | 99 | 96 | 100 | 100 | ![lighthouse index](docs/testing/lh-index-desktop.png) |
| destinations.html | 94 | 96 | 96 | 100 | ![lighthouse dest](docs/testing/lh-dest-desktop.png) |
| contact.html | 99 | 95 | 100 | 100 | ![lighthouse contact](docs/testing/lh-contact-desktop.png) |
| 404.html | 95 | 94 | 100 | 90 | ![lighthouse 404](docs/testing/lh-404-desktop.png) |

---

## Bugs Found and Fixes

### Bug #1: Map not rendering correctly when results section is first shown
- **Description:** The Leaflet map showed grey tiles when the results section was first made visible
- **Steps to reproduce:** Open index.html, search for a country for the first time
- **Expected:** Map displays correctly with tiles
- **Actual:** Grey area shown instead of map tiles
- **Fix applied:** Added `setTimeout` with `map.invalidateSize()` after showing the container. This forces Leaflet to recalculate the map dimensions after the container becomes visible.
- **Status:** Fixed

### Bug #2: HTML validation warnings for redundant attributes
- **Description:** W3C validator flagged `role="navigation"` on `<nav>` elements and trailing slashes on void elements
- **Steps to reproduce:** Run W3C HTML validator on any page
- **Expected:** No warnings or errors
- **Actual:** Warning about unnecessary role attribute and info about trailing slashes
- **Fix applied:** Removed `role="navigation"` from all `<nav>` elements (the role is implicit). Removed trailing slashes from void elements like `<link>`.
- **Status:** Fixed

### Bug #3: Section elements without headings on destinations and contact pages
- **Description:** W3C validator warned that `<section>` elements lacked heading elements
- **Steps to reproduce:** Run W3C HTML validator on destinations.html and contact.html
- **Expected:** No warnings
- **Actual:** Warning about sections lacking headings
- **Fix applied:** Changed `<section>` elements that did not have headings to `<div>` elements, as these were container elements rather than semantic sections.
- **Status:** Fixed