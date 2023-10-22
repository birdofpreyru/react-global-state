# useAsyncData()
```jsx
import { useAsyncData } from '@dr.pogodin/react-global-state';
```
Resolves asynchronous data, and stores them at the given `path` of global
state. When multiple components rely on asynchronous data at the same `path`,
the data are resolved once, and reused until their age is within specified
bounds. Once the data are stale, the hook allows to refreshes them. It also
garbage-collects stale data from the global state when the last component
relying on them is unmounted.

:::info
The hook stores loaded async data and related meta data at the `path` of global
state in form of [AsyncDataEnvelopeT] object. That global state segment can be
accessed, and even modified using other hooks,
_e.g_ [useGlobalState()], but doing so you should be careful to not interfere
with the related [useAsyncData()] hook logic in an undesireable way.
:::

The TypeScript signature of [useAsyncData()] implementation is
```ts
function useAsyncData<DataT>(
  path: null | string | undefined,
  loader: AsyncDataLoaderT<DataT>,
  options: UseAsyncDataOptionsT = {},
): UseAsyncDataResT<DataT> {
```
however, it is on purpose shadowed by the following TypeScript overloads
making convenient and safe static type analysis possible.

## TypeScript Overloads
[StateT]: #state-type

1.  The first overload for this hook has the signature (simplified by omitting
    the details behind the actual **DataT** definition):
    ```ts
    function useAsyncData<
      StateT,
      PathT extends null | string | undefined,
    >(
      path: PathT,
      loader: AsyncDataLoaderT<DataT>,
      options?: UseAsyncDataOptionsT,
    ): UseAsyncDataResT<DataT>;
    ```
    with two generic parameters:
    - `StateT` <a id="state-type" /> &mdash; The type of global state content.
    - `PathT` &mdash; **null** | **string** | **undefined** &mdash;
      The type of `path` argument.

    The type **DataT** is auto-evaluated by TypeScript based on generic parameters,
    if possible, and used for type-checking the loader and result. If **DataT**
    cannot be auto-evaluated, it falls back to **void**, forbidding TypeScript
    to use this hook overload.
    :::tip
    As [StateT] cannot be evaluated from hook argument / result types, to use
    this hook overload directly one would need to provide both generic parameters
    explicitly:
    ```ts
    useAsyncData<StateT, typeof path>(path, loader);
    ```
    Instead, you should prefer to use [withGlobalStateType()] function to get and
    use a specially wrapped version of this hook, with "locked-in" [StateT] type,
    which allows TS to auto-evaluate **PathT** based on `path` argument, and
    thus allows to use this hook without generic parameters, when possible:
    ```ts
    const { useAsyncData } = withGlobalStateType<StateT>();

    // Behind the scene, TS still auto-evaluates the DataT type, and uses it
    // to type-check `loader` and result. It denies to compile this if type check
    // fails, or DataT cannot be auto-evaluated.
    useAsyncData(path, loader);
    ```
    :::

2.  Another overload has the following signature (simplified by omitting
    details behind the exact **DataT** definition), which allows to explicitly
    force any **DataT** type under the caller's discretion:
    ```ts
    function useAsyncData<
      Forced extends ForceT | false = false,
      DataT = unknown,
    >(
      path: null | string | undefined,
      loader: AsyncDataLoaderT<DataT>,
      options?: UseAsyncDataOptionsT,
    ): UseAsyncDataResT<DataT>;
    ```
    Generic parameters are:
    - `Forced` &mdash; [ForceT] | **false** &mdash; The default value, _false_,
      forbids
      TypeScript to use this overload (it does so by forcing **DataT** to evaluate
      as _void_). It must be set equal [ForceT] explicitly to use this overload.

    - `DataT` &mdash; The type of loaded datum, defaults to **unknown**.
    You can use this overload in two ways:

    ```ts
    // Variant #1.

    import { type ForceT, useAsyncData } from '@dr.pogodin/react-global-state';

    useAsyncData<ForceT, DataT>(id, path, loader);

    // Variant #2. Using withGlobalStateType().

    import { type ForceT, withGlobalStateType } from '@dr.pogodin/react-global-state';

    const { useAsyncData } = withGlobalStateType<StateT>();

    // This overload does not really use StateT for type-checks, it just
    // assumes the DatatT type you have specified.
    useAsyncData<ForceT, DataT>(id, path, loader);
    ```

## Arguments
- `path` &mdash; **null** | **string** | **undefined** &mdash; Dot-delimitered
  state path, where data envelope is stored. _null_ or _undefined_ mean the entire
  state is just the envelope for this hook.

- `loader` &mdash; [AsyncDataLoaderT] &mdash; Asynchronous function which resolves (loads)
  async data, which should be stored at the global state `path`. When multiple
  components use [useAsyncData()] hook for the same `path`, the library assumes
  that all hook instances are called with the same `loader` (_i.e._ whichever of
  these loaders is used to resolve async data, the result is acceptable to be
  reused in all related components).

- `options` &mdash; [UseAsyncDataOptionsT] &mdash; Optional object
  with additional settings.

## Result
Returns an object of the type [UseAsyncDataResT]&lt;**DataT**&gt;.

[AsyncDataEnvelopeT]: /docs/api/types/async-data-envelope
[AsyncDataLoaderT]: /docs/api/types/async-data-loader
[ForceT]: /docs/api/types/force
[newAsyncDataEnvelope()]: /docs/api/functions/new-async-data-envelope
[useAsyncCollection()]: /docs/api/hooks/useasynccollection
[useAsyncData()]: /docs/api/hooks/useasyncdata
[UseAsyncDataOptionsT]: /docs/api/types/use-async-data-options
[UseAsyncDataResT]: /docs/api/types/use-async-data-res
[useGlobalState()]: /docs/api/hooks/useglobalstate
[withGlobalStateType()]: /docs/api/functions/with-global-state-type
