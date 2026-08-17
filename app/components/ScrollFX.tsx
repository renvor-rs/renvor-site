'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* Page-wide scroll choreography: generic reveals, stagger groups, the
   register strip, the operations lifecycle chart, and the statement's
   word-by-word illumination. Everything uses gsap.from, so content is
   fully visible with JavaScript disabled. Skipped under reduced motion. */
export default function ScrollFX() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      // register strip: billets rise into the strip, in lifecycle order
      const stripCells = gsap.utils.toArray('[data-strip-cell]');
      if (stripCells.length) {
        gsap.from('[data-strip-cell] .strip-billets i', {
          scaleY: 0,
          duration: 0.7,
          ease: 'expo.out',
          stagger: 0.09,
          scrollTrigger: { trigger: '.register-strip', start: 'top 88%' },
        });
        gsap.from('[data-strip-cell] .strip-name', {
          opacity: 0,
          y: 8,
          duration: 0.5,
          ease: 'power3.out',
          stagger: 0.09,
          scrollTrigger: { trigger: '.register-strip', start: 'top 88%' },
        });
      }

      // lifecycle register in operations: the seven impressions rise in order
      gsap.utils.toArray<HTMLElement>('.lr-cell').forEach((cell, i) => {
        gsap.from(cell.querySelector('.lr-bar'), {
          scaleY: 0,
          transformOrigin: 'bottom',
          duration: 0.65,
          ease: 'expo.out',
          delay: i * 0.08,
          scrollTrigger: { trigger: '.lifecycle-register', start: 'top 82%' },
        });
      });

      // generic rise-in reveals
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          y: 44,
          opacity: 0,
          duration: 0.95,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 84%' },
        });
      });

      // solution cards settle in
      gsap.utils.toArray<HTMLElement>('[data-solution-card]').forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 64, opacity: 0.25 },
          {
            y: 0,
            opacity: 1,
            ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 94%', end: 'top 58%', scrub: 0.55 },
            delay: i * 0.04,
          }
        );
      });

      // stagger groups
      gsap.utils.toArray<HTMLElement>('[data-stagger-group]').forEach((group) => {
        gsap.from(group.children, {
          y: 34,
          opacity: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: { trigger: group, start: 'top 86%' },
        });
      });

      // architecture statement: word-by-word illumination
      const words = gsap.utils.toArray('[data-architecture-word]');
      if (words.length) {
        gsap.fromTo(
          words,
          { opacity: 0.15 },
          {
            opacity: 1,
            stagger: 0.06,
            ease: 'none',
            scrollTrigger: {
              trigger: '[data-architecture-statement]',
              start: 'top 78%',
              end: 'bottom 52%',
              scrub: true,
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return null;
}
