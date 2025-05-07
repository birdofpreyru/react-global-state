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

expect<AsyncDataLoaderT<'OK'>>().type.toBeAssignableWith(loader1);
expect<AsyncDataLoaderT<'OK'>>().type.toBeAssignableWith(loader2);

expect(
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useAsyncData<ForceT, 'OK'>('path', loader1),
).type.toBe<UseAsyncDataResT<'OK'>>();

const SOME_PATH = 'some.path';
type StateT = { some: { path: AsyncDataEnvelopeT<'OK'> } };

expect(
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useAsyncData<StateT, typeof SOME_PATH>(SOME_PATH, loader1),
).type.toBe<UseAsyncDataResT<'OK'>>();

expect(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const x: UseAsyncDataResT<number> = useAsyncData<StateT, typeof SOME_PATH>(
    SOME_PATH,
    numLoader,
  );
}).type.toRaiseError(2322, 2345);
