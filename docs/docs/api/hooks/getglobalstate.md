# getGlobalState()
```jsx
import { getGlobalState } from '@dr.pogodin/react-global-state';
```
Gets a [GlobalState] instance from the context.

:::caution
In most cases you should use [useGlobalState()] and other hooks to interact with
the global state, instead of accesing the [GlobalState] object directly.
:::

The TypeScript signature of this function is
```ts
function getGlobalState<StateT>(): GlobalState<StateT>;
```

## Generic Parameters
[StateT]: #state-type
- `StateT` <a id="state-type" /> &mdash; The global state type.

:::tip
Alternatively you may use [withGlobalStateType()] function to get
[getGlobalState()] with "locked-in" [StateT]:

```ts
import { withGlobalStateType } from '@dr.pogodin/react-global-state';

const { getGlobalState } = withGlobalStateType<StateT>();
```
:::

## Result
Returns [GlobalState]&lt;[StateT]&gt; instance.

[getGlobalState()]: #
[GlobalState]: /docs/api/classes/globalstate
[useGlobalState()]: /docs/api/hooks/useglobalstate
[withGlobalStateType()]: /docs/api/functions/with-global-state-type
