import { expect } from 'tstyche';
import type { SetterT, UseGlobalStateResT } from '../../../src';

declare const x: UseGlobalStateResT<'X'>;

expect(x[0]).type.toBe<'X'>();
expect(x[1]).type.toBe<SetterT<'X'>>();
