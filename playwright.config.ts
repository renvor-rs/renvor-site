import { defineConfig, devices } from '@playwright/test';

/**
 * The suite runs against the **built static export**, served by `scripts/serve-static.mjs`
 * with the generated production headers applied — never against `next dev`. The dev server
 * injects a refresh runtime and unminified markup that production never ships, and it applies
 * no CSP at all, so a pass there would be evidence about the wrong artifact.
 */
/* Port is overridable per invocation, and CI uses a DIFFERENT one for every step.
 *
 * The `csp` job runs three suites back to back — control, enforcement, report-only — each
 * starting its own server because `reuseExistingServer` is false. On one shared port those
 * three race: the previous server is still releasing the socket while the next one binds, and
 * Playwright's health check can be answered by the *outgoing* server. Tests then begin against
 * a process that is shutting down, and its half-closed connections surface as `page.goto`
 * hanging until the test timeout — which is exactly the symptom that was observed, always on a
 * later test, never on the first. Distinct ports remove the race rather than widening a
 * timeout around it. */
const PORT = Number(process.env.A11Y_PORT ?? 3210);
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './tests',

  /* Parallel per FILE, not per test.
     `fullyParallel: true` runs the tests inside one file concurrently, which put two headless
     Firefox instances through a software-rendered WebGL scene at the same time. Firefox then
     exceeded even a 90s navigation budget on a different test each run, while passing 10/10 on
     three consecutive serial runs — so it was CPU contention, not a page defect. Diagnosed by
     measuring rather than by adding retries: `retries` stays at 0. */
  fullyParallel: false,

  // A stray `test.only` must fail CI rather than silently shrink the matrix.
  forbidOnly: !!process.env.CI,

  // Zero retries on purpose. A retry that turns a red run green hides an intermittent
  // violation, and a gate that hides intermittent violations is decoration. Timing is handled
  // by explicit waits on observable state instead.
  retries: 0,

  /* 90s per test rather than Playwright's 30s default.
     This is a budget correction, not a workaround. The hero boots a Three.js scene, and headless
     Firefox on a machine with no GPU software-renders it; combined with two projects running in
     parallel, `page.goto` alone exceeded 30s often enough to fail different tests on different
     runs. Every wait in the suite is on an observable signal — hydration, a load state, an
     attribute — so a genuinely broken page still fails, it just no longer fails because the
     renderer was slow. Diagnosed from the failure text (`Test timeout of 30000ms exceeded`)
     rather than by adding retries until it went green. */
  timeout: 90_000,

  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['list'], ['html', { open: 'never' }]] : [['list']],

  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',

    /* Every axe sweep runs under `prefers-reduced-motion: reduce`, and that is a measurement
       decision rather than a convenience.

       The page drives its reveals with GSAP, which writes inline `opacity` and scrubs it as
       the reader scrolls. Scanning with motion enabled samples whatever animation frame the
       scan landed on: panorama copy sits at low opacity until scrolled into range, and axe
       correctly reports the composited result as a contrast failure. That finding is about a
       transient frame, not about the palette, and it moves with scroll position and machine
       speed — which makes the gate both wrong and non-deterministic.

       Under reduced motion the page's own gate creates zero ScrollTriggers and writes zero
       inline styles, so every element sits at its authored colour. That is the state the
       palette can actually be held to. Motion is not left untested: `motion.spec.ts` asserts
       the animation really does engage when motion is allowed, so this sweep cannot become
       green by the animation quietly breaking. */
    contextOptions: { reducedMotion: 'reduce' },
  },

  projects: [
    // The two viewports the maintainer review was recorded at, so a regression is measured
    // against the same geometry that was approved.
    {
      name: 'desktop-1440x900',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
      testIgnore: /(browser|csp-control)\.spec\.ts/,
    },
    {
      name: 'mobile-390x844',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
      testIgnore: /(browser|csp-control)\.spec\.ts/,
    },
    // Engine matrix. Blink, Gecko, and WebKit each implement CSP separately, so a policy that
    // only ever ran on one of them is a policy tested on one third of readers.
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, testMatch: /browser\.spec\.ts/ },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }, testMatch: /browser\.spec\.ts/ },
    { name: 'webkit', use: { ...devices['Desktop Safari'] }, testMatch: /browser\.spec\.ts/ },

    // Runs only when explicitly selected (`--project=csp-control`), because it needs the
    // server started with CSP_CONTROL=1. Including it in the default run would fail every
    // time, since without the injected script there is nothing for the control to catch.
    {
      name: 'csp-control',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /csp-control\.spec\.ts/,
    },
  ],

  webServer: {
    // Serves `out/` with the generated policy applied — the same string the image ships.
    command: 'node scripts/serve-static.mjs',
    url: `${BASE_URL}/health`,
    env: {
      PORT: String(PORT),
      CSP_MODE: process.env.CSP_MODE ?? 'enforce',
      ...(process.env.CSP_CONTROL ? { CSP_CONTROL: process.env.CSP_CONTROL } : {}),
    },
    // Deliberately false everywhere, not just in CI. A stray Next dev server on this port was
    // reused instead of the static harness during development: it sends no CSP, compiles on
    // demand, and produced `page.goto` timeouts and header assertions that failed on a
    // different test every run. Always starting our own server makes the artifact under test
    // unambiguous.
    reuseExistingServer: false,
    timeout: 60_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
