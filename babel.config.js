export default {
  plugins: [
    'babel-plugin-react-compiler',
    ['module-resolver', {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      root: ['./src', '.'],
    }],
  ],
  presets: [
    '@babel/env',
    '@babel/react',
    '@babel/typescript',
  ],
};
