# getSsrContext()
```jsx
import { getSsrContext } from '@dr.pogodin/react-global-state';

getSsrContext(throwWithoutSsrContext = true): SsrContext;
```
Gets [SsrContext] object (the server-side rendering context, which is used to
pass global-state-related data between rendering iterations).

## Arguments
- `throwWithoutSsrContext` - **boolean** - If **true** (default) this hook
  will throw if no SSR context is attached to the global state. Pass in **false**
  to not throw in such case. In either case the hook will throw if no parent
  [GlobalStateProvider] (hence no global state) is found.

## Result
Returns [SsrContext] object.

:::caution
This hook throws in these cases:
- If current component has no parent [GlobalStateProvider] in the rendered
  React tree.
- If `throwWithoutSsrContext` is **true**, and there is no SSR context attached
  to the global state provided by [GlobalStateProvider].
:::

[GlobalStateProvider]: /docs/api/components/globalstateprovider
[SsrContext]: /docs/api/objects/ssrcontext
