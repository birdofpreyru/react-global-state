/**
 * Creates a Babel preset config.
 * @param {object} api Babel compiler API.
 * @param {object} envPresetOption Preset options.
 * @return {object} Babel preset config.
 */
module.exports = function preset(api, envPresetOption) {
  return {
    presets: [
      ['@babel/env', envPresetOption],

      // TODO: Starting from Babel 8, "automatic" will be the default runtime,
      // thus once upgraded to Babel 8, runtime should be removed from
      // @babel/react options below.
      ['@babel/react', { runtime: 'automatic' }],
    ],
    plugins: [
      ['module-resolver', {
        extensions: ['.js', '.jsx'],
        root: ['./src', '.'],
      }],
      '@babel/plugin-transform-runtime',
    ],
  };
};
