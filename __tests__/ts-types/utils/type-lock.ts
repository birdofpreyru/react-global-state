import { expect } from 'tstyche';

import { type ForceT } from '../../../src';
import { type TypeLock, type LockT } from '../../../src/utils';

declare const t01: TypeLock<LockT, never, 'x'>;
expect(t01).type.toBeNever();

declare const t02: TypeLock<LockT, void, 'x'>;
expect(t02).type.toBeVoid();

declare const t03: TypeLock<ForceT, never, 'x'>;
expect(t03).type.toEqual<'x'>();
