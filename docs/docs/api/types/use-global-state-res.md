# UseGlobalStateResT
```ts
import { type UseGlobalStateResT } from '@dr.pogodin/react-global-state';
```
[UseGlobalStateResT] is the type of result returned by the [useGlobalState()]
hook.

It is defined as the generic type:
```ts
type UseGlobalStateResT<ValueT> = [ValueT, SetterT<ValueT>];
```
a tuple of a value, and value setter function, and essentially it is the alias
for the type of result returned by the standard React's [useState()] hook (and
[SetterT] is the alias for the standard React's state setter function).

## Generic Parameters
- `ValueT` &mdash; The type of a value from the state.

[SetterT]: /docs/api/types/setter
[useGlobalState()]: /docs/api/hooks/useglobalstate
[UseGlobalStateResT]: #
[useState()]: https://react.dev/reference/react/useState
