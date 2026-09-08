'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { continuousMotionIsPaused, MOTION_ATTRIBUTE } from '../lib/motionPreference';

/**
 * The background field: a static dot grid and glow carry the blueprint texture, while every
 * moving element (signal travelers, scene drift, node halos) lives on one paused GSAP timeline
 * so the header's motion control starts and stops all of it together. The authored markup is
 * complete and static on its own; motion is layered on top only when allowed.
 */
export default function AmbientField() {
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const scene = field.querySelector<SVGGElement>('[data-ambient-scene]');
    const signals = field.querySelectorAll<SVGPathElement>('[data-ambient-signal]');
    const halos = field.querySelectorAll<SVGCircleElement>('[data-ambient-halo]');
    const glow = field.querySelector<SVGEllipseElement>('[data-ambient-glow]');
    if (!scene || signals.length !== 2) return;

    let cycle = 0;
    let updatePlayback: (() => void) | undefined;
    let motionObserver: MutationObserver | undefined;
    const context = gsap.context(() => {
      const signalTravel = gsap.to(signals, {
        strokeDashoffset: '-=720',
        duration: 30,
        ease: 'none',
        repeat: -1,
        onUpdate: () => {
          field.dataset.ambientProgress = signalTravel.progress().toFixed(3);
        },
        onRepeat: () => {
          cycle += 1;
          field.dataset.ambientCycle = String(cycle);
        },
      });

      const sceneDrift = gsap.to(scene, {
        xPercent: 0.65,
        yPercent: -0.45,
        duration: 14,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });

      const loop = gsap.timeline({ paused: true });
      loop.add(signalTravel, 0);
      loop.add(sceneDrift, 0);

      if (halos.length > 0) {
        loop.add(
          gsap.fromTo(
            halos,
            { scale: 0.55, opacity: 0.5 },
            {
              scale: 1.5,
              opacity: 0,
              duration: 4.6,
              ease: 'sine.out',
              repeat: -1,
              stagger: 2.3,
              transformOrigin: 'center',
            },
          ),
          0,
        );
      }

      if (glow) {
        loop.add(
          gsap.to(glow, {
            opacity: 0.85,
            duration: 9,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
          }),
          0,
        );
      }

      updatePlayback = () => {
        if (document.hidden || continuousMotionIsPaused()) {
          loop.pause();
          field.dataset.ambientState = 'paused';
          return;
        }

        loop.play();
        field.dataset.ambientState = 'running';
      };

      document.addEventListener('visibilitychange', updatePlayback);
      motionObserver = new MutationObserver(updatePlayback);
      motionObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: [MOTION_ATTRIBUTE],
      });
      updatePlayback();
    }, field);

    return () => {
      if (updatePlayback) document.removeEventListener('visibilitychange', updatePlayback);
      motionObserver?.disconnect();
      context.revert();
    };
  }, []);

  return (
    <div
      ref={fieldRef}
      className="ambient-field"
      data-ambient-field
      data-ambient-state="idle"
      data-ambient-progress="0"
      data-ambient-cycle="0"
      aria-hidden="true"
    >
      <svg
        className="ambient-field-map"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
      >
        <defs>
          <pattern
            id="ambient-dot-grid"
            width="52"
            height="52"
            patternUnits="userSpaceOnUse"
          >
            <circle className="ambient-grid-dot" cx="1.4" cy="1.4" r="1.4" />
          </pattern>
          <radialGradient id="ambient-glow-gradient" cx="50%" cy="42%" r="60%">
            <stop className="ambient-glow-stop-accent" offset="0%" />
            <stop className="ambient-glow-stop-clear" offset="100%" />
          </radialGradient>
        </defs>

        <rect className="ambient-grid" width="1440" height="900" fill="url(#ambient-dot-grid)" />

        <g data-ambient-scene>
          <ellipse
            className="ambient-glow"
            data-ambient-glow
            cx="720"
            cy="400"
            rx="620"
            ry="350"
            fill="url(#ambient-glow-gradient)"
          />

          <path className="ambient-route ambient-route-secondary" d="M-180 300L1540 746" />
          <path className="ambient-route ambient-route-secondary" d="M-180 620L1540 174" />

          <path className="ambient-route ambient-route-core" d="M-180 820L1540-174" />
          <path className="ambient-route ambient-route-signal" d="M-180 1040L1540 46" />

          <path
            className="ambient-traveler ambient-traveler-core"
            data-ambient-signal
            d="M-180 820L1540-174"
          />
          <path
            className="ambient-traveler ambient-traveler-signal"
            data-ambient-signal
            d="M-180 1040L1540 46"
          />

          <circle className="ambient-halo ambient-halo-core" data-ambient-halo cx="568" cy="388" r="26" />
          <circle className="ambient-halo ambient-halo-signal" data-ambient-halo cx="872" cy="432" r="26" />

          <g className="ambient-route-node ambient-route-node-core">
            <circle cx="568" cy="388" r="9" />
            <circle cx="568" cy="388" r="2.5" />
          </g>
          <g className="ambient-route-node ambient-route-node-signal">
            <circle cx="872" cy="432" r="9" />
            <circle cx="872" cy="432" r="2.5" />
          </g>
        </g>
      </svg>
    </div>
  );
}
