# MOVO

Static marketing site for **MOVO** electrolyte pouches, in its pre-launch
state: nothing is purchasable, and every call to action points at the waitlist.

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
product.html        MOVO Electrolyte Pouches (Mint | Citrus)
how-it-works.html   The three steps, usage rules
information.html    Ingredients overview
sodium.html         Ingredient detail
potassium.html      Ingredient detail
magnesium.html      Ingredient detail
l-taurine.html      Ingredient detail
science.html        Why electrolytes, why a pouch
story.html          Developed in Denmark
faq.html            15 questions
contact.html        Contact form

css/
  base.css          CSS variables, reset, typography
  layout.css        Header, nav, footer, page shell
  components.css    Buttons, badges, product card, form fields
  sections.css      Page hero, steps, zero bar, use cases, origin strip
  compare.css       Comparison table, per-pouch stats, supplement facts
  waitlist.css      Waitlist band
  bundles.css       Launch bundle cards
  home.css          Home masthead
  product.css       Product page layout
  how-it-works.css  How It Works layout
  science.css       The Science layout
  story.css         Our Story layout
  faq.css           FAQ accordion
  information.css   Ingredients layout
  contact.css       Contact page layout

js/
  nav.js            Mobile menu, scroll-aware header, footer year
  product.js        Flavor switcher
  waitlist.js       Waitlist validation + submit
  faq.js            Collapses other answers when one opens
  contact-form.js   Client-side validation + stubbed submit handler

assets/             Product photography and section imagery
```

## Customize the look

All colors, fonts, radii and shadows live as CSS variables at the top of
[`css/base.css`](css/base.css). Tweak there and the whole site updates.

## Wiring up the waitlist (next step)

The waitlist appears on the home, product, and story pages. Right now it
validates the email and shows a success state, but **does not store anything**.

Open [`js/waitlist.js`](js/waitlist.js) and set the endpoint at the top:

```js
const WAITLIST_ENDPOINT = "https://your-provider-endpoint";
```

Once that constant is non-empty, the form POSTs `{ "email": "..." }` as JSON
and only shows the success message when the provider returns OK. If your
provider (Mailchimp, Klaviyo, Kit) expects form-encoded fields or extra IDs,
adjust the `send()` function to match their documented payload.

## Wiring up the contact form (later)

Same idea, separate file. The form in [`contact.html`](contact.html) runs
client-side only; replace the `action` with a Formspree or Web3Forms endpoint
and swap the block marked `// STUB:` in
[`js/contact-form.js`](js/contact-form.js) for a real `fetch()`.

## Before launch

- Replace the generated imagery in `assets/` with real product and lifestyle
  photography where you have it.
- Confirm the supplement facts panel in `product.html` against the final
  certificate of analysis.
- Set real pricing in `product.html` and the bundle cards in `css/bundles.css`,
  then swap the waitlist CTA for a checkout button.

## Deploy

This is a plain static site. Drag the project folder onto:

- [Netlify Drop](https://app.netlify.com/drop)
- [Vercel](https://vercel.com/) (import as a static project)
- GitHub Pages (push to a repo, enable Pages on `main`)

No build command, no framework, no server.
