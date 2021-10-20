# useAsyncCollection()
```jsx
import { useAsyncCollection } from '@dr.pogodin/react-global-state';

useAsyncCollection(id, path, loader, options = {}): object;
```
Resolves and stores at the given `path` of global state elements of
an asynchronous data collection. In other words, it is an auxiliar wrapper
around [useAsyncData()] hook, which uses a loader which resolves to different
data, based on an ID argument passed in, and stores data fetched for different
IDs in the state.

:::info
For a given pair of `id` and `path` arguments this hook will store at
the `` `${path}.${id}` `` path of the global state an [AsyncDataEnvelope] object
holding the loaded data alongside some related meta-information. That global
state segment can be accessed, and even modified using other hooks,
_e.g_ [useGlobalState()], but doing so you should be careful to not interfere
with the related [useAsyncCollection()] hook logic in an undesireable way.
:::

### Arguments
- `id` - **string** - ID of the collection item to load & use.
- `path` - **string** - The global state path where entire collection should be
  stored.
- `loader` - [AsyncCollectionLoader] - A loader function, which takes an
  ID of data to load, and resolves to the corresponding data.
- `options` - **object** - Optional object with additional settings. The valid
  fields are:
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

## AsyncCollectionLoader
```jsx
function loader(id, oldData): Promise<any>;
```
This is the signature of `loader` function accepted by
[useAsyncCollection()] hook.

### Arguments
- `id` - **string**  - ID of the collection item to load.
- `oldData` - **any** - Previously fetched data for this ID, if any are stored
  in the global state.

### Result
Returns a **Promise** which resolves to the async data loaded for the specified
`id`.

[AsyncCollectionLoader]: #asynccollectionloader
[AsyncDataEnvelope]: /docs/api/objects/asyncdataenvelope
[useAsyncCollection()]: /docs/api/hooks/useasynccollection
[useAsyncData()]: /docs/api/hooks/useasyncdata
[useGlobalState()]: /docs/api/hooks/useglobalstate
