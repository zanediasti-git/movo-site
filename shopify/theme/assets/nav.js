/* Mobile nav panel and the scroll-aware header. */
(function () {
  const header = document.getElementById('site-header');
  const nav = document.getElementById('header-nav');
  const toggle = document.querySelector('[data-nav-toggle]');
  const scrim = document.querySelector('[data-nav-scrim]');

  if (toggle && nav) {
    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';

      if (scrim) {
        scrim.hidden = !open;
        // Let the element paint before transitioning opacity.
        requestAnimationFrame(() => scrim.classList.toggle('is-open', open));
      }
    };

    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    scrim?.addEventListener('click', () => setOpen(false));

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) setOpen(false);
    });

    // Reset state if the viewport grows past the mobile breakpoint.
    window.matchMedia('(min-width: 1000px)').addEventListener('change', (event) => {
      if (event.matches) setOpen(false);
    });
  }

  if (header && header.dataset.sticky !== 'false') {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
})();
