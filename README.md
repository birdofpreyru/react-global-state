![Master Build Status](https://img.shields.io/circleci/project/github/birdofpreyru/react-global-state/master.svg?label=master)
![Dev Build Status](https://img.shields.io/circleci/project/github/birdofpreyru/react-global-state/devel.svg?label=devel)
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
  - [Environment Variables](#EnvironmentVariables)
    - [`REACT_GLOBAL_STATE_DEBUG` (environment variable)](#REACT_GLOBAL_STATE_DEBUG)
  - [API](#api-section)
    - [`<GlobalStateProvider ... />`](#GlobalStateProvider)
    - [`useGlobalState(path: string, initialValue?: any): array`](#useGlobalState)
    - [`useAsyncData(path: string, loader: () => Promise<any>, options?: object): Promise<object>`](#useAsyncData)
    - [`useAsyncCollection(id: string, path: string, loader: (id: string) => Promise<any>, options?: object): Promise<object>`](#useAsyncCollection)
    - [`getSsrContext(throwWithoutSsrContext?: boolean = true): object`](#getSsrContext)
    - [`getGlobalState(): GlobalState`](#getGlobalState)

### Motivation

The motivation and vision is to bring to the table all useful features
of Redux, without related development overheads, like the amount of required
boilerplate code, and the efforts needed to design and maintain actions
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
is the same easy:

```jsx
async function loader() {

  /* Some async operation to get data, like a call to a 3-rd party API. */

  return data;
}

function SampleReactComponent() {
  const { data, loading, timestamp } = useAsyncData('data.envelope.path', loader);

  /* `data` holds the data loaded into the global state, if they are fresh enough;
   * `loading` signals that data loading (or silent re-loading) is in-progress;
   * `timestamp` is the timestamp of currently loaded `data`. */

  return /* Some JSX markup. */
}
```
&uArr; Behind the scene, the library takes care about updating the component
when the data loading starts and ends, also about the timestamps, automatic
reloading, and garbage collection of aged data.

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
    for them to complete, and allows the rendering pass to be redone
    with the new initial value of the global state, which is written to
    `ssrContext.state` in this case. If no updates to the state happened
    in the last rendering pass, this block breaks out of the loop, leaving
    to you in the `render` variable the HTML markup to send to the client,
    and in the `ssrContext.state` the initial value of the global state to use
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

_Each list item below describes a named export from the library._
_A TypeScript-like syntax is employed below to document arguments, props,_
_and return value types._

<a name="EnvironmentVariables"></a>
**Environment Variables**

- <a name="REACT_GLOBAL_STATE_DEBUG"></a>
  `REACT_GLOBAL_STATE_DEBUG` &ndash; When this environment variable is set or
  injected via Webpack, the library will log into the console state mutations,
  thus facilitating the development based on ReactGlobalState.

<a name="api-section"></a>
**API**

- <a name="GlobalStateProvider"></a>
  `<GlobalStateProvider ... />` &ndash; Provides a global state to its children.
  Library functions throw the `Missing GlobalStateProvider` error if called from
  a component having no global state provider up in their parent hierarchy.
  Multiple providers can be used in a code, and they can be nested. In such case
  a component will see the global state provided by the closest provider up in
  its parent hierarchy.

  **Properties**
  - `children?: any` &ndash; Optional. The content to render at the provider's
    position, and to provide the global state to.
  - `initialState?: any` &ndash; Optional. Initial global state value.
  - `ssrContext?: object` &ndash; Optional. If given, enables the server-side
    rendering (SSR) mode. In this mode async operations are executed in the way
    optimal for SSR, and the following fields are added to `ssrContext` object
    during each rendering pass:
    - `ssrContext.dirty: boolean` &ndash; `true` if the global state has been
      altered during the rendering pass.
    - `ssrContext.pending: Promise[]` &ndash; The array of promises to wait for
      prior to repeating the SSR pass.
    - `ssrContext.state: any` &ndash; The global state value after the current
      rendering pass.
  - `stateProxy?: boolean|GlobalState` &ndash; Optional. If `true` this provider
    will act as a proxy, i.e. it will reuse the state from the parent provider,
    instead of creating a new one. If it is an instance of `GlobalState` class
    this instance is used. This argument allows to implement code-splitting with
    SSR support.
  <hr />


- <a name="useGlobalState"></a>
  `useGlobalState(path: string, initialValue?: any): array` &ndash; The base
  global state hook, similar to the standard React's `useState(..)`. Subscribes
  the component to data localted at the given `path` of the global state, and
  also provides the data update method.

  **Arguments**

  - `path: string` &ndash; State path. It can be undefined to subscribe for
    entire state, though for most practical applications components should
    subscribe for relevant state paths.
    
    Internally, the state is a single
    object, and data are read and written to paths using `lodash`'s
    [`_.get(..)`](https://lodash.com/docs/4.17.15#get) and
    [`_.set(..)`](https://lodash.com/docs/4.17.15#set) methods. Thus, it is
    safe to read, and set paths which have not been set in the state yet.
  
  - `initialValue?: any` &ndash; Optional. Initial value or its factory.
    - If a function is provided, it will be executed only once, when the initial
      value has to be set, and the value returned by the function will be used
      as the initial value. This matches
      [Lazy initial state feature of React's `useState(..)`](https://reactjs.org/docs/hooks-reference.html#lazy-initial-state).
    - Otherwise the value itself will be used as the initial value.

  **Result**
  - `[value: any, setValue: (newValue: any) => undefined]` &ndash; Array with
    two elements: the value at the reqested path of global state, and the setter
    function which updates that value.

    Note:
    - `setValue: (newValue: any) => undefined` supports functional updates:
      if `newValue` is a function, it is called with the previous value as
      the argument, and its result is set as the new value. This behavior
      matches the [Functional updates feature of React's `useState(..)`](https://reactjs.org/docs/hooks-reference.html#functional-updates).
    - `setValue: (newValue: any) => undefiend` is stable, i.e. it does not
      change when the component is re-rendered (again, it matches behavior
      of the settter returned by the standard React's `setState(..)` hook).

  State update notifications are asyncroneous. If your code updates the state
  many times during a rendering pass, all update notifications are queued and
  dispatched after the current rendering pass completes.
  <hr />

- <a name="useAsyncData"></a>
  `useAsyncData(path: string, loader: () => Promise<any>, options?: object): Promise<object>`
  &ndash; The hook for storing async data in the global state at the specified path.
  When different components in your application rely on the same async data (e.g.
  fetched from a remote API), this hook simplifies loading, and reusing these
  data among different components (i.e. load just once, refresh if stale, etc.)

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

  - `path: string` &ndash; The state path, where all related information will
    be kept.
  - `loader: () => Promise<any>` &ndash; Async data loader, i.e. an async
    function returning a promise which resolves to the loaded data.
  - `options?: object` &ndash; Optional. Additional parameters.
    - `options.deps?: any[] = []` Optional. The array of dependencies to watch
      for changes (in the sence the standard React's `useEffect()` hook watches
      the changes in its last depdendencies argument), and to attempt reload of
      async data when any value in the array changes. The actual reloads are
      still restricted by the timestamp of currently loaded data (if any),
      and by `maxage`, `refreshAge` settings.
    - `options.maxage?: number = 5 * 60 * 1000` &ndash; Optional. The maximum age
      of data acceptable to the caller. If data in the state are older than this
      time [ms], `null` is returned until the data are reloaded. Defaults to
      5 minutes.
    - `options.refreshAge?: number = options.maxage` &ndash; Optional. The maximum
      age of data which will not trigger data update. Defaults to the `maxage`
      value.
    - `options.garbageCollectAge?: number = options.maxage` &ndash; Optional.
      The maximum age of data after which they will be dropped from the state,
      if no objects reference to them. Defaults to the `maxage` value.
    - `options.noSSR?: boolean` &ndash; Optional. If `true` this async
      operation will be ignored during the SSR rendering.

  **Result**
  - `Promise<object>` Resolves to the object with following fields:
    - `data: any` &ndash; The current data stored in the state.
    - `loading: boolean` &ndash; `true` if the data are being loaded.
    - `timestamp: number` &ndash; The timestamp of the data currently loaded
      into the state [ms].
  <hr />

- <a name="useAsyncCollection"></a>
  `useAsyncCollection(id: string, path: string, loader: (id: string) => Promise<any>, options?: object): Promise<object>`
  &ndash; The hook for storing an async collection of data at the specified
  global state path.

  **Arguments**
  - `id: string` &ndash; ID of the collection item to return.
  - `path: string` &ndash; The global state path at which the entire collection
    will be stored.
  - `loader: (id: string) => Promise<any>` &ndash; An async data loader, which
    given an ID of collection item loads it asyncroneously and returns to
    the caller.
  - `options?: object` &ndash; Optional. Additional options.
    - `options.deps?: any[] = []` Optional. The array of dependencies to watch
      for changes (in the sence the standard React's `useEffect()` hook watches
      the changes in its last depdendencies argument), and to attempt reload of
      async data when any value in the array changes. The actual reloads are
      still restricted by the timestamp of currently loaded data (if any),
      and by `maxage`, `refreshAge` settings.
    - `options.maxage?: number = 5 * 60 * 1000` &ndash; Optional. The maximum age
      of data acceptable to the caller. If data in the state are older than this
      time [ms], `null` is returned until the data are reloaded. Defaults to
      5 minutes.
    - `options.refreshAge?: number = options.maxage` &ndash; Optional. The maximum
      age of data which will not trigger data update. Defaults to the `maxage`
      value.
    - `options.garbageCollectAge?: number = options.maxage` &ndash; Optional.
      The maximum age of data after which they will be dropped from the state,
      if no objects reference to them. Defaults to the `maxage` value.
    - `options.noSSR?: boolean` &ndash; Optional. If `true` this async
      operation will be ignored during the SSR rendering.

  **Result**
  - `Promise<object>` Resolves to the object with following fields:
      - `data: any` &ndash; The current data stored in the state.
      - `loading: boolean` &ndash; `true` if the data are being loaded.
      - `timestamp: number` &ndash; The timestamp of the data currently loaded
        into the state [ms].
  <hr />

- <a name="getSsrContext"></a>
  `getSsrContext(throwWithoutSsrContext?: boolean = true]): Context`
  &ndash; The hook to access the closest SSR context from React components.

  In most use cases you don't need to access SSR context directly from your
  components. For SSR you just provide SSR context to the state provider,
  and read its resulting state directly after the render (see SSR example
  above). This hook is introduced to implement code-splitting with full SSR
  support, in a scenario when some components need additional data to be passed
  to them during SSR.

  **Arguments**
  - `throwWithoutSsrContext?: boolean = true` &ndash; Optional. Specifies
    whether the hook should throw if no SSR context exist. Default `true`.
    In any case, the hook will still throw if the entire global state is missing
    (i.e. there is no [`<GlobalStateProvider ... />`](#GlobalStateProvider)
    in the parent component hierarchy).

  **Result**
  - `object` &ndash; SSR context. See documentation of
    the [`<GlobalStateProvider ... />`](#GlobalStateProvider) component,
    in particular the `ssrContext` argument.
  <hr />

- <a name="getGlobalState"></a>
  `getGlobalState(): GlobalState` &ndash; The Hook to get `GlobalState` instance
  from the closest global state context. In all practical usecases you want
  to use the [`useGlobalState(..)`](useGlobalState) hook instead. This one is
  only intended for advanced usecases, like code-splitting, and SSR support,
  where the same global state instance should be shared between independently
  rendered React trees.
