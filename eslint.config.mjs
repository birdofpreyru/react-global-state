/* eslint-disable import/no-extraneous-dependencies */

import { defineConfig } from 'eslint/config';
import eslintConfigs from '@dr.pogodin/eslint-configs';

export default defineConfig([
  { ignores: [
    'build/',
    'docs/build/',
    'docs/.docusaurus/',
  ] },
  eslintConfigs.configs.javascript,
  eslintConfigs.configs.typescript,
  eslintConfigs.configs.react,
  {
    extends: [eslintConfigs.configs.jest],
    files: ['__tests__/**'],
  },
]);
