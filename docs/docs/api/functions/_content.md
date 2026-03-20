- [getGlobalState()](getglobalstate.md) &mdash; Gets [GlobalState]
  instance from the context.
- [getSsrContext()](getssrcontext.md) &mdash; Gets [SsrContext] object
  (the server-side rendering context, which is used to pass global-state-related
  data between rendering iterations).
- [loadAsyncData()] &mdash; Loads asynchronous data into the global state,
  the same way as [useAsyncData()], and [useAsyncCollection()] hooks do. It is
  intended for niche situations, where a direct, imperative manipulation of
  the global state is prefferable to those hooks, and `.reload()` methods
  they provide.
- [newAsyncDataEnvelope()] &mdash; Creates a new plain JS object, satisfying
  the [AsyncDataEnvelopeT] type, and with reasonable initial values of its fields.
- [withGlobalStateType()] &mdash; Returns a set of library components, classes,
  and hooks "locked-in" onto a specified state type. Thus, making it unnecessary
  (in TypeScript) to pass the state type as a generic parameter for each component,
  class, and hook, when they are used, and allowing TypeScript compiler to
  auto-evaluate their other generic parameters in many cases.

[AsyncDataEnvelopeT]: /docs/api/types/async-data-envelope
[GlobalState]: /docs/api/classes/globalstate
[loadAsyncData()]: /docs/api/functions/loadAsyncData
[newAsyncDataEnvelope()]: /docs/api/functions/new-async-data-envelope
[SsrContext]: /docs/api/classes/ssrcontext
[useAsyncCollection()]: /docs/api/hooks/useasynccollection
[useAsyncData()]: /docs/api/hooks/useasyncdata
[withGlobalStateType()]: /docs/api/functions/with-global-state-type
