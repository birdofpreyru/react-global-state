/* global module, require */

// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const { themes } = require('prism-react-renderer');

const CODE_REPO = 'https://github.com/birdofpreyru/react-global-state';
const EDIT_BASE = `${CODE_REPO}/edit/master/docs`;

const NPM_URL = 'https://www.npmjs.com/package/@dr.pogodin/react-global-state';

/** @type {import('@docusaurus/types').Config} */
const config = {
  baseUrl: '/docs/react-global-state/',
  favicon: 'img/favicon.ico',
  onBrokenAnchors: 'throw',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',
  plugins: ['docusaurus-plugin-sass'],
  tagline: 'React global state designed right',
  title: 'React Global State',
  url: 'https://dr.pogodin.studio',

  presets: [
    [
      '@docusaurus/preset-classic',

      /** @type {import('@docusaurus/preset-classic').Options} */
      {
        docs: {
          editUrl: EDIT_BASE,
          sidebarPath: require.resolve('./sidebars.js'),
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],

  themeConfig:

    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    {
      footer: {
        copyright: `Copyright © ${new Date().getFullYear()} Dr. Sergey Pogodin`,
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
        darkTheme: themes.dracula,
        theme: themes.github,
      },
    },
};

module.exports = config;
