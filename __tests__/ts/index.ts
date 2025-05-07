import type * as SrcNS from '../../src';

test('Library exports match expectations', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const lib = require('../../src') as typeof SrcNS;
  expect(lib).toMatchSnapshot();
});
