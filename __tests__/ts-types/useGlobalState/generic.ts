// TODO: Move all hook calls out of the top level!

import { expect } from 'tstyche';

import {
  type UseGlobalStateResT,
  useGlobalState,
} from '../../../src';

expect(useGlobalState()).type.toBe<UseGlobalStateResT<unknown>>();
expect(useGlobalState<'OK'>()).type.toBe<UseGlobalStateResT<'OK'>>();

type StateT = { some: { path: ValueT } };
type ValueT = 'value-a' | 'value-b';
const SOME_PATH = 'some.path';

expect(useGlobalState<StateT>()).type.toBe<UseGlobalStateResT<StateT>>();
expect(useGlobalState(null)).type.toBe<UseGlobalStateResT<void>>();
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
expect(useGlobalState(null)[0]).type.toBe<void>();

expect(() => {
  const [, setter] = useGlobalState(null);
  setter('invalid');
}).type.toRaiseError(2345);

expect(() => {
  const [, setter] = useGlobalState(null);
  setter(null);
}).type.toRaiseError(2345);

expect(
  useGlobalState<StateT, typeof SOME_PATH>(SOME_PATH),
).type.toBe<UseGlobalStateResT<ValueT>>();

expect(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const x: string = useGlobalState(SOME_PATH, 'XXX');
}).type.toRaiseError(2322, 2769);
