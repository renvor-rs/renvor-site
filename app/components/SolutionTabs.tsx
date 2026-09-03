'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { SOLUTIONS, SOLUTION_ICONS, type SolutionId } from '../lib/content';

const TAB_ORDER: SolutionId[] = ['backend', 'data', 'identity', 'delivery'];
const TAB_LABELS: Record<SolutionId, string> = {
  backend: 'Backend',
  data: 'Data',
  identity: 'Identity',
  delivery: 'Delivery',
};

/* An illustrative trait, not a copy of a real Renvor API. `renvor-core` exposes `Provider`
   with a different shape; this shows the *idea* of a capability boundary without inviting a
   reader to write it down as fact. The caption under the block says so explicitly. */
const CONTRACT = `pub trait Capability {
  type Config;
  type Error;

  async fn start(
    &self, ctx: Context
  ) -> Result<Handle, Self::Error>;
}`;

export default function SolutionTabs() {
  const [active, setActive] = useState<SolutionId>('backend');
  const panelRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (panelRef.current && !reduceMotion) {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', overwrite: true },
      );
    }
  }, [active]);

  const select = useCallback((id: SolutionId, focusTab: boolean) => {
    setActive(id);
    if (focusTab) {
      const idx = TAB_ORDER.indexOf(id);
      requestAnimationFrame(() => tabRefs.current[idx]?.focus());
    }
  }, []);

  // Arrow/Home/End move selection — the APG "automatic activation" tab pattern. Tab itself
  // leaves the tablist, because only the selected tab sits in the tab order.
  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    let next = -1;
    if (event.key === 'ArrowRight') next = (index + 1) % TAB_ORDER.length;
    else if (event.key === 'ArrowLeft') next = (index + TAB_ORDER.length - 1) % TAB_ORDER.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = TAB_ORDER.length - 1;
    if (next < 0) return;
    event.preventDefault();
    const target = TAB_ORDER[next];
    if (target) select(target, true);
  };

  const data = SOLUTIONS[active];
  const Icon = SOLUTION_ICONS[active];

  return (
    <article className="solution-main" data-solution-card>
      <div className="solution-switcher" role="tablist" aria-label="Application surfaces">
        {TAB_ORDER.map((id, i) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`tab-${id}`}
            className="mono"
            aria-selected={active === id}
            aria-controls="solution-panel"
            tabIndex={active === id ? 0 : -1}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            onClick={() => select(id, false)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {TAB_LABELS[id]}
          </button>
        ))}
      </div>
      <div
        id="solution-panel"
        role="tabpanel"
        aria-labelledby={`tab-${active}`}
        // Without this the panel is unreachable by keyboard whenever it holds no focusable
        // element — a reader could select a tab and never reach what it revealed.
        tabIndex={0}
        className="solution-content"
        ref={panelRef}
      >
        <div className="solution-copy">
          <span className="solution-icon">
            <Icon className="glyph" aria-hidden="true" strokeWidth={1.5} />
          </span>
          <span className="roadmap-badge mono">{data.roadmap}</span>
          <h3>{data.title}</h3>
          <p>{data.copy}</p>
          <ul>
            {data.list.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="contract-visual">
          <span className="mono">application::contract</span>
          {/* `overflow-x: auto` makes this a scrollable region once the sample is wider than
              the column — which it is at mobile widths. A scrollable region that is not
              focusable cannot be scrolled by keyboard at all, which axe reports as a serious
              WCAG 2.1.1 failure and which is a genuine one: the content is simply unreachable.
              `tabIndex` puts it in the tab order; the labelled region gives a screen reader
              something to announce when focus lands there. */}
          <pre tabIndex={0} role="region" aria-label="Illustrative capability trait, code sample">
            <code>{CONTRACT}</code>
          </pre>
          <p className="mono">illustrative shape / not a published API</p>
        </div>
      </div>
    </article>
  );
}
