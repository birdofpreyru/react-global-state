import { expectError, expectType } from 'tsd-lite';

import { type ValueAtPathT } from 'src/utils';

type StateT1 = {
  some: {
    array: { key: string }[];
    path: 'value-a' | 'value-b';
  };
};

declare const x1: ValueAtPathT<StateT1, 'some.path', never>;
expectType<'value-a' | 'value-b'>(x1);

declare const x2: ValueAtPathT<StateT1, 'some.path', undefined>;
expectType<'value-a' | 'value-b'>(x2);

declare const x3: ValueAtPathT<StateT1, 'some.array[3].key', never>;
expectType<string>(x3);

declare const x4: ValueAtPathT<StateT1, 'invalid.path', never>;
expectType<never>(x4);

declare const x5: ValueAtPathT<StateT1, 'invalid.path', undefined>;
expectType<undefined>(x5);

declare const x6: ValueAtPathT<StateT1, 'invalid.path', void>;
expectType<void>(x6);

expectError(() => {
  const x: ValueAtPathT<StateT1, 'some.path', 'XXX'> = 'value-a';
});

declare const x7: ValueAtPathT<StateT1, null, void>;
expectType<StateT1>(x7);

declare const x8: ValueAtPathT<StateT1, undefined, void>;
expectType<StateT1>(x8);

declare const x9: ValueAtPathT<StateT1, null | undefined, void>;
expectType<StateT1>(x9);

expectError(() => {
  const x: ValueAtPathT<StateT1, null | string, never> = 'XXX';
});

expectError(() => {
  const x: ValueAtPathT<StateT1, null | string, never> = {
    some: {
      array: [],
      path: 'value-a',
    },
  };
});

declare const x10: ValueAtPathT<string | StateT1, 'some.path', never>;
expectType<never>(x10);

// When the state type is unknown.

declare const y1: ValueAtPathT<unknown, 'some.path', never>;
expectType<never>(y1);

declare const y2: ValueAtPathT<unknown, null, never>;
expectType<never>(y2);
