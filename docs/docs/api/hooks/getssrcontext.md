# getSsrContext()
```jsx
import { getSsrContext } from '@dr.pogodin/react-global-state';
```
Gets [SsrContext] object (the server-side rendering context, which is used to
pass global-state-related data between rendering iterations).

The TypeScript signature of this hook is:
```ts
function getSsrContext<StateT>(
  throwWithoutSsrContext = true,
): SsrContext<StateT> | undefined;
```

:::tip
Alternatively you may use [API] interface to get
[getSsrContext()] variant with a "locked-in" [StateT]:

```ts
import RGS, { type API } from '@dr.pogodin/react-global-state';

const { getSsrContext } = RGS as API<StateT>;
```
:::

## Generic Parameters
[StateT]: #state-type
- `StateT` <a id="state-type" /> &mdash; The type of global state content.

## Arguments
- `throwWithoutSsrContext` &mdash; **boolean** &mdash; If _true_ (default) this
  hook will throw if no SSR context is attached to the global state. Pass in
  _false_ to not throw in such case. In either case the hook will throw if
  no parent [GlobalStateProvider] (hence no global state) is found.

## Result
Returns [SsrContext]&lt;[StateT]&gt object, or _undefined_
(if `throwWithoutSsrContext` set _false_, and there is no [SsrContext]).

:::caution
This hook throws in these cases:
- If current component has no parent [GlobalStateProvider] in the rendered
  React tree.
- If `throwWithoutSsrContext` is _true_, and there is no SSR context attached
  to the global state provided by [GlobalStateProvider].
:::

[API]: /docs/api/types/api
[getSsrContext()]: #
[GlobalStateProvider]: /docs/api/components/globalstateprovider
[SsrContext]: /docs/api/classes/ssrcontext
