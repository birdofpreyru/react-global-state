# SetterT
```ts
import { type SetterT } from '@dr.pogodin/react-utils`;
```
[SetterT] is the type of setter returned by the [useGlobalState()] hook.

It is defined as a generic type:
```ts
type SetterT<ValueT> = React.Dispatch<React.SetStateAction<ValueT>>;
```
and it is essentially an alias for the type of standard setter function returned
by React's [useState()] hook (see `setState` in the linked React documentation).

## Generic Parameters
[ValueT]: #value-type
- `ValueT` <a id="value-type" /> &mdash; The type of value being set by the setter.

## Arguments
The setter accepts a single argument which should be either the new value 
(of type [ValueT]) to set, or a value update function, which given the previous
value should return the new value to set.

[SetterT]: #
[useGlobalState()]: /docs/api/hooks/useglobalstate
[useState()]: https://react.dev/reference/react/useState
