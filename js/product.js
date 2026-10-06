(function () {
  "use strict";

  const selectedFlavor = document.getElementById("selected-flavor");
  const productImage = document.getElementById("product-image");
  const flavorInputs = document.querySelectorAll('input[name="flavor"]');

  if (!selectedFlavor || !flavorInputs.length) return;

  function updateProductFlavor(input) {
    const label = input.closest(".flavor-option");
    const flavorText = label?.querySelector("span")?.textContent;

    if (flavorText) {
      selectedFlavor.textContent = flavorText;
    }

    if (productImage && input.dataset.image) {
      productImage.src = input.dataset.image;
      productImage.alt = input.dataset.alt || `${flavorText} electrolyte pouch`;
    }
  }

  flavorInputs.forEach((input) => {
    if (input.checked) {
      updateProductFlavor(input);
    }

    input.addEventListener("change", () => {
      updateProductFlavor(input);
    });
  });
})();
