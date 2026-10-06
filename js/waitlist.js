(function () {
  "use strict";

  // TODO: paste the email provider's form endpoint here (Mailchimp post URL,
  // Klaviyo, ConvertKit, etc.). While this is empty the form validates and
  // confirms client-side only — no address is stored anywhere.
  const WAITLIST_ENDPOINT = "";

  const forms = document.querySelectorAll(".waitlist-form");
  if (!forms.length) return;

  function getError(input) {
    const v = input.validity;
    if (v.valid) return "";
    if (v.valueMissing) return "Please enter your email address.";
    if (v.typeMismatch) return "Please enter a valid email address.";
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

  function showSuccess(form) {
    const successEl = document.getElementById(form.dataset.success);
    if (!successEl) return;
    successEl.hidden = false;
  }

  async function send(form, email) {
    if (!WAITLIST_ENDPOINT) return true;

    const response = await fetch(WAITLIST_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email: email }),
    });

    return response.ok;
  }

  forms.forEach((form) => {
    const input = form.querySelector('input[type="email"]');
    const submit = form.querySelector('button[type="submit"]');
    if (!input) return;

    input.addEventListener("blur", () => {
      setFieldError(input, getError(input));
    });

    input.addEventListener("input", () => {
      if (input.closest(".form-field")?.classList.contains("is-invalid")) {
        setFieldError(input, getError(input));
      }
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const message = getError(input);
      setFieldError(input, message);
      if (message) {
        input.focus();
        return;
      }

      const original = submit ? submit.textContent : "";
      if (submit) {
        submit.disabled = true;
        submit.textContent = "Joining\u2026";
      }

      try {
        const ok = await send(form, input.value.trim());
        if (!ok) throw new Error("Request failed");
        form.reset();
        setFieldError(input, "");
        showSuccess(form);
      } catch (err) {
        setFieldError(input, "Something went wrong. Please try again.");
      } finally {
        if (submit) {
          submit.disabled = false;
          submit.textContent = original;
        }
      }
    });
  });
})();
