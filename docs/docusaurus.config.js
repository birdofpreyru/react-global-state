// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const { themes } = require('prism-react-renderer');

const CODE_REPO = 'https://github.com/birdofpreyru/react-global-state';
const EDIT_BASE = `${CODE_REPO}/edit/master/docs`;

const NPM_URL = 'https://www.npmjs.com/package/@dr.pogodin/react-global-state';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'React Global State',
  tagline: 'React global state designed right',
  url: 'https://dr.pogodin.studio',
  baseUrl: '/docs/react-global-state/',
  onBrokenAnchors: 'throw',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',
  favicon: 'img/favicon.ico',
  plugins: ['docusaurus-plugin-sass'],

  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: EDIT_BASE,
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        logo: {
          alt: 'Dr. Pogodin Studio',
          src: 'img/logo-verbose.svg',
          href: 'https://dr.pogodin.studio',
        },
        items: [
          {
            to: '/',
            label: 'React Global State',
            activeBaseRegex: '^/docs/react-global-state/$',
          },
          {
            type: 'doc',
            docId: 'tutorials/getting-started',
            position: 'left',
            label: 'Getting Started',
          },
          {
            type: 'doc',
            docId: 'api/index',
            position: 'left',
            label: 'API',
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
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              { label: 'API', to: '/docs/api' },
              {
                label: 'Getting Started',
                to: '/docs/tutorials/getting-started',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: CODE_REPO,
              },
              {
                label: 'NPM',
                href: NPM_URL,
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Dr. Sergey Pogodin`,
      },
      prism: {
        theme: themes.github,
        darkTheme: themes.dracula,
      },
    }),
};

module.exports = config;
