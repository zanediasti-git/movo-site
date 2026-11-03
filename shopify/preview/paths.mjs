import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

export const PREVIEW_DIR = here;
export const SHOPIFY_DIR = join(here, '..');
export const THEME_DIR = join(SHOPIFY_DIR, 'theme');

export const SECTIONS_DIR = join(THEME_DIR, 'sections');
export const SNIPPETS_DIR = join(THEME_DIR, 'snippets');
export const TEMPLATES_DIR = join(THEME_DIR, 'templates');
export const LAYOUT_DIR = join(THEME_DIR, 'layout');
export const ASSETS_DIR = join(THEME_DIR, 'assets');
export const CONFIG_DIR = join(THEME_DIR, 'config');
export const LOCALES_DIR = join(THEME_DIR, 'locales');
