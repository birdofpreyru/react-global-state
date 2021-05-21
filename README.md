![Master Build Status](https://img.shields.io/circleci/project/github/birdofpreyru/react-global-state/master.svg?label=master)
![Dev Build Status](https://img.shields.io/circleci/project/github/birdofpreyru/react-global-state/devel.svg?label=devel)
![Latest NPM Release](https://img.shields.io/npm/v/@dr.pogodin/react-global-state.svg)
![NPM Downloads](https://img.shields.io/npm/dm/@dr.pogodin/react-global-state.svg)

# React Global State

State of the art approach to the global state and asynchronous data management
in React applications, powered by hooks and Context API. Simple, efficient, with
full server-side rendering (SSR) support.

[Library Reference](https://dr.pogodin.studio/docs/react-global-state/index.html) &bull;
[Blog Article](https://dr.pogodin.studio/dev-blog/the-global-state-in-react-designed-right)

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

    // As you want to keep server latency within a reason, it is a good idea
    // to limit the maximum number of SSR rounds, or the maximum SSR time, or
    // both, and perform any async operations which took too long at the client
    // side.
    const MAX_SSR_ROUNDS = 3;
    const SSR_TIMEOUT = 1000; // 1 second (in milliseconds).

    async function renderServerSide() {
      let render;
      const start = Date.now();
      const ssrContext = { state: {} };
      for (let round = 0; round < MAX_SSR_ROUNDS; round += 1) {
        // SSR round.
        render = ReactDOM.renderToString((
          <GlobalStateProvider
            initialState={ssrContext.state}
            ssrContext={ssrContext}
          >
            <SampleApp />
          </GlobalStateProvider>
        ));

        // SSR round did not altered the global state: we are done.
        if (!ssrContext.dirty) break;

        // Waiting for pending async operations to complete.
        const timeout = SSR_TIMEOUT + start - Date.now();
        const ok = timeout > 0 && await Promise.race([
          Promise.allSettled(ssrContext.pending),
          new Promise((x) => setTimeout(() => x(false), timeout)),
        ]);
        if (!ok) break; // SSR timeout.
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
    ```js
    if (!ssrContext.dirty) break;

    const timeout = SSR_TIMEOUT + start - Date.now();
    const ok = timeout > 0 && await Promise.race([
      Promise.allSettled(ssrContext.pending),
      new Promise((x) => setTimeout(() => x(false), timeout)),
    ]);
    if (!ok) break;
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
    finalize the rest of rendering at the client side. Similarly, the timeout
    condition interrupts SSR and cause the code to serve the current render
    and state, if any pending async operation takes too long, thus compromising
    server latency.

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

[Library Reference](https://dr.pogodin.studio/docs/react-global-state/index.html) &bull;
[Blog Article](https://dr.pogodin.studio/dev-blog/the-global-state-in-react-designed-right)
