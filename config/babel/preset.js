/* global module */

function preset(api, options) {
  let envPreset = '@babel/env';
  if (options) envPreset = [envPreset, options];
  return {
    plugins: [
      ['module-resolver', {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        root: ['./src', '.'],
      }],
      '@babel/plugin-transform-runtime',
    ],
    presets: [
      envPreset,

      // TODO: Starting from Babel 8, "automatic" will be the default runtime,
      // thus once upgraded to Babel 8, runtime should be removed from
      // @babel/react options below.
      ['@babel/react', { runtime: 'automatic' }],

      '@babel/typescript',
    ],
  };
}

module.exports = preset;
