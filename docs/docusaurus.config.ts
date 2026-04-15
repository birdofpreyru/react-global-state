import { themes as prismThemes } from 'prism-react-renderer';

import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const CODE_REPO = 'https://github.com/birdofpreyru/react-global-state';
const EDIT_BASE = `${CODE_REPO}/edit/master/docs`;

const NPM_URL = 'https://www.npmjs.com/package/@dr.pogodin/react-global-state';

const config: Config = {
  baseUrl: '/docs/react-global-state/',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },
  onBrokenAnchors: 'throw',
  onBrokenLinks: 'throw',
  plugins: ['docusaurus-plugin-sass'],
  tagline: 'React global state designed right',
  title: 'React Global State',
  url: 'https://dr.pogodin.studio',

  presets: [
    [
      'classic',
      {
        docs: {
          editUrl: EDIT_BASE,
          sidebarPath: './sidebars.ts',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // TODO: Configure it later.
    // Replace with your project's social card
    // image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    footer: {
      copyright: `Copyright © 2019&ndash;${new Date().getFullYear()}, Dr. Sergey Pogodin`,
      links: [
        {
          items: [
            { label: 'API', to: '/docs/api' },
            {
              label: 'Getting Started',
              to: '/docs/tutorials/getting-started',
            },
          ],
          title: 'Docs',
        },
        {
          items: [
            {
              href: CODE_REPO,
              label: 'GitHub',
            },
            {
              href: NPM_URL,
              label: 'NPM',
            },
          ],
          title: 'More',
        },
      ],
      style: 'dark',
    },
    navbar: {
      items: [
        {
          activeBaseRegex: '^/docs/react-global-state/$',
          label: 'React Global State',
          to: '/',
        },
        {
          docId: 'tutorials/getting-started',
          label: 'Getting Started',
          position: 'left',
          type: 'doc',
        },
        {
          docId: 'api/index',
          label: 'API',
          position: 'left',
          type: 'doc',
        },
        {
          href: CODE_REPO,
          label: 'GitHub',
          position: 'right',
        },
        {
          href: NPM_URL,
          label: 'NPM',
          position: 'right',
        },
      ],
      logo: {
        alt: 'Dr. Pogodin Studio',
        href: 'https://dr.pogodin.studio',
        src: 'img/logo-verbose.svg',
      },
    },
    prism: {
      darkTheme: prismThemes.dracula,
      theme: prismThemes.github,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
