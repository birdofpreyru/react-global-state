# AsyncCollectionLoaderT
```ts
import { type AsyncCollectionLoaderT } from '@dr.pogodin/react-global-state';
```
The [AsyncCollectionLoaderT] type is the signature of a valid data loader
function for the [useAsyncCollection()] hook.

It is defined as a generic type:
```ts
type AsyncCollectionLoaderT<DataT> =
  (id: string, oldData: null | DataT) => DataT | Promise<DataT>
```

## Generic Parameters
- `DataT` <Link id="data-type" /> &mdash; The type of data loaded by the loader function.

[DataT]: #data-type

## Arguments

The data loader function receives two arguments:
- `id` &mdash; **string** &mdash; The identifier of collection item to load.
- `oldData` &mdash; [DataT] | **null** &mdash; The item previously loaded for
  this `id`, if any; or _null_.

## Result
The data loader function must either return a **Promise** resolving to a [DataT]
value for the given ID, or just return the [DataT] value directly.

[AsyncCollectionLoaderT]: /docs/api/types/async-collection-loader
[useAsyncCollection()]: /docs/api/hooks/useasynccollection
