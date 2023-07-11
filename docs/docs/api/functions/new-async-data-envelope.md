# newAsyncDataEnvelope()
```ts
import { newAsyncDataEnvelope } from '@dr.pogodin/react-global-state';
```
The [newAsyncDataEnvelope()] function creates a new plain JS object, satisfying
the [AsyncDataEnvelopeT] type, and with reasonable initial values of its fields.

Its TypeScript signature is
```ts
function newAsyncDataEnvelope<DataT>(
  initialData: DataT | null = null,
): AsyncDataEnvelopeT<DataT>;
```

## Generic Parameters
[DataT]: #data-type
- `DataT` <a id="data-type" /> &mdash; The type of data to be stored in
  the created envelope.

## Arguments
[initialData]: #initial-data
- `initialData` <a id="initial-data" /> &mdash; [DataT] | **null** &mdash;
  Optional. The initial datum to put in the envelope, if any; otherwise _null_
  (default) means to create an empty envelope.

## Result
A new object of type [AsyncDataEnvelopeT]&lt;[DataT]&gt;, with [initialData]
assigned into its `data` field; zero assigned into its `numRefs` and `timestamp`
fields; and empty string assigned into its `operationId` field.

[AsyncDataEnvelopeT]: /docs/api/types/async-data-envelope
[newAsyncDataEnvelope()]: #
