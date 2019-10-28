# Dr. Pogodin's React Global State

Efficient and simple to use global state management for React, implemented with
hooks, and spiced by useful data management functions (async retrieval, caching,
etc.).

### Content
- [Base example](#base-example)
- [Reference](#reference)
  - [`<GlobalStateProvider />`](#GlobalStateProvider) &ndash; Provides global
    state to its children.
  - [`useGlobalState(path, [initialValue])`](#useGlobalState) &ndash;
    Base global state hook.
  - [`useAsyncData(path, loader, [options])`](#useAsyncData) &ndash;
    Hook for storing async data in the global state.
- [Notes](#notes)

<a name="base-example"></a>

```jsx
/**
 * Base example: ComponentA and ComponentB rely on the same value in the global
 * state. Clicks of the button inside ComponentB update the value rendered by
 * ComponentA.
 */

import React from 'react';
import {
  GlobalStateProvider,
  useGlobalState,
} from '@dr.pogodin/react-global-state';

function ComponentA() {
  const [value] = useGlobalState('some.state.path', 0);
  return <div>Component A: {value}</div>;
}

function ComponentB() {
  const [value, setValue] = useGlobalState('some.state.path', 0);
  return (
    <div>
      <button onClick={() => setValue(value + 1)}>
        &uArr; Bump!
      </button>
    </div>
  );
}

export default function Demo() {
  return (
    <GlobalStateProvider>
      <ComponentA />
      <ComponentB />
    </GlobalStateProvider>
  );
}
```

### Reference

- <a name="GlobalStateProvider"></a>`<GlobalStateProvider />` &ndash;
  Provides global state to its children.
  The `Missing GlobalStateProvider` error is thrown if a library function
  is used inside a component which cannot find a provider up in the component
  hierarchy. Multiple providers can be used, and nested, in the same code.
  In such case a component will see the global state from the closest
  provider up in the component hierarchy.

  **Children** are optional, and they are rendered at the component place.

  **Properties**
  - `[initialState]` (_Any_) &ndash; Optional. Initial global state.

- <a name="useGlobalState"></a> `useGlobalState(path, [initialValue])` &ndash;
  Base global state hook, similar to React's `useState` hook for the local state.
  It subscribes the component to the data located at the given state `path`, and
  also exposes the data update method.

  **Arguments**

  - `path` (_String_) &ndash; State path. It can be undefined to subscribe for
    entire state, though for most practical applications components should
    subscribe for relevant state paths.
    
    Internally, the state is a single
    object, and data are read and written to paths using `lodash`'s
    [`_.get(..)`](https://lodash.com/docs/4.17.15#get) and
    [`_.set(..)`](https://lodash.com/docs/4.17.15#set) methods. Thus, it is
    safe to read, and set paths which have not been set in the state yet.
  
  - `[initialValue]` (_Any_) &ndash; Optional. Initial value. If given, it will
    be set at the path, if the current value at the path is undefined.

  **Returns** `[value, setValue(newValue)]` &ndash; Array with two elements.
  The first one is the value at the path. The second one is the function to
  update the path value.

  Notifications on state updates are async, in the sence that if you update
  the state multiple times from the same syncroneous code, the updates are
  propagated to other components once the current code exits.

  _&uArr; This requires a better explanation!_

- <a name="useAsyncData"></a> `useAsyncData(path, loader, [options])` &ndash;
  Hook for storing async data in the global state and the specified path. When
  different components in your application rely on the same async data (e.g.
  fetched from a remote API), this hook simplifies loading, and reusing these
  data among the components (i.e. load just once, refresh if stale, etc.)

  Given async data `loader` (a function which returns a `Promise` resolving to
  some data), this hook loads data to the specified global state path, ensuring
  that `loader` is triggered a single time even if the hook is called from
  different components (it is assumed that all calls of `useAsyncData(..)` for
  the same `path` rely on the same loader). It remembers the timestamp of data
  retrieval, and the number of components relying on the data. If hook is used
  when data are already present in the state, it reloads the data only if existing
  ones are older than the specified maximum age. It clears stale data from
  the state, when the last component relying on them is dismounted.

  **Arguments**
  - `path` (_String_) &ndash; State path, where all related information will
    be kept.
  - `loader` (_Function_) &ndash; Async function with resolves to the data of
    interest.
  - `[options]` (_Object_) &ndash; Optional. Additional parameters.
    - `[options.maxage]` (_Number_) &ndash; Optional. Maximum age of data
      acceptable to the caller. If data in the state are older than this time [ms],
      the reloading will be initiated.

  **Returns** object with the following fields:
  - `data` (_Any_) &ndash; current data stored at the state.
  - `loading` (_Boolean_) &ndash; `true` if the data are being loaded.
  - `timestamp` (_Number_) &ndash; Timestamp of the data currently loaded into
    the state [ms]. Defaults 5 min.

### Notes

_P.S.: Mind the version 0.0.1. As of now it is a proof-of-concept, which works great in the few tests I did. If you try, and find glitches, please report the bugs, it will help to polish this library faster._
