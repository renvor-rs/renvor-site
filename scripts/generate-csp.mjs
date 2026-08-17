#!/usr/bin/env node
/**
 * Derives the production Content-Security-Policy from the built artifact.
 *
 * WHY THIS IS GENERATED AND NOT COMMITTED
 * ---------------------------------------
 * A static export cannot use a nonce. A nonce must be unique per response, and these
 * responses are files on disk — the same bytes to every visitor — so a "nonce" baked into
 * one would be a shared constant, which is exactly the thing a nonce must never be. Next.js
 * documents nonces via middleware; middleware requires a Node server, and this deployment has
 * none. Hashes are therefore the only strict mechanism available here, and they are computed
 * from the built HTML rather than written by hand.
 *
 * That has a consequence worth stating plainly: **one of the inline scripts is the React
 * Server Components flight payload, whose content changes whenever any component changes.**
 * Its hash therefore changes on almost every commit. A policy committed to Git would be stale
 * the moment anyone edited a paragraph, and the usual outcome of a stale strict policy is
 * that somebody adds `'unsafe-inline'` to make the site work again.
 *
 * So the policy is **generated during the image build, from the same `out/` the image ships,
 * and served by the origin**. There is exactly one canonical policy per image, it cannot
 * disagree with the bytes it protects, and no committed copy exists to drift from it. The
 * Traefik middleware in `renvor-infra` deliberately does **not** set CSP for this reason; it
 * carries only the headers that do not depend on build output.
 *
 * WHAT IT EMITS
 * -------------
 *   out/_csp/policy.txt   the policy, one line — for tests, evidence, and human reading
 *   out/_csp/hashes.json  the inputs, so a reviewer can see which script produced which hash
 *   sws.generated.toml    static-web-server config carrying the policy and the cache rules
 *
 * `out/_csp/` ships inside the image on purpose: it makes the running container able to state
 * the policy it is enforcing, which is what turns "we set a CSP" into something checkable
 * from outside.
 *
 * Run: `pnpm run csp` (after `pnpm run build`).
 * Exit codes: 0 ok, 1 a policy could not be produced, 2 the build output is unusable.
 */

import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, mkdirSync, writeFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT = join(ROOT, 'out');
const CSP_DIR = join(OUT, '_csp');

/** Every `.html` under `out/`. A build that produced none is a failure, not an empty result. */
function htmlFiles(dir, found = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`[csp] ${relative(ROOT, dir)} does not exist — run \`pnpm run build\` first.`);
      process.exit(2);
    }
    throw error;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    // A symlink is neither isFile() nor isDirectory(); refuse rather than walk past one, so a
    // symlinked subtree cannot hide an unhashed inline script from this scan.
    if (statSync(full).isDirectory() && !entry.isSymbolicLink()) htmlFiles(full, found);
    else if (entry.isFile() && entry.name.endsWith('.html')) found.push(full);
  }
  return found;
}

/**
 * Inline `<script>` blocks — those with no `src`.
 *
 * The negative lookahead is what makes this correct: `<script src=...>` is authorised by
 * `'self'` and must NOT be hashed, while `<script>…</script>` must be. Matching both would
 * produce hashes of empty strings and a policy that looks stricter than it is.
 */
function inlineScripts(html) {
  return [...html.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
}

/**
 * CSP hashes are base64 of the raw digest over the exact bytes between the tags, and — this
 * part is load-bearing — **single-quoted in the source list**.
 *
 * An unquoted `sha256-…` is parsed as a *host* source, not a hash. Browsers then discard it
 * ("contains an invalid source … It will be ignored", because base64 may contain `+` and `/`)
 * and, finding no matching hash, block every inline script on the page. The policy still reads
 * as strict, the generator still exits 0, and the site is broken.
 *
 * That is not hypothetical: it is exactly what this generator emitted on its first run, and it
 * was caught only by loading the built page in a real browser under enforcement. Static
 * inspection of the policy string cannot see it, which is why `browser.spec.ts` asserts on the
 * quoted form and the negative control asserts the policy is live.
 */
const sha256 = (text) => `'sha256-${createHash('sha256').update(text, 'utf8').digest('base64')}'`;

const files = htmlFiles(OUT);
if (files.length === 0) {
  console.error('[csp] no HTML found under out/ — refusing to emit a policy for nothing.');
  process.exit(2);
}

const hashes = new Map(); // hash -> { bytes, files[], head }
let inlineCount = 0;
let externalCount = 0;
let inlineStyleBlocks = 0;
let styleAttributes = 0;

for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const rel = relative(OUT, file).split(sep).join('/');

  for (const body of inlineScripts(html)) {
    inlineCount += 1;
    const h = sha256(body);
    const entry = hashes.get(h) ?? { bytes: Buffer.byteLength(body), files: [], head: body.slice(0, 72) };
    entry.files.push(rel);
    hashes.set(h, entry);
  }
  externalCount += [...html.matchAll(/<script[^>]*\ssrc="/gi)].length;
  inlineStyleBlocks += [...html.matchAll(/<style[^>]*>/gi)].length;
  styleAttributes += [...html.matchAll(/\sstyle="/gi)].length;
}

/**
 * `style-src 'self'` only holds while the markup contains no inline style. If a future change
 * introduces one, the honest options are to move it to the stylesheet or to widen the policy —
 * and widening a policy must be a decision somebody makes, not something that happens quietly
 * because a build stopped matching its own rules. So this fails the build instead.
 *
 * Runtime CSSOM writes (`el.style.opacity = …`, which is what GSAP does) are NOT governed by
 * `style-src` and are unaffected by this check. Only markup is scanned, because only markup is
 * governed.
 */
if (inlineStyleBlocks > 0 || styleAttributes > 0) {
  console.error(
    `[csp] built HTML contains ${inlineStyleBlocks} <style> block(s) and ${styleAttributes} ` +
      `style="" attribute(s). The policy below claims style-src 'self' with no escape hatch, ` +
      `which would block them. Move the styles into globals.css, or change this policy ` +
      `deliberately — do not add 'unsafe-inline' to make a test pass.`,
  );
  process.exit(1);
}

const scriptHashes = [...hashes.keys()].sort();

// Belt to the braces above. A source list entry that is not quoted is silently reinterpreted
// as a host by every browser, so this must be structurally impossible rather than merely
// intended.
for (const h of scriptHashes) {
  if (!/^'sha256-[A-Za-z0-9+/]+={0,2}'$/.test(h)) {
    console.error(`[csp] refusing to emit an unquoted or malformed hash source: ${h}`);
    process.exit(1);
  }
}

/**
 * The policy.
 *
 * `default-src 'none'` is the load-bearing line: every fetch directive that is not named below
 * falls back to it and is therefore denied. Directives are then opened one at a time, each for
 * a reason that can be pointed at in the built output.
 */
const POLICY = [
  // Deny everything, then permit deliberately. A directive omitted here is denied, not ignored.
  `default-src 'none'`,

  // Same-origin chunk files, plus an exact hash for each inline script. No 'unsafe-inline',
  // no 'unsafe-eval', no 'strict-dynamic', no host allowlist, no CDN.
  `script-src 'self' ${scriptHashes.join(' ')}`,

  // One same-origin stylesheet. Verified above to need no inline allowance.
  `style-src 'self'`,

  // The brand SVGs and the two PNGs, all same-origin. No data: — nothing needs it, and data:
  // in img-src is a small but real exfiltration channel.
  `img-src 'self'`,

  // The page uses system fonts only: no @font-face, no webfont, no font CDN.
  `font-src 'none'`,

  // No fetch, XHR, WebSocket, EventSource, or beacon. The site talks to nothing at runtime,
  // and a violation here would mean something started to.
  `connect-src 'none'`,

  // No <object>, <embed>, or <applet>.
  `object-src 'none'`,

  // No <iframe> or <frame> is used.
  `frame-src 'none'`,

  // No audio or video.
  `media-src 'none'`,

  // No web workers or shared workers.
  `worker-src 'none'`,

  // No web app manifest.
  `manifest-src 'none'`,

  // Clickjacking protection. `frame-ancestors` is the modern replacement for
  // X-Frame-Options and, unlike it, cannot be overridden by a meta tag.
  `frame-ancestors 'none'`,

  // No form on the page. If one ever appears, this denies its submission until somebody
  // decides where it may go.
  `form-action 'none'`,

  // Pins the base URL for relative references, so an injected <base> cannot repoint every
  // relative script and asset on the page at another origin.
  `base-uri 'none'`,

  /* `upgrade-insecure-requests` is DELIBERATELY ABSENT. It was in the first version of this
     policy and was removed for two reasons, in this order:

     1. **It authorises nothing here.** Every source in this policy is `'self'` or `'none'`.
        An `http://` subresource from any other origin is already denied by the directive that
        governs it, and one from this origin cannot exist on an https:// page. The directive
        upgrades requests that the policy above has already refused to allow.

     2. **It made WebKit untestable.** WebKit applies the upgrade to loopback; Chromium and
        Firefox exempt it. Under `http://127.0.0.1`, WebKit rewrote every stylesheet, chunk,
        and brand asset to `https://127.0.0.1` and failed all of them with a TLS error, so the
        page never hydrated. The choice was between a policy verified on two engines out of
        three, a test harness that differs from production, and dropping a directive that
        grants nothing. Dropping it is the only one of those that costs no security.

     Transport security is handled where it belongs: TLS at the ingress, and HSTS once the
     production certificate is trusted and renewal is proven (see the infra repository). That
     is a stronger guarantee than a CSP directive, and it does not depend on a page having
     been loaded first. */
].join('; ');

mkdirSync(CSP_DIR, { recursive: true });
writeFileSync(join(CSP_DIR, 'policy.txt'), `${POLICY}\n`, 'utf8');
writeFileSync(
  join(CSP_DIR, 'hashes.json'),
  `${JSON.stringify(
    {
      generatedFrom: 'out/',
      htmlFiles: files.length,
      inlineScripts: inlineCount,
      externalScripts: externalCount,
      distinctHashes: scriptHashes.length,
      scripts: [...hashes.entries()].map(([hash, meta]) => ({
        hash,
        bytes: meta.bytes,
        files: meta.files,
        head: meta.head,
      })),
    },
    null,
    2,
  )}\n`,
  'utf8',
);

/**
 * static-web-server configuration.
 *
 * Cache policy, stated once so the image and any edge agree. Note the **ordering**: the
 * revalidating rule is the DEFAULT and the long-lived rules are the exceptions, not the other
 * way round.
 *
 * That ordering is deliberate and was arrived at by being wrong first. The obvious shape is a
 * rule matching `/**\/*.html`, and it silently does not apply to `/` — the request path for
 * the landing page is `/`, not `/index.html`, so the glob never matches the site's most
 * important document and it ships with no `Cache-Control` at all. Making revalidation the
 * default means an unmatched path is cached conservatively rather than not at all, so the
 * failure mode of a future mistake is a slightly slow page instead of a stale one.
 *
 *   - Everything revalidates by default. `max-age=0, must-revalidate` does not mean "do not
 *     store"; it means "store, but ask before reusing". A deploy takes effect on the next
 *     request rather than after a cache entry expires.
 *   - `/_next/static/**` is content-addressed by Next — the filename contains a hash of the
 *     contents — so it is immutable for a year. A changed file gets a different name.
 *   - `/assets/**` is NOT content-addressed. Brand files keep stable names on purpose, so a
 *     day is the honest ceiling: long enough to be worth caching, short enough that replacing
 *     a mark does not require a year to propagate.
 */
const SWS_CONFIG = `# GENERATED by scripts/generate-csp.mjs — do not edit, and do not commit.
#
# Produced from the exact \`out/\` tree that ships in the same image, so the policy and the
# bytes it protects cannot disagree. Regenerate by rebuilding.

[general]
host = "::"
port = 8080
root = "/public"
health = true
log-level = "info"
page404 = "/404.html"
page50x = "/404.html"

[advanced]

[[advanced.headers]]
source = "/**"
[advanced.headers.headers]
Cache-Control = "public, max-age=0, must-revalidate"
Content-Security-Policy = "${POLICY}"
X-Content-Type-Options = "nosniff"
Referrer-Policy = "no-referrer"
Permissions-Policy = "accelerometer=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), usb=(), xr-spatial-tracking=()"
Cross-Origin-Opener-Policy = "same-origin"
Cross-Origin-Resource-Policy = "same-origin"
X-Frame-Options = "DENY"

[[advanced.headers]]
source = "/_next/static/**"
[advanced.headers.headers]
Cache-Control = "public, max-age=31536000, immutable"

[[advanced.headers]]
source = "/assets/**"
[advanced.headers.headers]
Cache-Control = "public, max-age=86400"
`;
writeFileSync(join(ROOT, 'sws.generated.toml'), SWS_CONFIG, 'utf8');

console.log(`[csp] scanned ${files.length} HTML file(s)`);
console.log(`[csp]   inline scripts: ${inlineCount} across ${scriptHashes.length} distinct hash(es)`);
console.log(`[csp]   external scripts: ${externalCount} (all authorised by 'self')`);
console.log(`[csp]   inline <style> blocks: ${inlineStyleBlocks}, style="" attributes: ${styleAttributes}`);
for (const [hash, meta] of hashes) {
  console.log(`[csp]   ${hash}  ${String(meta.bytes).padStart(6)}B  ${meta.files.join(', ')}`);
}
console.log(`[csp] wrote out/_csp/policy.txt, out/_csp/hashes.json, sws.generated.toml`);
console.log(`[csp] policy: ${POLICY}`);
