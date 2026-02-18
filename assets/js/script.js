/* ──────────────────────────────────────────
   script.js - Main application logic
   Navigation, search, API, map, results
   ────────────────────────────────────────── */

// ── GLOBAL STATE ──
let mainMap = null;
let destMap = null;
let markers = [];
let destMarkers = [];
let currentAbortController = null;

// ── SPA NAVIGATION ──
function navigateTo(pageId) {
  document.querySelectorAll('.page-section').forEach(section => {
    section.classList.remove('active');
  });

  const target = document.getElementById('page-' + pageId);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.page === pageId) link.classList.add('active');
  });

  document.querySelector('.nav-links').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (pageId === 'destinations' && !destMap) {
    setTimeout(() => initDestMap(), 100);
  }
}

// Navigation listeners
document.querySelectorAll('[data-page]').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    navigateTo(this.dataset.page);
  });
});

// Hamburger
document.querySelector('.hamburger').addEventListener('click', function () {
  const nav = document.querySelector('.nav-links');
  const isOpen = nav.classList.toggle('open');
  this.setAttribute('aria-expanded', isOpen);
});

// ── FEEDBACK SYSTEM ──
function showFeedback(elementId, message, type) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.className = 'feedback ' + type;
  setTimeout(() => { el.className = 'feedback'; }, 5000);
}

function toggleSpinner(spinnerId, show) {
  const spinner = document.getElementById(spinnerId);
  if (spinner) spinner.classList.toggle('active', show);
}

// ── INPUT VALIDATION ──
function validateSearchInput(value) {
  if (!value || value.trim() === '') {
    return { valid: false, message: 'Please enter a country name to search.' };
  }

  const trimmed = value.trim();

  if (trimmed.length < 2) {
    return { valid: false, message: 'Search must be at least 2 characters long.' };
  }

  if (trimmed.length > 100) {
    return { valid: false, message: 'Search term is too long.' };
  }

  if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(trimmed)) {
    return { valid: false, message: 'Please enter a valid country name (letters only).' };
  }

  return { valid: true, message: '' };
}

// ── API SEARCH ──
async function searchCountries(query, feedbackId, spinnerId) {
  if (currentAbortController) currentAbortController.abort();
  currentAbortController = new AbortController();

  toggleSpinner(spinnerId, true);

  try {
    const response = await fetch(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(query.trim())}`,
      { signal: currentAbortController.signal }
    );

    if (!response.ok) {
      if (response.status === 404) {
        showFeedback(feedbackId, 'No countries found.', 'info');
        return [];
      }
      throw new Error('HTTP error');
    }

    return await response.json();
  } catch (error) {
    if (error.name !== 'AbortError') {
      showFeedback(feedbackId, 'Error loading destinations.', 'error');
      console.error(error);
    }
    return [];
  } finally {
    toggleSpinner(spinnerId, false);
  }
}

// ── CREATE CARD ──
function createCountryCard(country) {
  const card = document.createElement('div');
  card.className = 'dest-card';

  const name = country.name?.common || 'Unknown';
  const flag = country.flags?.svg || '';
  const region = country.region || 'Unknown';
  const population = country.population
    ? (country.population / 1000000).toFixed(1) + 'M'
    : 'N/A';

  card.innerHTML = `
    <img class="card-flag" src="${flag}" alt="${name}">
    <div class="card-body">
      <h3 class="card-title">${name}</h3>
      <div class="card-region">${region}</div>
      <div class="card-stats">
        <span class="stat-badge">👥 ${population}</span>
      </div>
    </div>
  `;

  return card;
}

// ── DISPLAY RESULTS ──
function displayResults(countries, gridId, mapInstance, markerArray) {
  const grid = document.getElementById(gridId);
  grid.innerHTML = '';

  markerArray.forEach(m => m.remove());
  markerArray.length = 0;

  countries.forEach(country => {
    grid.appendChild(createCountryCard(country));

    if (country.latlng && mapInstance) {
      const marker = L.marker(country.latlng).addTo(mapInstance);
      markerArray.push(marker);
    }
  });

  if (markerArray.length > 0 && mapInstance) {
    const group = L.featureGroup(markerArray);
    mapInstance.fitBounds(group.getBounds().pad(0.3));
  }
}

// ── HOME SEARCH ──
document.getElementById('search-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const input = document.getElementById('search-input');
  const validation = validateSearchInput(input.value);

  if (!validation.valid) {
    showFeedback('search-feedback', validation.message, 'error');
    return;
  }

  document.getElementById('results-container').style.display = 'block';

  if (!mainMap) {
    mainMap = L.map('map').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
      .addTo(mainMap);
  }

  document.getElementById('map-wrapper').classList.add('active');

  const countries = await searchCountries(input.value, 'search-feedback', 'search-spinner');

  if (countries.length > 0) {
    displayResults(countries, 'results-grid', mainMap, markers);
  }
});

// ── DESTINATION PAGE MAP ──
function initDestMap() {
  if (destMap) return;

  destMap = L.map('dest-map').setView([20, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
    .addTo(destMap);

  document.getElementById('dest-map-wrapper').classList.add('active');
}

// ── FEATURED DESTINATIONS ──
(async function loadFeatured() {
  const featured = ['Japan', 'Italy', 'Brazil', 'Australia'];
  const grid = document.getElementById('featured-grid');

  for (const name of featured) {
    try {
      const res = await fetch(
        'https://restcountries.com/v3.1/name/' + encodeURIComponent(name) + '?fullText=true'
      );
      if (res.ok) {
        const data = await res.json();
        grid.appendChild(createCountryCard(data[0]));
      }
    } catch (err) {
      console.warn(err);
    }
  }
})();

// ── BACK TO TOP ──
const backTopBtn = document.querySelector('.back-top');
window.addEventListener('scroll', () => {
  backTopBtn.classList.toggle('visible', window.scrollY > 400);
});

backTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});