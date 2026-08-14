import AxeBuilder from '@axe-core/playwright';
import {expect, test, type Locator, type Page} from '@playwright/test';
import type {Result} from 'axe-core';

// WCAG 2.1 A and AA. These are the tags the page is being held to; adding `best-practice`
// would mix advisory findings into a fatal gate, and dropping any of these would lower the
// bar to whatever the page currently happens to pass.
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] as const;

/**
 * Renders violations with enough detail to fix them from the CI log alone — rule, impact,
 * help URL, and the offending selectors. A bare `expect(violations).toEqual([])` prints an
 * unreadable object dump, which in practice means nobody reads it.
 */
function describeViolations(violations: Result[]): string {
  return violations
    .map((v) => {
      const targets = v.nodes
        .map((n) => `        - ${n.target.join(' ')}`)
        .join('\n');
      return `  [${v.impact ?? 'unknown'}] ${v.id}: ${v.help}\n      ${v.helpUrl}\n${targets}`;
    })
    .join('\n');
}

async function scan(page: Page, include?: string): Promise<Result[]> {
  const builder = new AxeBuilder({page}).withTags([...WCAG_TAGS]);
  if (include) builder.include(include);
  const {violations} = await builder.analyze();
  return violations;
}

async function expectNoViolations(page: Page, label: string, include?: string) {
  const violations = await scan(page, include);
  expect(
    violations,
    violations.length === 0
      ? `${label}: clean`
      : `${label}: ${violations.length} WCAG 2.1 A/AA violation(s)\n${describeViolations(violations)}`,
  ).toEqual([]);
}

/**
 * Waits until the page is actually there to be measured: hydrated, and with webfonts
 * resolved so text is scanned at its real size and weight rather than in a fallback face.
 *
 * There is no animation to wait out — the whole suite runs under `prefers-reduced-motion`
 * (see the rationale in playwright.config.ts), so GSAP writes no inline styles and every
 * element is already at its authored colour. These are waits on observable state, not
 * sleeps, and nothing here suppresses a finding.
 */
async function settle(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('html')).toHaveAttribute('data-has-hydrated', 'true');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
}

test.describe('landing route', () => {
  test('has no WCAG 2.1 A/AA violations on first paint', async ({page}) => {
    await page.goto('/');
    await settle(page);
    await expectNoViolations(page, 'landing / (initial state)');
  });

  test('has no WCAG 2.1 A/AA violations once scrolled', async ({page}) => {
    // The navbar restyles itself on scroll — its links move onto a different background
    // than the one they start on. Scanning only the top of the page would never measure
    // the state a reader spends most of their time looking at.
    await page.goto('/');
    await settle(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect
      .poll(() => page.evaluate(() => window.scrollY), {timeout: 10_000})
      .toBeGreaterThan(0);
    await expectNoViolations(page, 'landing / (scrolled to end)');
  });

  test('exposes a skip link that becomes visible on keyboard focus', async ({page}) => {
    await page.goto('/');
    await settle(page);

    const skipLink = page.getByRole('link', {name: 'Skip animated introduction'});
    await expect(skipLink).toHaveAttribute('href', '#solutions');

    // Off-screen until focused is fine; unreachable by keyboard is not. Focusing it must
    // bring it into the viewport, which is the whole point of a skip link.
    await skipLink.focus();
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeInViewport();
  });
});

// Every tab is a distinct rendered panel with its own heading, badge, and list. Scanning
// only the default tab would leave three quarters of this section unmeasured.
const SOLUTION_TABS = ['backend', 'data', 'identity', 'delivery'] as const;

test.describe('solution tablist', () => {
  for (const id of SOLUTION_TABS) {
    test(`panel for the "${id}" tab has no WCAG 2.1 A/AA violations`, async ({page}) => {
      await page.goto('/');
      await settle(page);

      const tab = page.locator(`#solution-tab-${id}`);
      await tab.click();

      await expect(tab).toHaveAttribute('aria-selected', 'true');
      await expect(page.locator('#solution-panel')).toHaveAttribute(
        'aria-labelledby',
        `solution-tab-${id}`,
      );

      await expectNoViolations(page, `landing / solution tab "${id}"`);
    });
  }

  test('implements roving tabindex and arrow-key navigation', async ({page}) => {
    await page.goto('/');
    await settle(page);

    const tabs: Locator[] = SOLUTION_TABS.map((id) => page.locator(`#solution-tab-${id}`));

    // Exactly one tab is in the tab order at a time; the rest are reachable by arrow key.
    // This is the ARIA tablist contract, and axe cannot verify it — it needs interaction.
    const first = tabs[0]!;
    await expect(first).toHaveAttribute('tabindex', '0');
    for (const tab of tabs.slice(1)) {
      await expect(tab).toHaveAttribute('tabindex', '-1');
    }

    await first.focus();
    await page.keyboard.press('ArrowRight');
    await expect(tabs[1]!).toBeFocused();
    await expect(tabs[1]!).toHaveAttribute('aria-selected', 'true');

    await page.keyboard.press('End');
    await expect(tabs[tabs.length - 1]!).toBeFocused();

    await page.keyboard.press('Home');
    await expect(first).toBeFocused();
    await expect(first).toHaveAttribute('aria-selected', 'true');
  });
});

test.describe('evaluation lens carousel', () => {
  test('has no WCAG 2.1 A/AA violations in any lens state', async ({page}) => {
    await page.goto('/');
    await settle(page);

    const next = page.getByRole('button', {name: 'Next evaluation lens'});
    const heading = page.locator('[aria-live="polite"] h2');

    const seen: string[] = [];
    // Three lenses, walked with the control a keyboard user would actually reach.
    for (let i = 0; i < 3; i += 1) {
      const title = (await heading.textContent())?.trim() ?? '';
      expect(title, 'each lens must render a non-empty heading').not.toBe('');
      seen.push(title);

      await expectNoViolations(page, `landing / evaluation lens "${title}"`);
      await next.click();
      await expect(heading).not.toHaveText(title);
    }

    // Proves the walk actually advanced rather than re-scanning one state three times.
    expect(new Set(seen).size, `expected 3 distinct lenses, saw ${seen.join(' | ')}`).toBe(3);
  });
});

test.describe('404 route', () => {
  test('has no WCAG 2.1 A/AA violations', async ({page}) => {
    // Served as a static document by the production server, so it is requested by path
    // rather than by triggering a real 404 the static server would answer differently.
    await page.goto('/404.html');
    await page.waitForLoadState('domcontentloaded');
    await page.evaluate(() => document.fonts.ready);
    await expectNoViolations(page, '404 page');
  });
});
