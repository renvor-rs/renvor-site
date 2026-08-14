import {expect, test} from '@playwright/test';

/**
 * The accessibility sweep in `landing.spec.ts` deliberately runs under
 * `prefers-reduced-motion: reduce`, because that is the only state in which every element
 * sits at its authored colour rather than at whatever opacity an in-flight GSAP tween left
 * it at.
 *
 * That creates one specific risk worth closing: if the animation gate broke such that GSAP
 * never ran at all, the reduced-motion sweep would keep passing and nothing would notice.
 * These tests pin both directions of the gate, so "reduced motion is clean" can only stay
 * true while "motion actually happens" is also true.
 *
 * They assert the mechanism, not the aesthetics — that inline animation styles are written
 * when motion is allowed and are absent when it is not. That is the same property the
 * maintainer review recorded on 2026-08-12.
 */

const WORD = '[data-architecture-word]';

async function inlineOpacityCount(page: import('@playwright/test').Page): Promise<number> {
  return page.evaluate(
    (sel) =>
      Array.from(document.querySelectorAll<HTMLElement>(sel)).filter(
        (el) => el.style.opacity !== '',
      ).length,
    WORD,
  );
}

test.describe('reduced motion', () => {
  // Inherits `contextOptions.reducedMotion = 'reduce'` from the config.
  test('applies no inline animation styles', async ({page}) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-has-hydrated', 'true');
    await page.waitForLoadState('networkidle');

    const total = await page.locator(WORD).count();
    expect(total, 'the panorama copy should render as individual word spans').toBeGreaterThan(0);

    expect(
      await inlineOpacityCount(page),
      'under prefers-reduced-motion the page must write zero inline opacity styles',
    ).toBe(0);
  });
});

test.describe('motion enabled', () => {
  test.use({contextOptions: {reducedMotion: 'no-preference'}});

  test('does apply inline animation styles', async ({page}) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-has-hydrated', 'true');
    await page.waitForLoadState('networkidle');

    const total = await page.locator(WORD).count();
    expect(total).toBeGreaterThan(0);

    // If this ever reaches zero, the animation has stopped running — and the reduced-motion
    // accessibility sweep would have gone on passing without telling anyone.
    await expect
      .poll(() => inlineOpacityCount(page), {
        timeout: 15_000,
        message: 'GSAP should drive the panorama reveal when motion is allowed',
      })
      .toBeGreaterThan(0);
  });
});
