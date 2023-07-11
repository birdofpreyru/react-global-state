import { expectError, expectType } from 'tsd-lite';

import GlobalState from 'src/GlobalState';

type ValueT = 'value-a' | 'value-b';

type StateT1 = {
  some: {
    path: ValueT;
  };
};

const gs = new GlobalState<StateT1>({ some: { path: 'value-a' } });

expectType<StateT1>(gs.getEntireState());
expectError(() => gs.setEntireState('invalid'));
expectType<StateT1>(gs.get());
expectType<StateT1>(gs.get(null));
expectType<StateT1>(gs.get(undefined));

declare const p1: null | string;
expectType<void>(gs.get(p1));

declare const p2: string;
expectType<void>(gs.get(p2));

expectError(() => {
  const x: string = gs.get(p2);
});

expectType<ValueT>(gs.get('some.path'));
expectType<void>(gs.get('invalid.path'));
expectError(() => gs.get('some.path', { initialValue: 'invalid' }));
expectError(() => gs.get('invalid.path', { initialValue: 'invalid' }));

expectType<void>(gs.get<1>());
expectType<'OK'>(gs.get<1, 'OK'>());

expectError(() => gs.get<1>('some.path', { initialValue: 'invalid' }));
