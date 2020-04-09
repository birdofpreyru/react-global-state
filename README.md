![Master Build Status](https://img.shields.io/circleci/project/github/birdofpreyru/react-global-state/master.svg?label=master)
![Dev Build Status](https://img.shields.io/circleci/project/github/birdofpreyru/react-global-state/develop.svg?label=develop)
![Latest NPM Release](https://img.shields.io/npm/v/@dr.pogodin/react-global-state.svg)
![NPM Downloads](https://img.shields.io/npm/dm/@dr.pogodin/react-global-state.svg)

# React Global State

Efficient and simple global state management for React, implemented with hooks,
and spiced by useful data management functions (asyncroneous retrieval, caching,
etc.), and the server-side rendering (SSR) support.

### Content
- [Motivation](#motivation)
- [Setup](#setup)
  - [Base setup](#base-setup)
  - [Server-sider rendering support](#server-side-rendering-support)
- [Reference](#reference)
  - [`<GlobalStateProvider />`](#GlobalStateProvider) &ndash; Provides global
    state to its children.
  - [`useGlobalState(path, [initialValue])`](#useGlobalState) &ndash;
    Base global state hook.
  - [`useAsyncData(path, loader, [options])`](#useAsyncData) &ndash;
    Hook for storing async data in the global state.
  - [`getGlobalState()`](#getGlobalState) &ndash; Gets global state instance.
  - [`getSsrContext([throwWithoutSsrContext=true])`](#getSsrContext) &ndash;
    Hook to access SSR context.
- [Notes](#notes)

### Motivation

The motivation, and the vision, is to bring to the table all useful features
of Redux, without related development overheads, like the amount of required
boilerplate code, and the efforts needed to design, and mainaint actions,
and reducers.

With this library, the introduction of a datum (data piece), shared across
different application components, is as easy as using the local React state:

```jsx
function SampleReactComponent() {
  const [data, setData] = useGlobalState('data.storage.path', initialValue);

  /* `data` value can be updating by calling `setData(newData)` anywhere inside
   * the component code, including inside hooks like `useEffect(..)` or some
   * event handlers. */

  return /* Some JSX markup. */;
}
```

Relying on async data, e.g. loading into the state data from a 3-rd party API,
is similarly easy:

```jsx
async function loader() {

  /* Some async operation to get data, like a call to a 3-rd party API. */

  return data;
}

function SampleReactComponent() {
  const { data, loading, timestamp } = useAsyncData('data.envelop.path', loader);

  /* `data` holds the data loaded into the global state, if they are fresh enough;
   * `loading` signals that data loading (or silent re-loading) is in-progress;
   * `timestamp` is the timestamp of currently loaded `data`. */

  return /* Some JSX markup. */
}
```
&uArr; Behind the scene, the library takes care about updating the component
when the data loading starts, and ends; as well as about the timestamps,
automatic reloading, and garbage collection of aged data.

Related closely to async data is the server-side rendering (SSR). This library
takes it into account, and provides a flexible way to implement SSR with loading
of some, or all async data at the server side.

### Setup

1.  <a name="base-setup"></a> The base setup is simple: just wrap your app into
    the `<GlobalStateProvider>` component, provided by this library, and you'll
    be able to use any library hooks within its child hierarchy.

    ```jsx
    /* The minimal example of the library setup and usage. */

    import React from 'react';
    import {
      GlobalStateProvider,
      useAsyncData,
      useGlobalState,
    } from '@dr.pogodin/react-global-state';

    /* Example of component relying on the global state. */

    function SampleComponent() {
      const [value, setValue] = useGlobalState('sample.component', 0);
      return (
        <button onClick={() => setValue(1 + value)}>
          {value}
        </button>
      );
    }

    /* Example of component relying on async data in the global state. */

    async function sampleDataLoader() {
      return new Promise((resolve) => {
        setTimeout(() => resolve('Sample Data'), 500);
      });
    }

    function SampleAsyncComponent() {
      const { data, loading } = useAsyncData('sample.async-component', sampleDataLoader);
      return data;
    }

    /* Example of the root app component, providing the state.  */

    export default function SampleApp() {
      return (
        <GlobalStateProvider>
          <SampleComponent />
          <SampleAsyncComponent />
        </GlobalStateProvider>
      );
    }
    ```

    Multiple, or nested `<GlobalStateProvider>` instances are allowed, and they
    will provide independent global states to its children (shadowing parent ones,
    in the case of nesting). However, the current SSR implementation assumes
    a single `<GlobalStateProvider>` at the app root. Multiple providers won't
    break it, but won't be a part of SSR data loading either.

    This setup is fine to run both at the client, and at the server-side, but
    in the case of server-side rendering, the library won't run any async data
    fetching, thus rendering pages with the initial global state; e.g. in
    the example above the `<SampleAsyncComponent>` will be rendered as an empty
    node, as `data` will be `undefined`, and `loading` will be `false`.
    To handle SSR better, and to have `<SampleAsyncComponent>` rendered as
    `Sample Data` even at the server-side, you need the following, a bit more
    complex, setup.

2.  Advanced setup with the server-side rendering support is demonstrated below,
    assuming that `<SampleComponent>`, `sampleDataLoader(..)`,
    and `<SampleAsyncComponent>` are defined the same way as in the previous
    example, and `<SampleApp>` component itself does not include
    the `<GlobalStateProvider>`, i.e.

    ```jsx
    export default function SampleApp() {
      return (
        <React.Fragment>
          <SampleComponent />
          <SampleAsyncComponent />
        </React.Fragment>
      );
    }
    ```

    The server-side rendering code becomes:

    ```jsx
    /* Server-sider rendering. */

    import React from 'react';
    import ReactDOM from 'react-dom/server';

    import { GlobalStateProvider } from '@dr.pogodin/react-global-state';

    import SampleApp from 'path/to/app';

    async function renderServerSide() {
      let render;
      const ssrContext = { state: {} };
      for (let round = 0; round < 3; round += 1) {
        render = ReactDOM.renderToString((
          <GlobalStateProvider
            initialState={ssrContext.state}
            ssrContext={ssrContext}
          >
            <SampleApp />
          </GlobalStateProvider>
        ));
        if (ssrContext.dirty) {
          await Promise.allSettled(ssrContext.pending);
        } else break;
      }
      return { render, state: ssrContext.state };
    }
    ```
    &uArr; When `ssrContext` property is passed into the `<GlobalStateProvider>`,
    the corresponding global state object switches into the SSR mode. In this mode,
    if the app rendering modifies the state, the `ssrContext.dirty` flag is set
    `true`, and for any async operations, triggered by the library hooks,
    corresponding promises are added into the `ssrContext.pending` array.
    Thus, the block of code
    ```
    if (ssrContext.dirty) {
      await Promise.allSettled(ssrContext.pending);
    } else break;
    ```
    in the case when last rendering pass triggered async operations, it waits
    for them to complete, and repeats allows the rendering pass to be redone
    with the new initial value of the global state, which is written to
    `ssrContext.state` in this case. If no updates to the state happened
    in the last rendering pass, this block breaks out of the loop, giving
    you in the `render` variable the HTML markup to send to the client, and
    in the `ssrContext.state` the initial value of the global state to use
    for app initialization at the client side.

    The outer `for` loop serves to protect against possible long re-rendering
    loops: if after several re-renders the state has not become stable, it is
    fine to send to the client side the latest render and state results, and
    finalize the rest of rendering at the client side.

    In case when some async operations are too long to wait for them during SSR,
    the async hooks accept `noSSR` option, to be ignored during SSR. Additional
    option is to wrap the rendering cycle into a timeout race codition, and if
    the desired rendering time has bit hit, the rendering loop can be interrupted,
    and the latest render and state can be sent to the client side.

    The corresponding client-side rendering is simple, just pass the state
    calculated during the server-side rendering into the `initialState` prop
    of `<GlobalStateProvider>` at the client side:

    ```jsx
    /* Client-side rendering. */

    import React from 'react';
    import ReactDOM from 'react-dom';

    import { GlobalStateProvider } from '@dr.pogodin/react-global-state';

    import SampleApp from 'path/to/app';

    function renderClientSide(stateFromServerSide) {
      ReactDOM.hydrate((
        <GlobalStateProvider initialState={stateFromServerSide}>
          <SampleApp />
        </GlobalStateProvider>
      ), document.getElementById('your-react-view'));
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

  - `[ssrContext]` (_Object_) &ndash; Optional. Switches provided state into
    the SSR mode. In this state, async operations will be executed in the optimal
    way, and the following fields will be written to `ssrContext` on the exit
    from the rendering pass:
    - `ssrContext.dirty` (_Boolean_) &ndash; Will be set `true`, if the state
      was altered during the pass, including some async operations started.
    - `ssrContext.pending` (_Promise[]_) &ndash; Array of promises which will
      resolve or reject once all async operations triggered by the render pass,
      are completed. Do `await Promise.allSettled(ssrContext.pending)` to wait
      until the rendering pass can be repeated with the updated state.
    - `ssrContext.state` (_Any_) &ndash; Will contain the resulting state after
      the rendering pass, including the results of async operations.

  - `[stateProxy]` (_Boolean_ | _GlobalState_) &ndash; Optional. If set `true`,
    the provider will act as proxy, i.e. it will re-use the state from a parent
    provider, instead of creating a new one. If set an instance of the global
    state object, that global state will be used. This is useful for
    code-splitting with SSR support.

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
  
  - `[initialValue]` (_Any_) &ndash; Optional. Initial value or its factory.
    - If a function is provided, it will be executed only once, when the initial
      value has to be set, and the value returned by the function will be used
      as the initial value. This matches
      [Lazy initial state feature of React's `useState(..)`](https://reactjs.org/docs/hooks-reference.html#lazy-initial-state).
    - Otherwise the value itself will be used as the initial value.

  **Returns** `[value, setValue(newValue)]` &ndash; Array with two elements.
  The first one is the value at the path. The second one is the function to
  update the path value.

  Notice:
    - `setValue(newValue)` supports functional updates: if you pass in
      a function, that function will be called with the previous value as its
      argument, and the result will be used as the new value. This matches
      [Functional updates feature of React's `useState(..)`](https://reactjs.org/docs/hooks-reference.html#functional-updates).
    - `setValue(..)` is stable, and won't change on re-renders (again, same as
      the React's `setState(..)` functions returned by `useState(..)` hook).

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
    - `[options.deps]` (_any[]_) Optional. The array of dependencies to watch
      for changes (in the sence the standard React's `useEffect()` hook watches
      the changes in its last depdendencies argument), and to attempt reload of
      async data when any value in the array changes. The actual reloads are
      still restricted by the timestamp of currently loaded data (if any),
      and by `maxage`, `refreshAge` settings.
    - `[options.maxage]` (_Number_) &ndash; Optional. Maximum age of data
      acceptable to the caller. If data in the state are older than this time [ms],
      the reloading will be initiated.
    - `[options.refreshAge]` (_Number_) &ndash; Optional. Maximum age of data
      which will not trigger data update. Defaults to the `maxage` value.
    - `[options.garbageCollectAge]` (_Number_) &ndash; Optional. Maximum age
      of data after which they will be dropped from the state, if no objects
      reference to them.
    - `[options.noSSR]` (_Boolean_) &ndash; Optional. If `true` this async
      operation will be ignored during the SSR rendering.

  **Returns** object with the following fields:
  - `data` (_Any_) &ndash; current data stored at the state.
  - `loading` (_Boolean_) &ndash; `true` if the data are being loaded.
  - `timestamp` (_Number_) &ndash; Timestamp of the data currently loaded into
    the state [ms]. Defaults 5 min.

- <a name="getSsrContext"></a> `getSsrContext([throwWithoutSsrContext=true])`
  &ndash; Hook to access SSR context from React components.

  In most use cases you don't need to access SSR context directly from your
  components. For SSR you just provide SSR context to the state provider,
  and read its resulting state directly after the render (see SSR example
  above). This hook is introduced to implement code-splitting with full SSR
  support, in a scenario when some components need additional data to be passed
  to them during SSR.

  Returns the SSR context, or throws if it does not exist. The optional
  `throwWithoutSsrContext` argument can be set to `false` to not throw if
  the context does not exist. In any case, this hook still throws if entire
  global state (i.e. `<GlobalStateProvider>`) is missing.

- <a name="getGlobalState"></a> `getGlobalState()` &ndash; Hook to get
  the actual `GlobalState` instance. In all practical usecases you want
  to use [`useGlobalState(..)`](useGlobalState) hook instead. This one is
  only intended for advanced usecases, like code-splitting, and SSR support,
  where the same global state instance should be shared between independently
  rendered React trees.

### Notes

_P.S.: Mind the early version! As of now it is a proof-of-concept, which works great in my tests, but lacks some features, and optimizations I have in my mind._
