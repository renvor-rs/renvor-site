'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { continuousMotionIsPaused, MOTION_ATTRIBUTE } from '../lib/motionPreference';

export default function AmbientField() {
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const scene = field.querySelector<SVGGElement>('[data-ambient-scene]');
    const signals = field.querySelectorAll<SVGPathElement>('[data-ambient-signal]');
    if (!scene || signals.length !== 2) return;

    let cycle = 0;
    let updatePlayback: (() => void) | undefined;
    let motionObserver: MutationObserver | undefined;
    const context = gsap.context(() => {
      const signalTravel = gsap.to(signals, {
        strokeDashoffset: '-=720',
        duration: 22,
        ease: 'none',
        paused: true,
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
        duration: 12,
        ease: 'sine.inOut',
        paused: true,
        repeat: -1,
        yoyo: true,
      });

      updatePlayback = () => {
        if (document.hidden || continuousMotionIsPaused()) {
          signalTravel.pause();
          sceneDrift.pause();
          field.dataset.ambientState = 'paused';
          return;
        }

        signalTravel.resume();
        sceneDrift.resume();
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
        <g data-ambient-scene>
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
