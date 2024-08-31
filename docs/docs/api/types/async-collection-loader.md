# AsyncCollectionLoaderT
```ts
import { type AsyncCollectionLoaderT } from '@dr.pogodin/react-global-state';
```
The [AsyncCollectionLoaderT] type is the signature of a valid data loader
function for the [useAsyncCollection()] hook.

It is defined as a generic type:
```ts
export type AsyncCollectionLoaderT<
  DataT,
  IdT extends number | string = number | string,
> =
  (id: IdT, oldData: null | DataT, meta: {
    isAborted: () => boolean;
    oldDataTimestamp: number;
  }) => DataT | Promise<DataT | null> | null;
```

## Generic Parameters
[DataT]: #data-type
[IdT]: #id-type
- `DataT` <Link id="data-type" /> &mdash; The type of data loaded by the loader
  function.
- `IdT` <Link id="id-type" /> &mdash; **number** | **string** &mdash;
  The type of collection item's index.

## Arguments

The data loader function receives two arguments:
- `id` &mdash; [IdT] &mdash; The identifier of collection item to load.
- `oldData` &mdash; [DataT] | **null** &mdash; The item previously loaded for
  this `id`, if any; or _null_.
- `meta` &mdash; Holds additional information about the loading opeartion:

  - `isAborted` &mdash; **() => boolean** &mdash; In various situations
    the library may abort an ongoing loading operation (or rather ignore
    the result of such aborted operation). The loader function may call
    this given `isAborted` method, to check whether it has been aborted
    or not, and if it has been aborted it may just exit with **null** result &mdash;
    as far as the library is concerned the result of that call will be
    silently discarted anyway.

    :::info
    Technically `isAborted()` (if memoized and used in the outer context of
    the loader) also returns _true_ after the loading operation has completed
    without an abort; _i.e._ it actually checks whether the current loading
    operation, if any, is the same for which this callback has been created.
    :::

  - `oldDataTimestamp` &mdash; **number** &mdash; Unix timestamp (milliseconds)
    of the given `oldData`, if any, or 0.

  - `setAbortCallback` &mdash; **(cb: () => void) => void** &mdash;
    Allows to register an abort callback, which will be triggered when, and if
    the current loading operation is aborted. If called repeatedly, the new
    callback will replace the previous one for that operation.

## Result
The data loader function, for the given ID, must return either [DataT] value,
or **null**, or a [Promise] of [DataT] value or **null**. When a [Promise] is
returned, the corresponding envelope in the global state is put into the (re-)loading
state while the promise settlement is awaited; otherwise the value ([DataT] or
**null**) is written into the envelope synchronously, without visiting
the intermediate (re-)loading state.

[AsyncCollectionLoaderT]: /docs/api/types/async-collection-loader
[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[useAsyncCollection()]: /docs/api/hooks/useasynccollection
