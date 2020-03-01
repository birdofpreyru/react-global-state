/**
 * Hook for updates of global state.
 */

import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';

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
    const value = _.isFunction(initialValue) ? initialValue() : initialValue;
    state = globalState.set(path, value);
  }
  const [
    localState,
    setLocalState,
  ] = useState(() => state);
  useEffect(() => {
    const callback = () => {
      const newState = globalState.get(path);
      if (newState !== localState) setLocalState(() => newState);
    };
    globalState.watch(callback);
    callback();
    return () => globalState.unWatch(callback);
  }, [localState]);

  const ref = useRef();
  if (!ref.current) {
    ref.current = {
      localState,
      setter: (value) => {
        const newValue = _.isFunction(value)
          ? value(ref.current.localState) : value;
        globalState.set(path, newValue);
      },
    };
  } else {
    ref.current.localState = localState;
  }

  return [
    localState,
    ref.current.setter,
  ];
}
