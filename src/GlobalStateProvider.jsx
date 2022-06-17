/* eslint-disable react/prop-types */

import { createContext, useContext, useRef } from 'react';

import GlobalState from './GlobalState';

const context = createContext();

/**
 * Gets {@link GlobalState} instance from the context. In most cases
 * you should use {@link useGlobalState}, and other hooks to interact with
 * the global state, instead of accessing it directly.
 * @return {GlobalState}
 */
export function getGlobalState() {
  // Here Rules of Hooks are violated because "getGlobalState()" does not follow
  // convention that hook names should start with use... This is intentional in
  // our case, as getGlobalState() hook is intended for advance scenarious,
  // while the normal interaction with the global state should happen via
  // another hook, useGlobalState().
  /* eslint-disable react-hooks/rules-of-hooks */
  const globalState = useContext(context);
  /* eslint-enable react-hooks/rules-of-hooks */
  if (!globalState) throw new Error('Missing GlobalStateProvider');
  return globalState;
}

/**
 * @category Hooks
 * @desc Gets SSR context.
 * @param {boolean} [throwWithoutSsrContext=true] If `true` (default),
 * this hook will throw if no SSR context is attached to the global state;
 * set `false` to not throw in such case. In either case the hook will throw
 * if the {@link &lt;GlobalStateProvider&gt;} (hence the state) is missing.
 * @returns {SsrContext} SSR context.
 * @throws
 * - If current component has no parent {@link &lt;GlobalStateProvider&gt;}
 *   in the rendered React tree.
 * - If `throwWithoutSsrContext` is `true`, and there is no SSR context attached
 *   to the global state provided by {@link &lt;GlobalStateProvider&gt;}.
 */
export function getSsrContext(throwWithoutSsrContext = true) {
  const { ssrContext } = getGlobalState();
  if (!ssrContext && throwWithoutSsrContext) {
    throw new Error('No SSR context found');
  }
  return ssrContext;
}

/**
 * Provides global state to its children.
 * @prop {ReactNode} [children] Component children, which will be provided with
 * the global state, and rendered in place of the provider.
 * @prop {any} [initialState] Initial content of the global state.
 * @prop {SsrContext} [ssrContext] Server-side rendering (SSR) context.
 * @prop {boolean|GlobalState} [stateProxy] This option is useful for code
 * splitting and SSR implementation:
 * - If `true`, this provider instance will fetch and reuse the global state
 *   from a parent provider.
 * - If `GlobalState` instance, it will be used by this provider.
 * - If not given, a new `GlobalState` instance will be created and used.
 */
export default function GlobalStateProvider({
  children,
  initialState,
  ssrContext,
  stateProxy,
}) {
  const state = useRef();
  if (!state.current) {
    if (stateProxy instanceof GlobalState) state.current = stateProxy;
    else if (stateProxy) state.current = getGlobalState();
    else state.current = new GlobalState(initialState, ssrContext);
  }
  return (
    <context.Provider value={state.current}>
      {children}
    </context.Provider>
  );
}
