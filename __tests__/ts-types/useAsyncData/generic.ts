import { expect } from 'tstyche';

import {
  type AsyncDataEnvelopeT,
  type AsyncDataLoaderT,
  type ForceT,
  type UseAsyncDataResT,
  useAsyncData,
} from '../../../src';

declare function loader1(): 'OK';
declare function loader2(): Promise<'OK'>;
declare function numLoader(): number;

expect<AsyncDataLoaderT<'OK'>>().type.toBeAssignable(loader1);
expect<AsyncDataLoaderT<'OK'>>().type.toBeAssignable(loader2);

expect(
  useAsyncData<ForceT, 'OK'>('path', loader1),
).type.toEqual<UseAsyncDataResT<'OK'>>();

const SOME_PATH = 'some.path';
type StateT = { some: { path: AsyncDataEnvelopeT<'OK'> } };

expect(
  useAsyncData<StateT, typeof SOME_PATH>(SOME_PATH, loader1),
).type.toEqual<UseAsyncDataResT<'OK'>>();

expect(() => {
  const x: UseAsyncDataResT<number> = useAsyncData<StateT, typeof SOME_PATH>(
    SOME_PATH,
    numLoader,
  );
}).type.toRaiseError(2322, 2345);
