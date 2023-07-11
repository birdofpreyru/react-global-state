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
- `timestamp` &mdash; **number** &mdash; The timestamp (milliseconds) when
  `data`, if any, were loaded (or the last time refreshed).
  :::caution
  If `data` is _null_ because async data loaded into the state do not satisfy
  the [maxage] limit, the value of `timestamp` still will correspond to the time
  when those async data were loaded into the state.
  :::

[useAsyncCollection()]: /docs/api/hooks/useasynccollection
[useAsyncData()]: /docs/api/hooks/useasyncdata
[UseAsyncDataResT]: #
[maxage]: /docs/api/types/use-async-data-options#maxage
