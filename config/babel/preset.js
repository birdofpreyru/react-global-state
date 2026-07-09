export default function preset(api, options) {
  const plugins = [
    'babel-plugin-react-compiler',
    ['module-resolver', {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      root: ['./src', '.'],
    }],
  ];

  if (options.build) plugins.push('@dr.pogodin/add-import-extension');

  return {
    plugins,
    presets: [
      '@babel/env',
      '@babel/react',
      '@babel/typescript',
    ],
  };
}
