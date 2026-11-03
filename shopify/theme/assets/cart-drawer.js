/* Cart drawer: opening, AJAX add-to-cart, quantity changes, and refreshing the
   drawer markup through the Section Rendering API. */
(function () {
  const config = window.MOVO ?? {};
  const routes = config.routes ?? {};
  const drawer = document.querySelector('[data-cart-drawer]');

  const open = () => {
    if (!drawer) return;
    drawer.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    drawer.querySelector('[data-cart-close]')?.focus();
  };

  const close = () => {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  const busy = (state) => {
    drawer?.querySelector('[data-cart-contents]')?.classList.toggle('is-busy', state);
  };

  /**
   * Pulls fresh markup for the drawer and, when present, the cart page section.
   * Falls back to a reload if the Section Rendering API is unavailable, which
   * is the case in the local preview.
   */
  async function refresh() {
    const targets = ['cart-drawer', 'main-cart'];

    try {
      const response = await fetch(`${routes.root ?? '/'}?sections=${targets.join(',')}`);
      const sections = await response.json();

      targets.forEach((name) => {
        const markup = sections[name];
        if (typeof markup !== 'string') return;

        const parsed = new DOMParser().parseFromString(markup, 'text/html');
        const next = parsed.querySelector('[data-cart-contents]');
        const current = document.querySelector(`#shopify-section-${name} [data-cart-contents]`);
        if (next && current) current.innerHTML = next.innerHTML;
      });

      await refreshCount();
    } catch (error) {
      console.warn('Section refresh unavailable, reloading instead.', error);
      window.location.reload();
    }
  }

  async function refreshCount() {
    const badge = document.querySelector('[data-cart-count]');
    if (!badge) return;

    const response = await fetch(`${routes.cart ?? '/cart'}.js`);
    const cart = await response.json();
    badge.textContent = cart.item_count;
    badge.classList.toggle('is-empty', cart.item_count === 0);
  }

  async function postCart(url, body) {
    busy(true);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.description || `Cart request failed (${response.status})`);
      }

      return await response.json();
    } finally {
      busy(false);
    }
  }

  // --- Wiring -------------------------------------------------------------

  document.addEventListener('click', (event) => {
    const opener = event.target.closest('[data-cart-open]');
    if (opener && drawer && config.cartDrawerEnabled !== false) {
      event.preventDefault();
      return open();
    }

    if (event.target.closest('[data-cart-close]')) return close();

    const changer = event.target.closest('[data-cart-change]');
    if (changer) {
      event.preventDefault();
      postCart(`${routes.cartChange ?? '/cart/change'}.js`, {
        id: changer.dataset.cartChange,
        quantity: Number(changer.dataset.quantity)
      })
        .then(refresh)
        .catch((error) => console.error(error));
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && drawer?.classList.contains('is-open')) close();
  });

  document.addEventListener('change', (event) => {
    const input = event.target.closest('[data-cart-quantity]');
    if (!input) return;

    postCart(`${routes.cartChange ?? '/cart/change'}.js`, {
      id: input.dataset.cartQuantity,
      quantity: Math.max(0, Number(input.value) || 0)
    })
      .then(refresh)
      .catch((error) => console.error(error));
  });

  // Product and bundle forms post through the API so the drawer can open.
  document.addEventListener('submit', (event) => {
    const form = event.target.closest('[data-product-form]');
    if (!form) return;

    event.preventDefault();

    const submit = form.querySelector('[type="submit"]');
    submit?.setAttribute('aria-disabled', 'true');

    const data = new FormData(form);
    const payload = { items: [buildItem(data)] };

    postCart(`${routes.cartAdd ?? '/cart/add'}.js`, payload)
      .then(() => {
        if (config.cartDrawerEnabled === false) {
          window.location.href = routes.cart ?? '/cart';
          return;
        }
        open();
        return refresh();
      })
      .catch((error) => {
        console.error(error);
        window.alert(error.message);
      })
      .finally(() => submit?.removeAttribute('aria-disabled'));
  });

  function buildItem(data) {
    const item = {
      id: Number(data.get('id')),
      quantity: Number(data.get('quantity') ?? 1)
    };

    const plan = data.get('selling_plan');
    if (plan) item.selling_plan = Number(plan);

    const properties = {};
    for (const [key, value] of data.entries()) {
      const match = key.match(/^properties\[(.+)\]$/);
      if (match && value) properties[match[1]] = value;
    }
    if (Object.keys(properties).length) item.properties = properties;

    return item;
  }

  window.MOVOCart = { open, close, refresh, postCart };
})();
