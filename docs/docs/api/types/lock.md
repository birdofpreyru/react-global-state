# LockT
[LockT]: /docs/api/types/lock
```ts
import type { LockT } from '@dr.pogodin/react-global-state';
```

[LockT] is a special type for &laquo;locking&raquo; overloads of hooks and
functions that allow to enforce arbitrary value types.

For example, [useGlobalState()] has such overload :

```ts
function useGlobalState<
  Forced extends ForceT | LockT = LockT,
  ValueT = void,
>(
  path: null | string | undefined,
  initialValue?: ValueOrInitializerT<TypeLock<Forced, never, ValueT>>,
): UseGlobalStateResT<TypeLock<Forced, void, ValueT>>;
```

You will probably never use it, unlike its [ForceT] counterpart.

[ForceT]: /docs/api/types/force
[useGlobalState()]: /docs/api/hooks/useglobalstate
