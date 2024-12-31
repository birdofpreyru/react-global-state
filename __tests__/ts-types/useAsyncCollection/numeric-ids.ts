import { describe, expect, test } from 'tstyche';

import {
  type AsyncDataEnvelopeT,
  type UseAsyncCollectionResT,
  type UseAsyncDataResT,
  useAsyncCollection,
  withGlobalStateType,
} from '../../../src';

import type { DataInEnvelopeAtPathT } from '../../../src/useAsyncData';
import type { ValueAtPathT } from '../../../src/utils';

type IdT = 1 | 2 | 3 | 4 | 5;

type StateT = {
  collection: { [id in IdT]?: AsyncDataEnvelopeT<'OK'> };
};

describe('useAsyncCollection() supports numeric IDs', () => {
  test('pre-conditions', () => {
    type T = DataInEnvelopeAtPathT<StateT, 'collection.1'>;

    expect<ValueAtPathT<StateT, 'collection.1.data', void>>()
      .type.toBe<'OK' | null | undefined>();
    expect<ValueAtPathT<StateT, `collection.${IdT}.data`, void>>()
      .type.toBe<'OK' | null | undefined>();
    expect<DataInEnvelopeAtPathT<StateT, 'collection.1'>>()
      .type.toBe<'OK'>();
    expect<DataInEnvelopeAtPathT<StateT, `collection.${IdT}`>>()
      .type.toBe<'OK'>();
  });

  test('base hook', () => {
    const resA = useAsyncCollection<StateT, 'collection', 1>(
      1,
      'collection',
      (id: IdT) => 'OK',
    );
    expect<typeof resA>().type.toBe<UseAsyncDataResT<'OK'>>();

    const resB = useAsyncCollection<StateT, 'collection', 1>(
      [1],
      'collection',
      (id: IdT) => 'OK',
    );
    expect<typeof resB>().type.toBe<UseAsyncCollectionResT<'OK', 1>>();

    const idOrIds = 1 as IdT | IdT[];
    const resC = useAsyncCollection<StateT, 'collection', IdT>(
      idOrIds,
      'collection',
      (id: IdT) => 'OK',
    );
    type ResC = UseAsyncDataResT<'OK'> | UseAsyncCollectionResT<'OK', IdT>;
    expect<typeof resC>().type.toBe<ResC>();
  });

  test('hook with the state locked by withGlobalStateType', () => {
    const X = withGlobalStateType<StateT>();
    const resA = X.useAsyncCollection(1, 'collection', (id: IdT) => 'OK' as 'OK');
    expect<typeof resA>().type.toBe<UseAsyncDataResT<'OK'>>();

    const resB = X.useAsyncCollection([1], 'collection', (id: IdT) => 'OK' as 'OK');
    expect<typeof resB>().type.toBe<UseAsyncCollectionResT<'OK', 1>>();

    const idOrIds = 1 as IdT | IdT[];
    const resC = X.useAsyncCollection(
      idOrIds,
      'collection',
      (id: IdT) => 'OK' as 'OK',
    );
    type ResC = UseAsyncDataResT<'OK'> | UseAsyncCollectionResT<'OK', IdT>;
    expect<typeof resC>().type.toBe<ResC>();
  });
});
