import { expect } from 'tstyche';

import {
  type AsyncDataEnvelopeT,
  type AsyncCollectionLoaderT,
  type UseAsyncDataResT,
  useAsyncCollection,
} from '../../../src';

declare function loader1(): 'OK';
declare function loader2(): Promise<'OK'>;

expect<AsyncCollectionLoaderT<'OK'>>().type.toBeAssignableWith(loader1);
expect<AsyncCollectionLoaderT<'OK'>>().type.toBeAssignableWith(loader2);

type StateT = {
  some: {
    path: Record<string, AsyncDataEnvelopeT<'OK'>>;
  };
};

const SOME_ID = 'someId';
const SOME_PATH = 'some.path';

expect(
  // eslint-disable-next-line
  useAsyncCollection<StateT, typeof SOME_PATH, typeof SOME_ID>(
    SOME_ID,
    SOME_PATH,
    loader1,
  ),
).type.toBe<UseAsyncDataResT<'OK'>>();
