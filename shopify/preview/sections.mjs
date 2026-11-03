import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { SECTIONS_DIR } from './paths.mjs';

const SCHEMA_PATTERN = /{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/;

/**
 * Renders a single section file the way the Online Store does: schema defaults
 * underneath, template instance settings on top, wrapped in the
 * `shopify-section` element that section CSS hooks onto.
 */
export function createSectionRenderer(engine) {
  return async function renderSection(type, globals = {}, instance = {}) {
    const source = readSection(type);
    if (source === null) {
      return `<!-- preview: missing section "${type}" -->`;
    }

    const schema = parseSchema(source, type);
    const id = instance.id ?? `preview-${type}`;
    const fromTemplate = Object.keys(instance).length > 0;

    const section = {
      id,
      type,
      settings: resolveReferences(
        { ...defaultSettings(schema.settings), ...(instance.settings ?? {}) },
        schema.settings,
        globals
      ),
      blocks: resolveBlocks(schema, instance, globals, fromTemplate),
      location: 'template',
      index: 1,
      index0: 0,
      shopify_attributes: ''
    };

    // `globals` is passed twice on purpose: as the scope, and as liquidjs
    // globals so it survives into the isolated scope `{% render %}` creates.
    const html = await engine.parseAndRender(source, { ...globals, section }, { globals });
    return `<div id="shopify-section-${id}" class="shopify-section shopify-section--${type}">${html}</div>`;
  };
}

function readSection(type) {
  try {
    return readFileSync(join(SECTIONS_DIR, `${type}.liquid`), 'utf8');
  } catch {
    return null;
  }
}

function parseSchema(source, type) {
  const match = source.match(SCHEMA_PATTERN);
  if (!match) return {};
  try {
    return JSON.parse(match[1]);
  } catch (error) {
    throw new Error(`Invalid {% schema %} JSON in sections/${type}.liquid: ${error.message}`);
  }
}

function defaultSettings(definitions = []) {
  const settings = {};
  for (const definition of definitions) {
    if (definition.id !== undefined && definition.default !== undefined) {
      settings[definition.id] = definition.default;
    }
  }
  return settings;
}

/**
 * A JSON template is authoritative: if it lists no blocks, the section renders
 * none. The `default`/`preset` fallback is only for sections pulled in by a
 * `{% section %}` tag, which carry no instance data at all.
 */
function resolveBlocks(schema, instance, globals, fromTemplate) {
  const source = fromTemplate
    ? normalizeBlocks(instance)
    : normalizeBlocks(schema.default ?? schema.presets?.[0] ?? {});

  const definitions = schema.blocks ?? [];

  return source.map((block, index) => {
    const definition = definitions.find((candidate) => candidate.type === block.type);
    return {
      id: block.id ?? `block-${index}`,
      type: block.type,
      settings: resolveReferences(
        { ...defaultSettings(definition?.settings), ...(block.settings ?? {}) },
        definition?.settings,
        globals
      ),
      index,
      index0: index,
      shopify_attributes: ''
    };
  });
}

/**
 * Shopify hands `collection` and `product` settings to Liquid as full objects,
 * while the JSON template stores a handle. Swap them out so sections can use
 * `section.settings.collection.products` the way they would on a store.
 */
function resolveReferences(settings, definitions = [], globals) {
  const lookups = {
    collection: globals.collections,
    product: globals.all_products,
    page: globals.pages
  };

  for (const definition of definitions ?? []) {
    const lookup = lookups[definition.type];
    const handle = settings[definition.id];
    if (!lookup || typeof handle !== 'string') continue;
    settings[definition.id] = lookup[handle] ?? null;
  }

  return settings;
}

function normalizeBlocks(holder) {
  const { blocks, block_order: blockOrder } = holder ?? {};
  if (!blocks) return [];
  if (Array.isArray(blocks)) return blocks;

  const ids = blockOrder ?? Object.keys(blocks);
  return ids.filter((id) => blocks[id]).map((id) => ({ id, ...blocks[id] }));
}
