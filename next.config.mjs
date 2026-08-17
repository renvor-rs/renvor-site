/**
 * Renvor landing site — Next.js configuration.
 *
 * This site is a **fully static export**. Every setting below either enforces that or
 * removes something that would quietly require a Node server at request time. The image
 * that ships is a `scratch` container holding generated files and one static binary; there
 * is no runtime to fall back on, so a feature that needs one is a build-time error here
 * rather than a 500 in production.
 *
 * What is deliberately absent, and must stay absent:
 *   - Server Actions, Route Handlers, and API routes — all require a server.
 *   - `middleware.ts` — the CSP is generated from the built artifact instead (see
 *     `scripts/generate-csp.mjs`), because middleware cannot run in a static export.
 *   - Request-time SSR, ISR, and revalidation.
 *   - Remote image optimisation — `images.unoptimized` below; the optimiser is a service.
 *   - Runtime environment variables, cookies, authentication, and persistent storage.
 *   - Telemetry — disabled in the build environment, see `.github/workflows/landing-ci.yml`
 *     and the Dockerfile, both of which set `NEXT_TELEMETRY_DISABLED=1`.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The whole point. `next build` emits a complete static site into `out/` and fails if any
  // page needs a server to render.
  output: 'export',

  reactStrictMode: true,

  // `out/about` is emitted as `out/about/index.html` rather than `out/about.html`, so a
  // plain static file server resolves directory URLs without rewrite rules. The site is one
  // page today; this keeps a second page from needing server configuration to work.
  trailingSlash: true,

  // The Image Optimisation API is a running service. A static export has none, so Next
  // requires this to be set rather than silently emitting URLs that 404 in production.
  images: { unoptimized: true },

  // Ship no `X-Powered-By: Next.js`. It advertises the framework and version surface for no
  // benefit. Note this only affects responses Next itself serves; the production origin is
  // static-web-server, which never sets the header at all.
  poweredByHeader: false,

  // A type error must fail the build. Next allows opting out, and that opt-out is exactly how
  // a broken build reaches production looking green.
  //
  // The matching `eslint` key was removed in Next 16, which no longer runs ESLint during
  // `next build` at all. Linting is therefore a separate CI step rather than something this
  // file can assert — stating it here would have been a control that does nothing.
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
