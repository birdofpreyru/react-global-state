import { expectAssignable } from 'tsd-lite';

import { useGlobalState } from '../../../src';

const [testValue] = useGlobalState<1, string>('fake.path');

expectAssignable<String>(testValue);
