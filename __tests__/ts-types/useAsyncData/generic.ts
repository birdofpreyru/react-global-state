import { expectAssignable, expectType } from 'tsd-lite';

import {
  type AsyncDataEnvelopeT,
  type AsyncDataLoaderT,
  type UseAsyncDataResT,
  useAsyncData,
} from 'src/index';

import { type TypeLock } from 'src/utils';

declare function loader1(): 'OK';
declare function loader2(): Promise<'OK'>;

expectAssignable<AsyncDataLoaderT<'OK'>>(loader1);
expectAssignable<AsyncDataLoaderT<'OK'>>(loader2);
expectAssignable<AsyncDataLoaderT<TypeLock<1, void, 'OK'>>>(loader1);

expectType<UseAsyncDataResT<'OK'>>(
  useAsyncData<1, 'OK'>('path', loader1),
);

const SOME_PATH = 'some.path';
type StateT = { some: { path: AsyncDataEnvelopeT<'OK'> } };

expectType<UseAsyncDataResT<'OK'>>(
  useAsyncData<StateT, typeof SOME_PATH>(SOME_PATH, loader1),
);
