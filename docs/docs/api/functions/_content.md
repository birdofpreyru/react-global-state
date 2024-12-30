- [getGlobalState()](getglobalstate.md) &mdash; Gets [GlobalState]
  instance from the context.
- [getSsrContext()](getssrcontext.md) &mdash; Gets [SsrContext] object
  (the server-side rendering context, which is used to pass global-state-related
  data between rendering iterations).
- [newAsyncDataEnvelope] &mdash; Creates a new plain JS object, satisfying
  the [AsyncDataEnvelopeT] type, and with reasonable initial values of its fields.
- [withGlobalStateType] &mdash; Returns a set of library components, classes,
  and hooks "locked-in" onto a specified state type. Thus, making it unnecessary
  (in TypeScript) to pass the state type as a generic parameter for each component,
  class, and hook, when they are used, and allowing TypeScript compiler to
  auto-evaluate their other generic parameters in many cases.

[AsyncDataEnvelopeT]: /docs/api/types/async-data-envelope
[GlobalState]: /docs/api/classes/globalstate
[newAsyncDataEnvelope]: /docs/api/functions/new-async-data-envelope
[SsrContext]: /docs/api/classes/ssrcontext
[withGlobalStateType]: /docs/api/functions/with-global-state-type
