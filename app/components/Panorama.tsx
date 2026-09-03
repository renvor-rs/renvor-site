'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* Five panels tracing the intended system end to end.
   The CLI and core panels describe implemented work. Every panel states its own evidence and
   limits plainly so planned capabilities cannot be mistaken for shipped product. */
const PANELS = [
  {
    id: 'cli',
    name: 'Interactive CLI',
    roadmap: 'Delivered in Phase 003 · unpublished',
    state: 'implemented and tested',
    title: 'Ask the decisions that shape the project.',
    text: 'The `renvor` command and its transactional project generator are implemented and tested. The wizard records transport choices, supports flags and machine-readable output, and refuses unsafe writes. Nothing is published, so generated projects cannot yet resolve a Renvor dependency.',
    visual: 'wizard',
  },
  {
    id: 'core',
    name: 'Stable core',
    roadmap: 'Delivered in Phase 002 · API unstable',
    state: 'implemented and tested',
    title: 'Keep transports outside the application service.',
    text: 'The kernel owns the lifecycle, provider registration and dependency resolution, layered configuration, cancellation, bounded deadlines, and independent liveness and readiness. It stays transport-independent by requirement. The CLI and opt-in REST and HTTP adapter call it through visible boundaries; GraphQL does not exist.',
    visual: 'boundary',
  },
  {
    id: 'ports',
    name: 'Capability ports',
    roadmap: 'Delivered in Phases 006–009 · unpublished',
    state: 'partly implemented and tested',
    title: 'Use mature crates without binding the whole app to them.',
    text: 'Narrow boundaries isolate capabilities so implementations can evolve independently. Persistence ports have SQLx and SeaORM adapters tested on PostgreSQL and MySQL, and authentication defines mail and audit ports with deterministic recording sinks. Production mail, queue, storage, and cache adapters do not exist, and persistence and authentication are not exposed through the facade.',
    visual: 'ports',
  },
  {
    id: 'clients',
    name: 'Full-stack contract',
    roadmap: 'Planned for 3.0',
    state: 'not built',
    title: 'Generate clients from one versioned API shape.',
    text: 'Backend contracts, frontend types, auth state, error handling, and regeneration rules are designed to stay synchronised across Rust and Next.js clients. No client generator or published API endpoint exists.',
    visual: 'clients',
  },
  {
    id: 'packages',
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
          <div className="wizard-option selected mono">PostgreSQL / selected</div>
          <div className="wizard-option mono">MySQL</div>
          <code>4 of 9 decisions</code>
          <em className="mockup-note">Illustrative state. The CLI exists only in source today.</em>
        </div>
      );
    case 'boundary':
      return (
        <div className="boundary-demo mono" aria-hidden="true">
          <span>REST</span>
          <span>GraphQL</span>
          <span>CLI</span>
          <em>adapters detach / the core stays</em>
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
          <p className="mono">package / registered</p>
          <p className="mono">migrations / discovered</p>
          <p className="mono">policy tests / passed</p>
          <em className="mockup-note">Design mock-up. This command does not exist.</em>
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
          <p className="section-kicker mono">One route / end to end</p>
          <h2>Trace the intended system without mistaking plans for product.</h2>
          <span className="panorama-caveat">
            Three panels describe implemented work today: the CLI, core, and selected capability
            ports. Every panel states its evidence and limits plainly.
          </span>
          <span className="panorama-hint mono">Scroll to trace the system</span>
        </div>

        {PANELS.map((panel) => (
          <article className="panorama-panel" key={panel.id}>
            <div className="panorama-copy">
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
