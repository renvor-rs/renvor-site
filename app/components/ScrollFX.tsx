'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { continuousMotionIsPaused, MOTION_ATTRIBUTE } from '../lib/motionPreference';

gsap.registerPlugin(ScrollTrigger);

/* Page-wide scroll choreography. Authored HTML/CSS is always complete and visible;
   motion adds route drawing, active-state sequencing, and spatial continuity. */
export default function ScrollFX() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      // framework boundary manifesto: two authored routes resolve through visible gates into the core
      const boundaryManifesto = document.querySelector<HTMLElement>('[data-boundary-manifesto]');
      if (boundaryManifesto) {
        const routes = gsap.utils.toArray<SVGPathElement>('[data-boundary-route]', boundaryManifesto);
        const boundaryTimeline = gsap.timeline({
          scrollTrigger: { trigger: boundaryManifesto, start: 'top 78%', once: true },
        });

        routes.forEach((route, index) => {
          const length = route.getTotalLength();
          boundaryTimeline.fromTo(
            route,
            { strokeDasharray: length, strokeDashoffset: length },
            {
              strokeDashoffset: 0,
              duration: 1.05,
              ease: 'expo.out',
              clearProps: 'strokeDasharray,strokeDashoffset',
            },
            index * 0.12
          );
        });

        boundaryTimeline
          .from(
            boundaryManifesto.querySelectorAll<SVGGElement>('[data-boundary-gate]'),
            { scale: 0.7, opacity: 0, transformOrigin: 'center', duration: 0.48, stagger: 0.1, ease: 'expo.out' },
            0.42
          )
          .from(
            boundaryManifesto.querySelector<SVGGElement>('[data-boundary-core]'),
            { x: 18, opacity: 0, duration: 0.58, ease: 'expo.out' },
            0.56
          )
          .from(
            boundaryManifesto.querySelectorAll<HTMLElement>('[data-boundary-copy] > *:not(.boundary-evidence-wrap)'),
            { y: 24, opacity: 0, duration: 0.62, stagger: 0.08, ease: 'expo.out' },
            0.18
          )
          .from(
            boundaryManifesto.querySelector<HTMLElement>('[data-boundary-evidence-track]'),
            { scaleX: 0, transformOrigin: 'left center', duration: 0.7, ease: 'expo.out' },
            0.72
          )
          .from(
            boundaryManifesto.querySelectorAll<HTMLElement>('[data-boundary-evidence]'),
            { y: 12, opacity: 0, duration: 0.48, stagger: 0.09, ease: 'expo.out' },
            0.78
          );
      }

      // proof signal board: rails resolve into the junction before its phase and status data arrives
      const proofBoard = document.querySelector<HTMLElement>('[data-proof-board]');
      if (proofBoard) {
        const rails = gsap.utils.toArray<SVGPathElement>('[data-proof-rail]', proofBoard);
        const railTimeline = gsap.timeline({
          scrollTrigger: { trigger: proofBoard, start: 'top 80%', once: true },
        });

        rails.forEach((rail, index) => {
          const length = rail.getTotalLength();
          railTimeline.fromTo(
            rail,
            { strokeDasharray: length, strokeDashoffset: length },
            {
              strokeDashoffset: 0,
              duration: 1.05,
              ease: 'power2.inOut',
              clearProps: 'strokeDasharray,strokeDashoffset',
            },
            index * 0.16
          );
        });

        railTimeline
          .from(
            '[data-proof-node]',
            { scale: 0.55, opacity: 0, transformOrigin: 'center', duration: 0.45, ease: 'expo.out' },
            0.72
          )
          .from(
            '[data-proof-phase]',
            { y: 10, opacity: 0, duration: 0.42, stagger: 0.08, ease: 'power2.out' },
            0.78
          )
          .from(
            proofBoard.querySelectorAll<HTMLElement>('[data-precedence-tier]'),
            { x: 22, opacity: 0, duration: 0.42, stagger: 0.07, ease: 'power2.out' },
            0.42
          )
          .from(
            proofBoard.querySelectorAll<HTMLElement>('[data-release-status]'),
            { y: 14, opacity: 0, duration: 0.42, stagger: 0.08, ease: 'power2.out' },
            0.64
          );
      }

      // kernel interlocking: one cursor follows the live marker geometry and pauses offscreen
      const lifecycleBoard = document.querySelector<HTMLElement>('[data-lifecycle-board]');
      if (lifecycleBoard) {
        const field = lifecycleBoard.querySelector<HTMLElement>('[data-lifecycle-field]');
        const cursor = lifecycleBoard.querySelector<HTMLElement>('[data-lifecycle-cursor]');
        const readout = lifecycleBoard.querySelector<HTMLOutputElement>('[data-lifecycle-readout]');
        const nodes = gsap.utils.toArray<HTMLElement>('[data-lifecycle-node]', lifecycleBoard);
        const rollback = lifecycleBoard.querySelector<HTMLElement>('[data-lifecycle-rollback]');

        const firstNode = nodes.at(0);

        if (field && cursor && readout && firstNode && nodes.length === 7) {
          let currentIndex = 0;
          let inViewport = false;
          let loopCycle = 0;

          const markerFor = (node: HTMLElement) =>
            node.querySelector<HTMLElement>('[data-lifecycle-marker]');

          const cursorPosition = (node: HTMLElement) => {
            const marker = markerFor(node);
            if (!marker) return { x: 0, y: 0 };

            const fieldRect = field.getBoundingClientRect();
            const markerRect = marker.getBoundingClientRect();
            return {
              x: markerRect.left - fieldRect.left + markerRect.width / 2 - cursor.offsetWidth / 2,
              y: markerRect.top - fieldRect.top + markerRect.height / 2 - cursor.offsetHeight / 2,
            };
          };

          const activate = (index: number) => {
            const node = nodes[index];
            if (!node) return;

            currentIndex = index;
            nodes.forEach((node, nodeIndex) => {
              node.classList.toggle('is-active', nodeIndex === index);
              node.classList.toggle('is-passed', nodeIndex < index);
            });
            rollback?.classList.toggle('is-active', index === 3);

            const phase = node.dataset.lifecyclePhase ?? String(index + 1).padStart(2, '0');
            const name = node.querySelector<HTMLElement>('.lifecycle-phase-name strong')?.textContent ?? '';
            lifecycleBoard.dataset.currentPhase = phase;
            readout.textContent = `${phase} / ${name}`;
          };

          const initialPosition = cursorPosition(firstNode);
          gsap.set(cursor, { x: initialPosition.x, y: initialPosition.y, autoAlpha: 1 });
          activate(0);

          const lifecycleLoop = gsap.timeline({
            paused: true,
            repeat: -1,
            repeatDelay: 0.45,
            repeatRefresh: true,
            onRepeat: () => {
              loopCycle += 1;
              lifecycleBoard.dataset.loopCycle = String(loopCycle);
            },
          });

          lifecycleLoop
            .to(cursor, { scale: 1.34, duration: 0.16, ease: 'expo.out' })
            .to(cursor, { scale: 1, duration: 0.3, ease: 'expo.out' });

          nodes.slice(1).forEach((node, offset) => {
            const index = offset + 1;
            lifecycleLoop
              .to(cursor, {
                x: () => cursorPosition(node).x,
                y: () => cursorPosition(node).y,
                duration: 0.64,
                ease: 'expo.inOut',
              })
              .call(() => activate(index))
              .to(cursor, { scale: 1.34, duration: 0.16, ease: 'expo.out' })
              .to(cursor, { scale: 1, duration: 0.28, ease: 'expo.out' });
          });

          lifecycleLoop
            .to(cursor, { autoAlpha: 0, duration: 0.22, ease: 'expo.out' })
            .call(() => {
              activate(0);
              const position = cursorPosition(firstNode);
              gsap.set(cursor, { x: position.x, y: position.y });
            })
            .to(cursor, { autoAlpha: 1, duration: 0.28, ease: 'expo.out' });

          const updatePlayback = () => {
            const shouldPlay = inViewport && !document.hidden && !continuousMotionIsPaused();
            if (shouldPlay) {
              lifecycleLoop.play();
              lifecycleBoard.dataset.loopState = 'running';
            } else {
              lifecycleLoop.pause();
              lifecycleBoard.dataset.loopState = 'paused';
            }
          };

          const observer = new IntersectionObserver(
            ([entry]) => {
              if (!entry) return;
              inViewport = entry.isIntersecting;
              updatePlayback();
            },
            { threshold: 0.08 }
          );
          observer.observe(lifecycleBoard);

          const handleVisibility = () => updatePlayback();
          const handleResize = () => {
            lifecycleLoop.invalidate();
            if (lifecycleLoop.paused()) {
              const position = cursorPosition(nodes[currentIndex] ?? firstNode);
              gsap.set(cursor, { x: position.x, y: position.y });
            }
          };
          document.addEventListener('visibilitychange', handleVisibility);
          window.addEventListener('resize', handleResize);
          const motionObserver = new MutationObserver(updatePlayback);
          motionObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: [MOTION_ATTRIBUTE],
          });

          cleanups.push(() => {
            observer.disconnect();
            document.removeEventListener('visibilitychange', handleVisibility);
            window.removeEventListener('resize', handleResize);
            motionObserver.disconnect();
            lifecycleLoop.kill();
            nodes.forEach((node) => node.classList.remove('is-active', 'is-passed'));
            rollback?.classList.remove('is-active');
          });
        }
      }

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

      // request trace: the route resolves first, then each visible node and its explanation activate together
      const architectureTrace = document.querySelector<HTMLElement>('[data-architecture-trace]');
      if (architectureTrace) {
        const routes = gsap.utils.toArray<SVGPathElement>('[data-architecture-route]', architectureTrace);
        const nodes = gsap.utils.toArray<SVGGElement>('[data-architecture-node]', architectureTrace);
        const stages = gsap.utils.toArray<HTMLElement>('[data-architecture-stage]', architectureTrace);
        const traceTimeline = gsap.timeline({
          scrollTrigger: { trigger: architectureTrace, start: 'top 76%', once: true },
        });

        routes.forEach((route, index) => {
          const length = route.getTotalLength();
          traceTimeline.fromTo(
            route,
            { strokeDasharray: length, strokeDashoffset: length },
            {
              strokeDashoffset: 0,
              duration: 1.15,
              ease: 'expo.out',
              clearProps: 'strokeDasharray,strokeDashoffset',
            },
            index * 0.12
          );
        });

        nodes.forEach((node, index) => {
          const at = 0.36 + index * 0.13;
          traceTimeline.from(
            node,
            { scale: 0.68, opacity: 0, transformOrigin: 'center', duration: 0.46, ease: 'expo.out' },
            at
          );
          if (stages[index]) {
            traceTimeline.from(
              stages[index],
              { y: 16, opacity: 0, duration: 0.5, ease: 'expo.out' },
              at
            );
          }
        });
      }
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      ctx.revert();
    };
  }, []);

  return null;
}
