# AsyncCollectionReloaderT
[AsyncCollectionReloaderT]: /docs/api/types/async-collection-reloader
```ts
import type { AsyncCollectionReloaderT } from '@dr.pogodin/react-global-state';
```
The [AsyncCollectionReloaderT] type is the signature of data re-loader function
in the result of [useAsyncCollection()] hook (see `reload` in
[UseAsyncCollectionResT]). It is defined as generic type
```ts
export type AsyncCollectionReloaderT<
  DataT,
  IdT extends number | string = number | string,
> = (loader?: AsyncCollectionLoaderT<DataT, IdT>) => void | Promise<void>;
```

## Generic Parameters
[DataT]: #data-type
- `DataT` <Link id="data-type" /> &mdash; the type of data loaded by
  the function.

[IdT]: #id-type
- `IdT` <Link id="id-type" /> &mdash; the type of collection keys.

## Arguments
- `loader` &mdash; [AsyncCollectionLoaderT]\<[DataT], [IdT]\> | **undefined**
  &mdash; Optional. The loader function to use; when it is not provided
  the loader given to the corresponding [useAsyncCollection()] hook is used.

## Result
If the reload happens synchronously it returns right away; otherwise it returns
a promise which resolves once the reload is completed (or aborted, either failed).

[AsyncCollectionLoaderT]: /docs/api/types/async-collection-loader
[useAsyncCollection()]: /docs/api/hooks/useasynccollection
[UseAsyncCollectionResT]: /docs/api/types/use-async-collection-res
