/* Mixed-flavor box: pick N tins, then add them as separate line items that
   share a `_bundle` property so the cart can still tell they belong together. */
(function () {
  const root = document.querySelector('[data-bundle-builder]');
  if (!root) return;

  const configEl = root.querySelector('[data-bundle-config]');
  if (!configEl) return;

  const config = JSON.parse(configEl.textContent);
  const flavors = new Map((config.flavors ?? []).map((flavor) => [flavor.handle, flavor]));
  const size = Number(config.size) || 6;

  const picks = [];

  const remainingEl = root.querySelector('[data-bundle-remaining]');
  const slots = [...root.querySelectorAll('[data-bundle-slots] .builder__slot')];
  const totalEl = root.querySelector('[data-bundle-total]');
  const addBtn = root.querySelector('[data-bundle-add]');

  function countFor(handle) {
    return picks.filter((pick) => pick === handle).length;
  }

  function money(cents) {
    return (Number(cents) / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  }

  function remainingLabel(left) {
    if (left === 0) return config.strings?.complete ?? 'Box complete';
    const template =
      left === 1
        ? config.strings?.remainingOne ?? '{{ count }} tin left to pick'
        : config.strings?.remainingOther ?? '{{ count }} tins left to pick';
    return template.replace(/\{\{\s*count\s*\}\}/g, String(left));
  }

  function render() {
    flavors.forEach((_, handle) => {
      const el = root.querySelector(`[data-bundle-count="${handle}"]`);
      if (el) el.textContent = String(countFor(handle));
    });

    slots.forEach((slot, index) => {
      const handle = picks[index];
      const flavor = handle ? flavors.get(handle) : null;
      slot.classList.toggle('is-filled', Boolean(flavor));
      if (flavor) {
        slot.setAttribute('data-flavor', String(flavor.flavor ?? 'brand').toLowerCase());
      } else {
        slot.removeAttribute('data-flavor');
      }
    });

    const total = picks.reduce((sum, handle) => sum + Number(flavors.get(handle)?.price ?? 0), 0);
    if (totalEl) totalEl.textContent = money(total);

    const left = Math.max(0, size - picks.length);
    if (remainingEl) remainingEl.textContent = remainingLabel(left);
    if (addBtn) addBtn.disabled = left !== 0;
  }

  function adjust(handle, delta) {
    if (!flavors.has(handle) || !delta) return;

    if (delta > 0) {
      if (picks.length >= size) return;
      picks.push(handle);
    } else {
      const index = picks.lastIndexOf(handle);
      if (index === -1) return;
      picks.splice(index, 1);
    }

    render();
  }

  root.addEventListener('click', (event) => {
    const stepper = event.target.closest('[data-bundle-delta]');
    if (stepper) {
      event.preventDefault();
      adjust(stepper.dataset.bundleHandle, Number(stepper.dataset.bundleDelta));
      return;
    }

    if (event.target.closest('[data-bundle-reset]')) {
      event.preventDefault();
      picks.length = 0;
      render();
      return;
    }

    if (event.target.closest('[data-bundle-add]')) {
      event.preventDefault();
      addBox();
    }
  });

  async function addBox() {
    if (picks.length !== size) return;

    const quantities = {};
    for (const handle of picks) {
      quantities[handle] = (quantities[handle] ?? 0) + 1;
    }

    const bundleId = `box-${Date.now()}`;
    const items = Object.entries(quantities).map(([handle, quantity]) => ({
      id: Number(flavors.get(handle).variantId),
      quantity,
      properties: {
        _bundle: bundleId,
        Box: config.label || 'Mixed 6-pack'
      }
    }));

    const cart = window.MOVOCart;
    if (!cart?.postCart) {
      window.alert('Cart is not ready yet. Refresh and try again.');
      return;
    }

    addBtn?.setAttribute('aria-disabled', 'true');

    try {
      const routes = window.MOVO?.routes ?? {};
      await cart.postCart(`${routes.cartAdd ?? '/cart/add'}.js`, { items });
      picks.length = 0;
      render();
      cart.open?.();
      await cart.refresh?.();
    } catch (error) {
      console.error(error);
      window.alert(error.message);
    } finally {
      addBtn?.removeAttribute('aria-disabled');
    }
  }

  render();
})();
