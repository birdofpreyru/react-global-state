/**
 * Hook for updates of global state.
 */

import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';

import { getGlobalState } from './GlobalStateProvider';

import { IS_DEBUG_MODE } from './utils';

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
        if (IS_DEBUG_MODE) {
          /* eslint-disable no-console */
          console.log('ReactGlobalState - useGlobalState setter triggered:');
          console.log('- Path:', path || '');
          console.log('- New value:', _.cloneDeep(newValue));
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
