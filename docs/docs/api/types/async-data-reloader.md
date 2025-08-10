# AsyncDataReloaderT
[AsyncDataReloaderT]: /docs/api/types/async-data-reloader
```ts
import type { AsyncDataReloaderT } from '@dr.pogodin/react-global-state';
```
The [AsyncDataReloaderT] type is the signature of data re-loader fucntion in
the result of [useAsyncData()] hook (see `reload` in [UseAsyncDataResT]). It is
defined as generic type
```ts
export type AsyncDataReloaderT<DataT>
= (loader?: AsyncDataLoaderT<DataT>) => void | Promise<void>;
```

## Generic Parameters
[DataT]: #data-type
- `DataT` <Link id="data-type" /> &mdash; the type of data loaded by the function.

## Arguments
- `loader` &mdash; [AsyncDataLoaderT]\<[DataT]\> | **undefined** &mdash;
  Optional. The loader function to use; when not provided the loader given
  to the corresponding [useAsyncData()] hook is used.

## Result
If the reload happens synchronously it returns right away; otherwise it returns
a promise which resolves once the reload is completed (or aborted, either failed).

[AsyncDataLoaderT]: /docs/api/types/async-data-loader
[useAsyncData()]: /docs/api/hooks/useasyncdata
[UseAsyncDataResT]: /docs/api/types/use-async-data-res
