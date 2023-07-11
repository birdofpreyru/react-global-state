test('Library exports match expectations', () => {
  const lib = require('../../src');
  expect(lib).toMatchSnapshot();
});
