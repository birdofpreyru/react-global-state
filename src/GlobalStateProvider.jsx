/* eslint-disable react/prop-types */

/**
 * @typedef {object} SsrContext Holds global-state-related information,
 * which should be persistent across rendering iterations during server-side
 * rendering (SSR). For the first SSR iteration any object, including an empty
 * `{}`, may be provided to {@link &lt;GlobalStateProvider&gt;}: in either case
 * all its fields listed below will be (re-)initialized as needed, and any other
 * fields contained in the object won't be touched by the library (thus, you may
 * use it to keep other data you need across SSR iterations, and you can access
 * it from React components via {@link getSsrContext} hook).
 * @prop {boolean} dirty `true` if the global state has been modified in
 * the last SSR iteration; `false` otherwise.
 * @prop {Promise[]} pending An array of promises waiting for completion of
 * asynchronous state operations (like {@link useAsyncData}), initiated during
 * the last SSR iteration.
 * @prop {any} state The global state content at the end of last SSR iteration.
 */

import { createContext, useContext, useState } from 'react';

import GlobalState from './GlobalState';

const context = createContext();

/**
 * @category Hooks
 * @desc Gets {@link GlobalState} instance from the context. In most cases
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
 * @category Components
 * @name &lt;GlobalStateProvider&gt;
 * @desc Provides global state to its children.
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
  let state;
  // Here Rules of Hooks are violated because hooks are called conditionally,
  // however we assume that these properties should not change at runtime, thus
  // the actual hook order is preserved. Probably, it should be handled better,
  // though.
  /* eslint-disable react-hooks/rules-of-hooks */
  if (stateProxy instanceof GlobalState) state = stateProxy;
  else if (stateProxy) state = getGlobalState();
  else [state] = useState(new GlobalState(initialState, ssrContext));
  /* eslint-enable react-hooks/rules-of-hooks */
  return (
    <context.Provider value={state}>
      {children}
    </context.Provider>
  );
}
