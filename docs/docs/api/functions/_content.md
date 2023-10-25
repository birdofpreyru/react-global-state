- [newAsyncDataEnvelope] &mdash; Creates a new plain JS object, satisfying
  the [AsyncDataEnvelopeT] type, and with reasonable initial values of its fields.
- [withGlobalStateType] &mdash; Returns a set of library components, classes,
  and hooks "locked-in" onto a specified state type. Thus, making it unnecessary
  (in TypeScript) to pass the state type as a generic parameter for each component,
  class, and hook, when they are used, and allowing TypeScript compiler to
  auto-evaluate their other generic parameters in many cases.

[AsyncDataEnvelopeT]: /docs/api/types/async-data-envelope
[newAsyncDataEnvelope]: /docs/api/functions/new-async-data-envelope
[withGlobalStateType]: /docs/api/functions/with-global-state-type
