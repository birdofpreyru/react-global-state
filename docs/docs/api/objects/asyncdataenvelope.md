# AsyncDataEnvelope
[AsyncDataEnvelope]s are plain JavaScript objects created in the global state by
[useAsyncData()] and [useAsyncCollection()] hooks to hold loaded async data and
related meta data.

## Fields
- `data` - **any** - The loaded async data.
- `numRefs` - **number** - The count of currently mounted components referencing
  the async data via [useAsyncData()] and [useAsyncCollection()] hooks.
- `operationId` - **string** - A unique ID of the current data loading operation,
  if one is in progress. Changing this ID before the operation ends effectively
  cancels it, and instructs related hooks to ignore the operation result.
  :::note
  Server-side and client-side operation UIDs start with `S` and `C` letters
  respectively. At the client side, if an envelope stores `operationId` starting
  with `S` letter, it is understood as a non-terminated data loading operation
  during SSR, and it is automatically restarted at the client-side in such case.
  :::
- `timestamp` - **number** - Unix timestamp (in milliseconds) of the most
  recently loaded `data` payload.

[AsyncDataEnvelope]: #
[useAsyncCollection()]: /docs/api/hooks/useasynccollection
[useAsyncData()]: /docs/api/hooks/useasyncdata
