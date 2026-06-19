import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Bayar Digital - Dokumentasi Developer',
  tagline: 'Payment Gateway API untuk Developer Tenant',
  favicon: 'img/favicon.ico',

  url: 'https://docs.bayar.digital',
  baseUrl: '/',

  organizationName: 'bayardigital',
  projectName: 'developer-docs',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'id',
    locales: ['id', 'en'],
    localeConfigs: {
      id: { label: 'Indonesia' },
      en: { label: 'English' },
    },
  },

  markdown: {
    mermaid: true,
  },

  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: undefined,
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
      defaultMode: 'dark',
    },
    navbar: {
      title: 'Bayar Digital',
      logo: {
        alt: 'Bayar Digital',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://bayar.digital',
          label: 'Dashboard',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Legal',
          items: [
            {
              label: 'Disclaimer',
              href: 'https://bayar.digital/disclaimer',
            },
            {
              label: 'Kebijakan Privasi',
              href: 'https://bayar.digital/privacy',
            },
            {
              label: 'Syarat & Ketentuan',
              href: 'https://bayar.digital/terms',
            },
          ],
        },
      ],
      copyright: `Copyright © 2026 Bayar Digital`,
    },
    prism: {
      theme: prismThemes.oneLight,
      darkTheme: prismThemes.oneDark,
      additionalLanguages: ['bash', 'json', 'yaml', 'javascript'],
    },
  } satisfies Preset.ThemeConfig,

  customFields: {
    agentName: 'Bayar Digital Documentation',
    agentDescription: 'Payment Gateway API Documentation for Developers',
    agentEndpoint: 'https://api.bayar.digital',
  },
};

export default config;
