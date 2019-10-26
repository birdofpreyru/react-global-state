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
 * @param {Number} [options.maxage=DEFAULT_MAXAGE]
 */
export default function useAsyncData(
  path,
  loader, {
    maxage,
  } = {
    maxage: DEFAULT_MAXAGE,
  },
) {
  const now = Date.now();
  const globalState = getGlobalState();
  let [localState] = useGlobalState(path);
  if (!localState) {
    localState = {
      data: null,
      numRefs: 0,
      operationId: '',
      timestamp: 0,
    };
  }
  if (localState.timestamp < now - maxage && !localState.operationId) {
    const operationId = uuid();
    localState = { ...localState, operationId };
    globalState.set(path, localState);
    loader().then((data) => {
      const state = globalState.get(path);
      if (operationId === state.operationId) {
        globalState.set(path, {
          ...state,
          data,
          operationId: '',
          timestamp: Date.now(),
        });
      }
    });
  }
  useEffect(() => {
    let state = globalState.get(path);
    globalState.set(path, { ...state, numRefs: 1 + state.numRefs });
    return () => {
      state = { ...globalState.get(path) };
      state.numRefs -= 1;
      if (!state.numRefs && state.timestamp < Date.now() - maxage) {
        state.data = null;
      }
      globalState.set(path, state);
    };
  }, []);
  return {
    data: localState.data,
    loading: Boolean(localState.operationId),
    timestamp: localState.timestamp,
  };
}
