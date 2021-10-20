# React Global State

**React Global State** is a state of the art library for the global state and
asynchronous data management in [React] applications, powered by [hooks] and
[Context API]. It is simple, efficient, and features a full SSR (server-side
rendering) support.

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

[Context API]: https://reactjs.org/docs/context.html
[Hooks]: https://reactjs.org/docs/hooks-intro.html
[React]: https://reactjs.orgs
[Redux]: https://redux.js.org
