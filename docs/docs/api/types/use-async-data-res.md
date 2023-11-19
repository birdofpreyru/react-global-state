# UseAsyncDataResT
```ts
import { type UseAsyncDataResT } from '@dr.pogodin/react-global-state';
```
[UseAsyncDataResT] is the type of result returned by [useAsyncData()]
and [useAsyncCollection()] hooks.

It is defined as the generic type:
```ts
type UseAsyncDataResT<DataT> = {
  data: DataT | null;
  loading: boolean;
  reload: (loader?: AsyncDataLoaderT<DataT>) => Promise<void>;
  timestamp: number;
};
```

## Generic Parameters
[DataT]: #data-type
- `DataT` <a id="data-type" /> &mdash; The type of datum managed by
  [useAsyncData()] or [useAsyncCollection()] hook.

## Fields
- `data` &mdash; [DataT] | **null** &mdash; The datum, if loaded;
  _null_ otherwise.
- `loading` &mdash; **boolean** &mdash; _true_ if the loading operation is
  currently underway; _false_ otherwise.

- `reload` &mdash; **(loader?: [AsyncDataLoaderT]&lt;[DataT]&gt;) => Promise&lt;void>**
  &mdash; Imperatively triggers a reload of data at the corresponding path in
  the global state, using provided custom `loader`, if any, or otherwise
  the loader given to the corresponding [useAsyncData()] hook.

  :::tip
  This method is intended for use in the imperative code (like mouse event
  handlers). When data should be reloaded in a response to the local or global
  state change, prefer to use `deps` option of [UseAsyncDataOptionsT].
  :::

- `timestamp` &mdash; **number** &mdash; The timestamp (milliseconds) when
  `data`, if any, were loaded (or the last time refreshed).
  :::caution
  If `data` is _null_ because async data loaded into the state do not satisfy
  the [maxage] limit, the value of `timestamp` still will correspond to the time
  when those async data were loaded into the state.
  :::

[AsyncDataLoaderT]: /docs/api/types/async-data-loader
[useAsyncCollection()]: /docs/api/hooks/useasynccollection
[useAsyncData()]: /docs/api/hooks/useasyncdata
[UseAsyncDataOptionsT]: /docs/api/types/use-async-data-options
[UseAsyncDataResT]: #
[maxage]: /docs/api/types/use-async-data-options#maxage
