import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { Liquid } from 'liquidjs';

import { LAYOUT_DIR, SECTIONS_DIR, SNIPPETS_DIR, TEMPLATES_DIR, THEME_DIR } from './paths.mjs';
import { createSectionRenderer } from './sections.mjs';
import { registerFilters } from './shims/filters.mjs';
import { registerTags } from './shims/tags.mjs';

/**
 * `{% render 'x' %}` resolves against snippets/ first, matching Shopify. The
 * theme root stays on the list so explicit sub-paths keep working.
 */
const engine = new Liquid({
  root: [SNIPPETS_DIR, SECTIONS_DIR, THEME_DIR],
  extname: '.liquid',
  cache: false,
  strictFilters: false,
  strictVariables: false,
  relativeReference: false
});

const renderSection = createSectionRenderer(engine);

registerFilters(engine);
registerTags(engine, { renderSection });

export { engine, renderSection };

/**
 * Renders a JSON template by walking its section `order`, then wraps the
 * result in layout/theme.liquid.
 */
export async function renderPage({ template, globals, layout }) {
  const definition = readTemplate(template);
  const layoutName = layout ?? definition.layout ?? 'theme';
  const order = definition.order ?? Object.keys(definition.sections ?? {});

  const rendered = [];
  for (const id of order) {
    const instance = definition.sections?.[id];
    if (!instance?.type) continue;
    if (instance.disabled) continue;
    rendered.push(await renderSection(instance.type, globals, { id, ...instance }));
  }

  const layoutSource = readFileSync(join(LAYOUT_DIR, `${layoutName}.liquid`), 'utf8');
  return engine.parseAndRender(
    layoutSource,
    { ...globals, content_for_layout: rendered.join('\n') },
    { globals }
  );
}

/** Falls back from `page.contact` to `page`, the way Shopify resolves suffixes. */
export function resolveTemplate(candidates) {
  for (const candidate of candidates) {
    try {
      readFileSync(join(TEMPLATES_DIR, `${candidate}.json`), 'utf8');
      return candidate;
    } catch {
      // try the next candidate
    }
  }
  return null;
}

function readTemplate(name) {
  const source = readFileSync(join(TEMPLATES_DIR, `${name}.json`), 'utf8');
  // JSON templates allow /* */ comments; strip them before parsing.
  return JSON.parse(source.replace(/\/\*[\s\S]*?\*\//g, ''));
}
