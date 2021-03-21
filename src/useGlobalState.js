/**
 * Hook for updates of global state.
 */

import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';

import { getGlobalState } from './GlobalStateProvider';
import { isDebugMode } from './utils';

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
    // Note: the "callback.active" flag below is needed to workaround the issue
    // https://github.com/birdofpreyru/react-global-state/issues/33,
    // which, unfortunately, I am not able to reproduce in test environment,
    // but I definitely seen it in the wild.
    const callback = () => {
      if (callback.active) {
        const newState = globalState.get(path);
        if (newState !== localState) setLocalState(() => newState);
      }
    };
    callback.active = true;
    globalState.watch(callback);
    callback();
    return () => {
      delete callback.active;
      globalState.unWatch(callback);
    };
  }, [localState]);

  const ref = useRef();
  if (!ref.current) {
    ref.current = {
      localState,
      setter: (value) => {
        const newValue = _.isFunction(value)
          ? value(ref.current.localState) : value;
        if (process.env.NODE_ENV !== 'production' && isDebugMode()) {
          /* eslint-disable no-console */
          console.groupCollapsed(
            `ReactGlobalState - useGlobalState setter triggered for path ${
              path || ''
            }`,
          );
          console.log('New value:', _.cloneDeep(newValue));
          console.groupEnd();
          /* eslint-enable no-console */
        }

        globalState.set(path, newValue);

        // The update of local state here is important for managed inputs:
        // if we wait until the global state change notification is delivered
        // (which happens after the next React render), React won't conserve
        // the text cursor inside the currently focused input field (the cursor
        // will jump to the field end, like if the value was changed not by
        // keyboard input).
        setLocalState(() => newValue);
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
