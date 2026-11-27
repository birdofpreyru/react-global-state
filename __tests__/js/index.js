/* global require */

test('Library exports match expectations', () => {
  const lib = require('../../build');
  expect(lib).toMatchSnapshot();
});
