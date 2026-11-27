import { expect, test } from '@jest/globals';

import type * as SrcNS from 'build/index.js';

test('Library exports match expectations', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const lib = require('../../build') as typeof SrcNS;
  expect(lib).toMatchSnapshot();
});
