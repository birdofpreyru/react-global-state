/**
 * Creates a Babel preset config.
 * @param {object} api Babel compiler API.
 * @param {options} [options] Optional. Preset options.
 * @param {string|string[]|object} [options.targets] Optional. Targets for
 *  Babel env preset.
 * @return {object} Babel preset config.
 */
module.exports = function preset(api, options = {}) {
  const { targets } = options;

  let envPreset = '@babel/env';
  if (targets) envPreset = [envPreset, { targets }];

  return {
    presets: [envPreset, '@babel/react'],
    plugins: [
      '@babel/plugin-transform-runtime',
      ['module-resolver', {
        extensions: ['.js', '.jsx'],
        root: ['./src', '.'],
      }],
    ],
  };
};
