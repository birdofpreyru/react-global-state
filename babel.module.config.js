module.exports = {
  presets: [
    ['./config/babel/preset', {
      modules: false,
      targets: 'defaults or chrome >= 69',
    }],
  ],
};
