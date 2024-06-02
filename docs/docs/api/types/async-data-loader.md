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
- `DataT` <Link id="data-type" /> &mdash; The type of data loaded by the loader
  function.

## Arguments
- `oldData` &mdash; [DataT] | **null** &mdash; The previously loaded item,
  if any; or _null_.

## Result
The data loader function should return either a [Promise] of [DataT] value,
or [DataT] value directly. In the former case, the corresponding envelope in
the global state will be in the (re-)loading state while the promise resolution
or rejection is awaited; in the later case [DataT] value will be writted into
the envelope synchronously, without visiting the intermediate (re-)loading state.

[AsyncDataLoaderT]: /docs/api/types/async-data-loader
[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[useAsyncData()]: /docs/api/hooks/useasyncdata
