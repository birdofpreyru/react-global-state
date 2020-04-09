/**
 * Loads and uses an item in an async collection.
 */

import useAsyncData from './useAsyncData';

/**
 * Loads and uses an item in async collection.
 * @param {string} id ID of the collection item to load & use.
 * @param {string} path The global state path where entire collection should be
 *  stored.
 * @param {function} loader A loader function, which takes an ID of item to
 *  load and returns a Promise resolving to the corresponding data item.
 * @param {object} [options] Optional. Additional options.
 * @param {any[]} [options.deps=[]] Optional. The array of dependencies
 *  to watch for changes. When any value in the array changes, the hook
 *  attempts to reload the item, assuming that timestamp and max age options
 *  say it should be reloaded.
 * @param {boolean} [options.noSSR]
 * @param {number} [options.garbageCollectAge=DEFAULT_MAXAGE]
 * @param {number} [options.maxage=DEFAULT_MAXAGE]
 * @param {number} [options.refreshAge=DEFAULT_MAXAGE]
 */
export default function useAsyncCollection(
  id,
  path,
  loader,
  options = {},
) {
  const itemPath = path ? `${path}.${id}` : id;
  return useAsyncData(itemPath, () => loader(id), options);
}
