'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* Five panels tracing the intended system end to end.
   Panel 02 is the only one describing something that exists. It says so, and the others say
   the opposite just as plainly — a page that hedges every claim equally tells a reader
   nothing about which parts are real. */
const PANELS = [
  {
    index: 'impression 01 / 05',
    name: 'Interactive CLI',
    roadmap: 'Planned for 1.0',
    state: 'not built',
    title: 'Ask the decisions that shape the project.',
    text: 'The wizard is designed to adapt its questions to the selected transport, database, ORM, authentication, frontend, styling, desktop, and deployment target. It is not implemented, and no executable exists.',
    visual: 'wizard',
  },
  {
    index: 'impression 02 / 05',
    name: 'Stable core',
    roadmap: 'Delivered in Phase 002 · API unstable',
    state: 'implemented and tested',
    title: 'Keep transports outside the application service.',
    text: 'The kernel owns the lifecycle, provider registration and dependency resolution, layered configuration, cancellation, bounded deadlines, and independent liveness and readiness. It is transport-independent by requirement: there is no HTTP server and no way to receive a request. REST, CLI, and later GraphQL are meant to call it through visible typed interfaces — none of them exists yet.',
    visual: 'boundary',
  },
  {
    index: 'impression 03 / 05',
    name: 'Capability ports',
    roadmap: 'Planned for 1.0',
    state: 'port shape only',
    title: 'Use mature crates without binding the whole app to them.',
    text: 'Narrow boundaries are designed to isolate persistence, mail, queues, storage, cache, and observability so implementations can evolve independently. The kernel defines the provider and configuration ports; no persistence, mail, queue, storage, or cache implementation exists.',
    visual: 'ports',
  },
  {
    index: 'impression 04 / 05',
    name: 'Full-stack contract',
    roadmap: 'Planned for 3.0',
    state: 'not built',
    title: 'Generate clients from one versioned API shape.',
    text: 'Backend contracts, frontend types, auth state, error handling, and regeneration rules are designed to stay synchronised across Rust and Next.js clients. No generator exists, and there is no API to generate from.',
    visual: 'clients',
  },
  {
    index: 'impression 05 / 05',
    name: 'Package ecosystem',
    roadmap: 'Planned for 4.0',
    state: 'not built',
    title: 'Add new capabilities to applications already running.',
    text: 'Independent crates are designed to use a package SDK for registration, configuration, migrations, source generation, diagnostics, and safe removal. No SDK and no package exist.',
    visual: 'packages',
  },
] as const;

function PanelVisual({ kind }: { kind: (typeof PANELS)[number]['visual'] }) {
  switch (kind) {
    case 'wizard':
      return (
        <div className="wizard-visual">
          <span className="mono">Project setup</span>
          <strong>Which database?</strong>
          <div className="wizard-option selected mono">PostgreSQL ✓</div>
          <div className="wizard-option mono">MySQL</div>
          <code>4 of 9 decisions</code>
          <em className="mockup-note">Design mock-up — this wizard does not exist</em>
        </div>
      );
    case 'boundary':
      return (
        <div className="boundary-demo mono" aria-hidden="true">
          <span>REST</span>
          <span>GraphQL</span>
          <span>CLI</span>
          <em>adapters detach — the core stays</em>
        </div>
      );
    case 'ports':
      return (
        <div className="ports-visual mono">
          <span>SQLx</span>
          <span>SeaORM</span>
          <span>Mail</span>
          <span>Jobs</span>
          <span>Storage</span>
          <span>Cache</span>
        </div>
      );
    case 'clients':
      return (
        <div className="clients-visual">
          <div>
            <span>Next.js</span>
          </div>
          <div>
            <span>Leptos</span>
          </div>
          <div>
            <span>Tauri</span>
          </div>
        </div>
      );
    case 'packages':
      return (
        <div className="packages-visual">
          <code>renvor add renvor-rbac</code>
          <p className="mono">✓ package registered</p>
          <p className="mono">✓ migrations discovered</p>
          <p className="mono">✓ policy tests passed</p>
          <em className="mockup-note">Design mock-up — this command does not exist</em>
        </div>
      );
  }
}

export default function Panorama() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      // Horizontal pin only on wide viewports. Below 997px the track is an ordinary vertical
      // stack, so a narrow reader never meets a pinned section they cannot scroll past.
      mm.add('(min-width: 997px)', () => {
        const distance = () => track.scrollWidth - window.innerWidth;
        gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.9,
            invalidateOnRefresh: true,
          },
        });
      });
      return () => mm.revert();
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section id="panorama" className="panorama" ref={sectionRef} data-panorama>
      <div className="panorama-track" ref={trackRef} data-panorama-track>
        <div className="panorama-intro">
          <p className="register-label mono">register 02 / the design, end to end</p>
          <h2>From first answer to installed capability.</h2>
          <span className="panorama-caveat">
            One of the five panels describes something that exists today — the core. Each panel
            states which it is.
          </span>
          <span className="panorama-hint mono">Scroll to trace the system →</span>
        </div>

        {PANELS.map((panel) => (
          <article className="panorama-panel" key={panel.index}>
            <div className="panorama-copy">
              <span className="panel-index mono">{panel.index}</span>
              <p className="panel-name">{panel.name}</p>
              <span className="roadmap-badge mono">{panel.roadmap}</span>
              <span className="panel-state mono">{panel.state}</span>
              <h3>{panel.title}</h3>
              <div className="panel-text">{panel.text}</div>
            </div>
            <PanelVisual kind={panel.visual} />
          </article>
        ))}
      </div>
    </section>
  );
}
