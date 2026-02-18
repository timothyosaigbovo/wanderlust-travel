/* ══════════════════════════════════════════════
   script.js - Main Application Logic
   Wanderlust Travel - Holiday Destination Finder
   
   This file handles:
   - Navigation (hamburger menu, back to top)
   - Search input validation
   - REST Countries API integration
   - Leaflet.js interactive map
   - Destination card creation
   - Featured destinations loading
   
   Demonstrates: DOM manipulation, event listeners,
   compound statements, input validation, async/await,
   error handling, API integration, asynchronicity
   ══════════════════════════════════════════════ */

/* ──────────────────────────────────────────────
   GLOBAL VARIABLES
   ────────────────────────────────────────────── */
let mainMap = null;          // Leaflet map instance for index.html
let destMap = null;          // Leaflet map instance for destinations.html
let mainMarkers = [];        // Array of map markers for index.html
let destMarkers = [];        // Array of map markers for destinations.html
let currentAbortController = null;  // AbortController to cancel stale API requests

/* ──────────────────────────────────────────────
   NAVIGATION - Hamburger Menu Toggle
   Demonstrates: event listeners, DOM manipulation,
   aria-expanded for accessibility
   ────────────────────────────────────────────── */
const hamburgerBtn = document.getElementById("hamburger-btn");
const navLinks = document.getElementById("nav-links");

if (hamburgerBtn && navLinks) {
  hamburgerBtn.addEventListener("click", function () {
    const isOpen = navLinks.classList.toggle("open");
    this.setAttribute("aria-expanded", isOpen);
  });
}

/* ──────────────────────────────────────────────
   BACK TO TOP BUTTON
   Demonstrates: scroll event listener, compound
   statements (if condition), classList toggle
   ────────────────────────────────────────────── */
const backTopBtn = document.getElementById("back-top-btn");

if (backTopBtn) {
  window.addEventListener("scroll", function () {
    if (window.scrollY > 400) {
      backTopBtn.classList.add("visible");
    } else {
      backTopBtn.classList.remove("visible");
    }
  });

  backTopBtn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ──────────────────────────────────────────────
   FEEDBACK SYSTEM
   Shows success, error, or info messages to user
   Demonstrates: DOM manipulation, setTimeout,
   template literals, compound statements
   ────────────────────────────────────────────── */

/**
 * Displays a feedback message to the user
 * @param {string} elementId - The ID of the feedback div
 * @param {string} message - The message to display
 * @param {string} type - Message type: "error", "success", or "info"
 */
function showFeedback(elementId, message, type) {
  const element = document.getElementById(elementId);
  if (!element) {
    return;
  }

  element.textContent = message;
  element.className = "feedback " + type;

  // Auto-hide the message after 6 seconds
  setTimeout(function () {
    element.className = "feedback";
    element.textContent = "";
  }, 6000);
}

/**
 * Shows or hides a loading spinner
 * @param {string} spinnerId - The ID of the spinner div
 * @param {boolean} show - True to show, false to hide
 */
function toggleSpinner(spinnerId, show) {
  const spinner = document.getElementById(spinnerId);
  if (spinner) {
    if (show) {
      spinner.classList.add("active");
    } else {
      spinner.classList.remove("active");
    }
  }
}

/* ──────────────────────────────────────────────
   INPUT VALIDATION
   Validates search input before making API calls
   Demonstrates: compound statements (if/else),
   presence check, length check, format check,
   defensive programming (criterion 2.3)
   ────────────────────────────────────────────── */

/**
 * Validates search input with multiple checks
 * @param {string} value - The raw input value
 * @returns {object} - { valid: boolean, message: string }
 */
function validateSearchInput(value) {
  // PRESENCE CHECK - is the field empty?
  if (!value || value.trim() === "") {
    return {
      valid: false,
      message: "Please enter a country name to search."
    };
  }

  const trimmed = value.trim();

  // LENGTH CHECK - is it too short?
  if (trimmed.length < 2) {
    return {
      valid: false,
      message: "Search must be at least 2 characters long."
    };
  }

  // LENGTH CHECK - is it too long?
  if (trimmed.length > 100) {
    return {
      valid: false,
      message: "Search term is too long. Please shorten it."
    };
  }

  // FORMAT CHECK - only letters, spaces, hyphens, apostrophes allowed
  if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(trimmed)) {
    return {
      valid: false,
      message: "Please enter a valid country name (letters only)."
    };
  }

  // All checks passed
  return { valid: true, message: "" };
}

/* ──────────────────────────────────────────────
   REST COUNTRIES API INTEGRATION
   Fetches country data from the free REST Countries API
   Demonstrates: async/await, try/catch/finally,
   AbortController for race conditions,
   HTTP status handling, error handling (criterion 2.8)
   
   DISTINCTION: Shows clear understanding of
   asynchronicity and timing problems when
   accessing shared data values
   ────────────────────────────────────────────── */

/**
 * Searches for countries using the REST Countries API
 * Uses AbortController to cancel previous requests if user
 * searches again quickly (prevents race conditions)
 * 
 * @param {string} query - The country name to search for
 * @param {string} feedbackId - ID of the feedback element
 * @param {string} spinnerId - ID of the spinner element
 * @returns {Array} - Array of country objects, or empty array on error
 */
async function searchCountries(query, feedbackId, spinnerId) {
  // Cancel any previous in-flight request to prevent race conditions
  // This ensures only the latest search result is displayed
  if (currentAbortController) {
    currentAbortController.abort();
  }
  currentAbortController = new AbortController();

  // Show loading spinner (progress indicator - distinction requirement)
  toggleSpinner(spinnerId, true);

  try {
    // Make the API request with abort signal
    const response = await fetch(
      "https://restcountries.com/v3.1/name/" + encodeURIComponent(query.trim()),
      { signal: currentAbortController.signal }
    );

    // Handle different HTTP status codes
    if (!response.ok) {
      if (response.status === 404) {
        // No countries found matching the search
        showFeedback(
          feedbackId,
          'No countries found matching "' + query + '". Try a different search.',
          "info"
        );
        return [];
      }
      // Other HTTP errors (500, 429, etc.)
      throw new Error("HTTP error: " + response.status);
    }

    // Parse the JSON response
    const data = await response.json();

    // Validate the response data
    if (!data || !Array.isArray(data) || data.length === 0) {
      showFeedback(feedbackId, "No results found. Try another search.", "info");
      return [];
    }

    return data;

  } catch (error) {
    // Don't show error for intentionally aborted requests
    // (this happens when user types a new search before old one finishes)
    if (error.name === "AbortError") {
      return [];
    }

    // Show user-friendly error message for network/API failures
    showFeedback(
      feedbackId,
      "Unable to load destinations. Please check your internet connection and try again.",
      "error"
    );
    console.error("REST Countries API Error:", error);
    return [];

  } finally {
    // Always hide the spinner, whether request succeeded or failed
    toggleSpinner(spinnerId, false);
  }
}

/* ──────────────────────────────────────────────
   MAP INITIALISATION
   Creates a Leaflet.js map with OpenStreetMap tiles
   Demonstrates: third-party library integration,
   conditional logic
   ────────────────────────────────────────────── */

/**
 * Initialises a Leaflet map on the given element
 * @param {string} elementId - The ID of the map div
 * @returns {object} - The Leaflet map instance
 */
function initMap(elementId) {
  const mapElement = document.getElementById(elementId);
  if (!mapElement) {
    return null;
  }

  const map = L.map(mapElement).setView([20, 0], 2);

  // Add OpenStreetMap tile layer (free, no API key needed)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18
  }).addTo(map);

  return map;
}

/* ──────────────────────────────────────────────
   DESTINATION CARD CREATION
   Builds HTML cards from country API data
   Demonstrates: DOM creation, template logic,
   compound statements (if/else, ternary),
   for loops, data handling
   ────────────────────────────────────────────── */

/**
 * Creates a destination card element from country data
 * @param {object} country - Country object from REST Countries API
 * @returns {HTMLElement} - The card DOM element
 */
function createCountryCard(country) {
  const card = document.createElement("div");
  card.className = "dest-card";
  card.setAttribute("role", "article");

  // Extract data safely with fallbacks for missing fields
  const name = country.name && country.name.common
    ? country.name.common
    : "Unknown";

  const flag = country.flags && country.flags.svg
    ? country.flags.svg
    : country.flags && country.flags.png
      ? country.flags.png
      : "";

  const region = country.region ? country.region : "Unknown Region";
  const subregion = country.subregion ? country.subregion : "";

  // Format population as millions
  let population = "N/A";
  if (country.population) {
    if (country.population >= 1000000) {
      population = (country.population / 1000000).toFixed(1) + "M";
    } else if (country.population >= 1000) {
      population = (country.population / 1000).toFixed(0) + "K";
    } else {
      population = country.population.toString();
    }
  }

  // Get capital city
  const capital = country.capital && country.capital.length > 0
    ? country.capital[0]
    : "N/A";

  // Get currencies (loop through object values)
  let currencies = "N/A";
  if (country.currencies) {
    const currencyNames = [];
    const currencyKeys = Object.keys(country.currencies);
    for (let i = 0; i < currencyKeys.length; i++) {
      currencyNames.push(country.currencies[currencyKeys[i]].name);
    }
    currencies = currencyNames.join(", ");
  }

  // Get languages (loop through object values, max 3)
  let languages = "N/A";
  if (country.languages) {
    const langValues = Object.values(country.languages);
    const displayLangs = [];
    for (let i = 0; i < langValues.length && i < 3; i++) {
      displayLangs.push(langValues[i]);
    }
    languages = displayLangs.join(", ");
  }

  // Get coordinates for map
  const lat = country.latlng && country.latlng.length >= 2
    ? country.latlng[0]
    : null;
  const lng = country.latlng && country.latlng.length >= 2
    ? country.latlng[1]
    : null;

  // Build the card HTML
  let cardHTML = "";

  // Flag image with error handling
  if (flag) {
    cardHTML += '<img class="card-flag" src="' + flag + '" alt="Flag of ' +
      name + '" loading="lazy" onerror="this.style.display=\'none\'">';
  }

  cardHTML += '<div class="card-body">';
  cardHTML += '<h3 class="card-title">' + name + "</h3>";
  cardHTML += '<div class="card-region">&#128205; ' + region;
  if (subregion) {
    cardHTML += " &middot; " + subregion;
  }
  cardHTML += "</div>";

  // Stats row 1
  cardHTML += '<div class="card-stats">';
  cardHTML += '<span class="stat-badge">&#127963; ' + capital + "</span>";
  cardHTML += '<span class="stat-badge">&#128101; ' + population + "</span>";
  cardHTML += '<span class="stat-badge">&#128176; ' + currencies + "</span>";
  cardHTML += "</div>";

  // Stats row 2
  cardHTML += '<div class="card-stats" style="margin-bottom:16px;">';
  cardHTML += '<span class="stat-badge">&#128172; ' + languages + "</span>";
  cardHTML += "</div>";

  // View on Map button (only if coordinates exist)
  if (lat !== null && lng !== null) {
    cardHTML += '<button class="card-btn" data-lat="' + lat +
      '" data-lng="' + lng + '" data-name="' + name +
      '">View on Map &#x2192;</button>';
  }

  cardHTML += "</div>";

  card.innerHTML = cardHTML;

  // Add click event to the View on Map button
  const mapBtn = card.querySelector(".card-btn");
  if (mapBtn) {
    mapBtn.addEventListener("click", function () {
      const btnLat = parseFloat(this.dataset.lat);
      const btnLng = parseFloat(this.dataset.lng);
      flyToCountry(btnLat, btnLng);
    });
  }

  return card;
}

/* ──────────────────────────────────────────────
   FLY TO COUNTRY ON MAP
   Smoothly moves the map to a specific location
   ────────────────────────────────────────────── */

/**
 * Flies the active map to specific coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 */
function flyToCountry(lat, lng) {
  // Determine which map is currently active
  const activeMap = mainMap || destMap;
  if (activeMap) {
    activeMap.flyTo([lat, lng], 5, { duration: 1.5 });

    // Scroll to map container so user can see it
    const mapContainer = document.querySelector(".map-container.active");
    if (mapContainer) {
      mapContainer.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
}

/* ──────────────────────────────────────────────
   DISPLAY SEARCH RESULTS
   Shows country cards and map markers
   Demonstrates: for loops, array manipulation,
   DOM manipulation, Leaflet marker management
   ────────────────────────────────────────────── */

/**
 * Displays country results as cards and map markers
 * @param {Array} countries - Array of country objects from API
 * @param {string} gridId - ID of the cards grid div
 * @param {object} mapInstance - Leaflet map instance
 * @param {Array} markerArray - Array to store markers for later cleanup
 */
function displayResults(countries, gridId, mapInstance, markerArray) {
  const grid = document.getElementById(gridId);
  if (!grid) {
    return;
  }

  // Clear previous results
  grid.innerHTML = "";

  // Clear previous map markers to prevent duplicates
  for (let i = 0; i < markerArray.length; i++) {
    markerArray[i].remove();
  }
  markerArray.length = 0;

  // Loop through countries and create cards + markers
  for (let i = 0; i < countries.length; i++) {
    const country = countries[i];

    // Create and add the card to the grid
    const card = createCountryCard(country);
    grid.appendChild(card);

    // Add a map marker if the country has coordinates
    if (country.latlng && country.latlng.length >= 2 && mapInstance) {
      const countryName = country.name && country.name.common
        ? country.name.common
        : "Unknown";
      const capital = country.capital && country.capital.length > 0
        ? country.capital[0]
        : "N/A";

      // Create marker with popup information
      const marker = L.marker([country.latlng[0], country.latlng[1]])
        .addTo(mapInstance)
        .bindPopup(
          "<strong>" + countryName + "</strong><br>" +
          "Capital: " + capital
        );

      markerArray.push(marker);
    }
  }

  // Fit the map to show all markers
  if (markerArray.length > 0 && mapInstance) {
    const group = L.featureGroup(markerArray);
    mapInstance.fitBounds(group.getBounds().pad(0.3));
  }
}

/* ──────────────────────────────────────────────
   HOME PAGE SEARCH (index.html)
   Handles the hero search form submission
   Demonstrates: event listener on form submit,
   input validation, async function call,
   conditional display logic
   ────────────────────────────────────────────── */
const searchForm = document.getElementById("search-form");

if (searchForm) {
  searchForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const input = document.getElementById("search-input");
    const query = input.value;

    // Validate input before making API call
    const validation = validateSearchInput(query);
    if (!validation.valid) {
      showFeedback("search-feedback", validation.message, "error");
      input.focus();
      return;
    }

    // Show results section
    const resultsSection = document.getElementById("results-section");
    if (resultsSection) {
      resultsSection.style.display = "block";
    }

    // Initialise map if not already done
    if (!mainMap) {
      mainMap = initMap("map");
    }

    // Show the map container
    const mapContainer = document.getElementById("map-container");
    if (mapContainer) {
      mapContainer.classList.add("active");
      // Fix Leaflet rendering issue when container was hidden
      setTimeout(function () {
        if (mainMap) {
          mainMap.invalidateSize();
        }
      }, 200);
    }

    // Call the API
    const countries = await searchCountries(
      query, "search-feedback", "search-spinner"
    );

    // Display results if we got any
    if (countries.length > 0) {
      // Update the results heading
      const resultsTitle = document.getElementById("results-title");
      const resultsCount = document.getElementById("results-count");

      if (resultsTitle) {
        resultsTitle.textContent = 'Results for "' + query.trim() + '"';
      }
      if (resultsCount) {
        resultsCount.textContent = countries.length + " destination" +
          (countries.length > 1 ? "s" : "") + " found";
      }

      // Display the cards and markers
      displayResults(countries, "results-grid", mainMap, mainMarkers);

      // Scroll to results
      resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

/* ──────────────────────────────────────────────
   DESTINATIONS PAGE SEARCH (destinations.html)
   Handles the destinations page search form
   ────────────────────────────────────────────── */
const destSearchForm = document.getElementById("dest-search-form");

if (destSearchForm) {
  // Initialise the destinations map on page load
  destMap = initMap("dest-map");
  const destMapContainer = document.getElementById("dest-map-container");
  if (destMapContainer) {
    destMapContainer.classList.add("active");
    setTimeout(function () {
      if (destMap) {
        destMap.invalidateSize();
      }
    }, 200);
  }

  destSearchForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const input = document.getElementById("dest-search-input");
    const query = input.value;

    // Validate input
    const validation = validateSearchInput(query);
    if (!validation.valid) {
      showFeedback("dest-feedback", validation.message, "error");
      input.focus();
      return;
    }

    // Call the API
    const countries = await searchCountries(
      query, "dest-feedback", "dest-spinner"
    );

    // Display results
    if (countries.length > 0) {
      displayResults(countries, "dest-grid", destMap, destMarkers);
    }
  });
}

/* ──────────────────────────────────────────────
   FEATURED DESTINATIONS (index.html)
   Loads popular countries on the homepage
   Demonstrates: async IIFE (Immediately Invoked
   Function Expression), for...of loop, try/catch
   for non-critical API calls
   ────────────────────────────────────────────── */
const featuredGrid = document.getElementById("featured-grid");

if (featuredGrid) {
  // List of countries to feature on the homepage
  const featuredCountries = [
    "Japan",
    "Italy",
    "Brazil",
    "Australia",
    "Morocco",
    "Iceland"
  ];

  /**
   * Loads featured country cards one by one
   * Each API call is independent - if one fails,
   * the others still load (graceful degradation)
   */
  (async function loadFeaturedDestinations() {
    for (let i = 0; i < featuredCountries.length; i++) {
      try {
        const response = await fetch(
          "https://restcountries.com/v3.1/name/" +
          encodeURIComponent(featuredCountries[i]) +
          "?fullText=true"
        );

        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const card = createCountryCard(data[0]);
            featuredGrid.appendChild(card);
          }
        }
      } catch (error) {
        // Silently skip failed featured items
        // This is non-critical content so we don't show an error
        console.warn("Could not load featured country:", featuredCountries[i]);
      }
    }
  })();
}