import Header from './components/Header';
import Hero from './components/Hero';
import SolutionTabs from './components/SolutionTabs';
import Panorama from './components/Panorama';
import LensCarousel from './components/LensCarousel';
import ScrollFX from './components/ScrollFX';

/* Bar heights for the two register charts live in `globals.css`, keyed by `:nth-child`, not
   in a `style` attribute here. That is a CSP decision: a `style` attribute is governed by
   `style-src`, so keeping any would force either `'unsafe-inline'` or `'unsafe-hashes'` into
   the production policy for the sake of fourteen numbers. Moving them to the stylesheet lets
   the policy stay `style-src 'self'` with no escape hatch at all.

   The seven lifecycle impressions, in order. This ordering is the product's central claim and
   is implemented in the Phase 002 kernel — `LifecyclePhase` in `renvor-core` has exactly these
   seven variants in exactly this sequence. Changing this array without changing the kernel
   would make the page lie about the one thing it can currently point at. */
const STAGE_NAMES = ['Load', 'Validate', 'Register', 'Boot', 'Ready', 'Drain', 'Stop'];
const pad = (n: number) => String(n).padStart(2, '0');

const STATEMENT =
  'The intended shape: a request enters through a transport, crosses policy and transaction boundaries in the application service, reaches replaceable capability ports, and returns through one typed error contract.';

const CLIENT_ROWS = [
  { name: 'Next.js', copy: 'SSR or CSR for web. Static CSR for Tauri.' },
  { name: 'Yew', copy: 'Component-based Rust UI with typed clients.' },
  { name: 'Dioxus', copy: 'Hooks-based Rust UI across supported targets.' },
  { name: 'Leptos', copy: 'Fine-grained reactive Rust applications.' },
  { name: 'Tauri', copy: 'Desktop packaging for supported static clients.' },
];

const OPERATION_COLUMNS = [
  {
    index: 'impression a',
    title: 'Security gates',
    body: 'Secret scanning, dependency and licence policy, redaction, bounded work, safe defaults, and release attestations.',
    note: 'Secret scanning, licence policy, and release attestation run today on the framework repository. Secret redaction and bounded work are implemented in the kernel. Deployment-time controls are planned.',
  },
  {
    index: 'impression b',
    title: 'Diagnostics',
    body: 'Actionable startup failures, configuration validation, generated-project checks, and package health diagnostics.',
    note: 'Startup failures and configuration validation are implemented and tested in the kernel. Project and package diagnostics need a generator and a package system, and are planned for 1.0 and 4.0.',
  },
  {
    index: 'impression c',
    title: 'Observability',
    body: 'Structured logs, traces, metrics, health, readiness, graceful drain, shutdown, rollback, and recovery.',
    note: 'Phase spans, independent liveness and readiness, the drain gate, and rollback on failed boot are implemented. Metrics export and deployment recovery are planned for 1.0.',
  },
];

const PACKAGES = [
  'renvor-auth',
  'renvor-rbac',
  'renvor-storage',
  'renvor-mail',
  'renvor-jobs',
  'renvor-cache',
  'renvor-observe',
  'renvor-testing',
];

export default function Page() {
  return (
    <>
      <Header />
      <main id="top">
        {/* Development-status notice. Deliberately outside every animation timeline: it must be
            readable before any animation runs, under reduced motion, and if JavaScript fails
            entirely. PLAN.md §26.6 makes this a release gate rather than a style choice. */}
        <aside className="status-notice" role="note" aria-label="Project status">
          <span className="notice-label mono">registration note</span>
          <p>
            <strong>Renvor is in active development and cannot be installed.</strong> Phase 002
            delivers a tested transport-independent kernel. <strong>No crate, release, CLI,
            network transport, database adapter, or generated project is available yet.</strong>
          </p>
          <p className="notice-detail">
            What exists is a kernel that runs the seven-phase lifecycle below, resolves provider
            dependencies within a counted work budget, layers configuration with per-key source
            attribution and total secret redaction, bounds every call into your code with a
            deadline, and answers liveness and readiness independently. It is tested on Rust
            1.94.0 and stable. <strong>Its API is explicitly unstable</strong> and will change
            once a real transport adapter exercises it.
          </p>
          <a href="https://github.com/renvor-rs/renvor/blob/main/PLAN.md">
            Read what is actually planned ↗
          </a>
        </aside>

        <Hero />

        {/* ============ REGISTER STRIP (seven impressions divider) ============ */}
        <div className="register-strip" aria-label="The seven lifecycle impressions">
          {STAGE_NAMES.map((name, i) => (
            <div className="strip-cell" data-strip-cell key={name}>
              <span className="strip-billets">
                <i />
              </span>
              <span className="strip-name mono">
                <i>{pad(i + 1)}</i>
                {name}
              </span>
            </div>
          ))}
        </div>

        {/* ============ §01 SOLUTIONS ============ */}
        <section id="solutions" className="section solutions-section">
          <div className="annot-grid">
            <aside className="annot" data-reveal>
              <span className="register-label mono">register 01 / surfaces</span>
              <span className="annot-note mono">four surfaces · one core · none delivered</span>
            </aside>
            <div className="annot-content">
              <div className="section-heading" data-reveal>
                <h2>Every application surface is designed to connect to one stable core.</h2>
                <p>
                  Renvor aims to provide a coherent default path while preserving the boundaries
                  that experienced Rust teams need to inspect and change.{' '}
                  <strong>
                    Each surface below carries the release that owns it, and none of the four has
                    been delivered.
                  </strong>{' '}
                  The core they are designed to connect to is the part that exists.
                </p>
              </div>
              <SolutionTabs />
              <div className="solution-side">
                <article data-solution-card>
                  <span className="roadmap-badge mono">Planned for Renvor 1.0</span>
                  <h3>Interactive generation</h3>
                  <p>
                    Questions are designed to adapt to previous answers, stopping invalid
                    combinations before generation.
                  </p>
                  <code className="unavailable-command">renvor new</code>
                  <em className="unavailable-note">
                    Not installable — the CLI is unbuilt and unpublished
                  </em>
                </article>
                <article data-solution-card>
                  <span className="roadmap-badge mono">Planned for Renvor 4.0</span>
                  <h3>Installable packages</h3>
                  <p>
                    The design adds RBAC and later capabilities to existing projects through a
                    versioned package contract.
                  </p>
                  <code className="unavailable-command">renvor add renvor-rbac</code>
                  <em className="unavailable-note">
                    Not installable — no package has been published
                  </em>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* ============ ARCHITECTURE STATEMENT ============ */}
        <section className="architecture-statement" data-architecture-statement>
          <span className="register-label mono">recorded intent</span>
          <p data-architecture-text>
            {STATEMENT.split(/\s+/).map((word, i) => (
              <span data-architecture-word key={`${word}-${i}`}>
                {word}{' '}
              </span>
            ))}
          </p>
        </section>

        {/* ============ §02 PANORAMA ============ */}
        <Panorama />

        {/* ============ §03 FULL-STACK ============ */}
        <section id="fullstack" className="section fullstack-section">
          <div className="annot-grid">
            <aside className="annot" data-reveal>
              <span className="register-label mono">register 03 / delivery targets</span>
              <span className="roadmap-badge mono">Planned for Renvor 3.0</span>
            </aside>
            <div className="annot-content">
              <div className="section-heading" data-reveal>
                <h2>One backend contract. The frontend your team prefers.</h2>
                <p>
                  The design: generated clients sharing versioned types, authentication state,
                  error behaviour, and contract regeneration, with styling a project choice rather
                  than a framework requirement.{' '}
                  <strong>
                    No client generator exists, and none of the five targets below is supported
                    today.
                  </strong>
                </p>
              </div>

              <div className="client-rows" data-stagger-group>
                {CLIENT_ROWS.map((row, i) => (
                  <article key={row.name}>
                    <span className="mono">target {pad(i + 1)}</span>
                    <h3>{row.name}</h3>
                    <p>{row.copy}</p>
                    <div className="mono">CSS · SCSS · Tailwind</div>
                  </article>
                ))}
              </div>

              <div className="auth-starter" data-reveal>
                <div>
                  <span className="roadmap-badge mono">
                    Backend planned for 1.0 · screens for 3.0
                  </span>
                  <h3>Authentication is designed to reach across the stack.</h3>
                  <p>
                    Backend routes, credential handling, verification, recovery, rate limits, and
                    audit events are planned for 1.0; frontend screens, typed state, and
                    end-to-end tests for 3.0.{' '}
                    <strong>Nothing generates authentication today.</strong>
                  </p>
                </div>
                <div className="auth-flow mono" aria-label="Planned authentication flow">
                  <span>Register</span>
                  <i aria-hidden="true">→</i>
                  <span>Verify</span>
                  <i aria-hidden="true">→</i>
                  <span>Session</span>
                  <i aria-hidden="true">→</i>
                  <span>Policy</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ §04 OPERATIONS ============ */}
        <section id="operations" className="section operations-section">
          <div className="annot-grid">
            <aside className="annot" data-reveal>
              <span className="register-label mono">register 04 / operations</span>
              <span className="roadmap-badge mono">
                Kernel implemented · deployment planned for 1.0
              </span>
            </aside>
            <div className="annot-content">
              <div className="section-heading" data-reveal>
                <h2>Production behaviour is designed in, not added later.</h2>
                <p>
                  Lifecycle, diagnostics, observability, supply-chain policy, release evidence,
                  and recovery are specified before the first production deployment.{' '}
                  <strong>
                    The lifecycle below is implemented and tested; the transports and adapters
                    that would drive it in production are not.
                  </strong>{' '}
                  The governance, verification sequence, and release policy are real and public.
                </p>
              </div>

              <div
                className="lifecycle-register"
                data-reveal
                aria-label="Lifecycle: Load, Validate, Register, Boot, Ready, Drain, Stop"
              >
                {STAGE_NAMES.map((name, i) => (
                  <div className="lr-cell" key={name}>
                    <span className="lr-bar" />
                    <span className="lr-name mono">
                      <i>{pad(i + 1)}</i>
                      {name}
                    </span>
                  </div>
                ))}
              </div>

              <p className="lifecycle-caption" data-reveal>
                <strong>Load → Validate → Register → Boot → Ready → Drain → Stop.</strong> Seven
                phases, in that order, implemented in the Phase 002 kernel. Assembly is
                synchronous; boot is asynchronous and rolls back what it started if a provider
                refuses to come up.
              </p>

              <div className="operation-columns" data-stagger-group>
                {OPERATION_COLUMNS.map((col) => (
                  <article key={col.title}>
                    <span className="op-index mono">{col.index}</span>
                    <h3>{col.title}</h3>
                    <p>
                      {col.body} <em>{col.note}</em>
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============ BRAND WORLD FIGURE ============ */}
        <figure className="world-figure" data-reveal>
          {/* Plain <img>: this is a static export with the image optimiser disabled, so
              next/image would emit the same tag after a round trip through a component that
              exists to talk to a service this deployment does not run. */}
          {/* eslint-disable @next/next/no-img-element */}
          <img
            className="only-light"
            src="/assets/renvor-brand-world-v21-light-1254.png"
            alt="The Ordered Register identity world: seven equal-width marine billets of rising, held, and falling heights above the words Load, Validate, Register, Boot, Ready, Drain, Stop"
            width={1254}
            height={1254}
            loading="lazy"
            decoding="async"
          />
          <img
            className="only-dark"
            src="/assets/renvor-brand-world-v21-dark-1254.png"
            alt="The Ordered Register identity world: seven equal-width ice billets of rising, held, and falling heights above the words Load, Validate, Register, Boot, Ready, Drain, Stop"
            width={1254}
            height={1254}
            loading="lazy"
            decoding="async"
          />
          {/* eslint-enable @next/next/no-img-element */}
          <figcaption className="mono">
            Ordered Register — every stage leaves a readable proof.
          </figcaption>
        </figure>

        {/* ============ EVALUATION LENS ============ */}
        <LensCarousel />

        {/* ============ §05 PACKAGES ============ */}
        <section id="packages" className="section package-section">
          <div className="annot-grid">
            <aside className="annot" data-reveal>
              <span className="register-label mono">register 05 / packages</span>
              <span className="roadmap-badge mono">Planned for Renvor 4.0</span>
            </aside>
            <div className="annot-content">
              <div className="section-heading" data-reveal>
                <h2>A package ecosystem designed for applications already in motion.</h2>
              </div>
              <p className="package-caveat" data-reveal>
                <strong>None of these packages exists.</strong> The names below are reserved by
                design, not published — neither <code>renvor</code> nor <code>renvor-cli</code> is
                on crates.io.
              </p>
              <div className="package-rows" data-stagger-group>
                {PACKAGES.map((name, i) => (
                  <div key={name}>
                    <span className="mono">crate {pad(i + 1)}</span>
                    <strong>{name}</strong>
                    <code className="unpublished-tag mono">not published</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============ §06 SOURCE / CTA (opposite-theme band) ============ */}
        <section id="docs" className="docs-section docs-band">
          <span className="docs-note note-tl mono" aria-hidden="true">
            source / public
          </span>
          <span className="docs-note note-tr mono" aria-hidden="true">
            kernel / tested
          </span>
          <span className="docs-note note-bl mono" aria-hidden="true">
            release / none
          </span>
          <span className="docs-note note-br mono" aria-hidden="true">
            governance / real
          </span>
          <div className="docs-content" data-reveal>
            {/* eslint-disable @next/next/no-img-element */}
            <img
              className="docs-mark band-mark-dark-variant"
              src="/assets/renvor-mark-v21-dark.svg"
              alt=""
              width={64}
              height={64}
            />
            <img
              className="docs-mark band-mark-light-variant"
              src="/assets/renvor-mark-v21.svg"
              alt=""
              width={64}
              height={64}
            />
            {/* eslint-enable @next/next/no-img-element */}
            <p className="docs-state mono">In development — no release</p>
            <h2>Follow the work. There is nothing to install yet.</h2>
            <p className="docs-caveat">
              No crate is published and the documentation site is <strong>not deployed</strong>.
              What is public and readable today is the source, the governance, the verification
              sequence, the plan — and a tested transport-independent kernel you can read, build,
              and run the test suite against.
            </p>
            <div className="actions">
              <a className="btn-primary" href="https://github.com/renvor-rs/renvor">
                Browse the source ↗
              </a>
              <a
                className="btn-secondary"
                href="https://github.com/renvor-rs/renvor/blob/main/PLAN.md"
              >
                Read the plan ↗
              </a>
            </div>
          </div>
        </section>

        <footer className="site-footer">
          <div>
            {/* eslint-disable @next/next/no-img-element */}
            <img
              className="only-light"
              src="/assets/renvor-mark-v21.svg"
              alt=""
              width={26}
              height={26}
            />
            <img
              className="only-dark"
              src="/assets/renvor-mark-v21-dark.svg"
              alt=""
              width={26}
              height={26}
            />
            {/* eslint-enable @next/next/no-img-element */}
            <span>renvor — application infrastructure for Rust teams · in development</span>
          </div>
          <nav aria-label="Footer" className="mono">
            <a href="https://github.com/renvor-rs/renvor">GitHub</a>
            <a href="https://github.com/renvor-rs/renvor/blob/main/PLAN.md">Plan</a>
            <a href="https://github.com/renvor-rs/renvor/blob/main/SECURITY.md">Security</a>
          </nav>
        </footer>
      </main>
      <ScrollFX />
    </>
  );
}
