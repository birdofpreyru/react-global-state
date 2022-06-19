# GlobalState

A [GlobalState] object is an instance of the **GlobalState** class, which
holds and manages the global state content. Users are not supposed to create
new [GlobalState] instances explicitly, but they may access the current instance
via the [getGlobalState()] hook. It allows imperative interactions with
the global state, instead of the normal declarative state access via
the [useGlobalState()] hook.

## Methods
- [get()](#get) - Reads a value from the [GlobalState].
- [set()](#set) - Writes a value into the [GlobalState].
- [unWatch()](#unwatch) - Unsubscribes a listener from global state update
  notifications.
- [watch()](#watch) - Subscribes a listener for global state update
  notifications.

### get()
```jsx
globalState.get(path, options): any
```
Gets current or initial value at the specified `path` of the global state.
It allows to get the entire global state, and automatically sets default value
at the `path`.
- `path` - **string** - Optional. Dot-delimitered state path. If **null** or
  **undefined** the entire global state is returned.
- `options` - **object** - Optional. Additional parameters.
  - `initialState` - **boolean** - If **true** the value will be read from
    the initial global state (at the moment of the [GlobalState] construction),
    instead of the current global state.
  - `initialValue` - **any** - Optional. Intended initial value at `path`.
    In case **undefined** value was read from the state `path` (either from
    the current, or initial state, depending on the `initialState` flag), this
    `initialValue` will be returned to the caller instead. `initialValue` will
    be also written to the `path` of the current state, provided the current
    value there is **undefined**.
- Returns **any** - The result value.

### set()
```jsx
globalState.set(path, value): any
```
Writes the `value` to given global state `path`.
- `path` - **string** - Optional. Dot-delimitered state path.
  Without it the `value` will replace the entire global state content.
- `value` - **any** - The value to set.
- Returns **any** - The given `value`.

### unWatch()
```jsx
globalState.unWatch(callback)
```
Unsubscribes `callback` from the state update notifications; no operation if
`callback` is not subscribed.
- `callback` - **function** - The callback to unsubscribe.

:::caution
This method throws if [SsrContext] is attached to the state instance:
the state watching functionality is intended for the client side only.
:::

### watch()
```jsx
globalState.watch(callback)
```
Subscribes `callback` to watch state updates; no operation if `callback`
is already subscribed to this state instance.

- `callback` - **function** - It will be triggered without any arguments
  each time the state context changes (however, the library may combine several
  independent state updates and call this `callback` just once when all these
  updatesare completed).

:::caution
This method throws if [SsrContext] is attached to the state instance:
the state watching functionlity is intended for the client-side only.
:::

[getGlobalState()]: /docs/api/hooks/getglobalstate
[useGlobalState()]: /docs/api/hooks/useglobalstate
[GlobalState]: /docs/api/objects/globalstate
[SsrContext]: /docs/api/objects/ssrcontext
