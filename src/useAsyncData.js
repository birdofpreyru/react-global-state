/**
 * Loads and uses async data into the GlobalState path.
 */

import { useEffect } from 'react';
import uuid from 'uuid/v4';

import { getGlobalState } from './GlobalStateProvider';
import useGlobalState from './useGlobalState';

const DEFAULT_MAXAGE = 5 * 60 * 1000; // 5 minutes.

/**
 * Loads and uses async data into the GlobalState path.
 * @param {String} path
 * @param {Function} loader
 * @param {Object} [options]
 * @param {Number} [options.garbageCollectAge=DEFAULT_MAXAGE]
 * @param {Number} [options.maxage=DEFAULT_MAXAGE]
 * @param {NumbeR} [options.refreshAge=DEFAULT_MAXAGE]
 */
export default function useAsyncData(
  path,
  loader,
  options = {},
) {
  const maxage = options.maxage || DEFAULT_MAXAGE;
  const refreshAge = options.refreshAge || maxage;
  const garbageCollectAge = options.garbageCollectAge || maxage;

  let now = Date.now();
  const globalState = getGlobalState();
  const [localState] = useGlobalState(path, {
    data: null,
    numRefs: 0,
    operationId: '',
    timestamp: 0,
  });

  if (globalState.ssrContext) {
    let state = globalState.get(path);
    if (!state.timestamp && !state.operationId) {
      const operationId = uuid();
      globalState.set(path, {
        ...state,
        operationId,
      });
      globalState.ssrContext.pending.push(
        loader().then((data) => {
          state = globalState.get(path);
          if (operationId === state.operationId) {
            globalState.set(path, {
              ...state,
              data,
              operationId: '',
              timestamp: Date.now(),
            });
          }
        }),
      );
    }
  } else {
    useEffect(() => {
      let state = globalState.get(path);
      if (state.timestamp < Date.now() - refreshAge && !state.operationId) {
        const operationId = uuid();
        globalState.set(path, {
          ...state,
          operationId,
          numRefs: 1 + state.numRefs,
        });
        loader().then((data) => {
          state = globalState.get(path);
          if (operationId === state.operationId) {
            globalState.set(path, {
              ...state,
              data,
              operationId: '',
              timestamp: Date.now(),
            });
          }
        });
      } else {
        globalState.set(path, {
          ...state,
          numRefs: 1 + state.numRefs,
        });
      }
      return () => {
        now = Date.now();
        state = { ...globalState.get(path) };
        state.numRefs -= 1;
        if (!state.numRefs && state.timestamp < now - garbageCollectAge) {
          state.timestamp = 0;
          state.data = null;
        }
        globalState.set(path, state);
      };
    }, []);
  }

  return {
    data: localState.timestamp < now - maxage ? null : localState.data,
    loading: Boolean(localState.operationId),
    timestamp: localState.timestamp,
  };
}
