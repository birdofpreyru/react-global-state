# AsyncDataEnvelopeT
```ts
import { type AsyncDataEnvelopeT } from '@dr.pogodin/react-global-state';
```
The [AsyncDataEnvelopeT] type describes a state segment storing data managed
by [useAsyncData()] and [useAsyncCollection()] hooks, alongside related meta-data.
It is defined as a generic type:
```ts
type AsyncDataEnvelopeT<DataT> = {
  data: null | DataT;
  numRefs: number;
  operationId: string;
  timestamp: number;
};
```
The function [newAsyncDataEnvelope()] helps to create a new plain JS object
matching [AsyncDataEnvelopeT] type, with its fields initialized to appropriate
defaults.

## Generic Parameters
[DataT]: #data-type
- `DataT` <a id="data-type" /> &mdash; The type of data stored in the envelope.

## Fields
- `data` &mdash; [DataT] | **null** &mdash; The data currently stored in
  the envelope, if any; or _null_ if the envelope is empty.

- `numRefs` &mdash; **number** &mdash; The number of mounted [useAsyncData()]
  hooks currently using data in this envelope. It is used by [useAsyncData()]
  for garbage collection from the state using a simple reference counting.

- `operationId` &mdash; **string** &mdash; The UUID of the ongoing data loading
  operation for this envelope, if any is in progress; an empty string otherwise.
  Changing this UUID before the loading operation ends effectively cancels it,
  and instructs related hook(s) to ignore the operation result.
  :::info
  Server-side and client-side UUID start with `S` and `C` letter prefixes
  respectively. At the client side, if an envelope stores `operationId` starting
  with `S` letter, it is understood as a non-terminated data loading operation
  during SSR, nad it is automatically restarted at the client-side in such case.
  :::

- `timestamp` &mdash; **number** &mdash; The timestamp (in milliseconds)
  when current `data` were loaded into the envelope (or the last time they
  were refreshed).

[AsyncDataEnvelopeT]: /docs/api/types/async-data-envelope
[newAsyncDataEnvelope()]: /docs/api/functions/new-async-data-envelope
[useAsyncCollection()]: /docs/api/hooks/useasynccollection
[useAsyncData()]: /docs/api/hooks/useasyncdata
