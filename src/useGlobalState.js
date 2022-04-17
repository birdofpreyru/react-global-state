// Hook for updates of global state.

import { cloneDeep, isFunction } from 'lodash';
import { useEffect, useRef, useState } from 'react';

import { getGlobalState } from './GlobalStateProvider';
import { isDebugMode } from './utils';

/**
 * The primary hook for interacting with the global state, modeled after
 * the standard React's
 * [useState](https://reactjs.org/docs/hooks-reference.html#usestate).
 * It subscribes a component to a given `path` of global state, and provides
 * a function to update it. Each time the value at `path` changes, the hook
 * triggers re-render of its host component.
 *
 * **Note:**
 * - For performance, the library does not copy objects written to / read from
 *   global state paths. You MUST NOT manually mutate returned state values,
 *   or change objects already written into the global state, without explicitly
 *   clonning them first yourself.
 * - State update notifications are asynchronous. When your code does multiple
 *   global state updates in the same React rendering cycle, all state update
 *   notifications are queued and dispatched together, after the current
 *   rendering cycle. In other words, in any given rendering cycle the global
 *   state values are "fixed", and all changes becomes visible at once in the
 *   next triggered rendering pass.
 *
 * @param {string} [path] Dot-delimitered state path. It can be undefined to
 * subscribe for entire state.
 *
 * Under-the-hood state values are read and written using `lodash`
 * [_.get()](https://lodash.com/docs/4.17.15#get) and
 * [_.set()](https://lodash.com/docs/4.17.15#set) methods, thus it is safe
 * to access state paths which have not been created before.
 * @param {any} [initialValue] Initial value to set at the `path`, or its
 * factory:
 * - If a function is given, it will act similar to
 *   [the lazy initial state of the standard React's useState()](https://reactjs.org/docs/hooks-reference.html#lazy-initial-state):
 *   only if the value at `path` is `undefined`, the function will be executed,
 *   and the value it returns will be written to the `path`.
 * - Otherwise, the given value itself will be written to the `path`,
 *   if the current value at `path` is `undefined`.
 * @return {Array} It returs an array with two elements: `[value, setValue]`:
 *
 * - The `value` is the current value at given `path`.
 *
 * - The `setValue()` is setter function to write a new value to the `path`.
 *
 *   Similar to the standard React's `useState()`, it supports
 *   [functional value updates](https://reactjs.org/docs/hooks-reference.html#functional-updates):
 *   if `setValue()` is called with a function as argument, that function will
 *   be called and its return value will be written to `path`. Otherwise,
 *   the argument of `setValue()` itself is written to `path`.
 *
 *   Also, similar to the standard React's state setters, `setValue()` is
 *   stable function: it does not change between component re-renders.
 */
export default function useGlobalState(path, initialValue) {
  const globalState = getGlobalState();
  let state = globalState.get(path);
  if (state === undefined && initialValue !== undefined) {
    const value = isFunction(initialValue) ? initialValue() : initialValue;
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
  }, [globalState, localState, path]);

  const ref = useRef();
  if (!ref.current) {
    ref.current = {
      localState,
      path,
      setter: (value) => {
        const newValue = isFunction(value)
          ? value(ref.current.localState) : value;
        if (process.env.NODE_ENV !== 'production' && isDebugMode()) {
          /* eslint-disable no-console */
          console.groupCollapsed(
            `ReactGlobalState - useGlobalState setter triggered for path ${
              ref.current.path || ''
            }`,
          );
          console.log('New value:', cloneDeep(newValue));
          console.groupEnd();
          /* eslint-enable no-console */
        }

        globalState.set(ref.current.path, newValue);

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
    ref.current.path = path;
  }

  return [
    localState,
    ref.current.setter,
  ];
}
