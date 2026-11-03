/* Product form: pack-size selection, subscription toggle, live pricing,
   quantity stepper and gallery thumbnails. */
(function () {
  const root = document.querySelector('[data-product-root]');
  if (!root) return;

  const data = readJson(root.querySelector('[data-product-json]'));
  const variants = data?.variants ?? [];

  const variantInput = root.querySelector('[data-variant-input]');
  const priceTarget = root.querySelector('[data-price-target]');
  const addButton = root.querySelector('[data-add-button]');
  const addLabel = root.querySelector('[data-add-label]');
  const planSelect = root.querySelector('[data-plan-select]');
  const planFrequency = root.querySelector('[data-plan-frequency]');
  const mainImage = root.querySelector('[data-gallery-main]');

  const state = {
    variantId: Number(variantInput?.value),
    subscribing: root.querySelector('[value="subscribe"]')?.checked ?? false
  };

  function currentVariant() {
    return variants.find((variant) => variant.id === state.variantId) ?? variants[0];
  }

  /** Subscription pricing comes from the selected plan's allocation. */
  function currentPricing() {
    const variant = currentVariant();
    if (!variant) return null;

    if (state.subscribing && planSelect) {
      const planId = Number(planSelect.value);
      const plan = variant.plans.find((candidate) => candidate.id === planId);
      if (plan) return { price: plan.price, compareAt: plan.compare_at_price };
    }

    return { price: variant.price, compareAt: variant.compare_at_price };
  }

  function render() {
    const variant = currentVariant();
    const pricing = currentPricing();
    if (!variant || !pricing) return;

    if (variantInput) variantInput.value = variant.id;

    if (priceTarget) {
      priceTarget.innerHTML = priceMarkup(pricing.price, pricing.compareAt);
    }

    if (addButton) {
      addButton.disabled = !variant.available;
      if (addLabel) {
        addLabel.textContent = variant.available
          ? window.MOVO?.strings?.addToCart ?? 'Add to cart'
          : window.MOVO?.strings?.soldOut ?? 'Sold out';
      }
    }

    if (planFrequency) planFrequency.hidden = !state.subscribing;
    // A disabled select is left out of the FormData, which is how a one-time
    // purchase ends up with no selling_plan.
    if (planSelect) planSelect.disabled = !state.subscribing;

    if (mainImage && variant.image) mainImage.src = variant.image;
  }

  function priceMarkup(price, compareAt) {
    const parts = [`<span class="price__now">${money(price)}</span>`];

    if (compareAt > price) {
      parts.push(`<s class="price__was">${money(compareAt)}</s>`);
      parts.push(`<span class="tag-save"><span>Save ${money(compareAt - price)}</span></span>`);
    }

    return `<span class="price price--lg">${parts.join('')}</span>`;
  }

  function money(cents) {
    return `$${(cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }

  function readJson(element) {
    if (!element) return null;
    try {
      return JSON.parse(element.textContent);
    } catch (error) {
      console.error('Could not parse product JSON', error);
      return null;
    }
  }

  // --- Events -------------------------------------------------------------

  root.addEventListener('change', (event) => {
    const target = event.target;

    if (target.name === 'pack') {
      state.variantId = Number(target.dataset.variantId);
      return render();
    }

    if (target.name === 'purchase_type') {
      state.subscribing = target.value === 'subscribe';
      return render();
    }

    if (target.dataset.planSelect !== undefined) render();
  });

  root.addEventListener('click', (event) => {
    const step = event.target.closest('[data-qty-step]');
    if (step) {
      const input = root.querySelector('[data-qty-input]');
      const next = Number(input.value) + Number(step.dataset.qtyStep);
      input.value = String(Math.max(Number(input.min || 1), next));
      return;
    }

    const thumb = event.target.closest('[data-gallery-thumb]');
    if (thumb && mainImage) {
      mainImage.src = thumb.dataset.galleryThumb;
      root
        .querySelectorAll('[data-gallery-thumb]')
        .forEach((candidate) => candidate.classList.toggle('is-active', candidate === thumb));
    }
  });

  render();
})();
