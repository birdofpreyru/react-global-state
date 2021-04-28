/**
 * Loads and uses an item in an async collection.
 */

import useAsyncData from './useAsyncData';

/**
 * @typedef {function} AsyncCollectionLoader This is the signature of
 * `loader` function accepted by {@link useAsyncCollection} hook.
 * @param {string} id ID of the collection item to load.
 * @param {any} oldData Previously fetched data for this ID, if any. The loader
 * does not have to use it, it is provided just for convenience, when the newly
 * resolved data may depend on the previously fetched data.
 * @returns {Promise<any>} Resolves to data to be stored in the global state
 * for the given collection item ID.
 */

/**
 * @category Hooks
 * @func useAsyncCollection
 * @desc Resolves and stores at the given `path` of global state elements of
 * an asynchronous data collection. In other words, it is an auxiliar wrapper
 * around {@link useAsyncData}, which uses a loader which resolves to different
 * data, based on ID argument passed in, and stores data fetched for different
 * IDs in the state.
 * @param {string} id ID of the collection item to load & use.
 * @param {string} path The global state path where entire collection should be
 *  stored.
 * @param {AsyncCollectionLoader} loader A loader function, which takes an
 * ID of data to load, and resolves to the corresponding data.
 * @param {object} [options] Additional options.
 * @param {any[]} [options.deps=[]] An array of dependencies, which trigger
 * data reload when changed. Given dependency changes are watched shallowly
 * (similarly to the standard React's
 * [useEffect()](https://reactjs.org/docs/hooks-reference.html#useeffect)).
 * @param {boolean} [options.noSSR] If `true`, this hook won't load data during
 * server-side rendering.
 * @param {number} [options.garbageCollectAge=maxage] The maximum age of data
 * (in milliseconds), after which they are dropped from the state when the last
 * component referencing them via `useAsyncData()` hook unmounts. Defaults to
 * `maxage` option value.
 * @param {number} [options.maxage=5 x 60 x 1000] The maximum age of
 * data (in milliseconds) acceptable to the hook's caller. If loaded data are
 * older than this value, `null` is returned instead. Defaults to 5 minutes.
 * @param {number} [options.refreshAge=maxage] The maximum age of data
 * (in milliseconds), after which their refreshment will be triggered when
 * any component referencing them via `useAsyncData()` hook (re-)renders.
 * Defaults to `maxage` value.
 * @return {{
 *   data: any,
 *   loading: boolean,
 *   timestamp: number
 * }} Returns an object with three fields: `data` holds the actual result of
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
export default function useAsyncCollection(
  id,
  path,
  loader,
  options = {},
) {
  const itemPath = path ? `${path}.${id}` : id;
  return useAsyncData(itemPath, (oldData) => loader(id, oldData), options);
}
