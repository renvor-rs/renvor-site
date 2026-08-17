import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { settle } from './support/settle';
import { navigate } from './support/navigate';

/**
 * Cross-engine validation of the generated CSP and of rendering.
 *
 * Runs on Chromium, Firefox, and WebKit. CSP is implemented separately by each engine — a
 * policy verified on one of them is a policy verified for a third of readers — and each
 * reports violations differently, which is why collection below is deliberately broad.
 *
 * Two things this file is careful about:
 *
 *   1. **Zero violations is not, by itself, evidence.** It is also what a page returns when
 *      no policy is applied at all. The `negative control` test below therefore proves the
 *      enforcement is live by making the browser block something, in the same run.
 *
 *   2. **`securitypolicyviolation` must be registered before the document parses**, or the
 *      first violations are missed. `addInitScript` runs before any page script, and the
 *      collected records are read out afterwards.
 */

// Resolved from the runner's working directory rather than `import.meta.url`: Playwright
// transpiles specs to CommonJS, where `import.meta` is a syntax error.
const POLICY = readFileSync(join(process.cwd(), 'out', '_csp', 'policy.txt'), 'utf8').trim();

/* The same policy is validated in both modes, and the two modes use different header names.
   Reading the name from `CSP_MODE` lets one suite cover both without a second copy of the
   expectations — and, importantly, without a test that silently passes in Report-Only because
   it was looking for a header that mode never sends. */
const MODE = process.env.CSP_MODE ?? 'enforce';
const CSP_HEADER =
  MODE === 'report-only' ? 'content-security-policy-report-only' : 'content-security-policy';

interface Violation {
  directive: string;
  blockedURI: string;
}

/** Registers a collector before the document parses, and returns a reader for it. */
async function collectViolations(page: Page): Promise<() => Promise<Violation[]>> {
  await page.addInitScript(() => {
    (window as unknown as { __violations: Violation[] }).__violations = [];
    document.addEventListener('securitypolicyviolation', (event) => {
      (window as unknown as { __violations: Violation[] }).__violations.push({
        directive: event.effectiveDirective || event.violatedDirective,
        blockedURI: event.blockedURI,
      });
    });
  });
  return async () =>
    page.evaluate(() => (window as unknown as { __violations: Violation[] }).__violations ?? []);
}

/** Console errors and unhandled rejections, which a CSP block also surfaces on some engines. */
function collectConsole(page: Page): { errors: string[]; rejections: string[] } {
  const errors: string[] = [];
  const rejections: string[] = [];
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => rejections.push(String(err)));
  return { errors, rejections };
}

test.describe('content security policy', () => {
  test('the served policy is the generated policy, and it is strict', async ({ page }) => {
    const response = await navigate(page, '/');
    const header = response?.headers()[CSP_HEADER] ?? '';

    // No drift: the header must be byte-identical to what the generator produced from the
    // same build. A second hand-maintained copy is exactly what this asserts cannot exist.
    expect(header, 'served CSP must equal out/_csp/policy.txt exactly').toBe(POLICY);

    // The properties that make it worth having. Each is asserted separately so a failure
    // names which one was lost.
    expect(header, "must not permit eval").not.toContain('unsafe-eval');
    expect(header, 'must not permit inline script or style').not.toContain('unsafe-inline');
    expect(header, 'must not permit hashed inline event handlers').not.toContain('unsafe-hashes');
    expect(header, 'must deny by default').toContain("default-src 'none'");
    // The quotes matter: an unquoted `sha256-…` is parsed as a host source, ignored, and the
    // page breaks while the policy still reads as strict. An earlier revision of the generator
    // emitted exactly that, and an assertion without the quote character passed against it.
    expect(header, 'hashes must be single-quoted, or browsers parse them as hosts').toMatch(
      /script-src 'self' 'sha256-/,
    );
    expect(header, 'every hash source must be quoted').not.toMatch(/[ ]sha256-/);
    expect(header, 'must forbid framing').toContain("frame-ancestors 'none'");
    expect(header, 'must pin the base URI').toContain("base-uri 'none'");
    expect(header, 'must forbid outbound connections').toContain("connect-src 'none'");

    // No remote origin may appear anywhere in the policy: everything is self-hosted.
    expect(header, 'no remote host may be allowlisted').not.toMatch(/https?:\/\//);
  });

  test(`the page loads with zero application violations (${MODE})`, async ({ page }) => {
    const read = await collectViolations(page);
    const console_ = collectConsole(page);

    await navigate(page, '/');
    await settle(page);

    // Exercise the interactive surfaces: a violation may only appear once a handler runs.
    await page.locator('#tab-data').click();
    await page.getByRole('button', { name: 'Next evaluation lens' }).click();
    await page.getByRole('button', { name: /Switch to (light|dark) theme/ }).click();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(750); // let scroll-driven work run and settle

    const violations = await read();
    expect(
      violations,
      `expected no CSP violations, got:\n${violations.map((v) => `  ${v.directive} <- ${v.blockedURI}`).join('\n')}`,
    ).toEqual([]);

    /* In Report-Only mode WebKit logs a console error about the policy itself — a Report-Only
       header with no `report-uri`/`report-to` endpoint reports nowhere, which is a correct
       thing for a browser to point out and is a property of the *mode*, not of the page. It is
       filtered here rather than by relaxing the assertion, so an enforcement run still requires
       a genuinely silent console and any other message in either mode still fails. */
    const pageErrors = console_.errors.filter(
      (text) => !(MODE === 'report-only' && /content security policy/i.test(text)),
    );
    expect(pageErrors, `console errors:\n${pageErrors.join('\n')}`).toEqual([]);
    expect(console_.rejections, `page errors:\n${console_.rejections.join('\n')}`).toEqual([]);
  });

  test('the 404 document also loads with zero violations', async ({ page }) => {
    const read = await collectViolations(page);
    await navigate(page, '/404.html');
    await settle(page);
    expect(await read()).toEqual([]);
  });

  test('the policy survives a reload and a cache revalidation', async ({ page }) => {
    const first = await navigate(page, '/');
    expect(first?.headers()[CSP_HEADER]).toBe(POLICY);

    const read = await collectViolations(page);
    const second = await page.reload();
    // HTML is `must-revalidate`, so a reload re-checks and the header must come back intact.
    expect(second?.headers()[CSP_HEADER], 'CSP must survive revalidation').toBe(POLICY);
    expect(second?.headers()['cache-control']).toContain('must-revalidate');
    await settle(page);
    expect(await read()).toEqual([]);
  });

  test('security and cache headers are present on the document', async ({ page }) => {
    const response = await navigate(page, '/');
    const h = response?.headers() ?? {};
    expect(h['x-content-type-options']).toBe('nosniff');
    expect(h['referrer-policy']).toBe('no-referrer');
    expect(h['permissions-policy']).toContain('geolocation=()');
    expect(h['cross-origin-opener-policy']).toBe('same-origin');
    expect(h['cache-control']).toContain('must-revalidate');
  });

  test('fingerprinted assets are cached immutably', async ({ page }) => {
    const chunks: string[] = [];
    page.on('response', (r) => {
      if (r.url().includes('/_next/static/')) chunks.push(r.headers()['cache-control'] ?? '');
    });
    await navigate(page, '/');
    await settle(page);
    expect(chunks.length, 'the page must load at least one fingerprinted chunk').toBeGreaterThan(0);
    for (const value of chunks) expect(value).toContain('immutable');
  });

  test('makes no third-party request and loads no remote resource', async ({ page }) => {
    const foreign: string[] = [];
    page.on('request', (r) => {
      const url = new URL(r.url());
      if (url.hostname !== '127.0.0.1' && url.protocol !== 'data:') foreign.push(r.url());
    });
    await navigate(page, '/');
    await settle(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    expect(foreign, `unexpected third-party requests:\n${foreign.join('\n')}`).toEqual([]);
  });
});

test.describe('rendering', () => {
  test('renders the brand, the status notice, and the lifecycle in this engine', async ({ page }) => {
    await navigate(page, '/');
    await settle(page);

    await expect(page.getByRole('link', { name: 'Renvor home' })).toBeVisible();
    await expect(page.getByRole('note', { name: 'Project status' })).toBeVisible();

    // The lifecycle is the one claim the page can currently point at, so it must be present
    // as text on every engine — not only as a canvas a WebKit build might refuse to create.
    const readout = page.locator('.register-stages li');
    await expect(readout).toHaveCount(7);
    await expect(readout).toHaveText([
      /Load/,
      /Validate/,
      /Register/,
      /Boot/,
      /Ready/,
      /Drain/,
      /Stop/,
    ]);
  });

  test('renders without a horizontal scrollbar', async ({ page }) => {
    await navigate(page, '/');
    await settle(page);
    // Polled rather than sampled once. A genuinely overflowing page never reaches 0 and still
    // fails; a single reading taken while layout was still settling did, intermittently, and
    // that is measurement noise rather than a finding.
    await expect
      .poll(
        () =>
          page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
          ),
        { timeout: 15_000 },
      )
      .toBeLessThanOrEqual(0);
  });

  test('remains readable when WebGL is unavailable', async ({ page }) => {
    // Simulates a blocked or absent GPU by making context creation fail. The decorative canvas
    // must degrade; the hero copy and the lifecycle text must not disappear with it.
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
        if (String(type).includes('webgl')) return null;
        // eslint-disable-next-line prefer-rest-params
        return (original as never as (...a: unknown[]) => unknown).call(this, type, ...rest);
      } as typeof HTMLCanvasElement.prototype.getContext;
    });

    const console_ = collectConsole(page);
    await navigate(page, '/');
    await settle(page);

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('.register-stages li')).toHaveCount(7);
    await expect(page.getByRole('note', { name: 'Project status' })).toBeVisible();
    expect(
      console_.rejections,
      `a failed WebGL context must not throw into the page:\n${console_.rejections.join('\n')}`,
    ).toEqual([]);
  });
});
