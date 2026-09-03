'use client';

import { useCallback, useEffect, useState } from 'react';
import { Moon, Pause, Play, Sun } from 'lucide-react';
import { currentMotionPreference, type MotionPreference } from '../lib/motionPreference';

type Theme = 'light' | 'dark';

function currentTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

export default function Header() {
  // Always starts at 'light' so the server-rendered markup and the first client render agree.
  // The real value is read in the effect below; the inline script in `layout.tsx` has already
  // set `data-theme` on <html> by then, so nothing flashes.
  const [theme, setTheme] = useState<Theme>('light');
  const [motion, setMotion] = useState<MotionPreference>('running');

  // Hydration marker for the test suite, which waits on this rather than on a timeout — a
  // sleep long enough to be reliable is long enough to hide a regression, and `networkidle`
  // does not tell you React has attached.
  //
  // It is rendered as a React-owned attribute on this element rather than written onto
  // `<html>` from an effect. That was the first attempt and it silently did not stick: React
  // owns the root element in the App Router and reconciles away an attribute it did not
  // render, so the marker vanished while the page was in fact perfectly interactive. The test
  // failure looked like broken hydration and was nothing of the sort.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTheme(currentTheme());
    setMotion(currentMotionPreference());
    setHydrated(true);
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('renvor-theme', next);
    } catch {
      // Private mode, or storage disabled. The theme still applies for this page view; only
      // persistence is lost, which is the correct thing to degrade.
    }
    setTheme(next);
  }, []);

  const toggleMotion = useCallback(() => {
    const next: MotionPreference =
      currentMotionPreference() === 'paused' ? 'running' : 'paused';
    document.documentElement.setAttribute('data-motion', next);
    try {
      localStorage.setItem('renvor-motion', next);
    } catch {
      // The control still applies to the current page when storage is unavailable.
    }
    setMotion(next);
  }, []);

  return (
    <header className="site-header" data-hydrated={hydrated ? 'true' : undefined}>
      {/* Absolute, not `#top`. This header is rendered on the 404 route too, where a bare
          fragment resolves against a document that has no such section — the link checker
          caught six of them, and a reader clicking "Surfaces" from a 404 would have gone
          nowhere. On the landing page `/#solutions` is still an in-page fragment navigation,
          not a reload, because the path is unchanged. */}
      <a className="brand" href="/" aria-label="Renvor home">
        {/* eslint-disable @next/next/no-img-element */}
        <img
          className="brand-lockup only-light"
          src="/assets/renvor-lockup-v40-light.svg"
          alt="Renvor"
          width={700}
          height={170}
        />
        <img
          className="brand-lockup only-dark"
          src="/assets/renvor-lockup-v40-dark.svg"
          alt="Renvor"
          width={700}
          height={170}
        />
        {/* eslint-enable @next/next/no-img-element */}
      </a>
      <nav className="site-nav" aria-label="Sections">
        <a href="/#solutions">System</a>
        <a href="/#panorama">Journey</a>
        <a href="/#operations">Lifecycle</a>
        <a href="https://docs.renvor.dev/">Docs</a>
      </nav>
      <div className="site-preferences" role="group" aria-label="Display preferences">
        <button
          type="button"
          className="motion-toggle"
          onClick={toggleMotion}
          aria-label={motion === 'paused' ? 'Play animations' : 'Pause animations'}
          aria-pressed={motion === 'paused'}
        >
          {motion === 'paused' ? (
            <Play className="glyph" aria-hidden="true" size={18} strokeWidth={1.6} />
          ) : (
            <Pause className="glyph" aria-hidden="true" size={18} strokeWidth={1.6} />
          )}
          <span className="preference-toggle-label mono">
            {motion === 'paused' ? 'play' : 'pause'}
          </span>
        </button>
        <button
          type="button"
          className="theme-toggle"
          onClick={toggle}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          aria-pressed={theme === 'dark'}
        >
          {/* Icons come from the icon set rather than being brand marks pressed into service as
              UI glyphs — a sun and a moon say "theme"; a favicon does not. */}
          {theme === 'dark' ? (
            <Sun className="glyph" aria-hidden="true" size={18} strokeWidth={1.6} />
          ) : (
            <Moon className="glyph" aria-hidden="true" size={18} strokeWidth={1.6} />
          )}
          <span className="preference-toggle-label mono">
            {theme === 'dark' ? 'light' : 'dark'}
          </span>
        </button>
      </div>
    </header>
  );
}
