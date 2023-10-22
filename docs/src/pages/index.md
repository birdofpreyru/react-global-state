import TsNote from '../../docs/api/_ts-note.md';

# React Global State

[![Latest NPM Release](https://img.shields.io/npm/v/@dr.pogodin/react-global-state.svg)](https://www.npmjs.com/package/@dr.pogodin/react-global-state)
[![NPM monthly downloads](https://img.shields.io/npm/dm/@dr.pogodin/react-global-state)](https://www.npmjs.com/package/@dr.pogodin/react-global-state)
[![CircleCI](https://dl.circleci.com/status-badge/img/gh/birdofpreyru/react-global-state/tree/master.svg?style=shield)](https://app.circleci.com/pipelines/github/birdofpreyru/react-global-state)
[![GitHub Repo stars](https://img.shields.io/github/stars/birdofpreyru/react-global-state?style=social)](https://github.com/birdofpreyru/react-global-state)

**React Global State** is a state of the art library for the global state and
asynchronous data management in [React] applications, powered by [hooks] and
[Context API]. It is simple, efficient, and features a full SSR (server-side
rendering) support.

[![Sponsor](../../../.README/sponsor.svg)](https://github.com/sponsors/birdofpreyru)

<TsNote />

## Motivation (JavaScript)

_**TypeScript**-specific nuances are explained in the next section._

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

## Motivation (TypeScript)

As many real-world projects nowadays are developed in TypeScript (justified so,
or for all wrong reasons), a&nbsp;good JavaScript library has support TypeScript,
and take a full advantage of its features, when available. It is worth reminding,
TypeScript does _static, compile-time type-checks_, thus we cannot, and are not
aiming to use its features for an exhaustive global state validation, casting,
_etc._, which would require dedicated runtime features, and goes beyond
the (current) scope of our library. We rather have the following aims with our
TypeScript support:

- In cases when static typing with TypeScript is able to evaluate the exact type
  of value on a given global state path, we want to use it for type checks.

- In cases when TypeScript is not able to evaluate, or is wrong about the exact
  type of value on a given global state path, we want to be able to force it to
  assume the type we need, whether it is correct or wrong.

- We want to have it very clear from the code, whether TypeScript's type
  resolution checked, and verified a value type, or wether we forced it under
  our own responsibility.

Regarding the evaluation of exact value type on a given global state path,
TypeScript is able to do it when the path string type can be reduced to
a _string literal type_, that describes a valid global state path,
and the type of global state is well-defined along that path. For example:

```ts
import RGS, { type API, type ForceT} from '@dr.pogodin/react-global-state';

type StateT = { some: { path: string }};

// This call returns a set of React components and hooks "locked-in" into
// the same specified state path.
const { useGlobalState } = RGS as API<StateT>;

function SampleReactComponent() {
  // Here TypeScript will automatically resolve "string" as the correct type of
  // `dataA` value and `setDataA` argument (`setDataA` will also accept a correct
  // state update function).
  const [dataA, setDataA] = useGlobalState('some.path');

  // This will report a TypeScript error: "unknown.path" is not a correct path
  // inside our `StateT` type, and thus our library (in TS), by default, rejects
  // to write/read it, although for its runtime implementation it is a legit
  // operation: in the first call to an unknown path, the given initial value,
  // `123`, will be written to that state path, then any hook related to that
  // path will work as usual. This default TS behavior is on purpose, to make
  // its clear that TS does not know given path (the type of value on that path),
  // and thus the user must force it, if he is sure about it.
  const dataB = useGlobalState('unknown.path', 123)[0];

  // This variant forces "number" value type on that unknown path.
  const dataC = useGlobalState<ForceT, number>('unknown.path', 123)[0];

  return /* Some JSX markup. */;
}
```

Here is a brief exampe of async data loading with TS-flavour of this library:

```ts
import RGS, {
  type API,
  type AsyncDataEnvelopeT,
  type ForceT,
} from '@dr.pogodin/react-global-state';

// `AsyncDataEnvelopeT<DataT>` type describes a state segment with stores
// data of given type `DataT`, managed by `useAsyncData()` hook(s).
type StateT = { some: { path: AsyncDataEnvelopeT<string> }};

// This call returns a set of React components and hooks "locked-in" into
// the same specified state path.
const { useAsyncData } = RGS as API<StateT>;

async function loader(): string {
  //-------------------------------------------------------------------
  // Some async operation to get data, like a call to a 3-rd party API.
  //-------------------------------------------------------------------
  return 'retrieved async data, a string in this example';
}

async function numberLoader(): number {
  //-------------------------------------------------------------------
  // Some async operation to get data, like a call to a 3-rd party API.
  //-------------------------------------------------------------------
  return 123;
}


function SampleReactComponent() {
  // This works, and automatically deduces the correct `data` type as `string`.
  const { data, loading, timestamp } = useAsyncData('some.path', loader);

  // This gives TS error, as it able to evaluate the correct type of data
  // in the envelope at "some.path" is "string", not a "number" returned by
  // `numberLoader()`.
  const { data, loading, timestamp } = useAsyncData('some.path', numberLoader);

  // We can force a number, though, if we are sure about it.
  // NOTE: The "1" as the first generic parameter is just a "switch" value
  // enabling this overload of the hook, it has nothing to do with the "number"
  // type of data we are forcing here.
  const { data, loading, timer } = useAsyncData<ForceT, number>('some.path', numberLoader);

  return /* Some JSX markup. */
}
```

## Further Reading
- [Getting Started](/docs/tutorials/getting-started)
- (**Outdated**) [Blog Article](https://dr.pogodin.studio/dev-blog/the-global-state-in-react-designed-right)
  &zwnj; &mdash; _written in 2020 it covers the original motivation and features,
  but not the&nbsp;TypeScript flavour of the library._

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
