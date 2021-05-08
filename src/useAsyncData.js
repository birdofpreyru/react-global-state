/**
 * Loads and uses async data into the GlobalState path.
 */

// TODO: This is temporary disabled, as detected issues should be analyzed
// carefully.
/* eslint-disable react-hooks/rules-of-hooks, react-hooks/exhaustive-deps */

import { cloneDeep } from 'lodash';
import { useEffect } from 'react';
import { v4 as uuid } from 'uuid';

import { getGlobalState } from './GlobalStateProvider';
import useGlobalState from './useGlobalState';
import { isDebugMode } from './utils';

const DEFAULT_MAXAGE = 5 * 60 * 1000; // 5 minutes.

/**
 * Executes the data loading operation.
 * @param {string} path Data segment path inside the global state.
 * @param {function} loader Data loader.
 * @param {GlobalState} globalState The global state instance.
 * @param {any} [oldData] Optional. Previously fetched data, currently stored in
 *  the state, if already fetched by the caller; otherwise, they will be fetched
 *  by the load() function itself.
 * @return {Promise} Resolves once the operation is done.
 * @ignore
 */
async function load(path, loader, globalState, oldData) {
  if (process.env.NODE_ENV !== 'production' && isDebugMode()) {
    /* eslint-disable no-console */
    console.log(
      `ReactGlobalState: useAsyncData data (re-)loading. Path: "${path || ''}"`,
    );
    /* eslint-enable no-console */
  }
  const operationId = uuid();
  const operationIdPath = path ? `${path}.operationId` : 'operationId';
  globalState.set(operationIdPath, operationId);
  const data = await loader(oldData || globalState.get(path).data);
  const state = globalState.get(path);
  if (operationId === state.operationId) {
    if (process.env.NODE_ENV !== 'production' && isDebugMode()) {
      /* eslint-disable no-console */
      console.groupCollapsed(
        `ReactGlobalState: useAsyncData data (re-)loaded. Path: "${
          path || ''
        }"`,
      );
      console.log('Data:', cloneDeep(data));
      /* eslint-enable no-console */
    }
    globalState.set(path, {
      ...state,
      data,
      operationId: '',
      timestamp: Date.now(),
    });
    if (process.env.NODE_ENV !== 'production' && isDebugMode()) {
      /* eslint-disable no-console */
      console.groupEnd();
      /* eslint-enable no-console */
    }
  }
}

/**
 * @typedef {object} AsyncDataEnvelope This type documents the structure of
 * global state segment, created by {@link useAsyncData} hook for storing of
 * loaded async data, and associated metadata.
 * @prop {any} data The actual loaded data.
 * @prop {number} numRefs The count of currently mounted components referencing
 * the data via `useAsyncData` hooks.
 * @prop {string} operationId A unique ID of the current data loading
 * operation, if one is in progress. Changing this ID before the operation
 * completes effectively cancels the ongoing operation, and instructs related
 * hook to ignore the operation result.
 * @prop {number} timestamp Unix timestamp (in milliseconds) of the most
 * recently loaded `data`.
 */

/**
 * @typedef {function} AsyncDataLoader This type documents the signature of
 * async data loader function, expected by {@link useAsyncData} hook.
 * @param {any} oldData Previously loaded data (_i.e._ the data currently stored
 * at the global state `path` managed by the corresponding `useAsyncData` hook,
 * which are assumed to be resolved from a previous call to the loader).
 * The loader does not have to use this argument, it is provided just for
 * convenience.
 * @return {Promise<any>} Async data to store to the state.
 */

/**
 * @category Hooks
 * @func useAsyncData
 * @desc Resolves asynchronous data, and stores them at given `path` of global
 * state. When multiple components rely on asynchronous data at the same `path`,
 * the data are resolved once, and reused until their age is within specified
 * bounds. Once the data are stale, the hook allows to refresh them. It also
 * garbage-collects stale data from the global state when the last component
 * relying on them is unmounted.
 * @param {string} path Dot-delimitered state path, where data envelop is
 * stored.
 * @param {AsyncDataLoader} loader Asynchronous function which resolves (loads)
 * data, which should be stored at the global state `path`. When multiple
 * components
 * use `useAsyncData()` hook for the same `path`, the library assumes that all
 * hook instances are called with the same `loader` (_i.e._ whichever of these
 * loaders is used to resolve async data, the result is acceptable to be reused
 * in all related components).
 * @param {object} [options] Additional options.
 * @param {any[]}  [options.deps=[]] An array of dependencies, which trigger
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
export default function useAsyncData(
  path,
  loader,
  options = {},
) {
  let { garbageCollectAge, maxage, refreshAge } = options;
  if (maxage === undefined) maxage = DEFAULT_MAXAGE;
  if (refreshAge === undefined) refreshAge = maxage;
  if (garbageCollectAge === undefined) garbageCollectAge = maxage;

  const globalState = getGlobalState();
  const [localState] = useGlobalState(path, {
    data: null,
    numRefs: 0,
    operationId: '',
    timestamp: 0,
  });

  if (globalState.ssrContext && !options.noSSR) {
    const state = globalState.get(path);
    if (!state.timestamp && !state.operationId) {
      globalState.ssrContext.pending.push(
        load(path, loader, globalState, state.data),
      );
    }
  } else {
    /* This takes care about the client-side reference counting, and garbage
     * collection. */
    useEffect(() => {
      const numRefsPath = path ? `${path}.numRefs` : 'numRefs';
      const numRefs = globalState.get(numRefsPath);
      globalState.set(numRefsPath, numRefs + 1);
      return () => {
        const state = globalState.get(path);
        if (
          state.numRefs === 1
          && garbageCollectAge < Date.now() - state.timestamp
        ) {
          if (process.env.NODE_ENV !== 'production' && isDebugMode()) {
            /* eslint-disable no-console */
            console.log(
              `ReactGlobalState - useAsyncData garbage collected at path ${
                path || ''
              }`,
            );
            /* eslint-enable no-console */
          }
          globalState.set(path, {
            ...state,
            data: null,
            numRefs: 0,
            timestamp: 0,
          });
        } else globalState.set(numRefsPath, state.numRefs - 1);
      };
    }, []);

    /* Data loading and refreshing. */
    let loadTriggered = false;
    useEffect(() => {
      const state = globalState.get(path);
      if (refreshAge < Date.now() - state.timestamp && !state.operationId) {
        load(path, loader, globalState, state.data);
        loadTriggered = true;
      }
    });

    const deps = options.deps || [];
    useEffect(() => {
      if (!loadTriggered && deps.length) load(path, loader, globalState);
    }, deps);
  }

  return {
    data: maxage < Date.now() - localState.timestamp ? null : localState.data,
    loading: Boolean(localState.operationId),
    timestamp: localState.timestamp,
  };
}
