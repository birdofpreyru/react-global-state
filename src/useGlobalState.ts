// Hook for updates of global state.

import isFunction from 'lodash/isFunction';

import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import { Emitter } from '@dr.pogodin/js-utils';

import type GlobalState from './GlobalState';
import { getGlobalState } from './GlobalStateProvider';

import {
  type ForceT,
  type LockT,
  type TypeLock,
  type ValueAtPathT,
  type ValueOrInitializerT,
  cloneDeepForLog,
  isDebugMode,
} from './utils';

export type SetterT<T> = Dispatch<SetStateAction<T>>;

type ListenerT = () => void;

type CurrentT = {
  globalState: GlobalState<unknown>;
  path: null | string | undefined;
  prevValue: unknown;
};

type StableT = {
  emitter: Emitter<[]>;
  setter: SetterT<unknown>;
  subscribe: (listener: ListenerT) => () => void;
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

// "Enforced type overload"
function useGlobalState<
  Forced extends ForceT | LockT = LockT,
  ValueT = void,
>(
  path: null | string | undefined,
  initialValue?: ValueOrInitializerT<TypeLock<Forced, never, ValueT>>,
): UseGlobalStateResT<TypeLock<Forced, void, ValueT>>;

// "Entire state overload"
function useGlobalState<StateT>(): UseGlobalStateResT<StateT>;

// "State evaluation overload"
function useGlobalState<
  StateT,
  PathT extends null | string | undefined,
>(
  path: PathT,
  initialValue: ValueOrInitializerT<
    Exclude<ValueAtPathT<StateT, PathT, never>, undefined>>,
): UseGlobalStateResT<Exclude<ValueAtPathT<StateT, PathT, void>, undefined>>;

function useGlobalState<
  StateT,
  PathT extends null | string | undefined,
>(
  path: PathT,
  initialValue?: ValueOrInitializerT<ValueAtPathT<StateT, PathT, never>>,
): UseGlobalStateResT<ValueAtPathT<StateT, PathT, void>>;

function useGlobalState(
  path?: null | string,
  // TODO: Revise it later!
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialValue?: ValueOrInitializerT<any>,

  // TODO: Revise it later!
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): UseGlobalStateResT<any> {
  const globalState = getGlobalState();

  const ref = useRef<CurrentT>(null);

  const [stable] = useState<StableT>(() => {
    const emitter = new Emitter();
    const setter = (value: unknown) => {
      const rc = ref.current;
      if (!rc) throw Error('Internal error');

      const newState = isFunction(value)
        ? value(rc.globalState.get(rc.path)) as unknown
        : value;

      if (process.env.NODE_ENV !== 'production' && isDebugMode()) {
        /* eslint-disable no-console */
        console.groupCollapsed(
          `ReactGlobalState - useGlobalState setter triggered for path ${
            rc.path ?? ''
          }`,
        );
        console.log('New value:', cloneDeepForLog(newState, rc.path ?? ''));
        console.groupEnd();
        /* eslint-enable no-console */
      }
      rc.globalState.set<ForceT, unknown>(rc.path, newState);

      // NOTE: The regular global state's update notifications, automatically
      // triggered by the rc.globalState.set() call above, are batched, and
      // scheduled to fire asynchronosuly at a later time, which is problematic
      // for managed text inputs - if they have their value update delayed to
      // future render cycles, it will result in reset of their cursor position
      // to the value end. Calling the rc.emitter.emit() below causes a sooner
      // state update for the current component, thus working around the issue.
      // For additional details see the original issue:
      // https://github.com/birdofpreyru/react-global-state/issues/22
      if (newState !== rc.prevValue) emitter.emit();
    };
    const subscribe = emitter.addListener.bind(emitter);
    return { emitter, setter, subscribe };
  });

  const value = useSyncExternalStore(
    stable.subscribe,
    () => globalState.get<ForceT, unknown>(path, { initialValue }),

    () => globalState.get<ForceT, unknown>(
      path,
      { initialState: true, initialValue },
    ),
  );

  ref.current ??= {
    globalState,
    path,
    prevValue: value,
  };

  useEffect(() => {
    ref.current = {
      globalState,
      path,
      prevValue: ref.current!.prevValue,
    };

    const watcher = () => {
      const nextValue = globalState.get<ForceT, unknown>(path);
      if (ref.current!.prevValue !== nextValue) {
        ref.current!.prevValue = nextValue;
        stable.emitter.emit();
      }
    };

    globalState.watch(watcher);
    watcher();

    return () => {
      globalState.unWatch(watcher);
    };
  }, [globalState, stable.emitter, path]);

  return [value, stable.setter];
}

export default useGlobalState;

// TODO: Revise.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface UseGlobalStateI<StateT> {
  (): UseGlobalStateResT<StateT>;

  <PathT extends null | string | undefined>(
    path: PathT,
    initialValue: ValueOrInitializerT<
      Exclude<ValueAtPathT<StateT, PathT, never>, undefined>>
  ): UseGlobalStateResT<Exclude<ValueAtPathT<StateT, PathT, void>, undefined>>;

  <PathT extends null | string | undefined>(
    path: PathT,
    initialValue?: ValueOrInitializerT<ValueAtPathT<StateT, PathT, never>>
  ): UseGlobalStateResT<ValueAtPathT<StateT, PathT, void>>;

  <Forced extends ForceT | LockT = LockT, ValueT = unknown>(
    path: null | string | undefined,
    initialValue?: ValueOrInitializerT<TypeLock<Forced, never, ValueT>>,
  ): UseGlobalStateResT<TypeLock<Forced, void, ValueT>>;
}
