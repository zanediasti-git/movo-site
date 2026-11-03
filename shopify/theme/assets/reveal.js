/* Reveals .reveal elements once as they scroll into view. */
(function () {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );

  items.forEach((item, index) => {
    // Stagger siblings so rows of cards cascade instead of popping together.
    item.style.transitionDelay = `${Math.min(index % 6, 5) * 70}ms`;
    observer.observe(item);
  });
})();
