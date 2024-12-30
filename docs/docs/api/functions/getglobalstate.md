# getGlobalState()
```jsx
import { getGlobalState } from '@dr.pogodin/react-global-state';
```
Gets a [GlobalState] instance from the context.

:::caution
In most cases you should use [useGlobalState()] and other hooks to interact with
the global state, instead of accesing the [GlobalState] object directly.
:::

:::info
Prior to the library **v0.18.0** this function was a hook, based on the React's
[useContext()], thus having to respect
[the rules of hooks](https://react.dev/reference/rules/rules-of-hooks).
Starting from **v0.18.0** it is based on [use()] instead, thus can be called
within loops and conditional statements like `if`.
:::

The TypeScript signature of this function is
```ts
function getGlobalState<StateT>(): GlobalState<StateT>;
```

## Generic Parameters
[StateT]: #state-type
- `StateT` <Link id="state-type" /> &mdash; The global state type.

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
[use()]: https://react.dev/reference/react/use
[useContext()]: https://react.dev/reference/react/useContext
[useGlobalState()]: /docs/api/hooks/useglobalstate
[withGlobalStateType()]: /docs/api/functions/with-global-state-type
