import { expect, test, type Page } from '@playwright/test';
import { navigate } from './support/navigate';

/**
 * The negative control for the CSP suite.
 *
 * `browser.spec.ts` asserts that the page produces **zero** violations. That result is only
 * meaningful if the browser was enforcing anything at all — an unapplied policy produces
 * exactly the same zero. This file closes that gap by making the browser block something on
 * purpose and asserting that it did.
 *
 * It runs in its own invocation because the server must be started with `CSP_CONTROL=1`,
 * which injects an inline script whose hash is deliberately absent from the policy. See the
 * `csp` job in `.github/workflows/landing-ci.yml`.
 *
 * If this file passes while `browser.spec.ts` also passes, the zero in that file means "the
 * policy is applied and the page complies". If this file fails, every clean result in the
 * same run is worthless and the build must go red.
 */

interface Violation {
  directive: string;
  blockedURI: string;
}

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

test.describe('negative control', () => {
  test('an un-hashed inline script is reported AND refused execution', async ({ page }) => {
    const read = await collectViolations(page);
    await navigate(page, '/');
    await page.waitForLoadState('domcontentloaded');

    const violations = await read();

    // 1. The browser reported it. Proves the policy reached the browser and was parsed.
    expect(
      violations.filter((v) => v.directive.includes('script-src')),
      'the injected un-hashed inline script MUST raise a script-src violation — if it did ' +
        'not, the policy is not being enforced and every zero-violation result is meaningless',
    ).not.toEqual([]);

    // 2. It did not run. Reporting without blocking is Report-Only behaviour, and this suite
    //    is meant to be validating Enforcement.
    const executed = await page.evaluate(
      () => (window as unknown as { __CSP_CONTROL_EXECUTED__?: boolean }).__CSP_CONTROL_EXECUTED__,
    );
    expect(executed, 'the blocked script must not have executed').toBeFalsy();
  });

  test('the legitimate page still works while the control is blocked', async ({ page }) => {
    // Proves the policy is discriminating rather than simply breaking everything: the hashed
    // theme script and the same-origin chunks must still run.
    await navigate(page, '/');
    await expect(page.locator('header.site-header')).toHaveAttribute('data-hydrated', 'true');
    await expect(page.locator('html')).toHaveAttribute('data-theme', /light|dark/);
    await expect(page.getByRole('note', { name: 'Project status' })).toBeVisible();
  });
});
