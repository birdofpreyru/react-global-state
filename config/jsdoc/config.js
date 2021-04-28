module.exports = {
  opts: {
    destination: 'docs',
    readme: 'src/home.md',
    recurse: true,
    template: 'node_modules/better-docs',
  },
  plugins: [
    'plugins/markdown',
    'node_modules/better-docs/category',
  ],
  source: {
    include: ['src'],
  },
  tags: {
    allowUnknownTags: ['category', 'subcategory'],
  },
  templates: {
    'better-docs': {
      hideGenerator: true,
      name: 'React Global State',
      navLinks: [{
        label: 'NPM',
        href: 'https://www.npmjs.com/package/@dr.pogodin/react-global-state',
      }, {
        label: 'GitHub',
        href: 'https://github.com/birdofpreyru/react-global-state',
      }, {
        label: 'Studio',
        href: 'https://dr.pogodin.studio/',
      }],
    },
  },
};
