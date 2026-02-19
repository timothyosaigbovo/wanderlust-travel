/* jshint esversion: 8, browser: true */
/* global displayResults, destMap, destMarkers, mainMap, mainMarkers, createCountryCard */
/* ══════════════════════════════════════════════
   features.js - Enhanced Features Module
   Wanderlust Travel - Holiday Destination Finder

   This file handles:
   - Region filtering (browse countries by continent)
   - Sort results (by name or population)
   - Favourites (save countries with localStorage)

   Demonstrates: DOM manipulation, event listeners,
   async/await, localStorage, array methods,
   compound statements, accessibility (ARIA)
   ══════════════════════════════════════════════ */

/* ──────────────────────────────────────────────
   GLOBAL VARIABLES
   ────────────────────────────────────────────── */

/** Stores the currently displayed country results for sorting */
let currentDisplayedResults = [];

/** Stores the current context (gridId, map, markers) for re-rendering */
let currentDisplayContext = {
  gridId: "dest-grid",
  mapInstance: null,
  markerArray: null
};

/* ──────────────────────────────────────────────
   FEATURE 1: REGION FILTERING
   Fetches countries by continent from the
   REST Countries API region endpoint
   Demonstrates: async/await, fetch API,
   DOM manipulation, aria-pressed
   ────────────────────────────────────────────── */

/**
 * Fetch and display countries filtered by region
 * @param {string} region - Region name (e.g. "Africa") or "all"
 */
async function filterByRegion(region) {
  const grid = document.getElementById("dest-grid");

  if (!grid) {
    return;
  }

  // Show loading state
  grid.innerHTML =
    '<div class="spinner active" role="status" aria-label="Loading countries"></div>';

  // Store display context for sorting
  currentDisplayContext.gridId = "dest-grid";
  currentDisplayContext.mapInstance = destMap;
  currentDisplayContext.markerArray = destMarkers;

  try {
    // Build the API URL based on selected region
    let url;
    if (region === "all") {
      url = "https://restcountries.com/v3.1/all";
    } else {
      url = "https://restcountries.com/v3.1/region/" + region;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("API request failed with status " + response.status);
    }

    let data = await response.json();

    // Sort alphabetically by default
    data.sort(function (a, b) {
      return a.name.common.localeCompare(b.name.common);
    });

    // Limit "all" results to prevent overwhelming the page
    if (region === "all") {
      data = data.slice(0, 30);
    }

    // Store results for sorting
    currentDisplayedResults = data;

    // Display using the existing displayResults function from script.js
    displayResults(data, "dest-grid", destMap, destMarkers);

    // Reset sort dropdown to default
    const sortSelect = document.getElementById("sort-select");
    if (sortSelect) {
      sortSelect.value = "name-asc";
    }

    // Announce results count to screen readers
    announceResultsCount(data.length, region);

  } catch (error) {
    console.error("Error filtering by region:", error);
    grid.innerHTML =
      '<p class="feedback error" style="display:block;" role="alert">' +
      "Failed to load countries. Please try again.</p>";
  }
}

/**
 * Announce results count for screen readers
 * @param {number} count - Number of results
 * @param {string} region - Region name or "all"
 */
function announceResultsCount(count, region) {
  let announceEl = document.getElementById("filter-results-count");

  if (!announceEl) {
    announceEl = document.createElement("p");
    announceEl.id = "filter-results-count";
    announceEl.className = "sr-only";
    announceEl.setAttribute("aria-live", "polite");
    const grid = document.getElementById("dest-grid");
    if (grid) {
      grid.parentNode.insertBefore(announceEl, grid);
    }
  }

  if (region !== "all") {
    announceEl.textContent = "Showing " + count + " countries in " + region;
  } else {
    announceEl.textContent = "Showing " + count + " countries";
  }
}

/**
 * Initialise region filter button event listeners
 */
function initRegionFilters() {
  const filterButtons = document.querySelectorAll(".filter-btn");

  if (filterButtons.length === 0) {
    return;
  }

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      // Remove active state from all buttons
      filterButtons.forEach(function (b) {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });

      // Set clicked button as active
      this.classList.add("active");
      this.setAttribute("aria-pressed", "true");

      // Fetch and display results for selected region
      filterByRegion(this.dataset.region);
    });
  });
}

/* ──────────────────────────────────────────────
   FEATURE 2: SORT RESULTS
   Sorts the currently displayed country results
   by name or population
   Demonstrates: array sorting, spread operator,
   compound statements (switch), event listener
   ────────────────────────────────────────────── */

/**
 * Sort the currently displayed country results
 * @param {string} sortBy - Sort criteria (name-asc, name-desc, pop-desc, pop-asc)
 */
function sortResults(sortBy) {
  if (currentDisplayedResults.length === 0) {
    return;
  }

  // Create a copy to avoid mutating the original array
  const sorted = currentDisplayedResults.slice();

  switch (sortBy) {
    case "name-asc":
      sorted.sort(function (a, b) {
        return a.name.common.localeCompare(b.name.common);
      });
      break;
    case "name-desc":
      sorted.sort(function (a, b) {
        return b.name.common.localeCompare(a.name.common);
      });
      break;
    case "pop-desc":
      sorted.sort(function (a, b) {
        return (b.population || 0) - (a.population || 0);
      });
      break;
    case "pop-asc":
      sorted.sort(function (a, b) {
        return (a.population || 0) - (b.population || 0);
      });
      break;
    default:
      return;
  }

  // Re-render results using existing function
  displayResults(
    sorted,
    currentDisplayContext.gridId,
    currentDisplayContext.mapInstance,
    currentDisplayContext.markerArray
  );
}

/**
 * Initialise sort dropdown event listener
 */
function initSortControls() {
  const sortSelect = document.getElementById("sort-select");

  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      sortResults(this.value);
    });
  }
}

/* ──────────────────────────────────────────────
   FEATURE 3: FAVOURITES (LocalStorage)
   Saves favourite countries to the browser
   Demonstrates: localStorage, JSON parse/stringify,
   event delegation, DOM manipulation, compound
   statements (if/else), accessibility (aria-label)
   ────────────────────────────────────────────── */

/** LocalStorage key for favourites */
var FAVOURITES_KEY = "wanderlust-favourites";

/**
 * Retrieve saved favourite country names from localStorage
 * @returns {Array} Array of favourite country names
 */
function getFavourites() {
  try {
    return JSON.parse(localStorage.getItem(FAVOURITES_KEY)) || [];
  } catch (error) {
    console.error("Error reading favourites:", error);
    return [];
  }
}

/**
 * Save the favourites array to localStorage
 * @param {Array} favs - Array of country names
 */
function saveFavourites(favs) {
  try {
    localStorage.setItem(FAVOURITES_KEY, JSON.stringify(favs));
  } catch (error) {
    console.error("Error saving favourites:", error);
  }
}

/**
 * Check if a country is currently in the favourites list
 * @param {string} countryName - The country name to check
 * @returns {boolean} True if the country is a favourite
 */
function isFavourite(countryName) {
  return getFavourites().indexOf(countryName) !== -1;
}

/**
 * Toggle a country in or out of the favourites list
 * @param {string} countryName - The country name to toggle
 * @param {HTMLElement} btn - The favourite button element
 */
function toggleFavourite(countryName, btn) {
  var favs = getFavourites();
  var index = favs.indexOf(countryName);

  if (index !== -1) {
    // Remove from favourites
    favs.splice(index, 1);
    btn.innerHTML = "&#9825;";
    btn.classList.remove("favourited");
    btn.setAttribute("aria-label", "Save " + countryName + " to favourites");
    btn.setAttribute("title", "Save to favourites");
  } else {
    // Add to favourites
    favs.push(countryName);
    btn.innerHTML = "&#9829;";
    btn.classList.add("favourited");
    btn.setAttribute("aria-label", "Remove " + countryName + " from favourites");
    btn.setAttribute("title", "Remove from favourites");
  }

  saveFavourites(favs);
}

/**
 * Create a favourite (heart) button for a country card
 * @param {string} countryName - The country name
 * @returns {HTMLElement} The favourite button element
 */
function createFavButton(countryName) {
  var favBtn = document.createElement("button");
  favBtn.className = "fav-btn";
  favBtn.type = "button";

  if (isFavourite(countryName)) {
    favBtn.innerHTML = "&#9829;";
    favBtn.classList.add("favourited");
    favBtn.setAttribute("aria-label", "Remove " + countryName + " from favourites");
    favBtn.setAttribute("title", "Remove from favourites");
  } else {
    favBtn.innerHTML = "&#9825;";
    favBtn.setAttribute("aria-label", "Save " + countryName + " to favourites");
    favBtn.setAttribute("title", "Save to favourites");
  }

  favBtn.addEventListener("click", function (event) {
    event.stopPropagation();
    event.preventDefault();
    toggleFavourite(countryName, favBtn);
  });

  return favBtn;
}

/* ──────────────────────────────────────────────
   INITIALISATION
   ────────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", function () {
  initRegionFilters();
  initSortControls();
});