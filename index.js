/**
 * Exposes the build for NodeJS LTS for Node environment, and web build for
 * other environments.
 */

/* eslint-disable global-require, no-eval */

module.exports = typeof process !== 'undefined'
  && process.versions && process.versions.node
  ? eval('require')('./build/node') : require('./build/web');
