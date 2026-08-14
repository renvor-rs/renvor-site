import type {Config} from '@docusaurus/types';
import type {Options, ThemeConfig} from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Renvor',
  tagline: 'Application infrastructure for Rust teams — in development, not yet released.',
  favicon: 'img/renvor-favicon-v7.svg',
  url: 'https://renvor.dev',
  baseUrl: '/',
  baseUrlIssueBanner: false,
  organizationName: 'renvor-rs',
  projectName: 'renvor-site',
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  markdown: {hooks: {onBrokenMarkdownLinks: 'warn'}},
  i18n: {defaultLocale: 'en', locales: ['en']},
  presets: [[
    'classic',
    {docs: false, blog: false, theme: {customCss: './src/css/custom.css'}} satisfies Options,
  ]],
  themeConfig: {
    // The description is the search-result and link-preview text, so it is the one claim most
    // likely to be read without the page's development-status notice beside it. It states the
    // status first for that reason (T095).
    metadata: [
      {name: 'description', content: 'Renvor is an in-development Rust application framework. Nothing is released or installable yet: the planned scope covers explicit services, transports, persistence, authentication, frontend delivery, desktop applications, and installable packages.'},
      {name: 'theme-color', content: '#3267FF'},
    ],
    colorMode: {defaultMode: 'light', respectPrefersColorScheme: true, disableSwitch: false},
    navbar: {
      title: 'renvor',
      logo: {alt: 'Renvor home', src: 'img/renvor-mark-v7.svg', srcDark: 'img/renvor-mark-v7-dark.svg', width: 36, height: 36},
      items: [
        {href: '/#solutions', label: 'Framework', position: 'right'},
        {href: '/#panorama', label: 'Architecture', position: 'right'},
        {href: '/#fullstack', label: 'Full stack', position: 'right'},
        {href: '/#operations', label: 'Operations', position: 'right'},
        // Labelled "Status", not "Docs": the section it targets states that documentation is
        // not deployed, so a "Docs" label would promise a destination that does not exist.
        // The anchor id stays `docs` because LandingPage collects it by that name.
        {href: '/#docs', label: 'Status', position: 'right'},
      ],
    },
  } satisfies ThemeConfig,
};

export default config;
