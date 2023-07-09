import { expectError, expectType } from 'tsd-lite';
import { type TypeLock } from 'src/utils';

function foo1<
  Unlocked extends 0 | 1 = 0,
>(arg: TypeLock<Unlocked, never, string>) {
  return arg;
}

expectError(foo1('string'));
expectType<string>(foo1<1>('string'));

function foo2<
  Unlocked extends 0 | 1 = 0,
>(): TypeLock<Unlocked, void, string> {
  return 'OK' as TypeLock<Unlocked, void, string>;
}

expectError(() => {
  const x: string = foo2();
});

expectType<void>(foo2());
expectType<string>(foo2<1>());
