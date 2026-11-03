import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

import { ASSETS_DIR } from './paths.mjs';
import { renderPage } from './render.mjs';
import { SITEMAP, matchRoute, notFoundRoute } from './routes.mjs';
import { buildCart } from './data/shop.mjs';

const PORT = Number(process.env.PORT ?? 5174);

const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2'
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = decodeURIComponent(url.pathname);

  if (pathname.startsWith('/assets/')) return serveAsset(pathname, res);
  if (pathname.startsWith('/cart/') || pathname === '/cart.js') return stubCartApi(pathname, res);
  if (pathname === '/__routes') return sendJson(res, 200, SITEMAP);

  const cartEmpty = url.searchParams.get('cart') === 'empty';

  try {
    const route = matchRoute(pathname, { cartEmpty, query: url.searchParams });
    const resolved = route ?? notFoundRoute(pathname, { cartEmpty });
    const html = await renderPage(resolved);

    res.writeHead(route ? 200 : 404, { 'content-type': 'text/html; charset=utf-8' });
    res.end(html);
  } catch (error) {
    console.error(`\n${pathname} failed:\n`, error);
    res.writeHead(500, { 'content-type': 'text/html; charset=utf-8' });
    res.end(errorPage(pathname, error));
  }
});

function serveAsset(pathname, res) {
  const relative = normalize(pathname.replace('/assets/', '')).replace(/^(\.\.[/\\])+/, '');
  const file = join(ASSETS_DIR, relative);

  if (!existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    return res.end(`Asset not found: ${relative}`);
  }

  res.writeHead(200, {
    'content-type': MIME[extname(file).toLowerCase()] ?? 'application/octet-stream',
    'cache-control': 'no-store'
  });
  createReadStream(file).pipe(res);
}

/**
 * The storefront Cart AJAX API does not exist locally. Returning a plausible
 * cart keeps the drawer and bundle builder from erroring while the design is
 * reviewed; real behavior is only verifiable on a store.
 */
function stubCartApi(pathname, res) {
  console.log(`  cart api stub: ${pathname}`);
  return sendJson(res, 200, { ...buildCart(), preview_stub: true });
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload, null, 2));
}

function errorPage(pathname, error) {
  const links = SITEMAP.map(({ label, url }) => `<li><a href="${url}">${label}</a></li>`).join('');
  return `<!doctype html><meta charset="utf-8">
<title>Preview error</title>
<style>
  body { font: 15px/1.6 ui-monospace, monospace; background: #04384c; color: #f3fffd; padding: 2rem; }
  h1 { font: 700 1.4rem/1.2 system-ui; color: #ff4b3e; }
  pre { background: #08506c; padding: 1rem; overflow: auto; border-left: 3px solid #ff6b6b; }
  a { color: #00d4ff; }
  ul { padding-left: 1.2rem; }
</style>
<h1>${pathname} failed to render</h1>
<pre>${String(error.stack ?? error.message).replace(/[<&]/g, (c) => (c === '<' ? '&lt;' : '&amp;'))}</pre>
<h2>Other routes</h2><ul>${links}</ul>`;
}

server.listen(PORT, () => {
  console.log(`\n  MOVO Boost theme preview\n  http://localhost:${PORT}\n`);
  for (const { label, url } of SITEMAP) {
    console.log(`  ${label.padEnd(22)} http://localhost:${PORT}${url}`);
  }
  console.log('\n  Liquid, CSS and JSON template edits apply on reload.\n');
});
