module.exports = {
  presets: [
    ['@babel/env', { targets: 'maintained node versions' }],

    // TODO: Starting from Babel 8, "automatic" will be the default runtime,
    // thus once upgraded to Babel 8, runtime should be removed from
    // @babel/react options below.
    ['@babel/react', { runtime: 'automatic' }],

    '@babel/typescript',
  ],
  plugins: [
    ['module-resolver', {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      root: ['./src', '.'],
    }],
    '@babel/plugin-transform-runtime',
  ],
};
