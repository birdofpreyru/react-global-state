import { expectType } from 'tsd-lite';

import { type ForceT } from 'src';
import { type TypeLock, type LockT } from 'src/utils';

declare const t01: TypeLock<LockT, never, 'x'>;
expectType<never>(t01);

declare const t02: TypeLock<LockT, void, 'x'>;
expectType<void>(t02);

declare const t03: TypeLock<ForceT, never, 'x'>;
expectType<'x'>(t03);
