import { expectAssignable, expectType, expectError } from 'tsd-lite';

import {
  type AsyncDataEnvelopeT,
  type AsyncDataLoaderT,
  type ForceT,
  type UseAsyncDataResT,
  useAsyncData,
} from 'src';

declare function loader1(): 'OK';
declare function loader2(): Promise<'OK'>;
declare function numLoader(): number;

expectAssignable<AsyncDataLoaderT<'OK'>>(loader1);
expectAssignable<AsyncDataLoaderT<'OK'>>(loader2);

expectType<UseAsyncDataResT<'OK'>>(
  useAsyncData<ForceT, 'OK'>('path', loader1),
);

const SOME_PATH = 'some.path';
type StateT = { some: { path: AsyncDataEnvelopeT<'OK'> } };

expectType<UseAsyncDataResT<'OK'>>(
  useAsyncData<StateT, typeof SOME_PATH>(SOME_PATH, loader1),
);

expectError(() => {
  const x: UseAsyncDataResT<number> = useAsyncData<StateT, typeof SOME_PATH>(
    SOME_PATH,
    numLoader,
  );
});
