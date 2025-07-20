import { expect } from 'tstyche';

import type { ForceT } from '../../../src';
import type { TypeLock, LockT } from '../../../src/utils';

declare const t01: TypeLock<LockT, never, 'x'>;
expect(t01).type.toBe<never>();

declare const t02: TypeLock<LockT, void, 'x'>;
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
expect(t02).type.toBe<void>();

declare const t03: TypeLock<ForceT, never, 'x'>;
expect(t03).type.toBe<'x'>();
