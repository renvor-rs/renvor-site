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

const solutionItems = [
  {
    id: 'backend',
    label: 'Backend',
    title: 'Typed services with visible work.',
    copy: 'REST and opt-in GraphQL enter through transport adapters, then reuse the same application services, policies, transactions, and error vocabulary.',
    list: ['OpenAPI 3.2 contract', 'Shared service layer', 'Explicit async and transactions'],
    icon: Route,
  },
  {
    id: 'data',
    label: 'Data',
    title: 'Persistence chosen at the boundary.',
    copy: 'Use SQLx or SeaORM with PostgreSQL or MySQL. Generated adapters include migrations, fixtures, health checks, and transaction ownership.',
    list: ['SQLx or SeaORM', 'PostgreSQL or MySQL', 'Repository capability ports'],
    icon: Database,
  },
  {
    id: 'identity',
    label: 'Identity',
    title: 'Authentication that reaches the screen.',
    copy: 'Generate secure backend auth flows and matching frontend routes, forms, state, recovery, verification, audit events, and tests.',
    list: ['Session or token flows', 'Argon2 credentials', 'Optional RBAC package'],
    icon: Fingerprint,
  },
  {
    id: 'delivery',
    label: 'Delivery',
    title: 'Web, Rust UI, and desktop targets.',
    copy: 'Generate Next.js, Yew, Dioxus, or Leptos clients with CSS, SCSS, or optional Tailwind CSS. Package supported static clients with Tauri.',
    list: ['Four frontend frameworks', 'Three styling systems', 'Tauri desktop target'],
    icon: MonitorSmartphone,
  },
];

const panoramaPanels = [
  {
    name: 'Interactive CLI',
    title: 'Ask the decisions that shape the project.',
    copy: 'The wizard adapts its questions to the selected transport, database, ORM, authentication, frontend, styling, desktop, and deployment target.',
    theme: 'blue',
    visual: 'wizard',
  },
  {
    name: 'Stable core',
    title: 'Keep transports outside the application service.',
    copy: 'The core owns use cases and policy. REST, GraphQL, CLI commands, tests, and future transports call it through visible typed interfaces.',
    theme: 'violet',
    visual: 'routes',
  },
  {
    name: 'Capability ports',
    title: 'Use mature crates without binding the whole app to them.',
    copy: 'Narrow Renvor boundaries isolate persistence, mail, queues, storage, cache, and observability so implementations can evolve independently.',
    theme: 'coral',
    visual: 'ports',
  },
  {
    name: 'Full-stack contract',
    title: 'Generate clients from one versioned API shape.',
    copy: 'Backend contracts, frontend types, auth state, error handling, and regeneration rules stay synchronized across Rust and Next.js clients.',
    theme: 'amber',
    visual: 'clients',
  },
  {
    name: 'Package ecosystem',
    title: 'Add new capabilities to applications already running.',
    copy: 'Independent crates use the package SDK for registration, configuration, migrations, source generation, diagnostics, and safe removal guidance.',
    theme: 'mint',
    visual: 'packages',
  },
];

const lifecycle = ['Load', 'Validate', 'Build', 'Start', 'Serve', 'Drain', 'Stop'];
const packageNames = ['renvor-auth', 'renvor-rbac', 'renvor-storage', 'renvor-mail', 'renvor-jobs', 'renvor-cache', 'renvor-observe', 'renvor-testing'];

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
  return <div className={styles.packagesVisual}><code>renover add renvor-rbac</code><p><Check size={15}/> package registered</p><p><Check size={15}/> migrations discovered</p><p><Check size={15}/> policy tests passed</p></div>;
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

      <section className={styles.hero}>
        <SpectrumBackground />
        <div className={styles.heroInner}>
          <p className={styles.releaseState} data-hero-support><Check size={15} aria-hidden="true" /> Renvor 4.0 production release</p>
          <h1 aria-label="Application infrastructure for complete Rust systems">
            <span className={styles.heroTitleDesktop} aria-hidden="true"><i data-hero-line>Application infrastructure</i></span>
            <span className={styles.heroTitleDesktop} aria-hidden="true"><i data-hero-line>for complete Rust systems.</i></span>
            <span className={styles.heroTitleMobile} aria-hidden="true"><i data-hero-line>Complete Rust systems.<br />One platform.</i></span>
          </h1>
          <p className={styles.heroLead} data-hero-support>Generate the backend, typed client, authentication, desktop shell, operating contracts, and package boundaries as one inspectable application.</p>
          <div className={styles.actions} data-hero-support>
            <a className={styles.primaryAction} href="https://docs.renvor.dev/getting-started">Start building <ArrowRight size={17} aria-hidden="true" /></a>
            <a className={styles.secondaryAction} href="#panorama">Tour the architecture <LinkArrow /></a>
          </div>
        </div>

        <div className={styles.heroProduct} data-hero-product>
          <div className={styles.productTopbar}><div><span/><span/><span/></div><code>renover new commerce</code><strong>ready</strong></div>
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
        </div>
      </section>

      <div className={styles.marquee} aria-label="Renvor technology choices">
        <div className={styles.marqueeTrack} data-marquee-track>
          {[...'REST GraphQL SQLx SeaORM PostgreSQL MySQL Next.js Yew Dioxus Leptos Tauri RBAC '.repeat(2).trim().split(' ')].map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}
        </div>
      </div>

      <section id="solutions" className={styles.solutionsSection}>
        <div className={styles.sectionHeading}>
          <h2>Every application surface connects to one stable core.</h2>
          <p>Renvor provides a coherent default path while preserving the boundaries that experienced Rust teams need to inspect and change.</p>
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
            <h3>Interactive generation</h3>
            <p>Questions adapt to previous answers. Invalid combinations stop before generation.</p>
            <code>renover new</code>
          </article>

          <article className={styles.solutionSideB} data-solution-card>
            <PackagePlus aria-hidden="true" />
            <h3>Installable packages</h3>
            <p>Add RBAC and future capabilities to existing projects through a versioned package contract.</p>
            <code>renover add renvor-rbac</code>
          </article>
        </div>
      </section>

      <section className={styles.architectureStatement} data-architecture-statement>
        <p>{'A request enters through a transport, crosses policy and transaction boundaries in the application service, reaches replaceable capability ports, and returns through one typed error contract.'.split(' ').map((word, index) => <span data-architecture-word key={`${word}-${index}`}>{word}{' '}</span>)}</p>
      </section>

      <section id="panorama" className={styles.panorama} data-panorama>
        <div className={styles.panoramaTrack} data-panorama-track>
          <div className={styles.panoramaIntro}>
            <p>Architecture panorama</p>
            <h2>Follow the application from first answer to installed capability.</h2>
            <span>Scroll to trace the system <ArrowRight aria-hidden="true" /></span>
          </div>
          {panoramaPanels.map((panel, index) => (
            <article key={panel.name} className={`${styles.panoramaPanel} ${styles[panel.theme]}`}>
              <div className={styles.panoramaCopy}>
                <span>{String(index + 1).padStart(2, '0')} / {String(panoramaPanels.length).padStart(2, '0')}</span>
                <p>{panel.name}</p>
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
          <p>Generated clients share versioned types, authentication state, error behavior, and contract regeneration. Styling remains a project choice, not a framework requirement.</p>
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
            <h3>Authentication is generated across the stack.</h3>
            <p>Backend routes, credential handling, verification, recovery, frontend screens, typed state, rate limits, audit events, and end-to-end tests arrive together.</p>
          </div>
          <div className={styles.authFlow} aria-label="Generated authentication flow">
            <span>Register</span><i/><span>Verify</span><i/><span>Session</span><i/><span>Policy</span>
          </div>
        </div>
      </section>

      <section id="operations" className={styles.operationsSection}>
        <div className={styles.operationsCopy}>
          <CircleGauge aria-hidden="true" />
          <h2>Production behavior is part of the application shape.</h2>
          <p>Lifecycle, diagnostics, observability, supply-chain policy, release evidence, and recovery are designed before the first production deployment.</p>
        </div>
        <div className={styles.lifecycleRail}>
          {lifecycle.map((stage, index) => <div key={stage}><span>{String(index + 1).padStart(2, '0')}</span><strong>{stage}</strong><i className={index < lifecycle.length - 1 ? undefined : styles.lastLine}/></div>)}
        </div>
        <div className={styles.operationGrid}>
          <article><ShieldCheck/><h3>Security gates</h3><p>Secret scanning, dependency and license policy, redaction, bounded work, safe defaults, and release attestations.</p></article>
          <article><ScanSearch/><h3>Diagnostics</h3><p>Actionable startup failures, configuration validation, generated-project checks, and package health diagnostics.</p></article>
          <article><CloudCog/><h3>Observability</h3><p>Structured logs, traces, metrics, health, readiness, graceful drain, shutdown, rollback, and recovery.</p></article>
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
        <div className={styles.packageCloud}>{packageNames.map((name, index) => <div key={name}><span>{String(index + 1).padStart(2, '0')}</span><strong>{name}</strong><code>crates.io</code></div>)}</div>
      </section>

      <section id="docs" className={styles.docsSection}>
        <div className={styles.docsSpectrum} aria-hidden="true"><i/><i/><i/><i/></div>
        <div className={styles.docsContent}>
          <img src="/img/renvor-mark-v7-dark.svg" alt="" />
          <p>Renvor 4.0 stable</p>
          <h2>Build the complete application. Keep the Rust underneath.</h2>
          <div className={styles.actions}>
            <a className={styles.docsPrimary} href="https://docs.renvor.dev/getting-started">Read the documentation <LinkArrow /></a>
            <a className={styles.docsSecondary} href="https://github.com/renvor-rs/renvor">Browse the source <LinkArrow /></a>
          </div>
        </div>
      </section>

      <footer className={styles.siteFooter}>
        <div><img src="/img/renvor-mark-v7-dark.svg" alt=""/><strong>renvor</strong><span>Application infrastructure for Rust teams.</span></div>
        <nav aria-label="Footer"><a href="https://docs.renvor.dev">Documentation</a><a href="https://github.com/renvor-rs/renvor">GitHub</a><a href="https://crates.io/crates/renvor">crates.io</a></nav>
      </footer>
    </main>
  );
}
