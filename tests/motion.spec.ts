import { expect, test, type Page } from '@playwright/test';
import { settle } from './support/settle';
import { navigate } from './support/navigate';

/**
 * The accessibility sweep runs under `prefers-reduced-motion: reduce`, because that is the
 * only state in which every element sits at its authored colour rather than at whatever
 * opacity an in-flight GSAP tween left it at.
 *
 * That creates one specific risk worth closing: if the animation gate broke such that GSAP
 * never ran at all, the reduced-motion sweep would keep passing and nothing would notice.
 * These tests pin both directions, so "reduced motion is clean" can only stay true while
 * "motion actually happens" is also true.
 *
 * They assert the mechanism, not the aesthetics.
 */

const WORD = '[data-architecture-word]';

async function inlineOpacityCount(page: Page): Promise<number> {
  return page.evaluate(
    (sel) =>
      Array.from(document.querySelectorAll<HTMLElement>(sel)).filter((el) => el.style.opacity !== '')
        .length,
    WORD,
  );
}

test.describe('reduced motion', () => {
  // Inherits `contextOptions.reducedMotion = 'reduce'` from the config.
  test('applies no inline animation styles', async ({ page }) => {
    await navigate(page, '/');
    await settle(page);

    const total = await page.locator(WORD).count();
    expect(total, 'the architecture statement should render as individual word spans').toBeGreaterThan(0);

    expect(
      await inlineOpacityCount(page),
      'under prefers-reduced-motion the page must write zero inline opacity styles',
    ).toBe(0);
  });

  test('leaves the page fully readable', async ({ page }) => {
    // The reduced-motion state must be the *finished* state, not the first frame of an
    // animation that never runs. Every word must be at full opacity.
    await navigate(page, '/');
    await settle(page);
    const faded = await page.evaluate((sel) => {
      return Array.from(document.querySelectorAll<HTMLElement>(sel)).filter(
        (el) => Number(getComputedStyle(el).opacity) < 0.99,
      ).length;
    }, WORD);
    expect(faded, 'no word may be left partially transparent under reduced motion').toBe(0);
  });
});

test.describe('motion enabled', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });

  test('does apply inline animation styles', async ({ page }) => {
    await navigate(page, '/');
    await settle(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));

    const total = await page.locator(WORD).count();
    expect(total).toBeGreaterThan(0);

    // If this ever reaches zero, the animation has stopped running — and the reduced-motion
    // accessibility sweep would have gone on passing without telling anyone.
    await expect
      .poll(() => inlineOpacityCount(page), { timeout: 10_000 })
      .toBeGreaterThan(0);
  });
});
