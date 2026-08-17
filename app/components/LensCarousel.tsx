'use client';

import { useCallback, useRef, useState } from 'react';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LENSES } from '../lib/content';

const pad = (n: number) => String(n).padStart(2, '0');

export default function LensCarousel() {
  const [index, setIndex] = useState(0);
  const copyRef = useRef<HTMLDivElement>(null);

  const show = useCallback((next: number) => {
    const idx = (next + LENSES.length) % LENSES.length;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const el = copyRef.current;
    if (el && !reduced) {
      gsap.to(el, {
        opacity: 0,
        y: 10,
        duration: 0.22,
        ease: 'power2.in',
        overwrite: true,
        onComplete: () => {
          setIndex(idx);
          gsap.to(el, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' });
        },
      });
    } else {
      setIndex(idx);
    }
  }, []);

  const lens = LENSES[index];
  if (!lens) return null;

  return (
    <section className="evaluation-section" aria-roledescription="carousel" aria-label="Evaluation lenses">
      {/* `aria-live="polite"` announces the new lens after the transition. It is on the copy
          container rather than the section so the controls do not get re-announced too. */}
      <div className="evaluation-copy" aria-live="polite" aria-atomic="true" ref={copyRef}>
        <p className="register-label mono">evaluation lens</p>
        <h2>{lens.title}</h2>
        <div>{lens.copy}</div>
      </div>
      <div className="evaluation-controls">
        <button type="button" aria-label="Previous evaluation lens" onClick={() => show(index - 1)}>
          <ChevronLeft aria-hidden="true" size={20} strokeWidth={1.8} />
        </button>
        <span className="mono">
          {/* Screen readers get a sentence; sighted readers get the register-style counter. */}
          <span className="sr-only">
            Lens {index + 1} of {LENSES.length}
          </span>
          <span aria-hidden="true">
            {pad(index + 1)} / {pad(LENSES.length)}
          </span>
        </span>
        <button type="button" aria-label="Next evaluation lens" onClick={() => show(index + 1)}>
          <ChevronRight aria-hidden="true" size={20} strokeWidth={1.8} />
        </button>
      </div>
    </section>
  );
}
