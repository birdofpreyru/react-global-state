- [getGlobalState()](getglobalstate.md) &mdash; Gets [GlobalState]
  instance from the context.
- [getSsrContext()](getssrcontext.md) &mdash; Gets [SsrContext] object
  (the server-side rendering context, which is used to pass global-state-related
  data between rendering iterations).
- [useAsyncCollection()] &mdash; Resolves and stores at the given path of global state
  elements of an asynchronous data collection.
- [useAsyncData()] &mdash; Resolves asynchronous data, and stores them at the given
  path of global state.
- [useGlobalState()](/docs/api/hooks/useglobalstate) &mdash; The primary hook for
  interacting with the global state, modeled after the standard React's
  [useState()](https://reactjs.org/docs/hooks-reference.html#usestate).

<!-- Links -->
[GlobalState]: /docs/api/classes/globalstate
[SsrContext]: /docs/api/classes/ssrcontext
[useAsyncCollection()]: /docs/api/hooks/useasynccollection
[useAsyncData()]: /docs/api/hooks/useasyncdata
