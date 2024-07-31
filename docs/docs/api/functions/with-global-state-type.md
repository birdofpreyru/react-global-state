# withGlobalStateType()
```ts
import { withGlobalStateType } from '@dr.pogodin/react-global-state';
```
Returns a set of library components, classes,
and hooks "locked-in" onto a specified state type. Thus, making it unnecessary
(in TypeScript) to pass the state type as a generic parameter for each component,
class, and hook, when they are used, and allowing TypeScript compiler to
auto-evaluate their other generic parameters in many cases.

This function is only relevant to the TypeScript usage of the library, and it
has this signature:

```ts
function withGlobalStateType<
  StateT,
  SsrContext extends SsrContext<StateT> = SsrContext<StateT>,
>(): {
  getGlobalState: ...;
  getSsrContext: ...;
  GlobalState: ...;
  GlobalStateProvider: ...;
  newAsyncDataEnvelope: ...;
  SsrContext: ...;
  useAsyncCollection: ...;
  useAsyncData: ...;
  useGlobalState: ...;
};
```
&uArr; _Simplified by omitting the actual types of returned components,
classes, hooks, and their overloads._

Essentially, the versions of entities (classes, components, hooks) returned
by [withGlobalStateType()] are the same as their corresponding stand-alone
entities (or its particular overloads) exported from the library, with the only
difference that if the original entity (overload) had **StateT** as one of its
generic parameters, the version of that entity (overload) returned by
[withGlobalStateType()] won't have **StateT** generic parameter, and will rather
use the same **StateT** value given to the [withGlobalStateType()] call.
The overloads that had no **StateT** parameter originally
(_e.g._

```ts
useGlobalState<Unlocked,ValueT>(
  path?: null | string,
  value: ValueOrInitializerT<ValueT>,
): UseGlobalStateResT<ValueT>;
```
&uArr; _See [useGlobalState()] for details._

are returned by [withGlobalStateType()] as they were originally,
thus allowing to also use them, without importing separately stand-alone
versions of the corresponding entities.

[useGlobalState()]: /docs/api/hooks/useglobalstate
[withGlobalStateType()]: #
