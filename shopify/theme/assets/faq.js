/* Keeps one FAQ answer open at a time, where the section asks for it. */
(function () {
  document.querySelectorAll('[data-faq-exclusive]').forEach((list) => {
    const items = list.querySelectorAll('details');

    items.forEach((item) => {
      item.addEventListener('toggle', () => {
        if (!item.open) return;
        items.forEach((other) => {
          if (other !== item) other.open = false;
        });
      });
    });
  });
})();
