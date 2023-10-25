# useAsyncCollection()
```jsx
import { useAsyncCollection } from '@dr.pogodin/react-global-state';
```
Resolves and stores at the given `path` of global state elements of
an asynchronous data collection. In other words, it is an auxiliar wrapper
around [useAsyncData()] hook, which uses a loader which resolves to different
data, based on an ID argument passed in, and stores data fetched for different
IDs in the state.

:::info
For a given pair of `id` and `path` arguments this hook will store at
the `` `${path}.${id}` `` path of the global state an [AsyncDataEnvelopeT] object
holding the loaded data alongside some related meta-information. That global
state segment can be accessed, and even modified using other hooks,
_e.g_ [useGlobalState()], but doing so you should be careful to not interfere
with the related [useAsyncCollection()] hook logic in an undesireable way.
:::

The TypeScript signature of [useAsyncCollection()] implementation is
```ts
function useAsyncCollection<DataT>(
  id: string,
  path: null | string | undefined,
  loader: AsyncCollectionLoaderT<DataT>,
  options: UseAsyncDataOptionsT = {},
): UseAsyncDataResT<DataT>;
```
This signature is shadowed in TypeScript by several narrowed overloads,
explained below, which are necessary to make static TypeScript type analysis
work.

## TypeScript Overloads
[StateT]: #state-type
1.  The first TypeScript overload for this hook has the signature (simplified
    by ommitting details behind the **DataT** definition):
    ```ts
    function useAsyncCollection<
      StateT,
      PathT extends null | string | undefined,
      IdT extends string,
    >(
      id: IdT,
      path: PathT,
      loader: AsyncCollectionLoaderT<DataT>
      >,
      options?: UseAsyncDataOptionsT,
    ): UseAsyncDataResT<DataT>;
    ```
    with three generic parameters:
      - `StateT` <a id="state-type" /> &mdash; The type of global state content.
      - `PathT` &mdash; **null** | **string** | **undefined** &mdash;
        The type of `path` argument.
      - `IdT` &mdash; **string** &mdash; The type of `id` argument.

    The type **DataT** is auto-evaluated by TypeScript based on generic
    parameters, if possible, and used for type-checking the loader and result.
    If **DataT** cannot be auto-evaluated, it falls back to **void**, forbidding
    TypeScript to use this hook overload.

    :::tip
    As [StateT] parameter cannot be evaluated from hook arguments / result types,
    to use this hook variant directly one would need to provide all three generic
    parameters explicitly:
    ```ts
    useAsyncCollection<StateT, typeof path, typeof id>(id, path, loader);
    ```
    Instead of this, you should prefer to use the [withGlobalStateType()]
    function to get and use a specially wrapped version of this hook, with
    "locked-in" [StateT] type, which allows TS to auto-evaluate the values of
    **PathT** and **IdT** from given arguments, and thus allows to use the hook
    this way:
    ```ts
    const { useAsyncCollection } = withGlobalStateType<StateT>();

    // Behind the scene, TS still attempts to auto-evaluate the DataT type
    // based on StateT, typeof id, and typeof path; and uses it to type check
    // the `loader` and result. It will deny to compile it if the type check
    // fails, or DataT cannot be auto-evaluated.
    useAsyncCollection(id, path, loader);
    ```
    :::

2.  Another overload has the following signature (simplified by omitting
    details behind the exact **DataT** definition), which allows to force any
    **DataT** type under the caller's discretion:
    ```ts
    function useAsyncCollection<
      Force extends ForceT | false = false,
      DataT = unknown,
    >(
      id: string,
      path: null | string | undefined,
      loader: AsyncCollectionLoaderT<DataT>,
      options?: UseAsyncDataOptionsT,
    ): UseAsyncDataResT<DataT>;
    ```
    Generic parameters are:
    - `Forced` &mdash; [ForceT] | **false** &mdash; The default value, **false**,
      forbids TypeScript to use this overload (it does so by forcing **DataT**
      to evaluate as **void** behind the scene). It must be set [ForceT] explicitly,
      to use this overload.
    - `DataT` &mdash; The type of collection item, defaults to **unknown**.

    You can use this overload in either of these way:
    ```ts
    // Variant #1.

    import { type ForceT, useAsyncCollection } from '@dr.pogodin/react-global-state';

    useAsyncCollection<ForceT, DataT>(id, path, loader);

    // Variant #2. Using withGlobalStateType().

    import { type ForceT, withGlobalStateType } from '@dr.pogodin/react-global-state';

    const { useAsyncCollection } = withGlobalStateType<StateT>();

    // This overload does not really use StateT for type-checks, it just assumes
    // the DataT type you have specified.
    useAsyncCollection<ForceT, DataT>(id, path, loader);
    ```

## Arguments
- `id` &mdash; **string** &mdash; ID of the collection item to load & use.
- `path` &mdash; **null** | **string** | **undefined** &mdash; The global state path
  where entire collection should be stored.
- `loader` &mdash; [AsyncCollectionLoaderT] &mdash; A loader function, which takes an
  ID of data to load, and resolves to the corresponding data.
- `options` &mdash; [UseAsyncDataOptionsT] &mdash; Optional object with additional settings.

## Result
Returns an object of [UseAsyncDataResT]&lt;**DataT**&gt; type.

[AsyncCollectionLoaderT]: /docs/api/types/async-collection-loader
[AsyncDataEnvelopeT]: /docs/api/types/async-data-envelope
[ForceT]: /docs/api/types/force
[UseAsyncDataOptionsT]: /docs/api/types/use-async-data-options
[useAsyncCollection()]: /docs/api/hooks/useasynccollection
[useAsyncData()]: /docs/api/hooks/useasyncdata
[UseAsyncDataResT]: /docs/api/types/use-async-data-res
[useGlobalState()]: /docs/api/hooks/useglobalstate
[withGlobalStateType()]: /docs/api/functions/with-global-state-type
