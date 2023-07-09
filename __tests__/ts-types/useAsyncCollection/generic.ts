import { expectAssignable, expectType } from 'tsd-lite';

import {
  type AsyncDataEnvelopeT,
  type AsyncCollectionLoaderT,
  type UseAsyncDataResT,
  useAsyncCollection,
} from 'src/index';

declare function loader1(): 'OK';
declare function loader2(): Promise<'OK'>;

expectAssignable<AsyncCollectionLoaderT<'OK'>>(loader1);
expectAssignable<AsyncCollectionLoaderT<'OK'>>(loader2);

type StateT = {
  some: {
    path: {
      [id: string]: AsyncDataEnvelopeT<'OK'>;
    };
  };
};

const SOME_ID = 'someId';
const SOME_PATH = 'some.path';

expectType<UseAsyncDataResT<'OK'>>(
  useAsyncCollection<StateT, typeof SOME_PATH, typeof SOME_ID>(
    SOME_ID,
    SOME_PATH,
    loader1,
  ),
);
