(function () {
  "use strict";

  const form = document.getElementById("contact-form");
  if (!form) return;

  const successEl = document.getElementById("form-success");
  const fields = form.querySelectorAll("input, select, textarea");

  const messages = {
    valueMissing: "This field is required.",
    typeMismatch: "Please enter a valid value.",
    typeMismatchEmail: "Please enter a valid email address.",
    patternMismatchPhone:
      "Please enter a valid phone number (digits, spaces, +, -, ( ) accepted).",
    tooShort: (min) => `Please enter at least ${min} characters.`,
  };

  function getError(input) {
    const v = input.validity;
    if (v.valid) return "";
    if (v.valueMissing) return messages.valueMissing;
    if (v.typeMismatch && input.type === "email")
      return messages.typeMismatchEmail;
    if (v.typeMismatch) return messages.typeMismatch;
    if (v.patternMismatch && input.type === "tel")
      return messages.patternMismatchPhone;
    if (v.tooShort) return messages.tooShort(input.minLength);
    return "Please check this field.";
  }

  function setFieldError(input, message) {
    const wrap = input.closest(".form-field");
    if (!wrap) return;
    const errEl = wrap.querySelector(".form-error");
    if (message) {
      wrap.classList.add("is-invalid");
      if (errEl) errEl.textContent = message;
      input.setAttribute("aria-invalid", "true");
    } else {
      wrap.classList.remove("is-invalid");
      if (errEl) errEl.textContent = "";
      input.removeAttribute("aria-invalid");
    }
  }

  fields.forEach((input) => {
    input.addEventListener("blur", () => {
      setFieldError(input, getError(input));
    });
    input.addEventListener("input", () => {
      if (input.closest(".form-field")?.classList.contains("is-invalid")) {
        setFieldError(input, getError(input));
      }
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    let firstInvalid = null;
    fields.forEach((input) => {
      const message = getError(input);
      setFieldError(input, message);
      if (message && !firstInvalid) firstInvalid = input;
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    // STUB: replace this block with a real submit (e.g. fetch() to Formspree
    // / Web3Forms) once the form action is wired to a real endpoint.
    if (successEl) {
      successEl.hidden = false;
      successEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    form.reset();
    fields.forEach((input) => setFieldError(input, ""));

    setTimeout(() => {
      if (successEl) successEl.hidden = true;
    }, 6000);
  });
})();
