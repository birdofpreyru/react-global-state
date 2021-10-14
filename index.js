/**
 * Exposes the build for NodeJS LTS for Node environment, and web build for
 * other environments.
 */

/* eslint-disable global-require, no-eval */

let lib;

try {
  lib = process.versions.node && eval('require')('./build/node');
} catch (error) {
  lib = undefined;
}

if (!lib) lib = require('./build/web');

module.exports = lib;
