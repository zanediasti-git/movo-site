# MOVO Boost — Shopify admin setup

The theme in `shopify/theme` is ready to push. This file is the checklist for standing up the store without accidentally going live.

**Do not, without explicit approval:**

- Connect `movoboost.com` (or any custom domain)
- Publish this theme as the live theme
- Set products to Active
- Turn on a live payment gateway / enable real checkout

The existing marketing site on Vercel stays where it is until you decide otherwise.

---

## 1. Create the store

1. Create a new Shopify store (trial is fine).
2. Leave the default `*.myshopify.com` URL. Do not add a custom domain.
3. In **Online Store → Preferences**, keep the storefront password on so the shop is not publicly crawlable.
4. Skip payment-provider setup. Shopify’s Bogus Gateway is enough for theme review.

---

## 2. Push the theme unpublished

From `shopify/`:

```bash
npm install
npx shopify auth login
npx shopify theme push --path theme --unpublished
```

`--unpublished` uploads the theme as a draft. It will **not** replace the live theme.

Useful follow-ups, still from `shopify/`:

```bash
npm run theme:dev                 # preview against the store (uploads on save)
npm run theme:check               # Liquid/theme-check
npm run theme:push-unpublished    # same as the push above
```

Local design review without a store still works:

```bash
npm run preview                   # http://localhost:5174
```

That preview talks to mock catalog data. Cart adds, subscriptions, and checkout only exist on a real store.

---

## 3. Metafield definitions

Create these **before** importing products so you can fill them as you go. Settings → Custom data.

### Products (`custom`)

| Namespace and key | Type | Notes |
| --- | --- | --- |
| `custom.flavor` | Single line text | `Mint` or `Citrus`. Drives `data-flavor` tinting. |
| `custom.taste_note` | Single line text | Shown on product cards and the mixed-box builder. |
| `custom.pouches_per_tin` | Integer | `18`. |
| `custom.accent_color` | Color | Optional. `#00d9a8` (Mint), `#ff9f1a` (Citrus). |
| `custom.actives` | JSON | Optional. Not required for the theme to render. |

### Variants (`custom`)

| Namespace and key | Type | Notes |
| --- | --- | --- |
| `custom.tins` | Integer | `1`, `3`, or `6`. Used to compute pouches and per-tin price. The pack picker also falls back to the variant title if this is empty. |

### Pages (`custom`) — ingredient pages only

| Namespace and key | Type | Notes |
| --- | --- | --- |
| `custom.label` | Single line text | `Electrolyte` or `Amino acid`. |
| `custom.dose` | Single line text | e.g. `250 mg per pouch`. |

---

## 4. Import products as drafts

`docs/products.csv` is a Shopify product CSV with **placeholder pricing** and `Status = draft`:

| Variant | Price | Compare at |
| --- | --- | --- |
| 1 Tin | $14.00 | — |
| 3-Pack | $37.80 | $42.00 (10% off) |
| 6-Pack | $71.40 | $84.00 (15% off) |

1. Admin → Products → Import, upload `shopify/docs/products.csv`.
2. Confirm both products landed as **Draft**. Do not set them Active.
3. Upload photography (theme assets are not product images). Suggested files, already in `theme/assets/`:
   - Mint: `Pouch-m.jpg`, `Image-front.jpg`, `pouch-open-top.jpg`, `pouches-loose.jpg`
   - Citrus: `Pouch-c.jpg`, plus the same lifestyle shots
4. Fill product metafields:

   **MOVO Boost Mint** — flavor `Mint`, taste note `Cold mint, clean finish`, pouches per tin `18`.
   Variants: 1 Tin → `tins` 1, 3-Pack → 3, 6-Pack → 6.

   **MOVO Boost Citrus** — flavor `Citrus`, taste note `Bright citrus, no sugar crash`, pouches per tin `18`.
   Same variant `tins` values.

5. Create a collection **Pouches**, handle `pouches`, manual, both products. The home flavor cards, mixed-box builder, and header “Shop” link all look this collection up by handle.

Inventory is seeded at 250 per variant so the theme never renders as sold out during review. Switch to real numbers before launch.

---

## 5. Subscriptions

The product form already reads `product.selling_plan_groups`. Nothing in the theme creates the plans.

1. Install **Shopify Subscriptions** (or another selling-plan app).
2. Create a group, e.g. “Subscribe & save”, 15% off.
3. Frequencies: every **30 days** and every **60 days**.
4. Assign the group to both products, all three variants.

A one-time purchase submits no `selling_plan` (the frequency `<select>` is disabled on that path, so it is omitted from the form). Do not make selling plans required.

---

## 6. Pages and templates

Online Store → Pages. Create each page, then in the theme editor assign the matching template.

| Title | Handle | Theme template |
| --- | --- | --- |
| How it works | `how-it-works` | `page.how-it-works` |
| Ingredients | `ingredients` | `page.ingredients` |
| The science | `science` | `page.science` |
| Our story | `story` | `page.story` |
| FAQ | `faq` | `page.faq` |
| Contact | `contact` | `page.contact` |
| Build a box | `build-a-box` | `page.build-a-box` |
| Sodium | `sodium` | `page.ingredient` |
| Potassium | `potassium` | `page.ingredient` |
| Magnesium | `magnesium` | `page.ingredient` |
| L-Taurine | `l-taurine` | `page.ingredient` |

Ingredient page metafields and body copy (paste into the page content, not the theme editor):

| Handle | Label | Dose | Body |
| --- | --- | --- | --- |
| `sodium` | Electrolyte | 250 mg per pouch | When you sweat, sodium is the main thing leaving your body — far more than any other mineral. It does two jobs: it holds water in your bloodstream (so hydration actually sticks instead of passing right through you), and it carries the electrical signals that tell your muscles to contract. Run low on sodium and you feel it fast — cramping, fatigue, that heavy-legged feeling late in a game. Drinking plain water when you are sodium-depleted can actually make it worse by diluting what is left. Replacing sodium during activity keeps fluid balanced and muscles firing. |
| `potassium` | Electrolyte | 75 mg per pouch | Sodium and potassium work as a pair — sodium mostly outside your cells, potassium mostly inside. Every muscle contraction depends on these two trading places across the cell wall, thousands of times a second. When potassium drops, that exchange gets sloppy: muscles cramp, fatigue sets in earlier, and recovery slows. Most athletes get less potassium than they need from food alone, so replacing it alongside sodium keeps the pair balanced instead of fixing one side of the equation. |
| `magnesium` | Electrolyte | 15 mg per pouch | If sodium and potassium fire the muscle, magnesium lets it let go. It is required for muscles to relax after contracting — which is why low magnesium is linked with cramping and twitching. It is also involved in how your body produces energy at the cellular level, so it plays a role in endurance, not just cramp prevention. Sweat pulls magnesium out slowly but steadily, and it is one of the most common shortfalls in athletes’ diets. |
| `l-taurine` | Amino acid | 100 mg per pouch | Taurine is an amino acid your body makes and stores heavily in muscle tissue — it is not a stimulant, despite showing up in energy drinks. Inside muscle cells it helps regulate calcium, which controls the strength of each contraction, and it helps cells hold onto water and stay balanced during hard efforts. Research in athletes links taurine with better endurance and less exercise-induced muscle damage. It is naturally found in meat and fish, and it is one of the most-studied ingredients in sports nutrition. |

The other pages get their copy from the JSON templates, so the page body can stay empty.

Also create the four legal pages Shopify expects (Privacy, Terms, Refund, Shipping) so the footer policy links resolve.

---

## 7. Navigation

**Main menu** (`main-menu`), in this order:

1. Shop → `/collections/pouches`
2. Build a box → `/pages/build-a-box`
3. How it works → `/pages/how-it-works`
4. Ingredients → `/pages/ingredients`
5. The science → `/pages/science`
6. Our story → `/pages/story`

**Footer** (`footer`): the same six, plus FAQ and Contact.

---

## 8. Theme editor pass

Open the unpublished theme in the editor and confirm:

- Header menu = Main menu, CTA → `/collections/pouches`
- Home “Pick your flavor” collection = Pouches
- Product template flavor-link blocks point at Mint and Citrus
- Build a box collection = Pouches, box size 6
- Footer legal links, xylitol warning, and supplement disclaimer
- Announcement bar copy
- Favicon / logo if you have production files (the wordmark is the fallback)

Save. Do not click **Publish**.

---

## 9. Mixed-box discount (later)

The builder adds one **1 Tin** line per flavor, with:

- `properties._bundle` — hidden id so two boxes don’t merge
- `properties.Box` — `Mixed 6-pack`, visible on the line

That means a mixed box currently rings up at 6 × $14.00 = **$84.00**. Same-flavor 6-packs stay $71.40.

To give mixed boxes the 6-pack rate, add a Shopify Function (or automatic discount) that applies when line items sharing a `_bundle` total 6 tins. Do not wire that up until you are ready to charge for it.

---

## 10. Going live — only with approval

When you are ready, and not before:

1. Confirm placeholder prices, copy, and photography.
2. Set products to Active.
3. Connect a real payment gateway.
4. Publish the theme.
5. Only then connect `movoboost.com` (Online Store → Domains). Point DNS after the storefront is the source of truth, so the Vercel site is not fighting Shopify.

Until that list is signed off, leave the theme unpublished, the products in draft, and the custom domain alone.
