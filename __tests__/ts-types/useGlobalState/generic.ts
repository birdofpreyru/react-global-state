// TODO: Move all hook calls out of the top level!

import { expect } from 'tstyche';

import {
  type UseGlobalStateResT,
  useGlobalState,
} from '../../../src';

// eslint-disable-next-line react-hooks/rules-of-hooks
expect(useGlobalState()).type.toBe<UseGlobalStateResT<unknown>>();
// eslint-disable-next-line react-hooks/rules-of-hooks
expect(useGlobalState<'OK'>()).type.toBe<UseGlobalStateResT<'OK'>>();

type ValueT = 'value-a' | 'value-b';
type StateT = { some: { path: ValueT } };
const SOME_PATH = 'some.path';

// eslint-disable-next-line react-hooks/rules-of-hooks
expect(useGlobalState<StateT>()).type.toBe<UseGlobalStateResT<StateT>>();
// eslint-disable-next-line react-hooks/rules-of-hooks
expect(useGlobalState(null)).type.toBe<UseGlobalStateResT<void>>();
// eslint-disable-next-line react-hooks/rules-of-hooks
expect(useGlobalState(null)[0]).type.toBeVoid();

expect(() => {
  const [, setter] = useGlobalState(null);
  setter('invalid');
}).type.toRaiseError(2345);

expect(() => {
  const [, setter] = useGlobalState(null);
  setter(null);
}).type.toRaiseError(2345);

expect(
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useGlobalState<StateT, typeof SOME_PATH>(SOME_PATH),
).type.toBe<UseGlobalStateResT<ValueT>>();

expect(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const x: string = useGlobalState(SOME_PATH, 'XXX');
}).type.toRaiseError(2322, 2769);
