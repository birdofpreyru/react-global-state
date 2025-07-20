import { expect } from 'tstyche';

import GlobalState from '../../../src/GlobalState';
import type { ForceT } from '../../../src/utils';

type ValueT = 'value-a' | 'value-b';
type StateT = { some: { path: ValueT } };

const gs = new GlobalState<StateT>({ some: { path: 'value-a' } });

expect(gs.set(null, { some: { path: 'value-a' } })).type.toBe<StateT>();

expect(() => gs.set(null, 'invalid')).type.toRaiseError(2769);

expect(gs.set('some.path', 'value-b')).type.toBe<ValueT>();

expect(() => gs.set('some.path', 'invalid')).type.toRaiseError(2769);

expect(gs.set<ForceT, number>('some.path', 10)).type.toBe<number>();
