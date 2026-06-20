# useSsrContext()
```tsx
import { useSsrContext } from '@dr.pogodin/react-global-state';

function useSsrContext<StateT>(
  throwWithoutSsrContext = true,
): SsrContext<StateT> | undefined;
```
Gets [SsrContext] object (the server-side rendering context, which is used to
pass global-state-related data between rendering iterations).

:::tip
You may use [withGlobalStateType()] function to get [useSsrContext()] variant
with a "locked-in" [StateT]:

```ts
import { withGlobalStateType } from '@dr.pogodin/react-global-state';

const { useSsrContext } = withGlobalStateType<StateT>();
```
:::

:::info
Technically, it only depends on [use()], thus it is not a regular hook bound
by [the rules of hooks], and it can be called within loops and conditional
statements (like `if`). However, as of now [eslint-plugin-react-hooks] does
not make distinction between [use()] and regular hooks (functions with names
prefixed by `use`), thus we prefer to name and treat it as a regular hook.
:::

<details>
<summary>Changelog</summary>

- Prior to [v0.24.0] it was named `getSsrContext()`; renamed to avoid
  [eslint-plugin-react-hooks] complains about its implementation.
- Prior to [v0.18.0] it was a true hook, based on the React's [useContext()],
  thus having to respect [the rules of hooks] to a letter; since [v0.18.0] it is
  based on [use()] instead, thus can be called within loops and conditional
  statements (like `if`).
</details>

## Generic Parameters
[StateT]: #state-type
- `StateT` <Link id="state-type" /> &mdash; The type of global state content.

## Arguments
- `throwWithoutSsrContext` &mdash; **boolean** &mdash; If _true_ (default) this
  hook will throw if no SSR context is attached to the global state. Pass in
  _false_ to not throw in such case. In either case the hook will throw if
  no parent [GlobalStateProvider] (hence no global state) is found.

## Result
Returns [SsrContext]&lt;[StateT]&gt object, or _undefined_
(if `throwWithoutSsrContext` set _false_, and there is no [SsrContext]).

:::caution
This function throws in these cases:
- If current component has no parent [GlobalStateProvider] in the rendered
  React tree.
- If `throwWithoutSsrContext` is _true_, and there is no SSR context attached
  to the global state provided by [GlobalStateProvider].
:::

[useSsrContext()]: /docs/api/hooks/useSsrContext
[GlobalStateProvider]: /docs/api/components/globalstateprovider
[eslint-plugin-react-hooks]: https://react.dev/reference/eslint-plugin-react-hooks
[SsrContext]: /docs/api/classes/ssrcontext
[the rules of hooks]: https://react.dev/reference/rules/rules-of-hooks
[use()]: https://react.dev/reference/react/use
[useContext()]: https://react.dev/reference/react/useContext
[v0.18.0]: https://github.com/birdofpreyru/react-global-state/releases/tag/v0.18.0
[v0.24.0]: https://github.com/birdofpreyru/react-global-state/releases/tag/v0.24.0
[withGlobalStateType()]: /docs/api/functions/with-global-state-type
