# useGlobalStateObject()
```tsx
import { useGlobalStateObject } from '@dr.pogodin/react-global-state';

function useGlobalStateObject<StateT>(): GlobalState<StateT>;
```
Gets a [GlobalState] instance from the context.

:::caution
In most cases you should use [useGlobalState()] and other hooks to interact with
the global state, instead of accesing the [GlobalState] object directly.
:::

:::tip
You may use [withGlobalStateType()] function to get
[useGlobalStateObject()] with "locked-in" [StateT]:

```ts
import { withGlobalStateType } from '@dr.pogodin/react-global-state';

const { useGlobalStateObject } = withGlobalStateType<StateT>();
```
:::

:::info
Technically, it only depends on [use()], thus it is not a regular hook bound by
[the rules of hooks], and it can be called within loops and conditional statements
(like `if`). However, as of now [eslint-plugin-react-hooks] does not make
distinction between [use()] and regular hooks (functions with names prefixed by
`use`), thus we prefer to name and treat it as a regular hook.
:::

<details>
<summary>Changelog</summary>

- Prior to [v0.24.0] it was named `getGlobalState()`; renamed to avoid
  [eslint-plugin-react-hooks] complains about its implementation.
- Prior to [v0.18.0] it was a true hook, based on the React's [useContext()],
  thus having to respect [the rules of hooks] to a letter; since [v0.18.0] it is
  based on [use()] instead, thus can be called within loops and conditional
  statements (like `if`).
</details>

## Generic Parameters
[StateT]: #state-type
- `StateT` <Link id="state-type" /> &mdash; The global state type.

## Result
Returns [GlobalState]&lt;[StateT]&gt; instance.

[GlobalState]: /docs/api/classes/globalstate
[eslint-plugin-react-hooks]: https://react.dev/reference/eslint-plugin-react-hooks
[the rules of hooks]: https://react.dev/reference/rules/rules-of-hooks
[use()]: https://react.dev/reference/react/use
[useContext()]: https://react.dev/reference/react/useContext
[useGlobalState()]: /docs/api/hooks/useglobalstate
[useGlobalStateObject()]: /docs/api/hooks/useGlobalStateObject
[v0.18.0]: https://github.com/birdofpreyru/react-global-state/releases/tag/v0.18.0
[v0.24.0]: https://github.com/birdofpreyru/react-global-state/releases/tag/v0.24.0
[withGlobalStateType()]: /docs/api/functions/with-global-state-type
