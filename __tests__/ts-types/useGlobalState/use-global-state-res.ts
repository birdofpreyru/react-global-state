import { expect } from 'tstyche';
import { type SetterT, type UseGlobalStateResT } from '../../../src';

declare const x: UseGlobalStateResT<'X'>;

expect(x[0]).type.toEqual<'X'>();
expect(x[1]).type.toEqual<SetterT<'X'>>();
