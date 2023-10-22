# GlobalState
```ts
import { GlobalState } from '@dr.pogodin/react-global-state';
```
The [GlobalState] class implements container that
holds and manages the global state content. Users are not supposed to create
new [GlobalState] instances explicitly, but they may access the current instance
via the [getGlobalState()] hook. It allows imperative interactions with
the global state, instead of the normal declarative state access via
the [useGlobalState()] hook.

## Generic Parameters
[StateT]: #state-type

In TypeScript this class is a generic
```ts
class GlobalState<StateT>;
```
where the signle generic parameter is:

- `StateT` <a id="state-type" /> &mdash; The global state content type.

## Methods
- [constructor()] &mdash; Creates a new [GlobalState] instance.
- [get()] &mdash; Reads a value from the [GlobalState].
- [getEntireState()] &mdash; Returns entire state content as a whole.
- [set()](#set) &mdash; Writes a value into the [GlobalState].
- [setEntireState()] &mdash; Overwrites entire state content as a whole.
- [unWatch()](#unwatch) &mdash; Unsubscribes a listener from global state update
  notifications.
- [watch()](#watch) &mdash; Subscribes a listener for global state update
  notifications.

### constructor()
[constructor()]: #constructor
```ts
constructor GlobalState<StateT>(
  initialState: StateT,
  ssrContext?: SsrContext<StateT>
): GlobalState<StateT>;
```
Creates a new [GlobalState] instance with given `initialState`, and optionally
`ssrContext`.
- `initialState` &mdash; [StateT] &mdash; Initial content of the global state.
  In JS it may be omitted to start with undefined state, but in TS the typing
  forces it to be given.
- `ssrContext` &mdash; [SsrContext]&lt;[StateT]&gt; &mdash; Optionally the
  [SsrContext] instance (for SSR purposes).

### get()
[get()]: #get
```ts
globalState.get(path, options)
```
Gets current or initial value at the specified `path` of the global state.
It allows to get the entire global state, and automatically sets default value
at the `path`.

_Runtime implementation:_
```ts
globalState.get<ValueT>(
  path?: null | string,
  options? GetOptsT<ValueT>,
): ValueT;
```
- `path` &mdash; **null** | **string** | **undefined** &mdash; Optional.
  Dot-delimitered state path. If _null_ or _undefined_ the entire global state
  is returned.

- `options` &mdash; **GetOptsT**&lt;**ValueT**&gt; &mdash; Optional. Additional
  settings.

  - `initialState` &mdash; **boolean** &mdash; If _true_ the value will be read
    from the initial global state (at the moment of the [GlobalState] construction),
    instead of the current global state.

  - `initialValue` &mdash; [ValueOrInitializerT]&lt;**ValueT**&gt; &mdash;
    Optional. Intended initial value at `path`, or its _initializing function_.
    In case _undefined_ value was read from the state `path` (either
    from the current, or initial state, depending on the `initialState` flag),
    this `initialValue` (its result) will be returned to the caller instead.
    `initialValue` (its result) will be also written to the `path` of the current
    state, provided the current value there is _undefined_.

- Returns the value at the path (of **ValueT** type).

_Compile-time TypeScript overloads:_

1.  When called without arguments it returns entire state content as a whole
    (effectively, it is the same as the [getEntireState()] method):
    ```ts
    globalState.get(): StateT;
    ```

2.  If **StateT** and the type of `path` (**PathT**) allow to auto-evaluate
    the type of value at `path` (**ValueArgT** and **ValueResT**), this overload
    gets the value with type-checks:
    ```ts
    get<PathT extends null | string | undefined, ValueArgT, ValueResT>(
      path: PathT,
      opts?: GetOptsT<ValueArgT>,
    ): ValueResT;
    ```
    &uArr; _Simplified by omitting the exact definitions behind **ValueArgT**
    and **ValueResT**._

    If **StateT** and **PathT** do not allow to evaluate the value type,
    **ValueArgT** falls back to **never**, and **ValueResT** falls back to
    **void**, thus rendering this overload forbidden in any practical context.

3.  This implementation allows to force any value type at the caller's discretion:
    ```ts
    get<Forced extends ForceT | false = false, ValueT = void>(
      path?: null | string,
      opts?: GetOptsT<ValueT>,
    ): ValueT;
    ```
    &uArr; _Simplified by omitting some details behind the actual **ValueT**
    definition and usage._

    By default, the _false_ value of **Forced** generic param forbids compiler
    to use this overload; it must be set equal **ForceT** to work, _e.g._
    ```ts
    // Forces TypeScript to assume the value at `path` has "string" type.

    import { type ForceT } from '@dr.pogodin/react-global-state';

    globalState.get<ForceT, string>(path);
    ```

### getEntireState()
[getEntireState()]: #getentirestate
```ts
globalState.getEntireState(): StateT;
```
Returns entire state content as a whole. It is equivalent to
`globalState.get()`.

### set()
```ts
globalState.set(path, value);
```
_Runtime implementation:_
```ts
globalState.set<ValueT>(
  path: null | string | undefined,
  value: ValueT,
): ValueT;
```
- `path` &mdash; **null** | **string** | **undefined** &mdash; Optional.
  Dot-delimitered state path. If _null_ or _undefined_ the `value` will replace
  the entire global state content.

- `value` &mdash; **unknown** &mdash; The value to set.

- Returns the given `value` itself.

_Compile-time TypeScript overloads:_

1.  If **StateT** and `path` type (**PathT**) allow to auto-evaluate the type
    of value at the `path`, this overload allows to write the value with static type-checks:
    ```ts
    set<PathT extends null | string | undefined, ValueArgT, ValueResT>(
      path: PathT,
      value: ValueArgT,
    ): ValueResT;
    ```
    &uArr; _Simplified by ommiting details behind the actual **ValueArgT** and
    **ValueResT** definitions and use._

    If value type cannot be evaluated based on **StateT** and **PathT**,
    **ValueArgT** falls back to **never**, and **ValueResT** falls back
    to **unknown**, thus forbidding TypeScript to use this overload in
    any practical context.

2.  This overload allows to force any **ValueT** type at the caller's
    discretion:
    ```ts
    set<Forced extends ForceT | false = false, ValueT = never>(
      path: null | string | undefined,
      value: ValueT,
    ): ValueT; 
    ```
    &uArr; _Simplified by omitting details behind the actual **ValueT**
    definition and use._

    The default value of **Forced** generic parameter, _false_, forbids TypeScript
    to use this overload, unless **Forced** is explicitly set equal _ForcedT_,
    _i.e._ you use this overload like this:
    ```ts
    // Forces TypeScript to assume `value` has "string" type:

    import { type ForceT } from '@dr.pogodin/react-global-state';

    globalState.set<ForceT, string>('some.path', 'some string value');
    ```

### setEntireState()
[setEntireState()]: #setentirestate
```ts
globalState.setEntireState(value: StateT): StateT;
```
Writes entire state content as a whole. It is equivalent to
`globalState.set(null, value)`.
- `value` &mdash; [StateT] &mdash; The new state content.
- Returns given `value` for chaining convenience.

### unWatch()
```jsx
globalState.unWatch(callback: CallbackT);
```
Unsubscribes `callback` from the state update notifications; no operation if
`callback` is not subscribed.
- `callback` &mdash; **CallbackT** &mdash; The callback to unsubscribe.

:::caution
This method throws if [SsrContext] is attached to the state instance:
the state watching functionality is intended for the client side only.
:::

### watch()
```jsx
globalState.watch(callback: CallbackT);
```
Subscribes `callback` to watch state updates; no operation if `callback`
is already subscribed to this state instance.

- `callback` &mdash; **CallbackT** &mdash; It will be triggered without any arguments
  each time the state context changes (however, the library may combine several
  independent state updates and call this `callback` just once when all these
  updatesare completed).

:::caution
This method throws if [SsrContext] is attached to the state instance:
the state watching functionlity is intended for the client-side only.
:::

[getGlobalState()]: /docs/api/hooks/getglobalstate
[GlobalState]: #
[SsrContext]: /docs/api/classes/ssrcontext
[useGlobalState()]: /docs/api/hooks/useglobalstate
[ValueOrInitializerT]: /docs/api/types/value-or-initializer
