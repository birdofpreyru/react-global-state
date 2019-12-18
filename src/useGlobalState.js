/**
 * Hook for updates of global state.
 */

import _ from 'lodash';
import { useEffect, useState } from 'react';

import { getGlobalState } from './GlobalStateProvider';

/**
 * Subscribes to the global state `path`.
 * @param {String} path
 * @param {Any} initialValue
 * @return {Array} First element - state segment, second - segment update
 *  function.
 */
export default function useGlobalState(path, initialValue) {
  const globalState = getGlobalState();
  let state = globalState.get(path);
  if (_.isUndefined(state) && !_.isUndefined(initialValue)) {
    state = globalState.set(path, initialValue);
  }
  const [
    localState,
    setLocalState,
  ] = useState(state);
  useEffect(() => {
    const callback = () => {
      const newState = globalState.get(path);
      if (newState !== localState) setLocalState(newState);
    };
    globalState.watch(callback);
    callback();
    return () => globalState.unWatch(callback);
  }, [localState, setLocalState]);
  return [localState, (value) => globalState.set(path, value)];
}
