# ForceT
[ForceT]: /docs/api/types/force
```ts
import { type ForceT } from '@dr.pogodin/react-global-state';
```

[ForceT] is a special type for &laquo;unlocking&raquo; overloads of hooks and
functions that allow to enforce arbitrary value types.

For example, [useGlobalState()] has such overload (here we omit the exact
details behind **ValueT** definition):

```ts
function useGlobalState<
  Forced extends ForceT | false = false,
  ValueT = void,
>(
  path: null | string | undefined,
  initialValue?: ValueOrInitializerT<ValueT>,
): UseGlobalStateResT<ValueT>;
```

Which can be used with [ForceT] to enforce arbitrary type of **ValueT**:

```ts
import { type ForceT } from '@dr.pogodin/react-global-state';

const [aString, aStringSetter] = useGlobalState<ForceT, string>('some.path');
```

[useGlobalState()]: /docs/api/hooks/useglobalstate
