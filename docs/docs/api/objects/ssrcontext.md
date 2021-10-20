# SsrContext

An [SsrContext] object holds global-state-related data persistent across
multiple SSR (server-side rendering) iterations.

:::info
[SsrContext] objects are just plain JS objects with the fields documented below.

For the first SSR iterations any object, including the empty one `{}`, may be
provided to the [GlobalStateProvider]: the necessary fields will be automatically
(re-)initialized as needed. Any other object fields won't be touched, thus you
may use the object to keep other data needed across SSR iterations for you app,
and you can access the current [SsrContext] from within a [React] component
using the [getSsrContext()] hook.
:::

## Fields
- `dirty` - **boolean** - **true** means the global state content has been
  modified during the last SSR iteration; **false** means the opposite.
- `pending` - **Promise[]** - An array of unresolved promises (pending async
  operations) that should be awaited prior to the next SSR iteration
  (see [useAsyncData()]).
- `state` - **any** - Entire global state content at the end of the last SSR
  iteration.

[getSsrContext()]: /docs/api/hooks/getssrcontext
[GlobalStateProvider]: /docs/api/components/globalstateprovider
[React]: https://reactjs.org
[SsrContext]: /docs/api/objects/ssrcontext
[useAsyncData()]: /docs/api/hooks/useasyncdata
