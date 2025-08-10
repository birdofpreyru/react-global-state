# UseAsyncCollectionResT
```ts
import { type UseAsyncCollectionResT } from '@dr.pogodin/react-global-state';
```
[UseAsyncCollectionResT] is the type of result possibly returned by
[useAsyncCollection()] hook (depends on hook's arguments).

It is defined as the generic type:
```ts
type UseAsyncCollectionResT<
  DataT,
  IdT extends number | string = number | string,
> = {
  items: {
    [id in IdT]: CollectionItemT<DataT>;
  }
  loading: boolean;
  reload: AsyncCollectionReloaderT<DataT, IdT>;
  timestamp: number;
};

// Where AsyncCollectionReloaderT and CollectionItemT are defined this way:

type CollectionItemT<DataT> = {
  data: DataT | null;
  loading: boolean;
  timestamp: number;
};

type AsyncCollectionReloaderT<
  DataT,
  IdT extends number | string = number | string,
>
  = (loader?: AsyncCollectionLoaderT<DataT, IdT>) => Promise<void>;
```

## Generic Parameters
[DataT]: #data-type
- `DataT` <Link id="data-type" /> &mdash; The type of data managed by
  [useAsyncCollection()] hook.
- `IdT` &mdash; **number** | **string** &mdash; The type of hook's `id` argument.

## Fields
- `items` &mdash; `{ [id in IdT]: CollectionItemT<DataT> }` &mdash;
  The map of items requested from the hook. Similarly to [UseAsyncDataResT],
  for each requested ID it will contain the [DataT] object or **null**, depending
  whether the global state has this object, fetched within the [maxage] limit;
  it will also contain the `timestamp` of last retrieval of this object,
  and `loading` flag indicating if a new retrieval is being in-flight.

  :::caution
  If `data` is **null** because async data loaded into the state do not satisfy
  the [maxage] limit, the value of `timestamp` still will correspond to the time
  when those async data were loaded into the state.
  :::

- `loading` &mdash; **boolean** &mdash; This flag, at the root level of
  the response, is _true_ if the loading operation is currently underway
  for any of the requested _data_ object; or _false_ otherwise (when all
  requested objects are within their refresh limits).

- `reload` &mdash; [AsyncCollectionReloaderT] &mdash; Imperatively triggers
  reloads of data for each of the requested IDs , using provided custom `loader`,
  if any, or otherwise the loader given to the corresponding
  [useAsyncCollection()] hook.

  :::tip Tips
  - This method is intended for imperative code (_e.g._ UI event handlers).
    When data should be reloaded in response to local or global state changes,
    prefer to use `deps` option of [UseAsyncDataOptionsT] to manage reloads.

  - This method is a stable function &mdash; it is guaranteed to remain the same
    across re-renders of the host component.
  :::

- `timestamp` &mdash; **number** &mdash; The timestamp (milliseconds) at
  the root level of the result is the smallest of `timestamp` values for
  the requested objects.

[AsyncCollectionLoaderT]: /docs/api/types/async-collection-loader
[AsyncCollectionReloaderT]: /docs/api/types/async-collection-reloader
[useAsyncCollection()]: /docs/api/hooks/useasynccollection
[useAsyncData()]: /docs/api/hooks/useasyncdata
[UseAsyncDataOptionsT]: /docs/api/types/use-async-data-options
[UseAsyncCollectionResT]: #
[UseAsyncDataResT]: /docs/api/types/use-async-data-res
[maxage]: /docs/api/types/use-async-data-options#maxage
