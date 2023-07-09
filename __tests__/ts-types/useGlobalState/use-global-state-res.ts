import { expectNotAssignable, expectType } from 'tsd-lite';
import { type SetterT, type UseGlobalStateResT } from 'src/index';

declare const x: UseGlobalStateResT<'X'>;

expectType<'X'>(x[0]);
expectType<SetterT<'X'>>(x[1]);
