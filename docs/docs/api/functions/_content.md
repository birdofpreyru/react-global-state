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

:::warning[Deprecated]
- [getGlobalState()](getglobalstate.md) &mdash; Renamed into
  [useGlobalStateObject()] in [v0.24.0].
- [getSsrContext()](getssrcontext.md) &mdash; Renamed into [useSsrContext()]
  in [v0.24.0].
:::

[AsyncDataEnvelopeT]: /docs/api/types/async-data-envelope
[GlobalState]: /docs/api/classes/globalstate
[loadAsyncData()]: /docs/api/functions/loadAsyncData
[newAsyncDataEnvelope()]: /docs/api/functions/new-async-data-envelope
[SsrContext]: /docs/api/classes/ssrcontext
[useAsyncCollection()]: /docs/api/hooks/useasynccollection
[useAsyncData()]: /docs/api/hooks/useasyncdata
[useGlobalStateObject()]: /docs/api/hooks/useGlobalStateObject
[useSsrContext()]: /docs/api/hooks/useSsrContext
[v0.24.0]: https://github.com/birdofpreyru/react-global-state/releases/tag/v0.24.0
[withGlobalStateType()]: /docs/api/functions/with-global-state-type
