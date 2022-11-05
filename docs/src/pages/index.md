# React Global State

**React Global State** is a state of the art library for the global state and
asynchronous data management in [React] applications, powered by [hooks] and
[Context API]. It is simple, efficient, and features a full SSR (server-side
rendering) support.

[![Sponsor](../../static/img/sponsor.png)](https://github.com/sponsors/birdofpreyru)

## Motivation

The motivation and vision behind this project is to bring to the table all
useful features of [Redux], without related development overheads, like
the amount of necessary boilerplate code, and the efforts needed to design
and maintain actions and reducers.

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

Relying on async data, _e.g._ loading into the state data from a 3-rd party API,
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
&uArr; _Behind the scene, the library takes care about updating the component
when the data loading starts and ends, also about the timestamps, automatic
reloading, and garbage collection of aged data._

Related closely to async data is the server-side rendering (SSR). This library
takes it into account, and provides a flexible way to implement SSR with loading
of some, or all async data at the server side.

## Further Reading
- [Getting Started](/docs/tutorials/getting-started)
- [Blog Article](https://dr.pogodin.studio/dev-blog/the-global-state-in-react-designed-right)

## Frequently Asked Questions {#faq}

- _Does React Global State library avoid unnecessary component re-renders when values updated in the global state are irrelevant to those components?_

  Yes, it does avoid unnecessary re-renders of the component tree. A component
  relying on `some.path` in the global state is re-rendered only when the value
  at this path, or its sub-path has changed; _i.e._ it will be re-rendered if
  the value at `some.path` has changed, and it will be re-rendered if the value
  at `some.path.sub.path` has changed.

- _How would you describe your use case compared to another React global state library, e.g. [Valtio](https://www.npmjs.com/package/valtio)?_

  1.  React Global State is designed to follow the standard React API as close
      as possible. _E.g._ if some component relies on the local state:
      ```jsx
      const [value, setValue] = useState(initialState);
      ```
      to move that value to the global state (or _vice versa_) one only needs to
      replace the hook with
      ```jsx
      const [value, setValue] = useGlobalState(path, initialState);
      ```
      The [useGlobalState()] hook takes care to follow all edge cases of the
      standard [useState()]: `setValue` setter identity is stable (does not
      change on re-renders), functional updates and lazy initial state are
      supported.

      Other libraries tend to re-invent the wheel, introducing their own APIs,
      which (i) should be learned and understood; (ii) do complicate migration
      of components between the local and global state, should it be needed in
      a course of app development / prototyping.

  2.  When it comes to async data in the global state other libraries tend to
      offer only a very basic supported, often relying on experimental or internal
      React mechanics.

      React Global State, [useAsyncData()] and [useAsyncCollection()] hooks in
      particular, implements async data fetching and management features: when
      multiple components use these hooks to load async data to the same global
      state path the library takes care to do the actual loading just once, and
      then keep the data without reloading until their age reaches (configurable)
      max age. There is an automated garbage collection of expired, non-used
      async data from the global state; there is server-side rendering (SSR)
      support, with suggested high-level setup taking care that all async data
      loaded using [useAsyncData()] and [useAsyncCollection()] hooks will be
      automatically loaded and used in server-side renders (still allowing to
      opt-out of that for individual hooks, and timeout server-side fetching of
      data that take too long to arrive, in which case the library will fetch
      such data client-side). It does not rely on experimental React APIs to
      achieve its functionality, it only uses current public APIs.

      For me the support of async data fetching into the global state and their
      further management with out-of-the-box SSR support was the primary
      motivation to create React Global State. There are many other global state
      React libraries, but I was not able to find any that would cover the async
      data handling with that ease I believed was possible. The secondary
      motivation was that existing global state libraries either had
      the shortcoming of unnecessary component re-renders when data irrelevant
      to them where updated in the global state, or introduced their
      own APIs, where following the standard React APIs for local state looks
      to me a way more convenient approach.

- _Is React Global State library production ready (considering the current version number 0.y.z)?_

  Yes. I personally use it in production for all my commercial and personal
  React projects for over an year. I just don't feel like to call it v1 until
  a reasonable adoption by 3rd party developers, and any API improvements that
  may come out of community experience.

[Context API]: https://reactjs.org/docs/context.html
[functional updates]: https://reactjs.org/docs/hooks-reference.html#functional-updates
[Hooks]: https://reactjs.org/docs/hooks-intro.html
[lazy initial state]: https://reactjs.org/docs/hooks-reference.html#functional-updates
[React]: https://reactjs.orgs
[Redux]: https://redux.js.org
[useAsyncCollection()]: /docs/api/hooks/useasynccollection
[useAsyncData()]: /docs/api/hooks/useasyncdata
[useGlobalState()]: /docs/api/hooks/useglobalstate
[useState()]: https://reactjs.org/docs/hooks-reference.html#usestate
