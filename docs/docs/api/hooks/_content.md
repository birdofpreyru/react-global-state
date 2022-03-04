- [getGlobalState()](getglobalstate.md) - Gets [GlobalState]
  instance from the context.
- [getSsrContext()](getssrcontext.md) - Gets [SsrContext] object
  (the server-side rendering context, which is used to pass global-state-related
  data between rendering iterations).
- [useAsyncCollection()] - Resolves and stores at the given path of global state
  elements of an asynchronous data collection.
- [useAsyncData()] - Resolves asynchronous data, and stores them at the given
  path of global state.
- [useGlobalState()](/docs/api/hooks/useglobalstate) - The primary hook for
  interacting with the global state, modeled after the standard React's
  [useState()](https://reactjs.org/docs/hooks-reference.html#usestate).

<!-- Links -->
[GlobalState]: ../objects/globalstate.md
[SsrContext]: ../objects/ssrcontext.md
[useAsyncCollection()]: useasynccollection.md
[useAsyncData()]: useasyncdata.md
