#!/usr/bin/env node
/**
 * Local static server that applies the **generated** production headers.
 *
 * This exists so the CSP can be validated in real browsers before it reaches production, and
 * so that validation is against the same policy string the image will serve — it reads
 * `out/_csp/policy.txt`, which `scripts/generate-csp.mjs` produced from the built HTML. It
 * does not contain a policy of its own, because a second copy is a second thing to drift.
 *
 * It is a **test harness**, not production. Production is `static-web-server` inside the
 * image, configured by the generated `sws.generated.toml`. Both take the same policy from the
 * same file, which is the point.
 *
 * Environment:
 *   PORT           listen port (default 3210)
 *   CSP_MODE       enforce (default) | report-only | none
 *   CSP_CONTROL    when "1", inject a script the policy must block — the negative control
 *
 * The negative control matters more than it looks. A CSP test that only ever observes zero
 * violations cannot distinguish "the policy is correct" from "the policy is not being applied
 * at all", and those two states look identical from the outside. With `CSP_CONTROL=1` the
 * page loads an inline script whose hash is deliberately absent from the policy; a browser
 * enforcing the policy MUST report a violation and MUST NOT execute it. If that control fails
 * to fire, every clean result in the same run is worthless.
 */

import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT = join(ROOT, 'out');
const PORT = Number(process.env.PORT ?? 3210);
const MODE = process.env.CSP_MODE ?? 'enforce';
const CONTROL = process.env.CSP_CONTROL === '1';

const policyPath = join(OUT, '_csp', 'policy.txt');
if (!existsSync(policyPath)) {
  console.error('[serve] out/_csp/policy.txt is missing — run `pnpm run build && pnpm run csp`.');
  process.exit(2);
}
const POLICY = readFileSync(policyPath, 'utf8').trim();

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
};

/* The control script is inline and un-hashed on purpose. Its own hash is never added to the
   policy, so a browser that is enforcing must refuse it. It sets a global the test then
   asserts is absent. */
const CONTROL_SCRIPT = `<script>window.__CSP_CONTROL_EXECUTED__ = true;</script>`;

function headersFor(pathname) {
  const headers = {
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy':
      'accelerometer=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), ' +
      'fullscreen=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), ' +
      'payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), ' +
      'usb=(), xr-spatial-tracking=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'X-Frame-Options': 'DENY',
  };
  if (MODE === 'enforce') headers['Content-Security-Policy'] = POLICY;
  else if (MODE === 'report-only') headers['Content-Security-Policy-Report-Only'] = POLICY;

  // Mirrors sws.generated.toml exactly: revalidate by default, long-lived only where the
  // filename is content-addressed. Keyed on the request path, which is what the production
  // server matches on — `/` must therefore be covered by the default rule rather than by an
  // `*.html` glob it can never match.
  if (pathname.startsWith('/_next/static/'))
    headers['Cache-Control'] = 'public, max-age=31536000, immutable';
  else if (pathname.startsWith('/assets/')) headers['Cache-Control'] = 'public, max-age=86400';
  else headers['Cache-Control'] = 'public, max-age=0, must-revalidate';
  return headers;
}

function resolve(urlPath) {
  // Normalise before joining, so `..` cannot escape `out/`. Checked again after joining,
  // because normalisation alone is not a containment guarantee.
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0] ?? '/')).replace(/^(\.\.[/\\])+/, '');
  let file = join(OUT, clean);
  if (!file.startsWith(OUT)) return null;
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file) && existsSync(`${file}.html`)) file = `${file}.html`;
  return existsSync(file) && statSync(file).isFile() ? file : null;
}

const server = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('ok');
  }

  const file = resolve(req.url ?? '/');
  const target = file ?? join(OUT, '404.html');
  const status = file ? 200 : 404;
  const ext = extname(target);

  let body = readFileSync(target);
  if (CONTROL && ext === '.html') {
    body = Buffer.from(body.toString('utf8').replace('</head>', `${CONTROL_SCRIPT}</head>`), 'utf8');
  }

  res.writeHead(status, {
    ...headersFor(file ? (req.url ?? '/') : '/404.html'),
    'Content-Type': TYPES[ext] ?? 'application/octet-stream',
    'Content-Length': body.length,
  });
  res.end(req.method === 'HEAD' ? undefined : body);
});

// Fail loudly rather than leave the port to whatever already owns it. A harness that cannot
// start must not look like a harness that started.
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(
      `[serve] port ${PORT} is already in use by another process. Refusing to start: tests ` +
        `would silently run against whatever is listening there instead of this build.`,
    );
    process.exit(2);
  }
  throw error;
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[serve] http://127.0.0.1:${PORT}  mode=${MODE}  control=${CONTROL ? 'ON' : 'off'}`);
  console.log(`[serve] policy: ${POLICY}`);
});
