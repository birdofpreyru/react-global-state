// Hook for updates of global state.

import { cloneDeep, isFunction } from 'lodash';
import { useEffect, useRef, useSyncExternalStore } from 'react';

import { Emitter } from '@dr.pogodin/js-utils';

import GlobalState from './GlobalState';
import { getGlobalState } from './GlobalStateProvider';

import {
  type CallbackT,
  type ForceT,
  type TypeLock,
  type ValueAtPathT,
  type ValueOrInitializerT,
  isDebugMode,
} from './utils';

export type SetterT<T> = React.Dispatch<React.SetStateAction<T>>;

type GlobalStateRef = {
  emitter: Emitter<[]>;
  globalState: GlobalState<unknown>;
  path: null | string | undefined;
  setter: SetterT<unknown>;
  state: unknown;
  watcher: CallbackT;
};

export type UseGlobalStateResT<T> = [T, SetterT<T>];

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
 * @param path Dot-delimitered state path. It can be undefined to
 * subscribe for entire state.
 *
 * Under-the-hood state values are read and written using `lodash`
 * [_.get()](https://lodash.com/docs/4.17.15#get) and
 * [_.set()](https://lodash.com/docs/4.17.15#set) methods, thus it is safe
 * to access state paths which have not been created before.
 * @param initialValue Initial value to set at the `path`, or its
 * factory:
 * - If a function is given, it will act similar to
 *   [the lazy initial state of the standard React's useState()](https://reactjs.org/docs/hooks-reference.html#lazy-initial-state):
 *   only if the value at `path` is `undefined`, the function will be executed,
 *   and the value it returns will be written to the `path`.
 * - Otherwise, the given value itself will be written to the `path`,
 *   if the current value at `path` is `undefined`.
 * @return It returs an array with two elements: `[value, setValue]`:
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

function useGlobalState<StateT>(): UseGlobalStateResT<StateT>;

function useGlobalState<Forced extends ForceT | false = false, ValueT = unknown>(
  path: null | string | undefined,
  initialValue?: ValueOrInitializerT<TypeLock<Forced, never, ValueT>>,
): UseGlobalStateResT<TypeLock<Forced, void, ValueT>>;

function useGlobalState<
  StateT,
  PathT extends null | string | undefined,
>(
  path: PathT,
  initialValue?: ValueOrInitializerT<ValueAtPathT<StateT, PathT, never>>
): UseGlobalStateResT<ValueAtPathT<StateT, PathT, void>>;

function useGlobalState(
  path?: null | string,
  initialValue?: ValueOrInitializerT<unknown>,
): UseGlobalStateResT<any> {
  const globalState = getGlobalState();

  const ref = useRef<GlobalStateRef>();
  const rc: GlobalStateRef = ref.current || {
    emitter: new Emitter(),
    globalState,
    path,
    setter: (value) => {
      const newState = isFunction(value) ? value(rc.state) : value;
      if (process.env.NODE_ENV !== 'production' && isDebugMode()) {
        /* eslint-disable no-console */
        console.groupCollapsed(
          `ReactGlobalState - useGlobalState setter triggered for path ${
            rc.path || ''
          }`,
        );
        console.log('New value:', cloneDeep(newState));
        console.groupEnd();
        /* eslint-enable no-console */
      }
      rc.globalState.set<ForceT, unknown>(rc.path, newState);
    },
    state: isFunction(initialValue) ? initialValue() : initialValue,
    watcher: () => {
      const state = rc.globalState.get(rc.path);
      if (state !== rc.state) rc.emitter.emit();
    },
  };
  ref.current = rc;

  rc.globalState = globalState;
  rc.path = path;

  rc.state = useSyncExternalStore(
    (cb) => rc.emitter.addListener(cb),
    () => rc.globalState.get<ForceT, unknown>(rc.path, { initialValue }),
    () => rc.globalState.get<ForceT, unknown>(rc.path, { initialValue, initialState: true }),
  );

  useEffect(() => {
    const { watcher } = ref.current!;
    globalState.watch(watcher);
    watcher();
    return () => globalState.unWatch(watcher);
  }, [globalState]);

  useEffect(() => {
    ref.current!.watcher();
  }, [path]);

  return [rc.state, rc.setter];
}

export default useGlobalState;
