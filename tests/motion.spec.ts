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

const TRACE = '[data-architecture-trace]';
const ROUTE = '[data-architecture-route]';
const NODE = '[data-architecture-node]';
const STAGE = '[data-architecture-stage]';
const LIFECYCLE_BOARD = '[data-lifecycle-board]';
const LIFECYCLE_NODE = '[data-lifecycle-node]';
const LIFECYCLE_NAME = '[data-lifecycle-node] .lifecycle-phase-name';
const LIFECYCLE_CURSOR = '[data-lifecycle-cursor]';
const LIFECYCLE_ROLLBACK = '[data-lifecycle-rollback]';
const AMBIENT_FIELD = '[data-ambient-field]';
const AMBIENT_SCENE = '[data-ambient-scene]';
const AMBIENT_SIGNAL = '[data-ambient-signal]';
const CSS_LOOPS = '.signal-loop-track, .docs-rail img';
const MOTION_TOGGLE_NAME = 'Animation playback';

async function expectArchitectureTargets(page: Page): Promise<void> {
  await expect(page.locator(TRACE), 'the semantic request trace should render once').toHaveCount(1);
  await expect(page.locator(ROUTE), 'the request, return, and connecting routes should render').toHaveCount(
    3,
  );
  await expect(page.locator(NODE), 'each request stage should have a corresponding route node').toHaveCount(
    4,
  );
  await expect(page.locator(STAGE), 'the trace should explain all four ordered stages').toHaveCount(4);
}

async function inlineAnimationStyleCount(page: Page): Promise<number> {
  return page.locator(`${ROUTE}, ${NODE}, ${STAGE}`).evaluateAll((elements) =>
    elements.filter((element) => {
      const style = (element as HTMLElement | SVGElement).style;
      return [
        style.opacity,
        style.transform,
        style.strokeDasharray,
        style.strokeDashoffset,
      ].some((value) => value !== '');
    }).length,
  );
}

async function activeRouteDashOffsetCount(page: Page): Promise<number> {
  return page.locator(ROUTE).evaluateAll((routes) =>
    routes.filter((route) => {
      const value = (route as SVGPathElement).style.strokeDashoffset;
      return value !== '' && Math.abs(Number.parseFloat(value)) > 0.1;
    }).length,
  );
}

async function triggerArchitectureTrace(page: Page): Promise<void> {
  await page.evaluate((selector) => {
    const trace = document.querySelector<HTMLElement>(selector);
    if (!trace) throw new Error('Architecture trace is missing.');

    document.documentElement.style.scrollBehavior = 'auto';
    const top = window.scrollY + trace.getBoundingClientRect().top;
    window.scrollTo(0, Math.max(0, top - window.innerHeight * 0.7));
  }, TRACE);
}

async function expectLifecycleTargets(page: Page): Promise<void> {
  await expect(page.locator(LIFECYCLE_BOARD), 'the lifecycle interlocking board should render once').toHaveCount(1);
  await expect(page.locator(LIFECYCLE_NODE), 'all seven ordered kernel phases should render').toHaveCount(7);
  await expect(page.locator(LIFECYCLE_ROLLBACK), 'Boot should expose one explicit rollback branch').toHaveCount(1);
  await expect(page.locator(LIFECYCLE_NAME)).toHaveText(STAGE_NAMES_FOR_TEST);
}

const STAGE_NAMES_FOR_TEST = ['01Load', '02Validate', '03Register', '04Boot', '05Ready', '06Drain', '07Stop'];

async function triggerLifecycleBoard(page: Page): Promise<void> {
  await page.evaluate((selector) => {
    const board = document.querySelector<HTMLElement>(selector);
    if (!board) throw new Error('Lifecycle board is missing.');

    document.documentElement.style.scrollBehavior = 'auto';
    const top = window.scrollY + board.getBoundingClientRect().top;
    window.scrollTo(0, Math.max(0, top - window.innerHeight * 0.28));
  }, LIFECYCLE_BOARD);
}

test.describe('reduced motion', () => {
  // Inherits `contextOptions.reducedMotion = 'reduce'` from the config.
  test('applies no inline animation styles', async ({ page }) => {
    await navigate(page, '/');
    await settle(page);

    await expectArchitectureTargets(page);

    expect(
      await inlineAnimationStyleCount(page),
      'reduced motion must leave no GSAP opacity, transform, or route-dash residue',
    ).toBe(0);
  });

  test('leaves the completed request trace fully visible', async ({ page }) => {
    // The reduced-motion state is the authored finished route, not the hidden first frame of
    // an animation that never runs. Every route is measurable and undashed; every node and
    // stage remains fully visible.
    await navigate(page, '/');
    await settle(page);
    await expectArchitectureTargets(page);

    const state = await page.evaluate(
      ({ routeSelector, visibleSelector }) => {
        const routes = Array.from(document.querySelectorAll<SVGPathElement>(routeSelector));
        const visibleTargets = Array.from(document.querySelectorAll<Element>(visibleSelector));

        return {
          measurableRoutes: routes.filter((route) => route.getTotalLength() > 0).length,
          completedRoutes: routes.filter((route) => {
            const style = getComputedStyle(route);
            const dashOffset = Number.parseFloat(style.strokeDashoffset);
            return (
              (style.strokeDasharray === 'none' || style.strokeDasharray === '0px') &&
              (Number.isNaN(dashOffset) || Math.abs(dashOffset) < 0.1)
            );
          }).length,
          fadedTargets: visibleTargets.filter(
            (target) => Number(getComputedStyle(target).opacity) < 0.99,
          ).length,
        };
      },
      { routeSelector: ROUTE, visibleSelector: `${NODE}, ${STAGE}` },
    );

    expect(state.measurableRoutes).toBe(3);
    expect(state.completedRoutes, 'all reduced-motion routes must render in their completed state').toBe(
      3,
    );
    expect(state.fadedTargets, 'all nodes and stage explanations must remain readable').toBe(0);
  });

  test('leaves the full lifecycle and rollback route readable without a loop', async ({ page }) => {
    await navigate(page, '/');
    await settle(page);
    await expectLifecycleTargets(page);

    const board = page.locator(LIFECYCLE_BOARD);
    await expect(board).toHaveAttribute('data-loop-state', 'idle');
    await expect(board).toHaveAttribute('data-current-phase', '01');
    await expect(page.locator(LIFECYCLE_ROLLBACK)).toContainText('Failed boot / rollback branch');
    await expect(page.locator(LIFECYCLE_ROLLBACK)).toContainText('Rollback what started');

    expect(
      await page.locator(`${LIFECYCLE_CURSOR}, ${LIFECYCLE_NODE}`).evaluateAll((elements) =>
        elements.filter((element) => {
          const style = (element as HTMLElement).style;
          return style.opacity !== '' || style.transform !== '';
        }).length,
      ),
      'reduced motion must not leave lifecycle transform or opacity residue',
    ).toBe(0);
  });

  test('leaves a complete static ambient route field without GSAP residue', async ({ page }) => {
    await navigate(page, '/');
    await settle(page);

    const field = page.locator(AMBIENT_FIELD);
    await expect(field).toHaveCount(1);
    await expect(field).toHaveAttribute('data-ambient-state', 'idle');
    await expect(field).toHaveAttribute('data-ambient-progress', '0');
    await expect(page.locator(AMBIENT_SIGNAL)).toHaveCount(2);

    expect(
      await page.locator(`${AMBIENT_SCENE}, ${AMBIENT_SIGNAL}`).evaluateAll((elements) =>
        elements.filter((element) => {
          const style = (element as SVGElement).style;
          return style.transform !== '' || style.opacity !== '' || style.strokeDashoffset !== '';
        }).length,
      ),
      'reduced motion must keep the ambient field in its authored static state',
    ).toBe(0);
  });

  test('renders one fresh stable hero frame after a theme change', async ({ page }) => {
    await navigate(page, '/');
    await settle(page);

    const canvas = page.locator('.hero-stage canvas');
    const fallback = page.locator('.hero-no-webgl');
    await expect
      .poll(async () => (await canvas.count()) + (await fallback.count()), { timeout: 10_000 })
      .toBeGreaterThan(0);

    test.skip((await canvas.count()) === 0, 'This browser runner exposes no WebGL2 context.');

    await expect(canvas).toHaveAttribute('data-static-frame', /\d+/);
    const beforeTheme = await page.locator('html').getAttribute('data-theme');
    const afterTheme = beforeTheme === 'dark' ? 'light' : 'dark';
    const beforeFrame = Number(await canvas.getAttribute('data-static-frame'));

    await page.getByRole('button', { name: /Switch to (light|dark) theme/ }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', afterTheme);
    await expect(canvas).toHaveAttribute('data-static-theme', afterTheme);

    const afterFrame = Number(await canvas.getAttribute('data-static-frame'));
    expect(afterFrame, 'the theme observer must render exactly one fresh static frame').toBe(
      beforeFrame + 1,
    );

    // Give an accidental RAF loop several opportunities to run. Reduced motion must remain
    // on the single frame produced by the theme observer.
    await page.waitForTimeout(180);
    expect(Number(await canvas.getAttribute('data-static-frame'))).toBe(afterFrame);
  });
});

test.describe('motion enabled', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });

  test('offers one persistent control for every CSS animation loop', async ({ page }) => {
    await navigate(page, '/');
    await settle(page);

    const toggle = page.getByRole('button', { name: MOTION_TOGGLE_NAME });
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(toggle).toContainText('pause');
    await expect(page.locator(CSS_LOOPS)).toHaveCount(3);
    expect(
      await page.locator(CSS_LOOPS).evaluateAll((elements) =>
        elements.map((element) => getComputedStyle(element).animationPlayState),
      ),
    ).toEqual(['running', 'running', 'running']);

    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'paused');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(toggle).toContainText('play');
    expect(
      await page.locator(CSS_LOOPS).evaluateAll((elements) =>
        elements.map((element) => getComputedStyle(element).animationPlayState),
      ),
    ).toEqual(['paused', 'paused', 'paused']);

    await page.reload();
    await settle(page);
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'paused');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(toggle).toContainText('play');

    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'running');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(toggle).toContainText('pause');
    expect(
      await page.locator(CSS_LOOPS).evaluateAll((elements) =>
        elements.map((element) => getComputedStyle(element).animationPlayState),
      ),
    ).toEqual(['running', 'running', 'running']);
  });

  test('restores the Three.js logo after repeated down and up scroll cycles', async ({ page }) => {
    await navigate(page, '/');
    await settle(page);

    const canvas = page.locator('.hero-stage canvas');
    const fallback = page.locator('.hero-no-webgl');
    await expect
      .poll(async () => (await canvas.count()) + (await fallback.count()), { timeout: 10_000 })
      .toBeGreaterThan(0);

    test.skip((await canvas.count()) === 0, 'This browser runner exposes no WebGL2 context.');

    await expect(canvas).toHaveAttribute('data-loop-mode', 'route-separation');
    await expect
      .poll(() => canvas.getAttribute('data-signal-travel').then(Number), { timeout: 10_000 })
      .toBeGreaterThan(3.5);
    expect(Number(await canvas.getAttribute('data-logo-scale'))).toBeGreaterThan(1.02);
    await expect
      .poll(() => canvas.getAttribute('data-signal-travel').then(Number), { timeout: 10_000 })
      .toBeLessThan(0.6);
    expect(Number(await canvas.getAttribute('data-logo-scale'))).toBeLessThan(1.005);

    await page.getByRole('button', { name: MOTION_TOGGLE_NAME }).click();
    await expect(canvas).toHaveAttribute('data-motion-state', 'paused');
    const pausedFrame = Number(await canvas.getAttribute('data-loop-frame'));
    await page.waitForTimeout(180);
    expect(
      Number(await canvas.getAttribute('data-loop-frame')),
      'the user control must stop the Three.js RAF loop while the hero remains visible',
    ).toBe(pausedFrame);

    await page.getByRole('button', { name: MOTION_TOGGLE_NAME }).click();
    await expect(canvas).toHaveAttribute('data-motion-state', 'running');
    await expect
      .poll(() => canvas.getAttribute('data-loop-frame').then(Number), { timeout: 2_000 })
      .toBeGreaterThan(pausedFrame);

    // Let the entrance timeline finish before exercising the regression. The bug was caused
    // by the scroll tween capturing that timeline's temporary opacity: 0 as its reverse state.
    await page.waitForTimeout(2_400);
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = 'auto';
    });

    for (let cycle = 0; cycle < 3; cycle += 1) {
      await page.evaluate(() => {
        const hero = document.querySelector<HTMLElement>('.hero');
        if (!hero) throw new Error('Hero is missing.');
        window.scrollTo(0, hero.offsetTop + hero.offsetHeight * 0.85);
      });
      await page.waitForTimeout(280);

      const downOpacity = await page.locator('.hero-stage').evaluate((element) =>
        Number(getComputedStyle(element).opacity),
      );
      expect(downOpacity, `cycle ${cycle + 1} must keep the logo visible while scrolling down`)
        .toBeGreaterThanOrEqual(0.99);

      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(420);

      const opacity = await page.locator('.hero-stage').evaluate((element) =>
        Number(getComputedStyle(element).opacity),
      );
      expect(opacity, `cycle ${cycle + 1} must restore the Three.js logo`).toBeGreaterThanOrEqual(
        0.99,
      );
    }

    // Leave the hero completely, then return. The visibility gate must restart the loop as
    // well as restoring the stage, which closes the longer-scroll version of the same report.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    const beforeLoopFrame = Number(await canvas.getAttribute('data-loop-frame'));
    await page.waitForTimeout(450);
    expect(
      Number(await canvas.getAttribute('data-loop-frame')),
      'the Three.js loop must pause while the hero is fully off-screen',
    ).toBe(beforeLoopFrame);

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(420);

    const returnedOpacity = await page.locator('.hero-stage').evaluate((element) =>
      Number(getComputedStyle(element).opacity),
    );
    expect(returnedOpacity).toBeGreaterThanOrEqual(0.99);
    await expect
      .poll(async () => Number(await canvas.getAttribute('data-loop-frame')), { timeout: 2_000 })
      .toBeGreaterThan(beforeLoopFrame);
  });

  test('draws the request trace and activates its stages', async ({ page }) => {
    await navigate(page, '/');
    await settle(page);
    await expectArchitectureTargets(page);
    await triggerArchitectureTrace(page);

    // Poll observable GSAP state rather than sleeping for a particular frame. At least one
    // route must carry a non-zero inline dash offset while it is being drawn.
    await expect
      .poll(() => activeRouteDashOffsetCount(page), { timeout: 10_000 })
      .toBeGreaterThan(0);

    // The route and its explanation activate as one sequence. Nodes/stages use opacity and
    // transform, so seeing more styled targets than the three routes proves that second half
    // of the timeline engaged too.
    await expect
      .poll(() => inlineAnimationStyleCount(page), { timeout: 10_000 })
      .toBeGreaterThan(3);

    // Route dash properties are deliberately cleared after drawing. This observes completion
    // without tying the assertion to the animation's exact duration or a fixed timeout.
    await expect
      .poll(
        () =>
          page.locator(ROUTE).evaluateAll((routes) =>
            routes.filter((route) => {
              const style = (route as SVGPathElement).style;
              return style.strokeDasharray !== '' || style.strokeDashoffset !== '';
            }).length,
          ),
        { timeout: 10_000 },
      )
      .toBe(0);
  });

  test('runs, pauses, and resumes the lifecycle signal loop', async ({ page }) => {
    await navigate(page, '/');
    await settle(page);
    await expectLifecycleTargets(page);
    await triggerLifecycleBoard(page);

    const board = page.locator(LIFECYCLE_BOARD);
    const cursor = page.locator(LIFECYCLE_CURSOR);
    await expect.poll(() => board.getAttribute('data-loop-state')).toBe('running');
    await expect(cursor).toBeVisible();

    const firstPhase = await board.getAttribute('data-current-phase');
    await expect
      .poll(() => board.getAttribute('data-current-phase'), { timeout: 10_000 })
      .not.toBe(firstPhase);

    await page.getByRole('button', { name: MOTION_TOGGLE_NAME }).click();
    await expect.poll(() => board.getAttribute('data-loop-state')).toBe('paused');
    const userPausedPhase = await board.getAttribute('data-current-phase');
    const userPausedCycle = await board.getAttribute('data-loop-cycle');
    await page.waitForTimeout(700);
    await expect(board).toHaveAttribute('data-current-phase', userPausedPhase ?? '');
    await expect(board).toHaveAttribute('data-loop-cycle', userPausedCycle ?? '');

    await page.getByRole('button', { name: MOTION_TOGGLE_NAME }).click();
    await triggerLifecycleBoard(page);
    await expect.poll(() => board.getAttribute('data-loop-state')).toBe('running');
    await expect
      .poll(() => board.getAttribute('data-current-phase'), { timeout: 10_000 })
      .not.toBe(userPausedPhase);

    await page.evaluate(() => window.scrollTo(0, 0));
    await expect.poll(() => board.getAttribute('data-loop-state')).toBe('paused');

    const pausedPhase = await board.getAttribute('data-current-phase');
    const pausedCycle = await board.getAttribute('data-loop-cycle');
    await page.waitForTimeout(700);
    await expect(board).toHaveAttribute('data-current-phase', pausedPhase ?? '');
    await expect(board).toHaveAttribute('data-loop-cycle', pausedCycle ?? '');

    await triggerLifecycleBoard(page);
    await expect.poll(() => board.getAttribute('data-loop-state')).toBe('running');
    await expect
      .poll(() => board.getAttribute('data-current-phase'), { timeout: 10_000 })
      .not.toBe(pausedPhase);
  });

  test('advances and visibility-gates the ambient route signals', async ({ page }) => {
    await navigate(page, '/');
    await settle(page);

    const field = page.locator(AMBIENT_FIELD);
    await expect(field).toHaveAttribute('data-ambient-state', 'running');
    await expect
      .poll(() => field.getAttribute('data-ambient-progress').then(Number), { timeout: 10_000 })
      .toBeGreaterThan(0.02);

    await page.getByRole('button', { name: MOTION_TOGGLE_NAME }).click();
    await expect(field).toHaveAttribute('data-ambient-state', 'paused');
    const userPausedProgress = await field.getAttribute('data-ambient-progress');
    await page.waitForTimeout(450);
    await expect(field).toHaveAttribute('data-ambient-progress', userPausedProgress ?? '');

    await page.getByRole('button', { name: MOTION_TOGGLE_NAME }).click();
    await expect(field).toHaveAttribute('data-ambient-state', 'running');
    await expect
      .poll(() => field.getAttribute('data-ambient-progress'), { timeout: 10_000 })
      .not.toBe(userPausedProgress);

    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(field).toHaveAttribute('data-ambient-state', 'paused');

    const pausedProgress = await field.getAttribute('data-ambient-progress');
    await page.waitForTimeout(450);
    await expect(field).toHaveAttribute('data-ambient-progress', pausedProgress ?? '');

    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(field).toHaveAttribute('data-ambient-state', 'running');
    await expect
      .poll(() => field.getAttribute('data-ambient-progress'), { timeout: 10_000 })
      .not.toBe(pausedProgress);
  });
});
