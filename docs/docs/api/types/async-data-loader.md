# AsyncDataLoaderT
```ts
import { type AsyncDataLoaderT } from '@dr.pogodin/react-global-state';
```
The [AsyncDataLoaderT] type is the signature of a valid data loader function
for the [useAsyncData()] hook.

It is defined as a generic type:
```ts
export type AsyncDataLoaderT<DataT>
  = (oldData: null | DataT, meta: {
    isAborted: () => boolean;
    oldDataTimestamp: number;
  }) => DataT | Promise<DataT | null> | null;
```
## Generic Parameters
[DataT]: #data-type
- `DataT` <Link id="data-type" /> &mdash; The type of data loaded by the loader
  function.

## Arguments
- `oldData` &mdash; [DataT] | **null** &mdash; The previously loaded item,
  if any; or _null_.

- `meta` &mdash; Holds additional information about the loading opeartion:

  - `isAborted` &mdash; **() => boolean** &mdash; In various situations
    the library may abort an ongoing loading operation (or rather ignore
    the result of such aborted operation). The loader function may call
    this given `isAborted` method, to check whether it has been aborted
    or not, and if it has been aborted it may just exit with **null** result &mdash;
    as far as the library is concerned the result of that call will be
    silently discarted anyway.

  - `oldDataTimestamp` &mdash; **number** &mdash; Unix timestamp (milliseconds)
    of the given `oldData`, if any, or 0.

## Result
The data loader function must return either [DataT] value, or **null**,
or a [Promise] of [DataT] value or **null**. When a [Promise] is returned,
the corresponding envelope in the global state is put into the (re-)loading
state while the promise settlement is awaited; otherwise the value ([DataT] or
**null**) is written into the envelope synchronously, without visiting
the intermediate (re-)loading state.

[AsyncDataLoaderT]: /docs/api/types/async-data-loader
[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[useAsyncData()]: /docs/api/hooks/useasyncdata
