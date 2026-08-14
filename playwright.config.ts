import {defineConfig, devices} from '@playwright/test';

// The suite runs against the *built* site, never the dev server. The dev server injects
// React refresh runtime and unminified markup that production never ships, so a pass there
// would not be evidence about the artifact that gets deployed.
const PORT = Number(process.env.A11Y_PORT ?? 3210);
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './tests/a11y',
  fullyParallel: true,

  // A stray `test.only` must fail CI rather than silently shrink the matrix.
  forbidOnly: !!process.env.CI,

  // Zero retries on purpose. A retry that turns a red run green hides an intermittent
  // violation, and an accessibility gate that hides intermittent violations is decoration.
  // Timing is handled by explicit waits in the specs instead.
  retries: 0,

  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [['github'], ['list'], ['html', {open: 'never'}]]
    : [['list']],

  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',

    // Every axe sweep runs under `prefers-reduced-motion: reduce`, and that is a deliberate
    // measurement decision rather than a convenience.
    //
    // The landing page drives its reveals with GSAP, which writes inline `opacity` onto
    // elements and scrubs it as the reader scrolls. Scanning with motion enabled therefore
    // samples whatever animation frame the scan happened to land on: the panorama copy sits
    // at `opacity: 0.12` until scrolled into range, and axe correctly reports the composited
    // result as a contrast failure. That finding is about a transient frame, not about the
    // palette, and it moves depending on scroll position and machine speed — so it makes the
    // gate both wrong and non-deterministic.
    //
    // Under reduced motion the page's own gate creates zero ScrollTriggers and writes zero
    // inline styles, so every element sits at its authored colour. That is the state the
    // palette can actually be held to. Motion is not left untested: `motion.spec.ts` asserts
    // that the animation really does engage when motion is allowed, so this sweep cannot
    // silently become green by the animation breaking.
    //
    // Playwright exposes this through `contextOptions`, not as a top-level `use` key.
    contextOptions: {reducedMotion: 'reduce'},
  },

  projects: [
    // The two viewports the maintainer review recorded on 2026-08-12, so a regression here
    // is measured against the same geometry that was approved.
    {
      name: 'desktop-1440x900',
      use: {...devices['Desktop Chrome'], viewport: {width: 1440, height: 900}},
    },
    {
      name: 'mobile-390x844',
      use: {
        ...devices['Desktop Chrome'],
        viewport: {width: 390, height: 844},
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],

  webServer: {
    command: `pnpm exec docusaurus serve --dir build --host 127.0.0.1 --port ${PORT} --no-open`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
