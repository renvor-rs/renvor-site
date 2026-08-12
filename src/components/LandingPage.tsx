import type {ReactNode} from 'react';
import {useRef, useState} from 'react';
import {useGSAP} from '@gsap/react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import {
  ArrowRight,
  ArrowUpRight,
  Blocks,
  Box,
  Braces,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleGauge,
  CloudCog,
  Code2,
  Database,
  FileCheck2,
  Fingerprint,
  GitBranch,
  Hammer,
  Laptop,
  Layers3,
  MonitorSmartphone,
  PackagePlus,
  Route,
  ScanSearch,
  ShieldCheck,
  TerminalSquare,
} from 'lucide-react';
import styles from '../pages/index.module.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Every capability shown on this page is unbuilt. The `roadmap` field on each record is the
// release that owns it, taken from PLAN.md §11.1 (REST 1.0), §11.2 (GraphQL 2.0), §13.1
// (backend auth, 1.0), §13.2 (frontend auth, 3.0), §10.2 (frontend matrix, 3.0), and
// Phase 030 (package ecosystem, 4.0). It is rendered, not decorative: a claim on this page
// without a visible release label is a release-honesty defect (T095).
const solutionItems = [
  {
    id: 'backend',
    label: 'Backend',
    roadmap: 'Planned for Renvor 1.0',
    title: 'Typed services with visible work.',
    copy: 'The design: REST — and opt-in GraphQL in 2.0 — will enter through transport adapters, then reuse the same application services, policies, transactions, and error vocabulary. None of it is built.',
    list: ['OpenAPI 3.2 contract', 'Shared service layer', 'Explicit async and transactions'],
    icon: Route,
  },
  {
    id: 'data',
    label: 'Data',
    roadmap: 'Planned for Renvor 1.0',
    title: 'Persistence chosen at the boundary.',
    copy: 'The design: SQLx or SeaORM with PostgreSQL or MySQL, where generated adapters carry migrations, fixtures, health checks, and transaction ownership. No adapter, migration, or generator exists yet.',
    list: ['SQLx or SeaORM', 'PostgreSQL or MySQL', 'Repository capability ports'],
    icon: Database,
  },
  {
    id: 'identity',
    label: 'Identity',
    roadmap: 'Backend planned for 1.0 · screens for 3.0',
    title: 'Authentication that reaches the screen.',
    copy: 'The design: backend auth flows in 1.0, with matching frontend routes, forms, state, recovery, and verification arriving in 3.0. RBAC is a 4.0 package. Nothing is generated today.',
    list: ['Session or token flows', 'Argon2 credentials', 'RBAC package planned for 4.0'],
    icon: Fingerprint,
  },
  {
    id: 'delivery',
    label: 'Delivery',
    roadmap: 'Planned for Renvor 3.0',
    title: 'Web, Rust UI, and desktop targets.',
    copy: 'The design: Next.js, Yew, Dioxus, or Leptos clients with CSS, SCSS, or optional Tailwind CSS, and Tauri packaging for supported static clients. No client generator exists yet.',
    list: ['Four frontend frameworks', 'Three styling systems', 'Tauri desktop target'],
    icon: MonitorSmartphone,
  },
];

const panoramaPanels = [
  {
    name: 'Interactive CLI',
    roadmap: 'Planned for 1.0',
    title: 'Ask the decisions that shape the project.',
    copy: 'The wizard is designed to adapt its questions to the selected transport, database, ORM, authentication, frontend, styling, desktop, and deployment target. It is not implemented.',
    theme: 'blue',
    visual: 'wizard',
  },
  {
    name: 'Stable core',
    roadmap: 'Planned for 1.0',
    title: 'Keep transports outside the application service.',
    copy: 'The core is designed to own use cases and policy, with REST, CLI commands, tests, and later GraphQL calling it through visible typed interfaces. No core exists yet.',
    theme: 'violet',
    visual: 'routes',
  },
  {
    name: 'Capability ports',
    roadmap: 'Planned for 1.0',
    title: 'Use mature crates without binding the whole app to them.',
    copy: 'Narrow boundaries are designed to isolate persistence, mail, queues, storage, cache, and observability so implementations can evolve independently. No port is implemented.',
    theme: 'coral',
    visual: 'ports',
  },
  {
    name: 'Full-stack contract',
    roadmap: 'Planned for 3.0',
    title: 'Generate clients from one versioned API shape.',
    copy: 'Backend contracts, frontend types, auth state, error handling, and regeneration rules are designed to stay synchronised across Rust and Next.js clients. No generator exists.',
    theme: 'amber',
    visual: 'clients',
  },
  {
    name: 'Package ecosystem',
    roadmap: 'Planned for 4.0',
    title: 'Add new capabilities to applications already running.',
    copy: 'Independent crates are designed to use a package SDK for registration, configuration, migrations, source generation, diagnostics, and safe removal. No SDK and no package exist.',
    theme: 'mint',
    visual: 'packages',
  },
];

const lifecycle = ['Load', 'Validate', 'Build', 'Start', 'Serve', 'Drain', 'Stop'];

// Names reserved by design, not published. Verified against the crates.io registry index on
// 2026-08-12: `renvor` and `renvor-cli` both return HTTP 404. Rendering "crates.io" beside
// these would assert an availability that does not exist.
const packageNames = ['renvor-auth', 'renvor-rbac', 'renvor-storage', 'renvor-mail', 'renvor-jobs', 'renvor-cache', 'renvor-observe', 'renvor-testing'];

const REPO_URL = 'https://github.com/renvor-rs/renvor';
const ROADMAP_URL = 'https://github.com/renvor-rs/renvor/blob/main/PLAN.md';

function SpectrumBackground(): ReactNode {
  return (
    <svg className={styles.spectrum} viewBox="0 0 1600 980" aria-hidden="true">
      <defs>
        <linearGradient id="ribbon-a" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#3267FF"/><stop offset=".52" stopColor="#7048E8"/><stop offset="1" stopColor="#F75F72"/></linearGradient>
        <linearGradient id="ribbon-b" x1="1" y1="0" x2="0" y2="1"><stop stopColor="#F7A928"/><stop offset=".48" stopColor="#F75F72"/><stop offset="1" stopColor="#7048E8"/></linearGradient>
        <radialGradient id="orb-a"><stop stopColor="#FFFFFF" stopOpacity=".9"/><stop offset="1" stopColor="#7CA0FF" stopOpacity="0"/></radialGradient>
      </defs>
      <path data-spectrum-ribbon="a" className={styles.ribbonA} d="M-180 760C180 360 470 960 820 500S1320 40 1780 190" />
      <path data-spectrum-ribbon="b" className={styles.ribbonB} d="M-120 210C270 650 570 30 930 410s560 510 810 190" />
      <path data-spectrum-route className={styles.routeLine} d="M-80 650h330V470h290V610h320V360h300V520h520" />
      <circle data-spectrum-orb="a" cx="330" cy="180" r="250" fill="url(#orb-a)" />
      <circle data-spectrum-orb="b" cx="1280" cy="760" r="320" fill="url(#orb-a)" />
    </svg>
  );
}

function LinkArrow(): ReactNode {
  return <ArrowUpRight aria-hidden="true" size={18} strokeWidth={1.8} />;
}

function ProductVisual({kind}: {kind: string}): ReactNode {
  if (kind === 'wizard') {
    return <div className={styles.wizardVisual}><span>Project setup</span><strong>Which database?</strong><div className={`${styles.wizardOption} ${styles.selectedWizardOption}`}>PostgreSQL <Check size={15} /></div><div className={styles.wizardOption}>MySQL</div><code>4 of 9 decisions</code></div>;
  }
  if (kind === 'routes') {
    return <div className={styles.routesVisual}><span>REST</span><i /><strong>Application<br/>service</strong><i /><span>GraphQL</span></div>;
  }
  if (kind === 'ports') {
    return <div className={styles.portsVisual}>{['SQLx', 'SeaORM', 'Mail', 'Jobs', 'Storage', 'Cache'].map((item) => <span key={item}>{item}</span>)}</div>;
  }
  if (kind === 'clients') {
    return <div className={styles.clientsVisual}><div><Laptop /><span>Next.js</span></div><div><Code2 /><span>Leptos</span></div><div><MonitorSmartphone /><span>Tauri</span></div></div>;
  }
  return <div className={styles.packagesVisual}><code>renover add renvor-rbac</code><p><Check size={15}/> package registered</p><p><Check size={15}/> migrations discovered</p><p><Check size={15}/> policy tests passed</p><em className={styles.mockupNote}>Design mock-up — this command does not exist</em></div>;
}

export default function LandingPage(): ReactNode {
  const rootRef = useRef<HTMLElement>(null);
  const [solutionId, setSolutionId] = useState('backend');
  const [lensIndex, setLensIndex] = useState(0);
  const solution = solutionItems.find((item) => item.id === solutionId) ?? solutionItems[0]!;
  const SolutionIcon = solution.icon;
  const brokenLinks = useBrokenLinks();

  for (const anchor of ['solutions', 'panorama', 'fullstack', 'operations', 'docs']) {
    brokenLinks.collectAnchor(anchor);
  }

  useGSAP(() => {
    const media = gsap.matchMedia();

    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.timeline({defaults: {ease: 'power4.out'}})
        .from('[data-hero-line]', {yPercent: 110, duration: 1.05, stagger: 0.09})
        .from('[data-hero-support]', {y: 28, opacity: 0, duration: .85, stagger: .1}, '-=.55')
        .from('[data-hero-product]', {y: 110, scale: .86, opacity: 0, duration: 1.2}, '-=.8');

      gsap.to('[data-spectrum-ribbon="a"]', {x: 120, y: -46, duration: 9, repeat: -1, yoyo: true, ease: 'sine.inOut'});
      gsap.to('[data-spectrum-ribbon="b"]', {x: -95, y: 54, duration: 11, repeat: -1, yoyo: true, ease: 'sine.inOut'});
      gsap.to('[data-spectrum-route]', {attr: {'stroke-dashoffset': -260}, duration: 7, repeat: -1, ease: 'none'});
      gsap.to('[data-spectrum-orb="a"]', {x: 170, y: 80, scale: 1.16, transformOrigin: 'center', duration: 8, repeat: -1, yoyo: true, ease: 'sine.inOut'});
      gsap.to('[data-spectrum-orb="b"]', {x: -160, y: -90, scale: .78, transformOrigin: 'center', duration: 10, repeat: -1, yoyo: true, ease: 'sine.inOut'});
      gsap.to('[data-marquee-track]', {xPercent: -50, duration: 24, repeat: -1, ease: 'none'});

      gsap.utils.toArray<HTMLElement>('[data-solution-card]').forEach((card, index) => {
        gsap.fromTo(card, {scale: .84, opacity: .28, y: 70}, {scale: 1, opacity: 1, y: 0, ease: 'power3.out', scrollTrigger: {trigger: card, start: 'top 92%', end: 'top 58%', scrub: .55}, delay: index * .04});
      });

      const words = gsap.utils.toArray<HTMLElement>('[data-architecture-word]');
      gsap.fromTo(words, {opacity: .12}, {opacity: 1, stagger: .07, ease: 'none', scrollTrigger: {trigger: '[data-architecture-statement]', start: 'top 76%', end: 'bottom 48%', scrub: true}});
    });

    media.add('(min-width: 997px) and (prefers-reduced-motion: no-preference)', () => {
      const track = document.querySelector<HTMLElement>('[data-panorama-track]');
      if (!track) return;
      gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: '[data-panorama]',
          start: 'top top',
          end: () => `+=${track.scrollWidth}`,
          pin: true,
          scrub: .9,
          invalidateOnRefresh: true,
        },
      });
    });

    return () => media.revert();
  }, {scope: rootRef});

  const lenses = [
    {title: 'Strong types stay visible', copy: 'Generated handlers, services, policies, ports, configuration, and errors remain normal Rust types with searchable ownership.'},
    {title: 'Packages remain replaceable', copy: 'Mature ecosystem crates sit behind narrow framework boundaries. Applications keep a stable contract without freezing implementation choices.'},
    {title: 'Operations are designed in', copy: 'Diagnostics, health, readiness, telemetry, draining, rollback, and recovery are part of the application shape from the first generated commit.'},
  ];

  return (
    <main ref={rootRef} className={styles.page}>
      <a className={styles.skipLink} href="#solutions">Skip animated introduction</a>

      {/* Development-status notice (T095). Deliberately outside the hero and outside every
          GSAP timeline: it must be readable before any animation runs, with reduced motion,
          and if JavaScript fails. Nothing on this page may animate it in or delay it. */}
      <aside className={styles.statusNotice} role="note" aria-label="Project status">
        <Hammer size={17} aria-hidden="true" />
        <p>
          <strong>Renvor is in development and cannot be installed.</strong> No crate is
          published, no release exists, and every capability described on this page is a
          design that has not been built. Nothing here is usable yet.
        </p>
        <a href={ROADMAP_URL}>What is actually planned <LinkArrow /></a>
      </aside>

      <section className={styles.hero}>
        <SpectrumBackground />
        <div className={styles.heroInner}>
          <p className={styles.releaseState} data-hero-support><Hammer size={15} aria-hidden="true" /> In development — nothing released</p>
          <h1 aria-label="Application infrastructure for complete Rust systems">
            <span className={styles.heroTitleDesktop} aria-hidden="true"><i data-hero-line>Application infrastructure</i></span>
            <span className={styles.heroTitleDesktop} aria-hidden="true"><i data-hero-line>for complete Rust systems.</i></span>
            <span className={styles.heroTitleMobile} aria-hidden="true"><i data-hero-line>Complete Rust systems.<br />One platform.</i></span>
          </h1>
          <p className={styles.heroLead} data-hero-support>The plan: generate the backend, typed client, authentication, desktop shell, operating contracts, and package boundaries as one inspectable application. This page describes that design — it does not describe working software.</p>
          <div className={styles.actions} data-hero-support>
            <a className={styles.primaryAction} href={REPO_URL}>Read the source <ArrowRight size={17} aria-hidden="true" /></a>
            <a className={styles.secondaryAction} href="#panorama">Tour the design <LinkArrow /></a>
          </div>
        </div>

        <div className={styles.heroProduct} data-hero-product>
          <div className={styles.productTopbar}><div><span/><span/><span/></div><code>renover new commerce</code><strong>mock-up</strong></div>
          <div className={styles.productBody}>
            <aside><span>01 Project</span><span>02 Transport</span><span>03 Data</span><span>04 Auth</span><span>05 Client</span><strong>06 Review</strong></aside>
            <div className={styles.productQuestion}>
              <p>Review application</p>
              <h2>Everything needed to start.</h2>
              <div><span>Transport</span><strong>REST + OpenAPI</strong></div>
              <div><span>Data</span><strong>SQLx + PostgreSQL</strong></div>
              <div><span>Client</span><strong>Next.js + SCSS</strong></div>
              <div><span>Desktop</span><strong>Not selected</strong></div>
            </div>
            <div className={styles.productOutput}>
              <span>Generated workspace</span>
              <strong>commerce/</strong>
              <code>apps/api<br/>apps/web<br/>crates/application<br/>crates/domain<br/>tests/</code>
              <p><Check size={14}/> 10 verification checks passed</p>
            </div>
          </div>
          <p className={styles.mockupCaption}>
            <strong>Design mock-up.</strong> The <code>renover</code> command does not exist and
            generates nothing. This shows the interface being designed, not a recorded session.
          </p>
        </div>
      </section>

      <div className={styles.marquee} aria-label="Technologies Renvor plans to support">
        <div className={styles.marqueeTrack} data-marquee-track>
          {[...'REST GraphQL SQLx SeaORM PostgreSQL MySQL Next.js Yew Dioxus Leptos Tauri RBAC '.repeat(2).trim().split(' ')].map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}
        </div>
      </div>

      <section id="solutions" className={styles.solutionsSection}>
        <div className={styles.sectionHeading}>
          <h2>Every application surface is designed to connect to one stable core.</h2>
          <p>Renvor aims to provide a coherent default path while preserving the boundaries that experienced Rust teams need to inspect and change. <strong>Each surface below carries the release that owns it. None has been built.</strong></p>
        </div>

        <div className={styles.solutionBento}>
          <article className={styles.solutionMain} data-solution-card>
            <div className={styles.solutionSwitcher} role="tablist" aria-label="Application surfaces">
              {solutionItems.map((item) => (
                <button
                  key={item.id}
                  id={`solution-tab-${item.id}`}
                  type="button"
                  role="tab"
                  aria-selected={solutionId === item.id}
                  aria-controls="solution-panel"
                  tabIndex={solutionId === item.id ? 0 : -1}
                  onClick={() => setSolutionId(item.id)}
                  onKeyDown={(event) => {
                    const currentIndex = solutionItems.findIndex((candidate) => candidate.id === item.id);
                    const nextIndex = event.key === 'ArrowRight'
                      ? (currentIndex + 1) % solutionItems.length
                      : event.key === 'ArrowLeft'
                        ? (currentIndex + solutionItems.length - 1) % solutionItems.length
                        : event.key === 'Home'
                          ? 0
                          : event.key === 'End'
                            ? solutionItems.length - 1
                            : -1;
                    if (nextIndex < 0) return;
                    event.preventDefault();
                    const nextId = solutionItems[nextIndex]!.id;
                    setSolutionId(nextId);
                    document.getElementById(`solution-tab-${nextId}`)?.focus();
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div id="solution-panel" role="tabpanel" aria-labelledby={`solution-tab-${solution.id}`} className={styles.solutionContent}>
              <div>
                <SolutionIcon aria-hidden="true" />
                <span className={styles.roadmapBadge}>{solution.roadmap}</span>
                <h3>{solution.title}</h3>
                <p>{solution.copy}</p>
                <ul>{solution.list.map((item) => <li key={item}><Check size={15}/>{item}</li>)}</ul>
              </div>
              <div className={styles.contractVisual}>
                <span>application::contract</span>
                <pre><code>{`pub trait Capability {\n  type Config;\n  type Error;\n\n  async fn start(\n    &self, ctx: Context\n  ) -> Result<Handle, Self::Error>;\n}`}</code></pre>
                <p><Check size={14}/> boundary verified</p>
              </div>
            </div>
          </article>

          <article className={styles.solutionSideA} data-solution-card>
            <TerminalSquare aria-hidden="true" />
            <span className={styles.roadmapBadge}>Planned for Renvor 1.0</span>
            <h3>Interactive generation</h3>
            <p>Questions are designed to adapt to previous answers, stopping invalid combinations before generation.</p>
            <code className={styles.unavailableCommand}>renover new</code>
            <em className={styles.unavailableNote}>Not installable — the CLI is unbuilt and unpublished</em>
          </article>

          <article className={styles.solutionSideB} data-solution-card>
            <PackagePlus aria-hidden="true" />
            <span className={styles.roadmapBadge}>Planned for Renvor 4.0</span>
            <h3>Installable packages</h3>
            <p>The design adds RBAC and later capabilities to existing projects through a versioned package contract.</p>
            <code className={styles.unavailableCommand}>renover add renvor-rbac</code>
            <em className={styles.unavailableNote}>Not installable — no package has been published</em>
          </article>
        </div>
      </section>

      <section className={styles.architectureStatement} data-architecture-statement>
        <p>{'The intended shape: a request enters through a transport, crosses policy and transaction boundaries in the application service, reaches replaceable capability ports, and returns through one typed error contract.'.split(' ').map((word, index) => <span data-architecture-word key={`${word}-${index}`}>{word}{' '}</span>)}</p>
      </section>

      <section id="panorama" className={styles.panorama} data-panorama>
        <div className={styles.panoramaTrack} data-panorama-track>
          <div className={styles.panoramaIntro}>
            <p>Architecture panorama</p>
            <h2>The design, from first answer to installed capability.</h2>
            <span className={styles.panoramaCaveat}>Every panel describes planned behaviour. None of it is implemented.</span>
            <span>Scroll to trace the system <ArrowRight aria-hidden="true" /></span>
          </div>
          {panoramaPanels.map((panel, index) => (
            <article key={panel.name} className={`${styles.panoramaPanel} ${styles[panel.theme]}`}>
              <div className={styles.panoramaCopy}>
                <span>{String(index + 1).padStart(2, '0')} / {String(panoramaPanels.length).padStart(2, '0')}</span>
                <p>{panel.name}</p>
                <span className={styles.roadmapBadge}>{panel.roadmap}</span>
                <h3>{panel.title}</h3>
                <div>{panel.copy}</div>
              </div>
              <ProductVisual kind={panel.visual} />
            </article>
          ))}
        </div>
      </section>

      <section id="fullstack" className={styles.fullstackSection}>
        <div className={styles.fullstackHeading}>
          <div><Braces aria-hidden="true"/><h2>One backend contract. The frontend your team prefers.</h2></div>
          <span className={styles.roadmapBadge}>Planned for Renvor 3.0</span>
          <p>The design: generated clients sharing versioned types, authentication state, error behaviour, and contract regeneration, with styling a project choice rather than a framework requirement. <strong>No client generator exists, and none of the five targets below is supported today.</strong></p>
        </div>
        <div className={styles.clientRail}>
          {[
            ['Next.js', 'SSR or CSR for web. Static CSR for Tauri.'],
            ['Yew', 'Component-based Rust UI with typed clients.'],
            ['Dioxus', 'Hooks-based Rust UI across supported targets.'],
            ['Leptos', 'Fine-grained reactive Rust applications.'],
            ['Tauri', 'Desktop packaging for supported static clients.'],
          ].map(([name, copy], index) => <article key={name}><span>{String(index + 1).padStart(2, '0')}</span><h3>{name}</h3><p>{copy}</p><div>CSS <i/> SCSS <i/> Tailwind</div></article>)}
        </div>
        <div className={styles.authStarter}>
          <div>
            <Fingerprint aria-hidden="true" />
            <span className={styles.roadmapBadge}>Backend planned for 1.0 · screens for 3.0</span>
            <h3>Authentication is designed to reach across the stack.</h3>
            <p>Backend routes, credential handling, verification, recovery, rate limits, and audit events are planned for 1.0; frontend screens, typed state, and end-to-end tests for 3.0. <strong>Nothing generates authentication today.</strong></p>
          </div>
          <div className={styles.authFlow} aria-label="Generated authentication flow">
            <span>Register</span><i/><span>Verify</span><i/><span>Session</span><i/><span>Policy</span>
          </div>
        </div>
      </section>

      <section id="operations" className={styles.operationsSection}>
        <div className={styles.operationsCopy}>
          <CircleGauge aria-hidden="true" />
          <span className={styles.roadmapBadge}>Design complete · implementation planned for 1.0</span>
          <h2>Production behaviour is designed in, not added later.</h2>
          <p>Lifecycle, diagnostics, observability, supply-chain policy, release evidence, and recovery are specified before the first production deployment. <strong>The specification exists; the runtime does not.</strong> This is the one area where written work is genuinely ahead — the governance, verification sequence, and release policy are real and public.</p>
        </div>
        <div className={styles.lifecycleRail}>
          {lifecycle.map((stage, index) => <div key={stage}><span>{String(index + 1).padStart(2, '0')}</span><strong>{stage}</strong><i className={index < lifecycle.length - 1 ? undefined : styles.lastLine}/></div>)}
        </div>
        <div className={styles.operationGrid}>
          <article><ShieldCheck/><h3>Security gates</h3><p>Secret scanning, dependency and licence policy, redaction, bounded work, safe defaults, and release attestations. <em>Secret scanning, licence policy, and release attestation run today on the framework repository; the rest are planned.</em></p></article>
          <article><ScanSearch/><h3>Diagnostics</h3><p>Actionable startup failures, configuration validation, generated-project checks, and package health diagnostics. <em>Planned for 1.0 — no runtime exists to diagnose.</em></p></article>
          <article><CloudCog/><h3>Observability</h3><p>Structured logs, traces, metrics, health, readiness, graceful drain, shutdown, rollback, and recovery. <em>Planned for 1.0.</em></p></article>
        </div>
      </section>

      <section className={styles.evaluationSection}>
        <div className={styles.evaluationControls}>
          <button type="button" aria-label="Previous evaluation lens" onClick={() => setLensIndex((lensIndex + lenses.length - 1) % lenses.length)}><ChevronLeft/></button>
          <span>{String(lensIndex + 1).padStart(2, '0')} / {String(lenses.length).padStart(2, '0')}</span>
          <button type="button" aria-label="Next evaluation lens" onClick={() => setLensIndex((lensIndex + 1) % lenses.length)}><ChevronRight/></button>
        </div>
        <div className={styles.evaluationCopy} aria-live="polite"><p>Evaluation lens</p><h2>{lenses[lensIndex]!.title}</h2><div>{lenses[lensIndex]!.copy}</div></div>
      </section>

      <section className={styles.packageSection}>
        <div className={styles.packageHeading}><PackagePlus/><h2>A package ecosystem designed for applications already in motion.</h2></div>
        <span className={styles.roadmapBadge}>Planned for Renvor 4.0</span>
        <p className={styles.packageCaveat}>
          <strong>None of these packages exists.</strong> The names below are reserved by design,
          not published — neither <code>renvor</code> nor <code>renvor-cli</code> is on crates.io.
        </p>
        <div className={styles.packageCloud}>{packageNames.map((name, index) => <div key={name}><span>{String(index + 1).padStart(2, '0')}</span><strong>{name}</strong><code className={styles.unpublishedTag}>not published</code></div>)}</div>
      </section>

      <section id="docs" className={styles.docsSection}>
        <div className={styles.docsSpectrum} aria-hidden="true"><i/><i/><i/><i/></div>
        <div className={styles.docsContent}>
          <img src="/img/renvor-mark-v7-dark.svg" alt="" />
          <p>In development — no release</p>
          <h2>Follow the work. There is nothing to build with yet.</h2>
          <p className={styles.docsCaveat}>
            Documentation is not deployed and no crate is published. What exists today is the
            governance, the verification sequence, and the plan — all of it public and readable.
          </p>
          <div className={styles.actions}>
            <a className={styles.docsPrimary} href={REPO_URL}>Browse the source <LinkArrow /></a>
            <a className={styles.docsSecondary} href={ROADMAP_URL}>Read the plan <LinkArrow /></a>
          </div>
        </div>
      </section>

      <footer className={styles.siteFooter}>
        <div><img src="/img/renvor-mark-v7-dark.svg" alt=""/><strong>renvor</strong><span>Application infrastructure for Rust teams — in development.</span></div>
        {/* Only destinations that resolve today. `docs.renvor.dev` is not deployed and
            `crates.io/crates/renvor` is HTTP 404, so neither is linked (T097). */}
        <nav aria-label="Footer"><a href={REPO_URL}>GitHub</a><a href={ROADMAP_URL}>Plan</a><a href={`${REPO_URL}/blob/main/SECURITY.md`}>Security</a></nav>
      </footer>
    </main>
  );
}
