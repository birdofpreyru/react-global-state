# getSsrContext()
```jsx
import { getSsrContext } from '@dr.pogodin/react-global-state';
```
Gets [SsrContext] object (the server-side rendering context, which is used to
pass global-state-related data between rendering iterations).

:::info
Prior to the library **v0.18.0** this function was a hook, based on the React's
[useContext()], thus having to respect
[the rules of hooks](https://react.dev/reference/rules/rules-of-hooks).
Starting from **v0.18.0** it is based on [use()] instead, thus can be called
within loops and conditional statements like `if`.
:::

The TypeScript signature of this function is:
```ts
function getSsrContext<StateT>(
  throwWithoutSsrContext = true,
): SsrContext<StateT> | undefined;
```

:::tip
Alternatively you may use [withGlobalStateType()] function to get
[getSsrContext()] variant with a "locked-in" [StateT]:

```ts
import { withGlobalStateType } from '@dr.pogodin/react-global-state';

const { getSsrContext } = withGlobalStateType<StateT>();
```
:::

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

[getSsrContext()]: #
[GlobalStateProvider]: /docs/api/components/globalstateprovider
[SsrContext]: /docs/api/classes/ssrcontext
[use()]: https://react.dev/reference/react/use
[useContext()]: https://react.dev/reference/react/useContext
[withGlobalStateType()]: /docs/api/functions/with-global-state-type
