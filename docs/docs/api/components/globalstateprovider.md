# GlobalStateProvider
```jsx
import { GlobalStateProvider } from '@dr.pogodin/react-global-state';
```
Provides [GlobalState] to its children tree.

## Properties
- `children` - **React.Node** - Component children, if any, are rendered
  in-place of [GlobalStateProvider] and provided with [GlobalState] instance.
- `initialState` - **any** - Optional. The initial global state content.
- `ssrContext` - [SsrContext] - Optional. SSR (server-side rendering) context.
- `stateProxy` - **boolean** | [GlobalState] - Enables "proxy" mode, intended
  for code-splitting and SSR implementation:
  - If **true** this [GlobalStateProvider] will fetch and reuse
    the [GlobalState] instance from the parent provider,
    instead of creating a new [GlobalState].
  - If [GlobalState] instance, it will provide it to the children, instead of
    creating a new [GlobalState].
  - Otherwise it will act as normal: create a new [GlobalState] instance and
    provide it to its children.

[GlobalState]: /docs/api/objects/globalstate
[GlobalStateProvider]: #
[SsrContext]: /docs/api/objects/ssrcontext
