/**
 * Page records for the preview. In Shopify these are real pages; the long-form
 * body copy lives in sections, so most of these only need title, handle and
 * template_suffix. The ingredient pages also carry metafields, which is how the
 * ingredient-detail section gets its label and dose.
 */
function page({ handle, title, suffix = '', content = '', metafields = {} }) {
  return {
    id: handle,
    handle,
    title,
    url: `/pages/${handle}`,
    content,
    template_suffix: suffix,
    metafields: { custom: metafields }
  };
}

const INGREDIENTS = [
  {
    handle: 'sodium',
    title: 'Sodium',
    label: 'Electrolyte',
    dose: '250 mg per pouch',
    content:
      '<p>When you sweat, sodium is the main thing leaving your body &mdash; far more than any other mineral. It does two jobs: it holds water in your bloodstream (so hydration actually sticks instead of passing right through you), and it carries the electrical signals that tell your muscles to contract. Run low on sodium and you feel it fast &mdash; cramping, fatigue, that heavy-legged feeling late in a game. Drinking plain water when you are sodium-depleted can actually make it worse by diluting what is left. Replacing sodium during activity keeps fluid balanced and muscles firing.</p>'
  },
  {
    handle: 'potassium',
    title: 'Potassium',
    label: 'Electrolyte',
    dose: '75 mg per pouch',
    content:
      '<p>Sodium and potassium work as a pair &mdash; sodium mostly outside your cells, potassium mostly inside. Every muscle contraction depends on these two trading places across the cell wall, thousands of times a second. When potassium drops, that exchange gets sloppy: muscles cramp, fatigue sets in earlier, and recovery slows. Most athletes get less potassium than they need from food alone, so replacing it alongside sodium keeps the pair balanced instead of fixing one side of the equation.</p>'
  },
  {
    handle: 'magnesium',
    title: 'Magnesium',
    label: 'Electrolyte',
    dose: '15 mg per pouch',
    content:
      '<p>If sodium and potassium fire the muscle, magnesium lets it let go. It is required for muscles to relax after contracting &mdash; which is why low magnesium is linked with cramping and twitching. It is also involved in how your body produces energy at the cellular level, so it plays a role in endurance, not just cramp prevention. Sweat pulls magnesium out slowly but steadily, and it is one of the most common shortfalls in athletes&rsquo; diets.</p>'
  },
  {
    handle: 'l-taurine',
    title: 'L-Taurine',
    label: 'Amino acid',
    dose: '100 mg per pouch',
    content:
      '<p>Taurine is an amino acid your body makes and stores heavily in muscle tissue &mdash; it is not a stimulant, despite showing up in energy drinks. Inside muscle cells it helps regulate calcium, which controls the strength of each contraction, and it helps cells hold onto water and stay balanced during hard efforts. Research in athletes links taurine with better endurance and less exercise-induced muscle damage. It is naturally found in meat and fish, and it is one of the most-studied ingredients in sports nutrition.</p>'
  }
];

export const pages = Object.fromEntries(
  [
    page({ handle: 'how-it-works', title: 'How it works', suffix: 'how-it-works' }),
    page({ handle: 'ingredients', title: 'Ingredients', suffix: 'ingredients' }),
    page({ handle: 'science', title: 'The science', suffix: 'science' }),
    page({ handle: 'story', title: 'Our story', suffix: 'story' }),
    page({ handle: 'faq', title: 'FAQ', suffix: 'faq' }),
    page({ handle: 'contact', title: 'Contact', suffix: 'contact' }),
    page({ handle: 'build-a-box', title: 'Build a box', suffix: 'build-a-box' }),
    ...INGREDIENTS.map((ingredient) =>
      page({
        handle: ingredient.handle,
        title: ingredient.title,
        suffix: 'ingredient',
        content: ingredient.content,
        metafields: {
          label: { value: ingredient.label },
          dose: { value: ingredient.dose }
        }
      })
    )
  ].map((record) => [record.handle, record])
);
