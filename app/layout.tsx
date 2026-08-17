import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://renvor.dev'),
  title: 'Renvor — application infrastructure for Rust teams (in development)',
  description:
    'Renvor is an in-development Rust application framework. Phase 002 delivers a tested, ' +
    'transport-independent kernel. No crate, release, CLI, network transport, database ' +
    'adapter, or generated project is available yet, and nothing is installable.',
  applicationName: 'Renvor',
  authors: [{ name: 'Renvor', url: 'https://github.com/renvor-rs/renvor' }],
  // No `robots: noindex` — the page is truthful about its own state, so it is safe to index.
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Renvor',
    title: 'Renvor — application infrastructure for Rust teams (in development)',
    description:
      'In development. Phase 002 delivers a tested, transport-independent kernel. Nothing is ' +
      'installable yet.',
  },
  icons: [
    {
      rel: 'icon',
      url: '/assets/renvor-favicon-v21-light.svg',
      media: '(prefers-color-scheme: light)',
      type: 'image/svg+xml',
    },
    {
      rel: 'icon',
      url: '/assets/renvor-favicon-v21-dark.svg',
      media: '(prefers-color-scheme: dark)',
      type: 'image/svg+xml',
    },
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // No `maximumScale` and no `userScalable: false`. Both break pinch-zoom, which is a WCAG
  // 1.4.4 failure, and the 200% zoom check in the accessibility suite would catch it.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f3e8' },
    { media: '(prefers-color-scheme: dark)', color: '#0c151a' },
  ],
};

/**
 * Applies the stored or preferred theme before first paint.
 *
 * This has to be inline and synchronous: an external script is deferred past first paint, so
 * a reader with the dark theme stored would see a parchment flash on every navigation. That
 * is a real accessibility problem, not a cosmetic one.
 *
 * Being inline, it is the one script on this page that `script-src 'self'` cannot authorise.
 * It is covered by a **SHA-256 hash** instead, computed from the built output by
 * `scripts/generate-csp.mjs` — so the policy authorises exactly these bytes and nothing else,
 * and editing this string without regenerating the policy fails the CSP check rather than
 * silently loosening it. `'unsafe-inline'` is never used.
 *
 * It touches only `document.documentElement`'s `data-theme` attribute and one localStorage
 * key, and every branch has a fallback, so a blocked or failed read cannot leave the page
 * unstyled.
 */
const themeScript = `(function(){try{var t=localStorage.getItem('renvor-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}}catch(e){t='light';}document.documentElement.setAttribute('data-theme',t);})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a className="skip-link" href="#top">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
