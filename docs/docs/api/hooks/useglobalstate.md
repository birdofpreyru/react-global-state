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
For the best performance and flexibility, the library does not copy, nor freezes
the objects written to (read from) the global state. You **SHOULD NOT** directly
mutate any objects stored in the global state; if you do, such mutations won't
be detected and handled by the library.

Technically, such mutations might be useful and legit when some internal data of
an object stored in the global state are not considered a part of the proper state,
but if you are to use such direct mutations, you better know and understand well
what you are doing!
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
      Forced extends ForceT | false = false,
      ValueT = void,
    >(
      path: null | string | undefined,
      initialValue?: ValueOrInitializerT<ValueT>,
    ): UseGlobalStateResT<ValueT>;
    ```
    Generic parameters are:
    - `Unlocked` &mdash; [ForceT] | **false** &mdash; The default value, **false**, forbids
      TypeScript to use this overload (it does so by forcing **DataT** to evaluate
      as **void**). It must be set equal [ForceT] explicitly to use this overload.
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
    [the lazy initial state of the standard React's useState()](https://react.dev/reference/react/useState#avoiding-recreating-the-initial-state)
    &mdash; only if the value at `path` is _undefined_, the function will be executed,
    and the value it returns will be written to the `path`.

  - Otherwise, the given value itself will be written to the `path`,
    if the current value at `path` is _undefined_.

  :::caution Beware
  Don't get misled by the `initialValue` name &mdash; it **DOES NOT IMPLY**
  the initial value is used exclusively on the first [useGlobalState()] call;
  instead the given initial value is applied on each call of [useGlobalState()]
  hook, if the current value at the `path` is _undefined_.

  For this reason in TypeScript code, if `initialValue` can't be `undefined`
  (or it is a function that can't return _undefined_) the value setter returned
  by [useGlobalState()] does not allow to set _undefined_ value either (as such
  setting will be reverted in the very next [useGlobalState()] evaluation).

  If that causes you a problem, you wan't to use _null_ as the no-value that is
  not overwritten by `initialValue`.
  :::

## Result
It returns an array with two elements `[value, setValue]` (see the type
[UseGlobalStateResT]&lt;**ValueT**&gt;):

- `value` &mdash; **ValueT** &mdash; The current value at the given `path`.
- `setValue` &mdash; [SetterT]&lt;**ValueT**&gt; &mdash; The setter function
  to update the value at `path`.

  Similar to the standard React's `useState()`, it supports
  [functional value updates][functional updates]:
  if `setValue()` is called with a function as argument, that function will
  be called with the current state value as its argument, and its return value
  will be written to `path`. Otherwise,
  the argument of `setValue()` itself is written to `path`.

  Also, similar to the standard React's state setters, `setValue()` is
  a stable function: it does not change between component re-renders.

[ForceT]: /docs/api/types/force
[functional updates]: https://reactjs.org/docs/hooks-reference.html#functional-updates
[GlobalState]: /docs/api/classes/globalstate
[SetterT]: /docs/api/types/setter
[useGlobalState()]: #
[UseGlobalStateResT]: /docs/api/types/use-global-state-res
[ValueOrInitializerT]: /docs/api/types/value-or-initializer
[withGlobalStateType()]: /docs/api/functions/with-global-state-type
