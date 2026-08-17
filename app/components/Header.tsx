'use client';

import { useCallback, useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

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

  return (
    <header className="site-header" data-hydrated={hydrated ? 'true' : undefined}>
      <a className="brand" href="#top" aria-label="Renvor home">
        {/* eslint-disable @next/next/no-img-element */}
        <img
          className="brand-lockup only-light"
          src="/assets/renvor-lockup-v21-light.svg"
          alt="Renvor"
          width={132}
          height={30}
        />
        <img
          className="brand-lockup only-dark"
          src="/assets/renvor-lockup-v21-dark.svg"
          alt="Renvor"
          width={132}
          height={30}
        />
        {/* eslint-enable @next/next/no-img-element */}
      </a>
      <nav className="site-nav" aria-label="Sections">
        <a href="#solutions">Surfaces</a>
        <a href="#panorama">Panorama</a>
        <a href="#fullstack">Full-stack</a>
        <a href="#operations">Operations</a>
        <a href="#packages">Packages</a>
        <a href="#docs">Source</a>
      </nav>
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
        <span className="theme-toggle-label mono">{theme === 'dark' ? 'light' : 'dark'}</span>
      </button>
    </header>
  );
}
