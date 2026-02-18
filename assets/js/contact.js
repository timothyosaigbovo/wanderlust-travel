/* contact.js - Contact form validation + EmailJS */

(function () {

  const EMAILJS_PUBLIC_KEY = "PASTE_PUBLIC_KEY_HERE";
  const EMAILJS_SERVICE_ID = "PASTE_SERVICE_ID_HERE";
  const EMAILJS_TEMPLATE_ID = "PASTE_TEMPLATE_ID_HERE";

  function $(id){ return document.getElementById(id); }

  function isValidName(name){
    return name.trim().length >= 2;
  }

  function isValidEmail(email){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  function isValidMessage(msg){
    return msg.trim().length >= 10;
  }

  document.addEventListener("DOMContentLoaded", function(){

    const form = $("contact-form");
    if(!form) return;

    const name = $("contact-name");
    const email = $("contact-email");
    const message = $("contact-message");

    const nameErr = $("name-error");
    const emailErr = $("email-error");
    const msgErr = $("message-error");

    const btn = $("contact-submit");
    const feedback = $("contact-feedback");

    [name,email,message].forEach(input=>{
      input.addEventListener("input", function(){
        this.classList.remove("invalid");
        const err = this.nextElementSibling;
        if(err) err.classList.remove("visible");
      });
    });

    if (typeof emailjs !== "undefined" &&
        !EMAILJS_PUBLIC_KEY.includes("PASTE_")) {
      emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    }

    form.addEventListener("submit", async function(e){
      e.preventDefault();

      let valid = true;

      if(!isValidName(name.value)){ name.classList.add("invalid"); nameErr.classList.add("visible"); valid=false; }
      if(!isValidEmail(email.value)){ email.classList.add("invalid"); emailErr.classList.add("visible"); valid=false; }
      if(!isValidMessage(message.value)){ message.classList.add("invalid"); msgErr.classList.add("visible"); valid=false; }

      if(!valid) return;

      if (EMAILJS_PUBLIC_KEY.includes("PASTE_")) {
        feedback.className = "form-feedback error";
        feedback.textContent = "EmailJS not configured yet.";
        return;
      }

      try{
        btn.disabled = true;
        btn.textContent = "Sending...";

        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          {
            from_name: name.value.trim(),
            reply_to: email.value.trim(),
            message: message.value.trim()
          }
        );

        feedback.className = "form-feedback success";
        feedback.textContent = "Thank you! Message sent successfully.";
        form.reset();

      }catch(err){
        console.error(err);
        feedback.className = "form-feedback error";
        feedback.textContent = "Sorry — something went wrong.";
      }finally{
        btn.disabled = false;
        btn.textContent = "Send Message →";
      }

    });

  });

})();