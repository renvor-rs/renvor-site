import type { Page, Response } from '@playwright/test';

/**
 * Navigate, retrying the **navigation** once — and nothing else.
 *
 * WHY THIS EXISTS, AND WHY IT IS NOT `retries: 1`
 * ----------------------------------------------
 * Headless Firefox intermittently fails to fire `load` for one navigation in a run: exactly one
 * of its ten tests, a different one each time, always `page.goto … waiting until "load"`, never
 * on Chromium or WebKit. It survived every plausible fix on the page and on the harness — the
 * server was made async and fully in-memory, given an exclusive bind and a distinct port per
 * suite, the engine matrix was made serial, WebGL initialisation was moved off the load path,
 * and the budget was raised to 90 seconds. Twenty-nine tests pass and one navigation hangs.
 *
 * A run-level `retries: 1` would fix the symptom and cost far too much: it would also retry a
 * **CSP violation**, a **WCAG violation**, and a **broken header**, so an intermittent real
 * defect would be reported as flaky-but-passing. That is precisely the failure this suite
 * exists to prevent, and `retries` stays at **0** in the config.
 *
 * This is narrower by construction. It retries the act of loading the page, before any
 * assertion has run. If the page is genuinely broken, both navigations fail and the test fails.
 * If an assertion is going to fail, it fails on the first and only attempt it gets. The retry
 * cannot turn a red finding green — it can only survive a browser that did not answer.
 *
 * It also **reports itself**: a retry prints to the CI log, so "this happened" stays visible
 * rather than becoming silence. A retry rate that starts climbing is then a signal, not a
 * secret.
 */
export async function navigate(page: Page, path: string): Promise<Response | null> {
  // Shorter than the 90s test timeout on purpose: the first attempt must give up early enough
  // to leave room for the second, otherwise this helper would only ever run once.
  const NAV_TIMEOUT = 30_000;

  try {
    return await page.goto(path, { waitUntil: 'load', timeout: NAV_TIMEOUT });
  } catch (error) {
    const reason = error instanceof Error ? error.message.split('\n')[0] : String(error);
    console.warn(
      `[navigate] first attempt at ${path} did not complete within ${NAV_TIMEOUT}ms (${reason}); ` +
        'retrying the navigation once. Assertions are NOT retried.',
    );
    // A fresh navigation rather than a reload: reload can reuse the wedged load that failed.
    return await page.goto(path, { waitUntil: 'load', timeout: NAV_TIMEOUT });
  }
}
