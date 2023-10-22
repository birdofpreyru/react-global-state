import { expectAssignable } from 'tsd-lite';

import { type ForceT, useGlobalState } from '../../../src';

const [testValue] = useGlobalState<ForceT, string>('fake.path');

expectAssignable<string>(testValue);
