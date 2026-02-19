/**
 * Contact Form - EmailJS Integration
 * Handles form validation and sends emails via EmailJS service
 * 
 * SETUP: The EmailJS SDK must be loaded in contact.html BEFORE this script:
 * <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
 */

// Initialise EmailJS with your public key (required before calling emailjs.send)
emailjs.init("57Rl-B5dwSLLzFLTb");

// Wait for DOM to load before attaching listeners
document.addEventListener("DOMContentLoaded", function () {
    const contactForm = document.getElementById("contact-form");

    if (contactForm) {
        contactForm.addEventListener("submit", handleFormSubmit);
    }

    // Clear inline errors when user starts typing
    const inputs = document.querySelectorAll("#contact-form input, #contact-form textarea");
    inputs.forEach(function (input) {
        input.addEventListener("input", function () {
            clearFieldError(this);
        });
    });
});

/**
 * Main form submission handler
 * Validates all fields, then sends email via EmailJS
 * @param {Event} event - The form submit event
 */
function handleFormSubmit(event) {
    event.preventDefault();

    // Get form field values
    const nameField = document.getElementById("name");
    const emailField = document.getElementById("email");
    const messageField = document.getElementById("message");
    const submitBtn = document.querySelector("#contact-form button[type='submit']");

    const nameValue = nameField.value.trim();
    const emailValue = emailField.value.trim();
    const messageValue = messageField.value.trim();

    // Clear previous errors
    clearAllErrors();

    // Validate all fields
    let isValid = true;

    if (nameValue.length < 2) {
        showFieldError(nameField, "Please enter your name (at least 2 characters).");
        isValid = false;
    }

    if (!isValidEmail(emailValue)) {
        showFieldError(emailField, "Please enter a valid email address.");
        isValid = false;
    }

    if (messageValue.length < 10) {
        showFieldError(messageField, "Please enter a message (at least 10 characters).");
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    submitBtn.setAttribute("aria-busy", "true");

    // Send email via EmailJS
    emailjs.send(
        "service_glmo4mi",
        "template_j1pj3lw",
        {
            from_name: nameValue,
            from_email: emailValue,
            message: messageValue
        }
    ).then(
        function (response) {
            // Success
            console.log("Email sent successfully!", response.status, response.text);
            showFormFeedback(
                "Thank you! Your message has been sent successfully. We will be in touch soon.",
                "success"
            );
            document.getElementById("contact-form").reset();
            clearAllErrors();
        },
        function (error) {
            // Error
            console.error("Failed to send email:", error);
            showFormFeedback(
                "Sorry, something went wrong. Please try again later.",
                "error"
            );
        }
    ).finally(function () {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message";
        submitBtn.removeAttribute("aria-busy");
    });
}

/**
 * Validate email format using regex
 * @param {string} email - The email string to validate
 * @returns {boolean} True if valid email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Show an inline error message under a form field
 * @param {HTMLElement} field - The input/textarea element
 * @param {string} message - The error message to display
 */
function showFieldError(field, message) {
    // Remove existing error for this field if any
    clearFieldError(field);

    // Create error element
    const errorEl = document.createElement("p");
    errorEl.classList.add("field-error");
    errorEl.setAttribute("role", "alert");
    errorEl.textContent = message;

    // Add error class to the field for styling
    field.classList.add("input-error");

    // Insert error message after the field
    field.parentNode.insertBefore(errorEl, field.nextSibling);
}

/**
 * Clear error message for a specific field
 * @param {HTMLElement} field - The input/textarea element
 */
function clearFieldError(field) {
    field.classList.remove("input-error");
    const existingError = field.parentNode.querySelector(".field-error");
    if (existingError) {
        existingError.remove();
    }
}

/**
 * Clear all error messages on the form
 */
function clearAllErrors() {
    const errors = document.querySelectorAll(".field-error");
    errors.forEach(function (el) {
        el.remove();
    });
    const errorFields = document.querySelectorAll(".input-error");
    errorFields.forEach(function (el) {
        el.classList.remove("input-error");
    });
}

/**
 * Display a feedback message above or below the form
 * @param {string} message - The feedback text
 * @param {string} type - "success" or "error"
 */
function showFormFeedback(message, type) {
    // Remove any existing feedback
    const existingFeedback = document.getElementById("form-feedback");
    if (existingFeedback) {
        existingFeedback.remove();
    }

    // Create feedback element
    const feedbackEl = document.createElement("div");
    feedbackEl.id = "form-feedback";
    feedbackEl.className = "feedback-message feedback-" + type;
    feedbackEl.setAttribute("role", "alert");
    feedbackEl.setAttribute("aria-live", "polite");
    feedbackEl.textContent = message;

    // Insert after the form
    const form = document.getElementById("contact-form");
    form.parentNode.insertBefore(feedbackEl, form.nextSibling);

    // Auto-hide success messages after 6 seconds
    if (type === "success") {
        setTimeout(function () {
            feedbackEl.style.opacity = "0";
            setTimeout(function () {
                feedbackEl.remove();
            }, 300);
        }, 6000);
    }
}