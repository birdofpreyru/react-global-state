import { expect } from 'tstyche';

import { type ForceT, useGlobalState } from '../../../src';
import { type UseGlobalStateI } from '../../../src/useGlobalState';

// Enforced type overload.
const [t01] = useGlobalState<ForceT, string>('fake.path');
expect(t01).type.toBeString();

// Enforced type overload.
const [t02] = useGlobalState('fake.path');
expect(t02).type.toBeVoid();

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
expect(t04).type.toBeString();

//------------------------------------------------------------------------------
// With locked-in state type.

const useGS = useGlobalState as UseGlobalStateI<StateT>;

{ // Enforced type overload.
  const [t] = useGS<ForceT, string>('fake.path');
  expect(t).type.toBeString();
}

{ // Enforced type overload.
  const [t] = useGS('fake.path');
  expect(t).type.toBeVoid();
}

{ // State evaluation overload.
  const [t] = useGS('real.path');
  expect(t).type.toBeString();
}

{ // Entire state overload.
  const [t] = useGS();
  expect(t).type.toBe<StateT>();
}
