import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import type { Result } from 'axe-core';
import { settle } from './support/settle';

// WCAG 2.1 A and AA. These are the tags the page is held to; adding `best-practice` would mix
// advisory findings into a fatal gate, and dropping any of these would lower the bar to
// whatever the page currently happens to pass.
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] as const;

/** Renders violations fixably from the CI log alone — rule, impact, help URL, and selectors. */
function describeViolations(violations: Result[]): string {
  return violations
    .map((v) => {
      const targets = v.nodes.map((n) => `        - ${n.target.join(' ')}`).join('\n');
      return `  [${v.impact ?? 'unknown'}] ${v.id}: ${v.help}\n      ${v.helpUrl}\n${targets}`;
    })
    .join('\n');
}

async function expectNoViolations(page: Page, label: string) {
  const { violations } = await new AxeBuilder({ page }).withTags([...WCAG_TAGS]).analyze();
  expect(
    violations,
    violations.length === 0
      ? `${label}: clean`
      : `${label}: ${violations.length} WCAG 2.1 A/AA violation(s)\n${describeViolations(violations)}`,
  ).toEqual([]);
}

test.describe('landing route', () => {
  test('has no WCAG 2.1 A/AA violations on first paint', async ({ page }) => {
    await page.goto('/');
    await settle(page);
    await expectNoViolations(page, 'landing / (initial state)');
  });

  test('has no WCAG 2.1 A/AA violations once scrolled', async ({ page }) => {
    // Several sections restyle as they enter the viewport. Scanning only the top would never
    // measure the state a reader spends most of their time looking at.
    await page.goto('/');
    await settle(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 10_000 }).toBeGreaterThan(0);
    await expectNoViolations(page, 'landing / (scrolled to end)');
  });

  test('exposes a skip link that becomes visible on keyboard focus', async ({ page }) => {
    await page.goto('/');
    await settle(page);

    const skipLink = page.getByRole('link', { name: 'Skip to content' });
    await expect(skipLink).toHaveAttribute('href', '#top');

    // Off-screen until focused is fine; unreachable by keyboard is not. Focusing it must bring
    // it into the viewport, which is the whole point of a skip link.
    await skipLink.focus();
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeInViewport();
  });

  test('states the development status before any interaction', async ({ page }) => {
    // A release gate, not a copy check: PLAN.md §26.6 requires the page to say plainly that
    // Renvor cannot be installed, and to say it somewhere a reader meets immediately.
    await page.goto('/');
    await settle(page);
    const notice = page.getByRole('note', { name: 'Project status' });
    await expect(notice).toBeVisible();
    await expect(notice).toContainText('cannot be installed');
    await expect(notice).toContainText('Phase 002 delivers a tested transport-independent kernel');
    await expect(notice).toContainText('No crate, release, CLI, network transport');
  });

  test('never presents an installable command', async ({ page }) => {
    // Both commands may appear, but only labelled as unavailable. This asserts the label is
    // present next to each, so a future edit cannot leave a bare command looking runnable.
    await page.goto('/');
    await settle(page);
    const commands = page.locator('.unavailable-command');
    await expect(commands).toHaveCount(2);
    await expect(commands.nth(0)).toHaveText('renvor new');
    await expect(commands.nth(1)).toHaveText('renvor add renvor-rbac');
    await expect(page.locator('.unavailable-note')).toHaveCount(2);

    // The superseded executable name must not appear anywhere on the page.
    const body = (await page.locator('body').textContent()) ?? '';
    expect(body, 'the retired `renover` spelling must not appear').not.toContain('renover');
  });
});

// Every tab is a distinct rendered panel with its own heading, badge, and list. Scanning only
// the default tab would leave three quarters of this section unmeasured.
const SOLUTION_TABS = ['backend', 'data', 'identity', 'delivery'] as const;

test.describe('solution tablist', () => {
  for (const id of SOLUTION_TABS) {
    test(`panel for the "${id}" tab has no WCAG 2.1 A/AA violations`, async ({ page }) => {
      await page.goto('/');
      await settle(page);

      const tab = page.locator(`#tab-${id}`);
      await tab.click();

      await expect(tab).toHaveAttribute('aria-selected', 'true');
      await expect(page.locator('#solution-panel')).toHaveAttribute('aria-labelledby', `tab-${id}`);

      await expectNoViolations(page, `landing / solution tab "${id}"`);
    });
  }

  test('implements roving tabindex and arrow-key navigation', async ({ page }) => {
    await page.goto('/');
    await settle(page);

    const tabs: Locator[] = SOLUTION_TABS.map((id) => page.locator(`#tab-${id}`));

    // Exactly one tab is in the tab order at a time; the rest are reachable by arrow key.
    // That is the ARIA tablist contract, and axe cannot verify it — it needs interaction.
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
  test('has no WCAG 2.1 A/AA violations in any lens state', async ({ page }) => {
    await page.goto('/');
    await settle(page);

    const next = page.getByRole('button', { name: 'Next evaluation lens' });
    const heading = page.locator('.evaluation-copy h2');

    const seen: string[] = [];
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

  test('is operable by keyboard alone', async ({ page }) => {
    await page.goto('/');
    await settle(page);
    const next = page.getByRole('button', { name: 'Next evaluation lens' });
    const heading = page.locator('.evaluation-copy h2');
    const before = (await heading.textContent())?.trim() ?? '';

    await next.focus();
    await expect(next).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(heading).not.toHaveText(before);
  });
});

test.describe('theme toggle', () => {
  test('switches theme by keyboard and reports its state', async ({ page }) => {
    await page.goto('/');
    await settle(page);

    const toggle = page.getByRole('button', { name: /Switch to (light|dark) theme/ });
    const before = await page.locator('html').getAttribute('data-theme');

    await toggle.focus();
    await expect(toggle).toBeFocused();
    await page.keyboard.press('Enter');

    await expect
      .poll(() => page.locator('html').getAttribute('data-theme'))
      .not.toBe(before);
    // `aria-pressed` must track the real state, or the control lies to a screen reader.
    const after = await page.locator('html').getAttribute('data-theme');
    await expect(toggle).toHaveAttribute('aria-pressed', String(after === 'dark'));
  });

  test('has no WCAG 2.1 A/AA violations in the dark theme', async ({ page }) => {
    await page.goto('/');
    await settle(page);
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expectNoViolations(page, 'landing / dark theme');
  });
});

test.describe('404 route', () => {
  test('has no WCAG 2.1 A/AA violations', async ({ page }) => {
    await page.goto('/404.html');
    await settle(page);
    await expectNoViolations(page, '404 page');
  });

  test('an unknown path is answered 404 with the 404 document', async ({ page }) => {
    const response = await page.goto('/definitely-not-a-page');
    expect(response?.status(), 'a missing route must be a real 404, not a 200').toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('does not exist');
  });
});

test.describe('layout', () => {
  // WCAG 1.4.10 reflow. Horizontal scrolling at these widths is the failure this catches.
  for (const width of [320, 375, 768, 1024, 1440]) {
    test(`does not overflow horizontally at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await settle(page);
      // Polled, not sampled once: a genuinely overflowing page never reaches 0, while a single
      // reading taken mid-layout can be wrong under parallel load.
      await expect
        .poll(
          () =>
            page.evaluate(
              () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
            ),
          { timeout: 15_000, message: `${width}px viewport overflowed` },
        )
        .toBeLessThanOrEqual(0);
    });
  }

  test('remains usable at 200% zoom', async ({ page }) => {
    // WCAG 1.4.4. Emulated by halving the viewport, which is what doubling the scale does to
    // the CSS pixel budget.
    await page.setViewportSize({ width: 640, height: 512 });
    await page.goto('/');
    await settle(page);
    await expect
      .poll(
        () =>
          page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
          ),
        { timeout: 15_000, message: '200% zoom overflowed' },
      )
      .toBeLessThanOrEqual(0);
    await expect(page.getByRole('note', { name: 'Project status' })).toBeVisible();
  });
});
