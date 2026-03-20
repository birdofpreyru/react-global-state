# loadAsyncData()
[loadAsyncData()]: /docs/api/functions/loadAsyncData
```tsx
import { loadAsyncData } from '@dr.pogodin/react-global-state';
```

The [loadAsyncData()] function loads asynchronous (or synchronous) data into
the global state, the same way as [useAsyncData()], and [useAsyncCollection()]
hooks do.

In most cases, to (re-)load such data into the global state you should rely on
those hooks, their `deps` options, and `reload()` / `set()` methods they return.
However, there are niche situations when a direct, imperative global state
manipulation with the [loadAsyncData()] function makes more sense. For example,
when it is necessary to (re-)load some data into the global state in response
to an external system notification, when the exact data path to be reloaded
not known beforehand, and specified by that notification itself. In such
situation a regular hook is not convenient, as it is not known beforehand which
path of the global state it should watch / update, and [loadAsyncData()] comes
in handy.

The TypeScript signature of [loadAsyncData()] implementation is:
```tsx
function loadAsyncData<DataT>(
  path: null | string | undefined,
  loader: AsyncDataLoaderT<DataT>,
  globalState: GlobalState<unknown, SsrContext<unknown>>,
  old?: { data: DataT | null; timestamp: number },
  operationId: OperationIdT = `C${uuid()}`,
): Promise<void> | void;
```
however, it is shadowed by the following TypeScript overloads that provide
additional type-safety.

## TypeScript Overloads
1.  The first overload
    ```tsx
    function loadAsyncData<
      StateT,
      PathT extends null | string | undefined,
      DataT extends DataInEnvelopeAtPathT<
        StateT, PathT> = DataInEnvelopeAtPathT<StateT, PathT>,
    >(
      path: PathT,
      loader: AsyncDataLoaderT<DataT>,
      globalState: GlobalState<StateT, SsrContext<StateT>>,
      old?: { data: DataT | null; timestamp: number },
      operationId?: OperationIdT,
    ): Promise<void> | void;
    ```
    expects two generic parameters:
    - `StateT` &mdash; The type of global state content.
    - `PathT` &mdash; **null** | **string** | **undefined** &mdash; The type of
      `path` argument.

    and it uses them to auto-evaluate the third parameter, `DataT` &mdash;
    the type of data stored in the data envelope at the specified `path`.
    If `DataT` type cannot be auto-evaluated, it falls back to **void**,
    thus forbidding TypeScript to use this function overload.
    :::tip
    Rather than providing both `StateT`, and `PathT` parameters to the function
    each time you use it, like
    ```tsx
    loadAsyncData<StateT, typeof path>(path, loader, gs);
    ```
    you should prefer to use [withGlobalStateType()] function to get and use
    a version of [loadAsyncData()] with the "locked-in" `StateT` type, which
    also allows TypeScript to auto-evaluate `PathT` type based on `path` value,
    and thus allows to omit generic parameters altogether:
    ```tsx
    // Get this `loadAsyncData()` version in one place in the code, where your
    // StateT type is defined.
    const { loadAsyncData } = withGlobalStateType<StateT>();

    // Then use it anywhere you need simply like this:
    loadAsyncData(path, loader, gs);
    ```
    :::

2.  Another overload allows to explicitly force any `DataT` type to the function
    call:
    ```tsx
    function loadAsyncData<
      Forced extends ForceT | LockT = LockT,
      DataT = unknown,
    >(
      path: null | string | undefined,
      loader: AsyncDataLoaderT<TypeLock<Forced, void, DataT>>,
      globalState: GlobalState<unknown, SsrContext<unknown>>,
      old?: { data: DataT | null; timestamp: number },
      operationId?: OperationIdT,
    ): Promise<void> | void;
    ```
    Generic parameters are:
    - `Forced` &mdash; [ForceT] | [LockT] &mdash; The default value, [LockT],
      forbids TypeScript to use this overload (it does so by forcing `DataT`
      to evaluate as **void**). It must be set equal [ForceT] explicitly to use
      this overload.
    - `DataT` &mdash; The type of loaded datum, defaults to **unknown**.

      <details>
        <summary>Example</summary>

        ```tsx
        // Variant #1.

        import { type ForceT, loadAsyncData } from '@dr.pogodin/react-global-state';

        loadAsyncData<ForceT, DataT>(path, loader, gs);

        // Variant #2.

        import { type ForceT, withGlobalStateType } from '@dr.pogodin/react-global-state';

        const { loadAsyncData } = withGlobalStateType<StateT>();

        loadAsyncData<ForceT, DataT>(path, loader, gs);
        ```
      </details>

## Arguments

- `path` &mdash; **null** | **string** | **undefined** &mdash; Dot-delimitered
  state path, where the data envelope is stored. _null_ or _undefined_ means
  the entire state is just the envelope to target.

- `loader` &mdash; [AsyncDataLoaderT] &mdash; Asynchronous, or synchronous
  function which resolves (loads) some data that should be stored at the global
  state `path`.

- `globalState` &mdash; [GlobalState] &mdash; The global state instance.

- `old` &mdash; `{ data: DataT | null; timestamp: number }` &mdash; Optional.
  The previous data stored at the `path`, and their `timestamp`, to be passed
  to the `loader`. If not provided, these will be retrieved automatically from
  the `globalState`.

- `operationId` &mdash; `OperationId` &mdash; Optional. UUID of the loading
  operation, prefixed by `C` or `S` letter, with `C` prefix to be used for
  the client-side loading. By default an appropriate UUID will be generated
  automatically.

## Result

If `loader` returns a data promise, [useAsyncData()] also returns a promise,
which resolves without payload once the loading operation is completed.
Otherwise, this function returns _undefined_ value.

[AsyncDataLoaderT]: /docs/api/types/async-data-loader
[ForceT]: /docs/api/types/force
[GlobalState]: /docs/api/classes/globalstate
[LockT]: /docs/api/types/lock
[useAsyncCollection()]: /docs/api/hooks/useasynccollection
[useAsyncData()]: /docs/api/hooks/useasyncdata
[withGlobalStateType()]: /docs/api/functions/with-global-state-type
