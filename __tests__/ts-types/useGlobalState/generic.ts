import { expect, test } from 'tstyche';

import {
  type UseGlobalStateResT,
  useGlobalState,
} from '../../../src';

test('test', () => {
  expect(useGlobalState()).type.toBe<UseGlobalStateResT<unknown>>();
  expect(useGlobalState<'OK'>()).type.toBe<UseGlobalStateResT<'OK'>>();

  type StateT = { some: { path: ValueT } };
  type ValueT = 'value-a' | 'value-b';
  const SOME_PATH = 'some.path';

  expect(useGlobalState<StateT>()).type.toBe<UseGlobalStateResT<StateT>>();
  expect(useGlobalState(null)).type.toBe<UseGlobalStateResT<void>>();
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  expect(useGlobalState(null)[0]).type.toBe<void>();

  const [, setter] = useGlobalState(null);
  expect(setter).type.not.toBeCallableWith('invalid');
  expect(setter).type.not.toBeCallableWith(null);

  expect(
    useGlobalState<StateT, typeof SOME_PATH>(SOME_PATH),
  ).type.toBe<UseGlobalStateResT<ValueT>>();

  expect(useGlobalState).type.not.toBeCallableWith(SOME_PATH, 'XXX');
});
