# getGlobalState()
```jsx
import { getGlobalState } from '@dr.pogodin/react-global-state';

getGlobalState(): GlobalState;
```

Gets [GlobalState] instance from the context.

:::caution
In most cases you should use [useGlobalState()] and other hooks to interact with
the global state, instead of accesing the [GlobalState] object directly.
:::

## Arguments
None.

## Result
Returns [GlobalState] instance.

[GlobalState]: /docs/api/objects/globalstate
[useGlobalState()]: /docs/api/hooks/useglobalstate
