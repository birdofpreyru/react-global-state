# GlobalStateProvider
```jsx
import { GlobalStateProvider } from '@dr.pogodin/react-global-state';
```
Provides [GlobalState] to its children tree.

## Generic Parameters
[StateT]: #state-type
In TypeScript version [GlobalStateProvider] is a generic component with
the signature:
```ts
function GlobalStateProvider<StateT>(
  props: GlobalStateProviderProps<StateT>,
): JSX.Element;
```
where a single generic parameter:
- `StateT` <a id="state-type" /> &mdash; The type of global state provided via this
  [GlobalStateProvider].

:::tip
Alternatively you may use [withGlobalStateType()] function to get
[GlobalStateProvider] with "locked-in" [StateT]:

```ts
import { withGlobalStateType } from '@dr.pogodin/react-global-state';

const { GlobalStateProvider } = withGlobalStateType<StateT>();
```
:::

## Properties
:::info
In TypeScript version `props` of [GlobalStateProvider] are typed this way:
```ts
type GlobalStateProviderProps<StateT> = {
  children?: ReactNode;
} & ({
  initialState: ValueOrInitializerT<StateT>,
  ssrContext?: SsrContext<StateT>;
} | {
  stateProxy: true | GlobalState<StateT>;
});
```
Note, in particular, this type permits to either provide `stateProxy` prop,
to use [GlobalStateProvider] as a proxy for an existing [GlobalState], or a pair
of `initialState` and (optionally) `ssrContext` props, to create and provide
a new [GlobalState].

In JavaScript, where all these props (`stateProxy`, `initialState`, `ssrContext`)
can be provided together, the `stateProxy`, if provided, has precedence and
activates the "proxy mode", no matter other props values.
:::

- `children` &mdash; **ReactNode** &mdash; Component children, if any,
  are rendered in-place of [GlobalStateProvider] and provided with [GlobalState]
  instance.

- `initialState` <a id="initial-state-prop" /> &mdash;
  [ValueOrInitializerT]&lt;[StateT]&gt; &mdash;
  The initial global state content.

  :::caution BEWARE
  The library assumes the `initialState` is never mutated after it has
  been provided to [GlobalStateProvider].
  :::
  :::info JavaScript _vs._ TypeScript
  In TypeScript version this property is obligatory (beside when [stateProxy]
  prop is used instead), and its value must satisfy
  the [ValueOrInitializerT]&lt;[StateT]&gt; type.

   in JavaScript it is optional, as the runtime logic permits to initialize
   entire global state as _undefined_, and later create and populate the state
   object as its various paths are accessed via global state hooks.

  In theory, you can do the same in TypeScript (by defining [StateT]
  as optionally _undefined_), but that will make TypeScript unable to evaluate
  types of values inside the state, thus diminishing the usefulness of TypeScript
  features provided by this library.
  :::

- `ssrContext` &mdash; [SsrContext] &mdash; Optional. SSR (server-side
  rendering) context. In TypeScript version it is only permitted when no
  [stateProxy] is provided.

- `stateProxy` <a id="state-proxy-prop" /> &mdash;
  **boolean** | [GlobalState] &mdash; Enables _proxy mode_, intended
  for code-splitting and SSR implementation:
  - If _true_ this [GlobalStateProvider] will fetch and reuse
    the [GlobalState] instance from the parent provider,
    instead of creating a new [GlobalState].
  - If [GlobalState] instance, it will provide it to the children, instead of
    creating a new [GlobalState].
  - Otherwise it will act as normal: create a new [GlobalState] instance and
    provide it to its children.

[GlobalState]: /docs/api/objects/globalstate
[GlobalStateProvider]: #
[initialState]: #initial-state-prop
[SsrContext]: /docs/api/classes/ssrcontext
[stateProxy]: #state-proxy-prop
[ValueOrInitializerT]: /docs/api/types/value-or-initializer
[withGlobalStateType()]: /docs/api/functions/with-global-state-type
