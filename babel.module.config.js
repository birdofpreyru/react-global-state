module.exports = {
  presets: [
    ['./config/babel/preset', {
      modules: false,
      targets: 'defaults',
    }],
    '@babel/preset-typescript',
  ],
};
