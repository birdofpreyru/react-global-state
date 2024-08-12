# AsyncCollectionT
[AsyncCollectionT]: #collectiont
```tsx
import type { AsyncCollectionT } from '@dr.pogodin/react-global-state';
```
The [AsyncCollectionT] type describes a segment of the global state managed by
an [useAsyncCollection()] hook &mdash; a map between string/number IDs and
corresponding data, wrapped into auxiliary [envelopes][AsyncDataEnvelopeT]:
```tsx
type AsyncCollectionT<
  DataT = unknown,
  IdT extends number | string = number | string,
> = { [id in IdT]?: AsyncDataEnvelopeT<DataT> };
```

## Generic Parameters
- `DataT` &mdash; The type of collection items, defaults **uknown**.
- `IdT` &mdash; **number** | **string** &mdash; The type of collection keys
  (IDs), defaults **number** | **string**.

[useAsyncCollection()]: /docs/api/hooks/useasynccollection
[AsyncDataEnvelopeT]: /docs/api/types/async-data-envelope
