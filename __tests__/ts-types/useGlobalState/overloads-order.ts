// TODO: Move hook calls out of the top level, to avoid triggering ESLint.

import { expect } from 'tstyche';

import { type ForceT, useGlobalState } from '../../../src';
import type { UseGlobalStateI } from '../../../src/useGlobalState';

// Enforced type overload.
const [t01] = useGlobalState<ForceT, string>('fake.path');
expect(t01).type.toBe<string>();

// Enforced type overload.
const [t02] = useGlobalState('fake.path');
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
expect(t02).type.toBe<void>();

type StateT = {
  real: {
    path: string;
  };
};

// Entire state overload.
const [t03] = useGlobalState<StateT>();
expect(t03).type.toBe<StateT>();

// State evaluation overload.
const [t04] = useGlobalState<StateT, 'real.path'>('real.path');
expect(t04).type.toBe<string>();

// -----------------------------------------------------------------------------
// With locked-in state type.

const useGS = useGlobalState as UseGlobalStateI<StateT>;

{ // Enforced type overload.
  const [t] = useGS<ForceT, string>('fake.path');
  expect(t).type.toBe<string>();
}

{ // Enforced type overload.
  const [t] = useGS('fake.path');
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  expect(t).type.toBe<void>();
}

{ // State evaluation overload.
  const [t] = useGS('real.path');
  expect(t).type.toBe<string>();
}

{ // Entire state overload.
  const [t] = useGS();
  expect(t).type.toBe<StateT>();
}
