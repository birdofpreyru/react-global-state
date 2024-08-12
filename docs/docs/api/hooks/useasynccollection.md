# useAsyncCollection()
```jsx
import { useAsyncCollection } from '@dr.pogodin/react-global-state';
```
Manages an [asynchronous data collection][AsyncCollectionT] in the global state, 
_i.e._ a map between string/number IDs and corresponding data, wrapped into
auxiliary [envelopes][AsyncDataEnvelopeT].

<details>
<summary>Example</summary>
```tsx
import {
  type AsyncCollectionT,
  type AsyncDataEnvelopeT,
  useAsyncCollection,
} from '@dr.pogodin/react-global-state';

type StateT = {
  collection: AsyncCollectionT<string>;
}

async function loader(id: string): Promise<string> {
  // Some asynchronous logic here.
  return 'result';
}

const Component: React.FunctionComponent = () => {
  const { items } = useAsyncCollection<StateT>(
    ['a', 'b'],
    'collection',
    loader,
  );
  return (
    <div>
      <div>Result for "a": {items.a}</div>
      <div>Result for "b": {items.b}</div>
    </div>
  );
};
```
</details>

It is similar to the simpler [useAsyncData()] hook, but instead of a single
data object, it handles a set of such objects, distinguished by their IDs;
and the collection [loader][AsyncCollectionLoaderT] provides the underlying
logic for resolution of data for a given ID.

:::info
- Starting with **v0.17.0** of the library, the hook assumes the value at
  the given collection `path` is a proper [AsyncCollectionT] object, or
  **undefined**; in particular it must not have any key/value pairs with
  non-[AsyncDataEnvelopeT] values.
- The hook does reference-counting and garbage-collection of orphaned loaded
  data, as per the `garbageCollectAge` limit (see [UseAsyncDataOptionsT]).
:::

The TypeScript signature of [useAsyncCollection()] implementation is
```ts
function useAsyncCollection<
  DataT,
  IdT extends number | string,
>(
  idOrIds: IdT | IdT[],
  path: null | string | undefined,
  loader: AsyncCollectionLoaderT<DataT, IdT>,
  options: UseAsyncDataOptionsT = {},
): UseAsyncDataResT<DataT> | UseAsyncCollectionResT<DataT, IdT>
```
This signature is shadowed in TypeScript by several narrowed overloads,
explained below, which are necessary to make static TypeScript type analysis
work.

## TypeScript Overloads
[StateT]: #state-type
1.  The first TypeScript overload for this hook has the signature
    ```ts
    function useAsyncCollection<
      StateT,
      PathT extends null | string | undefined,
      IdT extends number | string,

      DataT extends DataInEnvelopeAtPathT<StateT, `${PathT}.${IdT}`> =
      DataInEnvelopeAtPathT<StateT, `${PathT}.${IdT}`>,
    >(
      id: IdT,
      path: PathT,
      loader: AsyncCollectionLoaderT<DataT, IdT>,
      options?: UseAsyncDataOptionsT,
    ): UseAsyncDataResT<DataT>;
    ```
    with three required generic parameters:
      - `StateT` <Link id="state-type" /> &mdash; The type of global state content.
      - `PathT` &mdash; **null** | **string** | **undefined** &mdash;
        The type of `path` argument.
      - `IdT` &mdash; **number** | **string** &mdash; The type of `id` argument.

    The fourth generic parameter, **DataT**, is auto-resolved by TypeScript,
    if possible, and used for type-checking the loader and result. If `DataT`
    cannot be resolved automatically, it falls back to **void**, forbidding
    TypeScript to use this hook overload.

    :::important
    Note, this overload takes a single `id` value, and returns the result with
    [UseAsyncDataResT] type. Thus, it manages a single _data_ object in
    the collection, unlike other overloads below that take an array of IDs,
    and return the result with different [UseAsyncCollectionResT] type,
    thus managing multple _data_ objects.
    
    It is permitted to pass different number of IDs to the mounted hooks in
    different renders.
    :::

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

2.  The second overload has the following signature, which allows to force any
    **DataT** type under the caller's discretion:
    ```ts
    function useAsyncCollection<
      Forced extends ForceT | LockT = LockT,
      DataT = unknown,
      IdT extends number | string = number | string,
    >(
      id: IdT,
      path: null | string | undefined,
      loader: AsyncCollectionLoaderT<TypeLock<Forced, void, DataT>, IdT>,
      options?: UseAsyncDataOptionsT,
    ): UseAsyncDataResT<TypeLock<Forced, void, DataT>>;
    ```
    Generic parameters are:
    - `Forced` &mdash; [ForceT] | **false** &mdash; The default value, **false**,
      forbids TypeScript to use this overload (it does so by forcing **DataT**
      to evaluate as **void** behind the scene). It must be set [ForceT] explicitly,
      to use this overload.
    - `DataT` &mdash; The type of collection item, defaults to **unknown**.
    - `IdT` &mdash; **number** | **string** &mdash; The type of `id` argument.

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

3.  The next overload is this:
    ```ts
    function useAsyncCollection<
      StateT,
      PathT extends null | string | undefined,
      IdT extends number | string,

      DataT extends DataInEnvelopeAtPathT<StateT, `${PathT}.${IdT}`> =
      DataInEnvelopeAtPathT<StateT, `${PathT}.${IdT}`>,
    >(
      id: IdT[],
      path: PathT,
      loader: AsyncCollectionLoaderT<DataT, IdT>,
      options?: UseAsyncDataOptionsT,
    ): UseAsyncCollectionResT<DataT, IdT>;
    ```
    It is similar to the first one, but it takes an array of ID values,
    and returns the result of [UseAsyncCollectionResT] type, that wraps
    a set of requested collection items, and related meta-data.

4.  Finally,
    ```ts
    function useAsyncCollection<
      Forced extends ForceT | LockT = LockT,
      DataT = unknown,
      IdT extends number | string = number | string,
    >(
      id: IdT[],
      path: null | string | undefined,
      loader: AsyncCollectionLoaderT<TypeLock<Forced, void, DataT>, IdT>,
      options?: UseAsyncDataOptionsT,
    ): UseAsyncCollectionResT<DataT, IdT>;
    ```
    is a signature similar to both 2 & 3 &mdash; it allows to force **DataT**
    at consumer's discretion, and request a set of collection items rather than
    a single one.

## Arguments
- `id` &mdash; **number** | **string** | **Array&lt;number | string&gt;** &mdash;
  ID(s) of collection item(s) to load & use. Depending on whether a single ID or
  an array of IDs is provided, the hook will return either [UseAsyncDataResT] or
  [UseAsyncCollectionResT] result. Note, if `id` is an array with one element,
  it will still return the later ([UseAsyncCollectionResT]) result.

- `path` &mdash; **null** | **string** | **undefined** &mdash; The global state path
  where entire collection should be stored.
- `loader` &mdash; [AsyncCollectionLoaderT] &mdash; A loader function,
  which takes an ID of data to load, and resolves to the corresponding data.
  Same as with the [useAsyncData()] hook, if `loader` returns data promise,
  the corresponding envelope in the global state will be put into (re-)loading
  state while the promise settlement is awaited; however, if non-promise data
  value is returned, it is immediately (synchronously) stored into the envelope,
  without visiting the (re-)loading state.

- `options` &mdash; [UseAsyncDataOptionsT] &mdash; Optional object with additional settings.

## Result
Returns an object of [UseAsyncCollectionResT]\<**DataT**\> (when called with an
array of IDs) or [UseAsyncDataResT]&lt;**DataT**&gt; (when called with a single
ID) types.

[AsyncCollectionLoaderT]: /docs/api/types/async-collection-loader
[AsyncCollectionT]: /docs/api/types/async-collection
[AsyncDataEnvelopeT]: /docs/api/types/async-data-envelope
[ForceT]: /docs/api/types/force
[UseAsyncDataOptionsT]: /docs/api/types/use-async-data-options
[useAsyncCollection()]: /docs/api/hooks/useasynccollection
[useAsyncData()]: /docs/api/hooks/useasyncdata
[UseAsyncCollectionResT]: /docs/api/types/use-async-collection-res
[UseAsyncDataResT]: /docs/api/types/use-async-data-res
[useGlobalState()]: /docs/api/hooks/useglobalstate
[withGlobalStateType()]: /docs/api/functions/with-global-state-type
