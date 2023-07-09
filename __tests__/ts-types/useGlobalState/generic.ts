import { expectError, expectType } from 'tsd-lite';

import {
  type UseGlobalStateResT,
  useGlobalState,
} from 'src/index';

expectType<UseGlobalStateResT<unknown>>(useGlobalState());
expectType<UseGlobalStateResT<'OK'>>(useGlobalState<'OK'>());

type ValueT = 'value-a' | 'value-b';
type StateT = { some: { path: ValueT } };
const SOME_PATH = 'some.path';

expectType<UseGlobalStateResT<StateT>>(useGlobalState<StateT>());
expectType<UseGlobalStateResT<void>>(useGlobalState(null));
expectType<void>(useGlobalState(null)[0]);

expectError(() => {
  const setter = useGlobalState(null)[1];
  setter('invalid');
});

expectError(() => {
  const setter = useGlobalState(null)[1];
  setter(null);
});

expectType<UseGlobalStateResT<ValueT>>(
  useGlobalState<StateT, typeof SOME_PATH>(SOME_PATH),
);

expectError(() => {
  const x: string = useGlobalState(SOME_PATH, 'XXX');
});
