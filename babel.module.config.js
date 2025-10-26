export default {
  plugins: [
    'babel-plugin-add-import-extension',
  ],
  presets: [
    ['./config/babel/preset', {
      modules: false,
      targets: 'defaults or chrome >= 69 or node >= 20',
    }],
  ],
};
