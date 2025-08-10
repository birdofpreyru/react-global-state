# UseAsyncDataResT
```ts
import { type UseAsyncDataResT } from '@dr.pogodin/react-global-state';
```
[UseAsyncDataResT] is the type of result returned by [useAsyncData()]
and, possibly (depends on hook's arguments), [useAsyncCollection()] hooks.

It is defined as the generic type:
```ts
type UseAsyncDataResT<DataT> = {
  data: DataT | null;
  loading: boolean;
  reload: AsyncDataReloaderT<DataT>;
  set: (data: DataT | null) => void;
  timestamp: number;
};
```

## Generic Parameters
[DataT]: #data-type
- `DataT` <Link id="data-type" /> &mdash; The type of datum managed by
  [useAsyncData()] or [useAsyncCollection()] hook.

## Fields
- `data` &mdash; [DataT] | **null** &mdash; The datum, if loaded;
  _null_ otherwise.
- `loading` &mdash; **boolean** &mdash; _true_ if the loading operation is
  currently underway; _false_ otherwise.

- `reload` &mdash; [AsyncDataReloaderT]  &mdash; Imperatively triggers a reload
  of data at the corresponding path in the global state, using provided custom
  `loader`, if any, or otherwise the loader given to the corresponding
  [useAsyncData()] hook.

  :::tip Tips
  - This method is intended for imperative code (_e.g._ UI event handlers).
    When data should be reloaded in response to local or global state changes,
    prefer to use `deps` option of [UseAsyncDataOptionsT] to manage reloads.

  - This method is a stable function &mdash; it is guaranteed to remain the same
    across re-renders of the host component.
  :::

- `set` &mdash; **(data: [DataT] | null) => void** &mdash; Synchronously writes
  given `data` into the envelope at the corresponding path of the global state.

- `timestamp` &mdash; **number** &mdash; The timestamp (milliseconds) when
  `data`, if any, were loaded (or the last time refreshed).
  :::caution
  If `data` is _null_ because async data loaded into the state do not satisfy
  the [maxage] limit, the value of `timestamp` still will correspond to the time
  when those async data were loaded into the state.
  :::

[AsyncDataLoaderT]: /docs/api/types/async-data-loader
[AsyncDataReloaderT]: /docs/api/types/async-data-reloader
[useAsyncCollection()]: /docs/api/hooks/useasynccollection
[useAsyncData()]: /docs/api/hooks/useasyncdata
[UseAsyncDataOptionsT]: /docs/api/types/use-async-data-options
[UseAsyncDataResT]: #
[maxage]: /docs/api/types/use-async-data-options#maxage
