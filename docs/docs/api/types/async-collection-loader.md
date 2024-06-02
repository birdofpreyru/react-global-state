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
The data loader function should return either a [Promise] of [DataT] value for the given ID,
or [DataT] value directly. In the former case, the corresponding envelope in
the global state will be in the (re-)loading state while the promise resolution
or rejection is awaited; in the later case [DataT] value will be writted into
the envelope synchronously, without visiting the intermediate (re-)loading state.

[AsyncCollectionLoaderT]: /docs/api/types/async-collection-loader
[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[useAsyncCollection()]: /docs/api/hooks/useasynccollection
