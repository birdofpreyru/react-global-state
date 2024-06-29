import { expect } from 'tstyche';

import GlobalState from '../../../src/GlobalState';
import type { ForceT } from '../../../src/utils';

type ValueT = 'value-a' | 'value-b';

type StateT1 = {
  some: {
    path: ValueT;
  };
};

const gs = new GlobalState<StateT1>({ some: { path: 'value-a' } });

expect(gs.getEntireState()).type.toBe<StateT1>();
expect(() => gs.setEntireState('invalid')).type.toRaiseError(2345);
expect(gs.get()).type.toBe<StateT1>();
expect(gs.get(null)).type.toBe<StateT1>();
expect(gs.get(undefined)).type.toBe<StateT1>();

declare const p1: null | string;
expect(gs.get(p1)).type.toBeVoid();

declare const p2: string;
expect(gs.get(p2)).type.toBeVoid();

expect(() => {
  const x: string = gs.get(p2);
}).type.toRaiseError(2322);

expect(gs.get('some.path')).type.toBe<ValueT>();
expect(gs.get('invalid.path')).type.toBeVoid();

expect(() => gs.get('some.path', {
  initialValue: 'invalid',
})).type.toRaiseError(2769);

expect(() => gs.get('invalid.path', {
  initialValue: 'invalid',
})).type.toRaiseError(2769);

expect(gs.get<ForceT, void>()).type.toBeVoid();
expect(gs.get<ForceT, 'OK'>()).type.toBe<'OK'>();

expect(() => gs.get<ForceT, void>('some.path', {
  initialValue: 'invalid',
})).type.toRaiseError(2322);
