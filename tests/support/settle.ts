import { expect, type Page } from '@playwright/test';

/**
 * Waits until the page is actually there to be measured.
 *
 * `data-hydrated` is rendered by the header once its mount effect has run (see
 * `app/components/Header.tsx`), so this waits on React having attached rather than on a clock.
 * A sleep long enough to be reliable is long enough to hide a regression; these are waits on
 * observable state, and nothing here suppresses a finding.
 *
 * It is read from the `<header>` element, not from `<html>`: React owns the root element in
 * the App Router and reconciles away attributes it did not render, so a marker written onto
 * `<html>` from an effect does not survive.
 *
 * `document.fonts.ready` is kept even though the site ships no webfont — it costs nothing,
 * and it stops this helper becoming wrong the day someone adds one.
 */
export async function settle(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  // 20s rather than the 5s default. Hydration here means parsing ~34KB of flight payload and
  // booting Three.js, and the suite runs five projects in parallel — under that contention the
  // default was occasionally short on Firefox while the page was in fact fine. This is not a
  // retry and it does not mask anything: if hydration genuinely never happens the assertion
  // still fails, it just no longer fails because another worker had the CPU.
  await expect(page.locator('header.site-header')).toHaveAttribute('data-hydrated', 'true', {
    timeout: 20_000,
  });
  // `load`, not `networkidle`. Playwright discourages `networkidle`, and here it is actively
  // wrong: Firefox never reached it on this page, so every spec using it timed out on an
  // engine where the page was in fact fully loaded and interactive. The hydration marker above
  // is the real signal that React has attached; `load` covers subresources.
  await page.waitForLoadState('load');
  await page.evaluate(() => document.fonts.ready);
}
