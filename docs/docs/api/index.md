---
sidebar_position: 1
---

# Overview

**Environment Variables**
- `REACT_GLOBAL_STATE_DEBUG` - Enables debug logging.

**Components**
- [GlobalStateProvider](/docs/api/components/globalstateprovider) - Provides
  [GlobalState] to its children tree.

**Hooks**
- [getGlobalState()](/docs/api/hooks/getglobalstate) - Gets [GlobalState]
  instance from the context.
- [getSsrContext()](/docs/api/hooks/getssrcontext) - Gets [SsrContext] object
  (the server-side rendering context, which is used to pass global-state-related
  data between rendering iterations).
- [useAsyncCollection()] - Resolves and stores at the given path of global state
  elements of an asynchronous data collection.
- [useAsyncData()] - Resolves asynchronous data, and stores them at the given
  path of global state.
- [useGlobalState()](/docs/api/hooks/useglobalstate) - The primary hook for
  interacting with the global state, modeled after the standard React's
  [useState()](https://reactjs.org/docs/hooks-reference.html#usestate).

**Objects**
- [AsyncDataEnvelope] - Plain JavaScript objects created in the global state by
  [useAsyncData()] and [useAsyncCollection()] hooks to hold loaded async data
  and related meta data.
- [GlobalState] - An object that holds and manages the global state content.
- [SsrContext] - An object that holds global-state-related data persistent
  across multiple SSR (server-side rendering) iterations.

[AsyncDataEnvelope]: /docs/api/objects/asyncdataenvelope
[GlobalState]: /docs/api/objects/globalstate
[SsrContext]: /docs/api/objects/ssrcontext
[useAsyncCollection()]: /docs/api/hooks/useasynccollection
[useAsyncData()]: /docs/api/hooks/useasyncdata
