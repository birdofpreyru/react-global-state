module.exports = {
  presets: [
    ['@babel/env', { targets: 'defaults' }],
    '@babel/react',
  ],
  plugins: [
    ['module-resolver', {
      extensions: ['.js', '.jsx'],
      root: ['./src', '.'],
    }],
  ],
};
