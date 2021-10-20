# useAsyncData()
```jsx
import { useAsyncData } from '@dr.pogodin/react-global-state';

useAsyncData(path, loader, options = {}): object;
```
Resolves asynchronous data, and stores them at the given `path` of global
state. When multiple components rely on asynchronous data at the same `path`,
the data are resolved once, and reused until their age is within specified
bounds. Once the data are stale, the hook allows to refreshes them. It also
garbage-collects stale data from the global state when the last component
relying on them is unmounted.

:::info
The hook stores loaded async data and related meta data at the `path` of global
state in form of [AsyncDataEnvelope] object. That global state segment can be
accessed, and even modified using other hooks,
_e.g_ [useGlobalState()], but doing so you should be careful to not interfere
with the related [useAsyncData()] hook logic in an undesireable way.
:::

### Arguments
- `path` - **string** - Dot-delimitered state path, where data envelope is stored.
- `loader` - [AsyncDataLoader] - Asynchronous function which resolves (loads)
  async data, which should be stored at the global state `path`. When multiple
  components use [useAsyncData()] hook for the same `path`, the library assumes
  that all hook instances are called with the same `loader` (_i.e._ whichever of
  these loaders is used to resolve async data, the result is acceptable to be
  reused in all related components).
- `options` - **object** - Optional object with additional parameters:
  - `deps` - **any[]** - An array of dependencies to watch. If provided,
  the hook will reload async data when any of these dependencies changes.
  Given dependencies are watched shallowly.
  - `noSSR` - **boolean** - Set **true** to opt-out of loading async data
    during the server-side rendering.
  - `garbageCollectAge` - **number** - The maximum age of data (in milliseconds)
    after which they are dropped from the global state when the last component
    referencing them via [useAsyncCollection()] or [useAsyncData()] hook
    unmounts. Defaults to the value of `maxage` option.
  - `maxage` - **number** - The maximum age of data (in milliseconds) acceptable
    to the hook's caller. If loaded data stored in the global state are older
    than this value **null** is returned instread of the loaded data.
    Defaults to 5 minutes.
  - `refreshAge` - **number** - The maximum age of data (in milliseconds) after
    which their refresh is triggered when any component referencing them via
    [useAsyncCollection()] or [useAsyncData()] hook is (re-)rendered.
    Defaults to the value of `maxage` option.

### Result
Returns an **object** with the following fields:
- `data` - **any** - Async data loaded in the last `loader` invokation, if any,
  and if satisfy the `maxage` limit; **null** otherwise.
- `loading` - **boolean** - **true** if the data are being loaded
  (_i.e._ the hook is currently waiting for the result of a `loader` function's
  invokation).
- `timestamp` - **number** - Unix timestamp (in milliseconds) of async data
  currently loaded into the global state, if any.
  :::caution
  If `data` is **null** because async data loaded into the state do not satisfy
  the `maxage` limit, the value of `timestamp` still will correspond to the time
  when those async data were loaded into the state.
  :::

## AsyncDataLoader
```jsx
function loader(oldData): Promise<any>;
```
This is the signature of `loader` function accepted by [useAsyncData()] hook.

### Arguments
- `oldData` - **any** - Previously loaded async data currently stored at
  the `path`, if any.

### Result
Returns a **Promise** which resolves to the async data.

[AsyncDataEnvelope]: /docs/api/objects/asyncdataenvelope
[AsyncDataLoader]: #asyncdataloader
[useAsyncCollection()]: /docs/api/hooks/useasynccollection
[useAsyncData()]: /docs/api/hooks/useasyncdata
[useGlobalState()]: /docs/api/hooks/useglobalstate
