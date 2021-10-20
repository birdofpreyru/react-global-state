# GlobalState

A [GlobalState] object holds and manages the global state content.

:::info
[GlobalState] objects are instancess of **GlobalState** class. Library users are
not supposed to create new [GlobalState] instances themselves, however they may
access the current [GlobalState] object using the [getGlobalState()] hook. Note,
that is not the normal way to interact with the global state, and it is intended
for advanced, special usecases.
:::

[**Methods**](#methods):
- [get()](#get) - Gets a value from [GlobalState].
- [set()](#set) - Writes a value into [GlobalState].
- [unWatch()](#unwatch) - Unsubscribes a listener from global state update
  notifications.
- [watch()](#watch) - Adds a listener for global state update notifications.

## Methods

### get()
```jsx
globalState.get(path): any
```
Gets the value at the given `path` of the global state. If `path` is **null** or
**undefined**, the entire state content is returned.
- `path` - **string** - Optional. Dot-delimitered state path.
  Without it the entire global state content is returned.
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
[GlobalState]: /docs/api/objects/globalstate
[SsrContext]: /docs/api/objects/ssrcontext
