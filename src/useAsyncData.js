/**
 * Loads and uses async data into the GlobalState path.
 */

import _ from 'lodash';
import { useEffect } from 'react';
import { v4 as uuid } from 'uuid';

import { getGlobalState } from './GlobalStateProvider';
import useGlobalState from './useGlobalState';

const DEFAULT_MAXAGE = 5 * 60 * 1000; // 5 minutes.

/**
 * Executes the data loading operation.
 * @param {string} path Data segment path inside the global state.
 * @param {function} loader Data loader.
 * @param {GlobalState} globalState The global state instance.
 * @return {Promise} Resolves once the operation is done.
 */
async function load(path, loader, globalState) {
  if (process.env.REACT_GLOBAL_STATE_DEBUG) {
    /* eslint-disable no-console */
    console.log('ReactGlobalState - useAsyncData data (re-)loading:');
    console.log('- Path:', path);
    /* eslint-enable no-console */
  }
  const operationId = uuid();
  const operationIdPath = path ? `${path}.operationId` : 'operationId';
  globalState.set(operationIdPath, operationId);
  const data = await loader();
  const state = globalState.get(path);
  if (operationId === state.operationId) {
    if (process.env.REACT_GLOBAL_STATE_DEBUG) {
      /* eslint-disable no-console */
      console.log('ReactGlobalState - useAsyncData data (re-)loaded:');
      console.log('- Path:', path || '');
      console.log('- Data:', _.cloneDeep(data));
      /* eslint-enable no-console */
    }
    globalState.set(path, {
      ...state,
      data,
      operationId: '',
      timestamp: Date.now(),
    });
  }
}

/**
 * Loads and uses async data into the GlobalState path.
 * @param {string} path
 * @param {function} loader
 * @param {object} [options]
 * @param {any[]}  [options.deps=[]] Optional. The array of dependencies
 *  to watch for changes. When any value in the array changes, the hook will
 *  attempt to reload async data (maxage and refreshAge setting still apply).
 *  The values are watched shallowly, using the standard React's useEffect
 *  hook internally.
 * @param {boolean} [options.noSSR]
 * @param {number} [options.garbageCollectAge=DEFAULT_MAXAGE]
 * @param {number} [options.maxage=DEFAULT_MAXAGE]
 * @param {numbeR} [options.refreshAge=DEFAULT_MAXAGE]
 */
export default function useAsyncData(
  path,
  loader,
  options = {},
) {
  const maxage = options.maxage || DEFAULT_MAXAGE;
  const refreshAge = options.refreshAge || maxage;
  const garbageCollectAge = options.garbageCollectAge || maxage;

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
        load(path, loader, globalState),
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
          if (process.env.REACT_GLOBAL_STATE_DEBUG) {
            /* eslint-disable no-console */
            console.log('ReactGlobalState - useAsyncData garbage collected:');
            console.log('- Path:', path || '');
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
    useEffect(() => {
      const state = globalState.get(path);
      if (refreshAge < Date.now() - state.timestamp && !state.operationId) {
        load(path, loader, globalState);
      }
    }, options.deps || []);
  }

  return {
    data: maxage < Date.now() - localState.timestamp ? null : localState.data,
    loading: Boolean(localState.operationId),
    timestamp: localState.timestamp,
  };
}
