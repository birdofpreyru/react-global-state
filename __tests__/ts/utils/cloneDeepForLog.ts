import type * as LodashM from 'lodash';
import mockdate from 'mockdate';

const mockCloneDeepDelay = 500;

const consoleWarnings: unknown[][] = [];

console.warn = (...data: unknown[]) => {
  consoleWarnings.push(data);
};

jest.mock<typeof LodashM>('lodash-es', () => {
  const real = jest.requireActual<typeof LodashM>('lodash-es');
  return {
    ...real,
    cloneDeep<T>(value: T) {
      mockdate.set(Date.now() + mockCloneDeepDelay);
      return real.cloneDeep(value);
    },
  };
});

test('key timeout works as expected', async () => {
  // eslint-disable-next-line import/dynamic-import-chunkname
  const { cloneDeepForLog } = await import('src/utils');

  const oA = { data: { key: 'value' } };
  let oB = cloneDeepForLog(oA, '2');
  oA.data.key = 'value-2';
  expect(oB.data.key).toBe('value');
  expect(consoleWarnings).toMatchSnapshot();

  oB = cloneDeepForLog(oA, '2');
  oA.data.key = 'value-3';
  expect(oB.data.key).toBe('value-3');
  expect(consoleWarnings).toMatchSnapshot();

  oB = cloneDeepForLog(oA, '3');
  oA.data.key = 'value-4';
  expect(oB.data.key).toBe('value-3');
  expect(consoleWarnings).toMatchSnapshot();
});
