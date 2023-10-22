/**
 * Loads and uses an item in an async collection.
 */

import useAsyncData, {
  type DataInEnvelopeAtPathT,
  type UseAsyncDataOptionsT,
  type UseAsyncDataResT,
} from './useAsyncData';

import { type ForceT, type TypeLock } from './utils';

export type AsyncCollectionLoaderT<DataT> =
  (id: string, oldData: null | DataT) => DataT | Promise<DataT>;

/**
 * Resolves and stores at the given `path` of global state elements of
 * an asynchronous data collection. In other words, it is an auxiliar wrapper
 * around {@link useAsyncData}, which uses a loader which resolves to different
 * data, based on ID argument passed in, and stores data fetched for different
 * IDs in the state.
 * @param id ID of the collection item to load & use.
 * @param path The global state path where entire collection should be
 *  stored.
 * @param loader A loader function, which takes an
 * ID of data to load, and resolves to the corresponding data.
 * @param options Additional options.
 * @param options.deps An array of dependencies, which trigger
 * data reload when changed. Given dependency changes are watched shallowly
 * (similarly to the standard React's
 * [useEffect()](https://reactjs.org/docs/hooks-reference.html#useeffect)).
 * @param options.noSSR If `true`, this hook won't load data during
 * server-side rendering.
 * @param options.garbageCollectAge The maximum age of data
 * (in milliseconds), after which they are dropped from the state when the last
 * component referencing them via `useAsyncData()` hook unmounts. Defaults to
 * `maxage` option value.
 * @param options.maxage The maximum age of
 * data (in milliseconds) acceptable to the hook's caller. If loaded data are
 * older than this value, `null` is returned instead. Defaults to 5 minutes.
 * @param options.refreshAge The maximum age of data
 * (in milliseconds), after which their refreshment will be triggered when
 * any component referencing them via `useAsyncData()` hook (re-)renders.
 * Defaults to `maxage` value.
 * @return Returns an object with three fields: `data` holds the actual result of
 * last `loader` invokation, if any, and if satisfies `maxage` limit; `loading`
 * is a boolean flag, which is `true` if data are being loaded (the hook is
 * waiting for `loader` function resolution); `timestamp` (in milliseconds)
 * is Unix timestamp of related data currently loaded into the global state.
 *
 * Note that loaded data, if any, are stored at the given `path` of global state
 * along with related meta-information, using slightly different state segment
 * structure (see {@link AsyncDataEnvelope}). That segment of the global state
 * can be accessed, and even modified using other hooks,
 * _e.g._ {@link useGlobalState}, but doing so you may interfere with related
 * `useAsyncData()` hooks logic.
 */

function useAsyncCollection<
  StateT,
  PathT extends null | string | undefined,
  IdT extends string,
>(
  id: IdT,
  path: PathT,
  loader: AsyncCollectionLoaderT<
  DataInEnvelopeAtPathT<StateT, `${PathT}.${IdT}`>
  >,
  options?: UseAsyncDataOptionsT,
): UseAsyncDataResT<DataInEnvelopeAtPathT<StateT, `${PathT}.${IdT}`>>;

function useAsyncCollection<
  Forced extends ForceT | false = false,
  DataT = unknown,
>(
  id: string,
  path: null | string | undefined,
  loader: AsyncCollectionLoaderT<TypeLock<Forced, void, DataT>>,
  options?: UseAsyncDataOptionsT,
): UseAsyncDataResT<TypeLock<Forced, void, DataT>>;

function useAsyncCollection<DataT>(
  id: string,
  path: null | string | undefined,
  loader: AsyncCollectionLoaderT<DataT>,
  options: UseAsyncDataOptionsT = {},
): UseAsyncDataResT<DataT> {
  const itemPath = path ? `${path}.${id}` : id;
  return useAsyncData<ForceT, DataT>(
    itemPath,
    (oldData: null | DataT) => loader(id, oldData),
    options,
  );
}

export default useAsyncCollection;
