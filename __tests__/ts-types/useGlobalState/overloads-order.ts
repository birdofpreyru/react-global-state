import { expectType } from 'tsd-lite';

import { type ForceT, useGlobalState } from 'src';
import { type UseGlobalStateI } from 'src/useGlobalState';

// Enforced type overload.
const [t01] = useGlobalState<ForceT, string>('fake.path');
expectType<string>(t01);

// Enforced type overload.
const [t02] = useGlobalState('fake.path');
expectType<void>(t02);

type StateT = {
  real: {
    path: string;
  };
};

// Entire state overload.
const [t03] = useGlobalState<StateT>();
expectType<StateT>(t03);

// State evaluation overload.
const [t04] = useGlobalState<StateT, 'real.path'>('real.path');
expectType<string>(t04);

//------------------------------------------------------------------------------
// With locked-in state type.

const useGS = useGlobalState as UseGlobalStateI<StateT>;

{ // Enforced type overload.
  const [t] = useGS<ForceT, string>('fake.path');
  expectType<string>(t);
}

{ // Enforced type overload.
  const [t] = useGS('fake.path');
  expectType<void>(t);
}

{ // State evaluation overload.
  const [t] = useGS('real.path');
  expectType<string>(t);
}

{ // Entire state overload.
  const [t] = useGS();
  expectType<StateT>(t);
}
