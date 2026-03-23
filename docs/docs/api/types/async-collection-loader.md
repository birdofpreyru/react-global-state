# AsyncCollectionLoaderT
```ts
import { type AsyncCollectionLoaderT } from '@dr.pogodin/react-global-state';
```
The [AsyncCollectionLoaderT] type is the signature of a valid data loader
function for the [useAsyncCollection()] hook.

It is defined as a generic type:
```ts
type AsyncCollectionLoaderT<
  DataT,
  IdT extends number | string = number | string,
> = (id: IdT, oldData: DataT | null, meta: {
  abortSignal: AbortSignal;
  oldDataTimestamp: number;
}) => DataT | Promise<DataT | null> | null;
```

:::info
- Prior to the library
  [v0.22.0](https://github.com/birdofpreyru/react-global-state/releases/tag/v0.22.0)
  the `meta` object passed into the loader included `isAborted()`,
  and `setAbortCallback()` methods. They have been removed in favor of
  the new `abortSignal` field.
:::

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

  - `abortSignal` &mdash; [AbortSignal] &mdash; Triggered if the loading
    operation has been aborted, and the return value of the current loader
    invokation will be ignored. For the optimal performance, the loader should
    react on this signal by terminating any asynchronous work early, and
    resolving _null_ (or any other value).

  - `oldDataTimestamp` &mdash; **number** &mdash; Unix timestamp (milliseconds)
    of the given `oldData`, if any, or 0.

## Result
The data loader function, for the given ID, must return either [DataT] value,
or **null**, or a [Promise] of [DataT] value or **null**. When a [Promise] is
returned, the corresponding envelope in the global state is put into the (re-)loading
state while the promise settlement is awaited; otherwise the value ([DataT] or
**null**) is written into the envelope synchronously, without visiting
the intermediate (re-)loading state.

[AbortSignal]: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
[AsyncCollectionLoaderT]: /docs/api/types/async-collection-loader
[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[useAsyncCollection()]: /docs/api/hooks/useasynccollection
