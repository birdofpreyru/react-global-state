/* eslint-disable react/prop-types */

import { isFunction } from 'lodash';

import {
  type ReactNode,
  createContext,
  useContext,
  useRef,
} from 'react';

import GlobalState from './GlobalState';
import SsrContext from './SsrContext';

const context = createContext<unknown>(undefined);

/**
 * Gets {@link GlobalState} instance from the context. In most cases
 * you should use {@link useGlobalState}, and other hooks to interact with
 * the global state, instead of accessing it directly.
 * @return
 */
export function getGlobalState<T>(): GlobalState<T> {
  // Here Rules of Hooks are violated because "getGlobalState()" does not follow
  // convention that hook names should start with use... This is intentional in
  // our case, as getGlobalState() hook is intended for advance scenarious,
  // while the normal interaction with the global state should happen via
  // another hook, useGlobalState().
  /* eslint-disable react-hooks/rules-of-hooks */
  const globalState = useContext(context as React.Context<GlobalState<T>>);
  /* eslint-enable react-hooks/rules-of-hooks */
  if (!globalState) throw new Error('Missing GlobalStateProvider');
  return globalState;
}

/**
 * @category Hooks
 * @desc Gets SSR context.
 * @param throwWithoutSsrContext If `true` (default),
 * this hook will throw if no SSR context is attached to the global state;
 * set `false` to not throw in such case. In either case the hook will throw
 * if the {@link &lt;GlobalStateProvider&gt;} (hence the state) is missing.
 * @returns SSR context.
 * @throws
 * - If current component has no parent {@link &lt;GlobalStateProvider&gt;}
 *   in the rendered React tree.
 * - If `throwWithoutSsrContext` is `true`, and there is no SSR context attached
 *   to the global state provided by {@link &lt;GlobalStateProvider&gt;}.
 */
export function getSsrContext<T>(
  throwWithoutSsrContext = true,
): SsrContext<T> | undefined {
  const { ssrContext } = getGlobalState<T>();
  if (!ssrContext && throwWithoutSsrContext) {
    throw new Error('No SSR context found');
  }
  return ssrContext;
}

type NewStateProps<T> = {
  initialState: T | (() => T);
  ssrContext?: SsrContext<T>;
};

type GlobalStateProviderProps<T> = {
  children?: ReactNode;
} & (NewStateProps<T> | {
  stateProxy: true | GlobalState<T>;
});

/**
 * Provides global state to its children.
 * @param prop.children Component children, which will be provided with
 * the global state, and rendered in place of the provider.
 * @param prop.initialState Initial content of the global state.
 * @param prop.ssrContext Server-side rendering (SSR) context.
 * @param prop.stateProxy This option is useful for code
 * splitting and SSR implementation:
 * - If `true`, this provider instance will fetch and reuse the global state
 *   from a parent provider.
 * - If `GlobalState` instance, it will be used by this provider.
 * - If not given, a new `GlobalState` instance will be created and used.
 */
export default function GlobalStateProvider<T>(
  { children, ...rest }: GlobalStateProviderProps<T>,
) {
  const state = useRef<GlobalState<T>>();
  if (!state.current) {
    // NOTE: The last part of condition, "&& rest.stateProxy", is needed for
    // graceful compatibility with JavaScript - if "undefined" stateProxy value
    // is given, we want to follow the second branch, which creates a new
    // GlobalState with whatever intiialState given.
    if ('stateProxy' in rest && rest.stateProxy) {
      if (rest.stateProxy === true) state.current = getGlobalState();
      else state.current = rest.stateProxy;
    } else {
      const { initialState, ssrContext } = rest as NewStateProps<T>;

      state.current = new GlobalState<T>(
        isFunction(initialState) ? initialState() : initialState,
        ssrContext,
      );
    }
  }
  return (
    <context.Provider value={state.current}>
      {children}
    </context.Provider>
  );
}

GlobalStateProvider.defaultProps = {
  children: undefined,
};
