# API

[API] is a special interface allowing to get all library exports with
&laquo;locked-in&raquo; state type. The way you use it is the following:

```ts
import RGS, { type API } from '@dr.pogodin/react-global-state';

type MyStateT = {
  some: {
    path: string;
  };
};

const { GlobalStateProvider, useGlobalState } = RGS as API<StateT>;
```

[API] also has an optional second generic argument, specifying the type of
[SsrContext] to use alongside the state, and it default to just `SsrContext<StateT>`.
This is how you may use it to &laquo;lock-in&raquo; you own extension of [SsrContext]
for all library exports that care about it.

```ts
import RGS, { type API, SsrContext } from '@dr.pogodin/react-global-state';

type MyStateT = {
  // Definition of you global state shape goes here.
};

class MyCustomSsrContext extends SsrContext<MyStateT> {
  // Something useful here, like additional fields for SSR context.
}

const {
  getSsrContext,
  GlobalStateProvider,
  useGlobalState,
  // etc.
} = RGS as API<MyStateT, MyCustomSsrContext>;

```

[API]: /docs/api/types/api
[SsrContext]: /docs/api/classes/ssrcontext

