import { expect, test } from 'tstyche';

import {
  type AsyncDataEnvelopeT,
  type AsyncDataLoaderT,
  type ForceT,
  type UseAsyncDataResT,
  useAsyncData,
} from '../../../src';

import type { DataInEnvelopeAtPathT } from '../../../src/useAsyncData';

declare function loader1(): 'OK';
declare function loader2(): Promise<'OK'>;
declare function numLoader(): number;

test('test', () => {
  expect<AsyncDataLoaderT<'OK'>>().type.toBeAssignableFrom(loader1);
  expect<AsyncDataLoaderT<'OK'>>().type.toBeAssignableFrom(loader2);

  expect(
    useAsyncData<ForceT, 'OK'>('path', loader1),
  ).type.toBe<UseAsyncDataResT<'OK'>>();

  const SOME_PATH = 'some.path';
  type StateT = { some: { path: AsyncDataEnvelopeT<'OK'> } };

  expect(
    useAsyncData<StateT, typeof SOME_PATH>(SOME_PATH, loader1),
  ).type.toBe<UseAsyncDataResT<'OK'>>();

  expect(
    useAsyncData<
      StateT,
      typeof SOME_PATH,
      DataInEnvelopeAtPathT<StateT, typeof SOME_PATH>
    >,
  ).type.not.toBeCallableWith(SOME_PATH, numLoader);
});
