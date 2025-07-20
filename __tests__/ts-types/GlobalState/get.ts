// TODO: Revise all ESLint rule overrides in this module.

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
// eslint-disable-next-line @typescript-eslint/no-confusing-void-expression, @typescript-eslint/no-invalid-void-type
expect(gs.get(p1)).type.toBe<void>();

declare const p2: string;
// eslint-disable-next-line @typescript-eslint/no-confusing-void-expression, @typescript-eslint/no-invalid-void-type
expect(gs.get(p2)).type.toBe<void>();

expect(() => {
  // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression, @typescript-eslint/no-unused-vars
  const x: string = gs.get(p2);
}).type.toRaiseError(2322);

expect(gs.get('some.path')).type.toBe<ValueT>();
// eslint-disable-next-line @typescript-eslint/no-confusing-void-expression, @typescript-eslint/no-invalid-void-type
expect(gs.get('invalid.path')).type.toBe<void>();

expect(() => gs.get('some.path', {
  initialValue: 'invalid',
})).type.toRaiseError(2769);

// eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
expect(() => gs.get('invalid.path', {
  initialValue: 'invalid',
})).type.toRaiseError(2769);

// eslint-disable-next-line @typescript-eslint/no-confusing-void-expression, @typescript-eslint/no-unnecessary-type-arguments, @typescript-eslint/no-invalid-void-type
expect(gs.get<ForceT, void>()).type.toBe<void>();
expect(gs.get<ForceT, 'OK'>()).type.toBe<'OK'>();

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
expect(() => gs.get<ForceT, void>('some.path', {
  initialValue: 'invalid',
})).type.toRaiseError(2322);
