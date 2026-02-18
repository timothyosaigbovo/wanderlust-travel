/* ══════════════════════════════════════════════
   contact.js - Contact Form Handler
   Wanderlust Travel - Holiday Destination Finder
   
   This file handles:
   - Contact form validation (name, email, message)
   - Form submission with EmailJS
   - User feedback messages
   - Field-level error display and clearing
   
   Demonstrates: input validation (presence, format,
   range checks), event listeners, DOM manipulation,
   compound statements, error handling
   ══════════════════════════════════════════════ */

/* ──────────────────────────────────────────────
   EMAILJS INITIALISATION
   Replace the public key below with your own from
   emailjs.com > Account > Public Key
   ────────────────────────────────────────────── */

// Uncomment the line below and add your EmailJS public key when ready
// emailjs.init("YOUR_PUBLIC_KEY_HERE");

/* ──────────────────────────────────────────────
   FORM VALIDATION FUNCTIONS
   Each function validates one field and returns
   true (valid) or false (invalid)
   Demonstrates: compound statements, presence check,
   length check, format check (criterion 2.3)
   ────────────────────────────────────────────── */

/**
 * Validates the name field
 * Checks: not empty, at least 2 characters
 * @param {string} value - The name input value
 * @returns {boolean} - True if valid
 */
function validateName(value) {
  if (!value || value.trim() === "") {
    return false;
  }
  if (value.trim().length < 2) {
    return false;
  }
  return true;
}

/**
 * Validates the email field
 * Checks: not empty, matches email format
 * @param {string} value - The email input value
 * @returns {boolean} - True if valid
 */
function validateEmail(value) {
  if (!value || value.trim() === "") {
    return false;
  }
  // Email format check using regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value.trim())) {
    return false;
  }
  return true;
}

/**
 * Validates the message field
 * Checks: not empty, at least 10 characters
 * @param {string} value - The message textarea value
 * @returns {boolean} - True if valid
 */
function validateMessage(value) {
  if (!value || value.trim() === "") {
    return false;
  }
  if (value.trim().length < 10) {
    return false;
  }
  return true;
}

/* ──────────────────────────────────────────────
   SHOW/HIDE FIELD ERRORS
   Shows or hides the error message under each field
   and adds/removes the red border styling
   ────────────────────────────────────────────── */

/**
 * Shows an error on a specific form field
 * @param {HTMLElement} inputEl - The input/textarea element
 * @param {string} errorId - The ID of the error span
 */
function showFieldError(inputEl, errorId) {
  inputEl.classList.add("invalid");
  const errorEl = document.getElementById(errorId);
  if (errorEl) {
    errorEl.classList.add("visible");
  }
}

/**
 * Hides the error on a specific form field
 * @param {HTMLElement} inputEl - The input/textarea element
 * @param {string} errorId - The ID of the error span
 */
function hideFieldError(inputEl, errorId) {
  inputEl.classList.remove("invalid");
  const errorEl = document.getElementById(errorId);
  if (errorEl) {
    errorEl.classList.remove("visible");
  }
}

/* ──────────────────────────────────────────────
   CONTACT FORM SUBMISSION
   Validates all fields, then sends via EmailJS
   Demonstrates: event listener, compound statements
   (multiple if checks), DOM manipulation,
   loading states, user feedback
   ────────────────────────────────────────────── */
const contactForm = document.getElementById("contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Get form field elements
    const nameInput = document.getElementById("contact-name");
    const emailInput = document.getElementById("contact-email");
    const messageInput = document.getElementById("contact-message");
    const submitBtn = document.getElementById("contact-submit");
    const feedbackDiv = document.getElementById("contact-feedback");

    let isFormValid = true;

    // ── Validate Name ──
    if (!validateName(nameInput.value)) {
      showFieldError(nameInput, "name-error");
      isFormValid = false;
    } else {
      hideFieldError(nameInput, "name-error");
    }

    // ── Validate Email ──
    if (!validateEmail(emailInput.value)) {
      showFieldError(emailInput, "email-error");
      isFormValid = false;
    } else {
      hideFieldError(emailInput, "email-error");
    }

    // ── Validate Message ──
    if (!validateMessage(messageInput.value)) {
      showFieldError(messageInput, "message-error");
      isFormValid = false;
    } else {
      hideFieldError(messageInput, "message-error");
    }

    // Stop if any field is invalid
    if (!isFormValid) {
      return;
    }

    // ── Show loading state ──
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    // ── Send email using EmailJS ──
    // NOTE: To enable real email sending:
    // 1. Sign up at emailjs.com
    // 2. Uncomment emailjs.init() at the top of this file
    // 3. Replace the service ID, template ID below
    // 4. Uncomment the emailjs.send() block below
    // 5. Remove the setTimeout simulation block

    /*
    emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
      from_name: nameInput.value.trim(),
      from_email: emailInput.value.trim(),
      message: messageInput.value.trim()
    }).then(
      function(response) {
        // SUCCESS
        feedbackDiv.className = "form-feedback success";
        feedbackDiv.textContent = "Thank you! Your message has been sent. We'll get back to you within 24 hours.";
        contactForm.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message \u2192";
      },
      function(error) {
        // FAILURE
        feedbackDiv.className = "form-feedback error";
        feedbackDiv.textContent = "Sorry, something went wrong. Please try again or email us directly.";
        console.error("EmailJS Error:", error);
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message \u2192";
      }
    );
    */

    // ── Simulated sending (remove this when EmailJS is set up) ──
    setTimeout(function () {
      feedbackDiv.className = "form-feedback success";
      feedbackDiv.textContent =
        "Thank you! Your message has been sent. We'll get back to you within 24 hours.";

      // Reset the form
      contactForm.reset();

      // Clear any remaining error styles
      hideFieldError(nameInput, "name-error");
      hideFieldError(emailInput, "email-error");
      hideFieldError(messageInput, "message-error");

      // Re-enable the button
      submitBtn.disabled = false;
      submitBtn.textContent = "Send Message \u2192";

      // Auto-hide success message after 8 seconds
      setTimeout(function () {
        feedbackDiv.className = "form-feedback";
        feedbackDiv.textContent = "";
      }, 8000);
    }, 1500);
  });
}

/* ──────────────────────────────────────────────
   CLEAR ERRORS ON INPUT
   When the user starts typing in a field, the
   error message for that field disappears
   Demonstrates: forEach loop, event listeners,
   DOM manipulation for better user experience
   ────────────────────────────────────────────── */
const formFields = [
  { inputId: "contact-name", errorId: "name-error" },
  { inputId: "contact-email", errorId: "email-error" },
  { inputId: "contact-message", errorId: "message-error" }
];

for (let i = 0; i < formFields.length; i++) {
  const field = formFields[i];
  const inputEl = document.getElementById(field.inputId);

  if (inputEl) {
    inputEl.addEventListener("input", function () {
      hideFieldError(this, field.errorId);
    });
  }
}