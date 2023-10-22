# SsrContext
```ts
import { SsrContext } from '@dr.pogodin/react-global-state';
```

The [SsrContext] class implements a storage for data that should be persistent
across multiple SSR (server-side rendering) iterations. As a part of this library,
its primary purpose is to keep data related to the global state, but you may also
sub-class and use it to keep any other data that are required for rendering in
your app, and need to be persistent across SSR iterations. In either case, for
SSR purposes you provide an instance of [SsrContext] to your [GlobalStateProvider],
and then you may access it from within React components using the [getSsrContext()]
hook.

:::info
Prior to **v0.10.x** versions of the library there was no dedicated [SsrContext]
class, and any JS object could play its role. This still works with JS-flavour
of the library in its **v0.10.x** versions, but it can change in future, thus
you are encouraged to start using [SsrContext] class in your SSR setup, if any.
:::

## Generic Parameters
[StateT]: #state-type

In TypeScript version, [SsrContext] is a generic class
```ts
class SsrContext<StateT>;
```
with a single parameter:

- `StateT` <a id="state-type"></a> &mdash; The type of global state object,
  used in [constructor()] and [`state` field].

:::tip
Alternatively you may use [API] interface to get
[SsrContext] variant with "locked-in" [StateT]:

```ts
import RGS, { type API } from '@dr.pogodin/react-global-state';

const { SsrContext } = RGS as API<StateT>;
```
:::

## Fields
[`state` field]: #state-field

- `dirty` &mdash; **boolean** &mdash; _true_ if `state` was modified within
  the last SSR iteration; _false_ otherwise.
- `pending` &mdash; **Promise[]** &mdash; An array of unresolved promises
  (pending async operations) that should be awaited prior to the next SSR
  iteration (see [useAsyncData()]).
- `state` <a id="state-field" /> &mdash; [StateT] | **undefined** &mdash;
  Entire global state at the end of the last SSR iteration. Can be _undefined_
  prior to the first SSR pass.

## Methods

### constructor()
[constructor()]: #constructor
```ts
const ssrContext = new SsrContext<StateT>(state?: StateT);
```
Creates a new [SsrContext] instance.
- `state` &mdash; [StateT] | **undefined** &mdash; Optional. The initial
  value for [`state` field], which can be left _undefined_, to start the render
  with default initial state.

[API]: /docs/api/types/api
[getSsrContext()]: /docs/api/hooks/getssrcontext
[GlobalStateProvider]: /docs/api/components/globalstateprovider
[SsrContext]: /docs/api/classes/ssrcontext
[useAsyncData()]: /docs/api/hooks/useasyncdata
