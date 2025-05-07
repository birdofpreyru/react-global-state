import { expect } from 'tstyche';

import type { ValueAtPathT } from '../../../src/utils';

type StateT1 = {
  some: {
    array: Array<{ key: string }>;
    path: 'value-a' | 'value-b';
  };
};

declare const x1: ValueAtPathT<StateT1, 'some.path', never>;
expect(x1).type.toBe<'value-a' | 'value-b'>();

declare const x2: ValueAtPathT<StateT1, 'some.path', undefined>;
expect(x2).type.toBe<'value-a' | 'value-b'>();

declare const x3: ValueAtPathT<StateT1, 'some.array[3].key', never>;
expect(x3).type.toBeString();

declare const x4: ValueAtPathT<StateT1, 'invalid.path', never>;
expect(x4).type.toBeNever();

declare const x5: ValueAtPathT<StateT1, 'invalid.path', undefined>;
expect(x5).type.toBeUndefined();

declare const x6: ValueAtPathT<StateT1, 'invalid.path', void>;
expect(x6).type.toBeVoid();

expect(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const x: ValueAtPathT<StateT1, 'some.path', 'XXX'> = 'value-a';
}).type.toRaiseError(2344);

declare const x7: ValueAtPathT<StateT1, null, void>;
expect(x7).type.toBe<StateT1>();

declare const x8: ValueAtPathT<StateT1, undefined, void>;
expect(x8).type.toBe<StateT1>();

declare const x9: ValueAtPathT<StateT1, null | undefined, void>;
expect(x9).type.toBe<StateT1>();

expect(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const x: ValueAtPathT<StateT1, null | string, never> = 'XXX';
}).type.toRaiseError(2322);

expect(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const x: ValueAtPathT<StateT1, null | string, never> = {
    some: {
      array: [],
      path: 'value-a',
    },
  };
}).type.toRaiseError(2322);

declare const x10: ValueAtPathT<string | StateT1, 'some.path', never>;
expect(x10).type.toBe<'value-a' | 'value-b' | undefined>();

// When the state type is unknown.

declare const y1: ValueAtPathT<unknown, 'some.path', never>;
expect(y1).type.toBeNever();

declare const y2: ValueAtPathT<unknown, null, never>;
expect(y2).type.toBeNever();
