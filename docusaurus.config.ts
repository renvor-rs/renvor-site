import type {Config} from '@docusaurus/types';
import type {Options, ThemeConfig} from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Renvor',
  tagline: 'Application infrastructure for Rust teams.',
  favicon: 'img/renvor-favicon-v7.svg',
  url: 'https://renvor.dev',
  baseUrl: '/',
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
    metadata: [
      {name: 'description', content: 'Renvor connects explicit Rust services, transports, persistence, authentication, frontend delivery, desktop applications, and installable packages.'},
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
        {href: '/#docs', label: 'Docs', position: 'right'},
      ],
    },
  } satisfies ThemeConfig,
};

export default config;
