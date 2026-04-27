# MOVO

Static marketing site for **MOVO** electrolyte pouches. Three pages: Home, Product, Contact.

No build step. Plain HTML / CSS / JS, organized into small files.

## Run locally

Just open `index.html` in a browser, or serve the folder with any static server:

```bash
# Option 1: Python (built-in on macOS)
python3 -m http.server 5173

# Option 2: Node (one-liner, no install)
npx --yes serve .
```

Then visit http://localhost:5173.

## File map

```
index.html          Home
product.html        Electrolyte Pouch 1.0 (Coming Soon)
contact.html        Contact form

css/
  base.css          CSS variables, reset, typography
  layout.css        Header, nav, footer, page shell
  components.css    Buttons, badges, product card, form fields
  home.css          Home-only sections
  product.css       Product page layout
  contact.css       Contact page layout

js/
  nav.js            Mobile menu, scroll-aware header, footer year
  contact-form.js   Client-side validation + stubbed submit handler

assets/
  logo.svg                     MOVO mark (placeholder)
  wave.svg                     Hero wave divider
  product-placeholder.svg      Pouch tin until you have photography
```

## Customize the look

All colors, fonts, radii and shadows live as CSS variables at the top of
[`css/base.css`](css/base.css). Tweak there and the whole site updates.

## Replace placeholder copy

Search the project for the comment `<!-- TODO: replace`. Each placeholder
paragraph is marked.

## Replace placeholder product image

Drop your photo into `assets/` (e.g. `assets/pouch-1.png`) and update the two
references:

- `index.html` &rarr; `<img src="assets/product-placeholder.svg" ...>` in the
  product card
- `product.html` &rarr; `<img class="product__image" src="...">`

## Wiring up the contact form (later)

Right now the form runs purely client-side: it validates fields and shows a
"Thanks" success state, but does **not** send anything anywhere.

When you're ready to make it real, pick a no-backend service such as
[Formspree](https://formspree.io/) or [Web3Forms](https://web3forms.com/),
then:

1. In [`contact.html`](contact.html), replace the `action` on the `<form>`
   with the endpoint URL the service gives you, for example:

   ```html
   <form id="contact-form" action="https://formspree.io/f/your-id" method="POST" novalidate>
   ```

2. Open [`js/contact-form.js`](js/contact-form.js) and replace the section
   marked `// STUB:` with a `fetch()` call, e.g.:

   ```js
   const data = new FormData(form);
   const res = await fetch(form.action, {
     method: "POST",
     body: data,
     headers: { Accept: "application/json" },
   });
   if (res.ok) {
     successEl.hidden = false;
     form.reset();
   }
   ```

That's the only wiring required.

## Deploy

This is a plain static site. Drag the project folder onto:

- [Netlify Drop](https://app.netlify.com/drop)
- [Vercel](https://vercel.com/) (import as a static project)
- GitHub Pages (push to a repo, enable Pages on `main`)

No build command, no framework, no server.
