# ValueOrInitializerT
```ts
import { type ValueOrInitializerT } from '@dr.pogodin/react-global-state';
```
[ValueOrInitializerT] is the type for arguments that accept either a value to
use, or an initializer function that returns the value to use. When a function
is provided to such argument, it is only called when the value is actually needed,
thus allowing to avoid unnecessary evaluation of the value, if it is expensive,
and only needed, say, in the initial render of a component. In other words, it is
just a type alias for the standard _initializer function_ in React
(_see "[Avoiding recreating the initial state](https://react.dev/reference/react/useState#avoiding-recreating-the-initial-state)"_).

In TypeScript it is defined as
```ts
type ValueOrInitializerT<ValueT> = ValueT | (() => ValueT);
```
where
[ValueT]: #value-type
- `ValueT` <a id="value-type" /> &mdash; The type of value.

:::caution
To decide whether a value or an _initializer function_ was provided to
an argument of [ValueOrInitializerT] type, we use [isFunction()] check
from Lodash &mdash; if it returns _true_ we assume the argument value
is an _initializer function_.

As a side-effect, if such argument should have a function value (_i.e._ [ValueT]
is a function type), you must wrap such value inside an _initializer function_
to correctly set it, _e.g._

```ts
import { type ForceT, useGlobalState } from '@dr.pogodin/react-global-state';

// A sample function, we want to place, as the initial value,
// at the path "some.path" of the global state (although it is not
// the best idea in most cases to place functions or other
// non-serializeable objects into the state, especially during SSR).
function foo(arg: number): string {
  return arg.toString();
}

function SampleComponent() {
  // WRONG: At runtime the hook will assume `foo` is an initializer
  // function, thus if the initial value is to be used, it will call
  // foo(), which will crash with error in this example (and if would
  // not crash, its result would be used as the initial value).
  useGlobalState<ForceT, typeof foo>('some.path', foo);

  // CORRECT: At runtime the hook correctly assumes its argument,
  // `() => foo` is an initializer function, thus if the initial
  // value is to be used, it calls it, and uses its result (`foo`)
  // as the initial value.
  useGlobalState<ForceT, typeof foo>('some.path', () => foo);

  return null;
}
```
:::

[isFunction()]: https://lodash.com/docs/4.17.15#isFunction
[SetterT]: /docs/api/types/setter
[ValueOrInitializerT]: #
