import { expectError, expectType } from 'tsd-lite';

import GlobalState from 'src/GlobalState';
import { type ForceT } from 'src/utils';

type ValueT = 'value-a' | 'value-b';
type StateT = { some: { path: ValueT } };

const gs = new GlobalState<StateT>({ some: { path: 'value-a' } });

expectType<StateT>(gs.set(null, { some: { path: 'value-a' } }));
expectError(() => gs.set(null, 'invalid'));
expectType<ValueT>(gs.set('some.path', 'value-b'));
expectError(() => gs.set('some.path', 'invalid'));
expectType<number>(gs.set<ForceT, number>('some.path', 10));
