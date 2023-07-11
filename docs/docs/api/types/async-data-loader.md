# AsyncDataLoaderT
```ts
import { type AsyncDataLoaderT } from '@dr.pogodin/react-global-state';
```
The [AsyncDataLoaderT] type is the signature of a valid data loader function
for the [useAsyncData()] hook.

It is defined as a generic type:
```ts
export type AsyncDataLoaderT<DataT>
  = (oldData: null | DataT) => DataT | Promise<DataT>;
```
## Generic Parameters
[DataT]: #data-type
- `DataT` <a id="data-type" /> &mdash; The type of data loaded by the loader
  function.

## Arguments
- `oldData` &mdash; [DataT] | **null** &mdash; The previously loaded item,
  if any; or _null_.

## Result
The data loader function must either return a **Promise** resolving to a [DataT]
value, or just return a [DataT] value directly.

[AsyncDataLoaderT]: /docs/api/types/async-data-loader
[useAsyncData()]: /docs/api/hooks/useasyncdata
