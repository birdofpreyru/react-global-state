/* eslint-disable react/prop-types */

import { isFunction } from 'lodash';

import {
  type ReactNode,
  createContext,
  useContext,
  useRef,
} from 'react';

import GlobalState, { type ValueOrInitializerT } from './GlobalState';
import SsrContext from './SsrContext';

const context = createContext<GlobalState<unknown> | null>(null);

/**
 * Gets {@link GlobalState} instance from the context. In most cases
 * you should use {@link useGlobalState}, and other hooks to interact with
 * the global state, instead of accessing it directly.
 * @return
 */
export function getGlobalState<StateT>(): GlobalState<StateT> {
  // Here Rules of Hooks are violated because "getGlobalState()" does not follow
  // convention that hook names should start with use... This is intentional in
  // our case, as getGlobalState() hook is intended for advance scenarious,
  // while the normal interaction with the global state should happen via
  // another hook, useGlobalState().
  /* eslint-disable react-hooks/rules-of-hooks */
  const globalState = useContext(context);
  /* eslint-enable react-hooks/rules-of-hooks */
  if (!globalState) throw new Error('Missing GlobalStateProvider');
  return globalState as GlobalState<StateT>;
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
export function getSsrContext<StateT>(
  throwWithoutSsrContext = true,
): SsrContext<StateT> | undefined {
  const { ssrContext } = getGlobalState<StateT>();
  if (!ssrContext && throwWithoutSsrContext) {
    throw new Error('No SSR context found');
  }
  return ssrContext;
}

type NewStateProps<StateT> = {
  initialState: ValueOrInitializerT<StateT>,
  ssrContext?: SsrContext<StateT>;
};

type GlobalStateProviderProps<StateT> = {
  children?: ReactNode;
} & (NewStateProps<StateT> | {
  stateProxy: true | GlobalState<StateT>;
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
export default function GlobalStateProvider<StateT>(
  { children, ...rest }: GlobalStateProviderProps<StateT>,
) {
  const state = useRef<GlobalState<StateT>>();
  if (!state.current) {
    // NOTE: The last part of condition, "&& rest.stateProxy", is needed for
    // graceful compatibility with JavaScript - if "undefined" stateProxy value
    // is given, we want to follow the second branch, which creates a new
    // GlobalState with whatever intiialState given.
    if ('stateProxy' in rest && rest.stateProxy) {
      if (rest.stateProxy === true) state.current = getGlobalState();
      else state.current = rest.stateProxy;
    } else {
      const { initialState, ssrContext } = rest as NewStateProps<StateT>;

      state.current = new GlobalState<StateT>(
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
