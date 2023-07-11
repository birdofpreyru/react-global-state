:::info TypeScript Support
The TypeScript support is the primary aim for **v0.10.x** versions of
the library.

As of the latest library version, **v0.10.0-alpha.1**, the codebase has been
migrated to TypeScript, extended with TypeScript-specific features, and tested
with TypeScript-specific unit and functionality tests. The backward compatibility
with JavaScript is ensured by keeping and passing all original unit and functionality
tests from previous releases, and NPM packages will include both TypeScript
and compiled JavaScript versions of the codebase, exposed via `package.json`'s
[`exports` mapping](https://nodejs.org/api/packages.html#packages_exports),
with fallback to `main`, `react-native`, `source` fields for environments not
yet supporting `exports`.

The documentation of TypeScript-specific features is a work in progress,
and at least for now the documentation, in some places, will explain JavaScript
features and usage first, then covering additional TypeScript-specific nuances
for the same topics. In other places documentation will mostly explain TypeScript
side of things, assuming it is clear whether the stuff being explained works
the same in pure JavaScript (just without static type-checks and generic
parameters), or just not really present as real entities in pure JavaScript
(like dedicated type declarations), although otherwise followed in the runtime.

The regular **v0.10.0** release will happen once the library is tested across
a variety of real-world projects, and any discovered issues are fixed.

_See details of library versions history at [Releases Page on GitHub](https://github.com/birdofpreyru/react-global-state/releases)._
:::

