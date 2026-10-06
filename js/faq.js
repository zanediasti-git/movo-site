(function () {
  "use strict";

  // Native <details> already handles keyboard and no-JS use. This only adds
  // the nicety of collapsing the other answers when one is opened.
  const items = document.querySelectorAll(".faq__item");
  if (items.length < 2) return;

  items.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;

      items.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });
})();
