# UseAsyncDataOptionsT
```ts
import { type UseAsyncDataOptionsT } from '@dr.pogodin/react-global-state';
```
[UseAsyncDataOptionsT] is the type of settings object accepted by
[useAsyncData()] and [useAsyncCollection()] hooks.

## Fields
**All fields are optional.**

- `deps` &mdash; **any[]** &mdash; An array of dependencies to watch. If provided,
  the hook will reload async data when any of these dependencies changes.
  Given dependencies are watched shallowly, and since library **v0.11.0**
  they are tracked per the global state path, rather than per a hook instance.

- `disabled` &mdash; **boolean** &mdash; With this flag set _true_ the hook will
  not trigger (re-)loads of requested data, nor will it change the reference
  count for the data path, nor will it attempt garbage collection on the path.

  However, it will still watch the global state segment &laquo;lazily&raquo;,
  its result will reflect the current state of that segment, and updates to that
  segment will trigger re-renders of the component that mounted this hook.

  :::note
  This option was introduced in the library **v0.17.5** as a way to signal that
  the component using this hook does not need requested data at the moment, thus
  the hook should not attempt to (re-)load them. The current behavior explained
  above seems to cover that need in the best way, however it might be adjusted
  in the future versions according to the in-field experience of using this
  option.
  :::

- `noSSR` &mdash; **boolean** &mdash; Set _true_ to opt-out of loading async data
  during the server-side rendering.

- `garbageCollectAge` &mdash; **number** &mdash; The maximum age of data (in milliseconds)
  after which they are dropped from the global state when the last component
  referencing them via [useAsyncCollection()] or [useAsyncData()] hook
  unmounts. Defaults to the value of `maxage` option.

- `maxage` <Link id="maxage" /> &mdash; **number** &mdash; The maximum age of data (in milliseconds) acceptable
  to the hook's caller. If loaded data stored in the global state are older
  than this value **null** is returned instread of the loaded data.
  Defaults to 5 minutes.

- `refreshAge` &mdash; **number** &mdash; The maximum age of data (in milliseconds) after
  which their refresh is triggered when any component referencing them via
  [useAsyncCollection()] or [useAsyncData()] hook is (re-)rendered.
  Defaults to the value of `maxage` option.

[useAsyncCollection()]: /docs/api/hooks/useasynccollection
[UseAsyncDataOptionsT]: #
[useAsyncData()]: /docs/api/hooks/useasyncdata
