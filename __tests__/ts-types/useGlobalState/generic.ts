import { expect } from 'tstyche';

import {
  type UseGlobalStateResT,
  useGlobalState,
} from '../../../src';

expect(useGlobalState()).type.toBe<UseGlobalStateResT<unknown>>();
expect(useGlobalState<'OK'>()).type.toBe<UseGlobalStateResT<'OK'>>();

type ValueT = 'value-a' | 'value-b';
type StateT = { some: { path: ValueT } };
const SOME_PATH = 'some.path';

expect(useGlobalState<StateT>()).type.toBe<UseGlobalStateResT<StateT>>();
expect(useGlobalState(null)).type.toBe<UseGlobalStateResT<void>>();
expect(useGlobalState(null)[0]).type.toBeVoid();

expect(() => {
  const setter = useGlobalState(null)[1];
  setter('invalid');
}).type.toRaiseError(2345);

expect(() => {
  const setter = useGlobalState(null)[1];
  setter(null);
}).type.toRaiseError(2345);

expect(
  useGlobalState<StateT, typeof SOME_PATH>(SOME_PATH),
).type.toBe<UseGlobalStateResT<ValueT>>();

expect(() => {
  const x: string = useGlobalState(SOME_PATH, 'XXX');
}).type.toRaiseError(2322, 2769);
