# useGlobalState()
```jsx
import { useGlobalState } from '@dr.pogodin/react-global-state';
```
The primary hook for interacting with the [GlobalState], modeled after
the standard React's
[useState()](https://reactjs.org/docs/hooks-reference.html#usestate).
It subscribes a component to a given `path` of global state, and provides
a function to update it. Each time the value at `path` changes, the hook
triggers re-render of its host component.

:::caution
For performance, the library does not copy objects written to / read from
global state paths. You **MUST NOT** manually mutate returned state values,
or change objects already written into the global state, without explicitly
clonning them first yourself.
:::

:::caution
State update notifications are asynchronous. When your code does multiple
global state updates in the same React rendering cycle, all state update
notifications are queued and dispatched together, after the current
rendering cycle. In other words, in any given rendering cycle the global
state values are "fixed", and all changes becomes visible at once in the
next triggered rendering pass.
:::

The TypeScript signature of [useGlobalState()] implementation is

```ts
function useGlobalState(
  path?: null | string,
  initialValue?: ValueOrInitializerT<unknown>,
): UseGlobalStateResT<any> 
```
however, it is on purpose shadowed by the following TypeScript overloads,
to make convenient and safe static type analysis possible.

## TypeScript Overloads
1.  The first overload for this hook has the signature
    ```ts
    function useGlobalState<StateT>(): UseGlobalStateResT<StateT>;
    ```
    where
    - `StateT` &mdash; The type of global state content.

    In other words, when called without arguments, the hook gives access to
    reading / writing the entire global state as a whole.

2.  The second overload is (simplified by omitting the exact details behind
    **DataT** definition):
    ```ts
    function useGlobalState<
      StateT,
      PathT extends null | string | undefined,
    >(
      path: PathT,
      initialValue?: ValueOrInitializerT<DataT>
    ): UseGlobalStateResT<DataT>;
    ```
    with two generic parameters:
    - `StateT` &mdash; The type of global state content.
    - `PathT` &mdash; **null** | **string** | **undefined** &mdash;
      The type of `path`  argument.

    The type **DataT** is auto-evaluated by TypeScript based on generic
    parameters, if possible, and used to type-check the loader and result.
    If **DataT** cannot be auto-evaluated, it falls back to **void**, which
    forbids TypeScript to use this overload.
    :::tip
    As **StateT** cannot be evaluated from hook argument / result types,
    to use this hook overload directly one would need to provide both
    generic parameters explictly:
    ```ts
    useGlobalState<StateT, typeof path>(path);
    ```
    Instead, you should prefer to use [withGlobalStateType()] function to get
    and use a specially wrapped version of this hook, with "locked-in" **StateT**
    type, which allows TS to auto-evaluate **PathT** based on `path` argument,
    and thus allows to use this hook variant without generic parameters,
    when possible:
    ```ts
    const { useGlobalState } = withGlobalStateType<StateT>();

    // Behind the scene, TS still auto-evaluates DataT type, and uses it
    // for type checks; it also denies to compile it, if DataT cannot be
    // evaluated.
    useGlobalState(path);
    ```
    :::

3.  Another overload permits to force any **DataT** type under the caller's
    discretion (simplified by omitting details behind the exact **DataT**
    definition):
    ```ts
    function useGlobalState<
      Unlocked extends 0 | 1 = 0,
      ValueT = void,
    >(
      path: null | string | undefined,
      initialValue?: ValueOrInitializerT<ValueT>,
    ): UseGlobalStateResT<ValueT>;
    ```
    Generic parameters are:
    - `Unlocked` &mdash; **0** | **1** &mdash; The default value, **0**, forbids
      TypeScript to use this overload (it does so by forcing **DataT** to evaluate
      as **void**). It must be set **1** explicitly to use this overload.
    - `ValueT` &mdash; The type of value at the state `path`, defaults
      to **void** to force the caller to specify it.

## Arguments
- `path` &mdash; **null** | **string** | **undefined** &mdash; Dot-delimitered
  state path. It can be _null_ or _undefined_ to subscribe for entire state as
  a whole. Under-the-hood state values are read and written
  using Lodash's
  [_.get()](https://lodash.com/docs/4.17.15#get) and
  [_.set()](https://lodash.com/docs/4.17.15#set) methods, thus it is safe
  to access state paths which have not been created before (in JS, in TS
  the static typing will forbid it if **StateT** is well-defined).

- `initialValue` &mdash; [ValueOrInitializerT]&lt;**ValueT**&gt; &mdash; Initial
  value to set at the `path`, or _initializer function_ for this value:
  - If a function is given, it will act similar to
    [the lazy initial state of the standard React's useState()](https://react.dev/reference/react/useState#avoiding-recreating-the-initial-state).
    only if the value at `path` is _undefined_, the function will be executed,
    and the value it returns will be written to the `path`.
  - Otherwise, the given value itself will be written to the `path`,
    if the current value at `path` is _undefined_.

## Result
It returns an array with two elements `[value, setValue]` (see the type
[UseGlobalStateResT]&lt;**ValueT**&gt;):

- `value` &mdash; **ValueT** &mdash; The current value at the given `path`.
- `setValue` &mdash; [SetterT]&lt;**ValueT**&gt; &mdash; The setter function
  to update the value at `path`.

  Similar to the standard React's `useState()`, it supports
  [functional value updates](https://reactjs.org/docs/hooks-reference.html#functional-updates):
  if `setValue()` is called with a function as argument, that function will
  be called and its return value will be written to `path`. Otherwise,
  the argument of `setValue()` itself is written to `path`.

  Also, similar to the standard React's state setters, `setValue()` is
  a stable function: it does not change between component re-renders.

[GlobalState]: /docs/api/classes/globalstate
[SetterT]: /docs/api/types/setter
[useGlobalState()]: #
[UseGlobalStateResT]: /docs/api/types/use-global-state-res
[ValueOrInitializerT]: /docs/api/types/value-or-initializer
[withGlobalStateType()]: /docs/api/functions/with-global-state-type
