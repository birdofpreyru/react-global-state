/* eslint-disable react/prop-types */

import React, { useContext, useState } from 'react';

import GlobalState from './GlobalState';

const context = React.createContext();

/**
 * Gets GlobalState instance from the context.
 */
export function getGlobalState() {
  const globalState = useContext(context);
  if (!globalState) throw new Error('Missing GlobalStateProvider');
  return globalState;
}

/**
 * Returns SSR context.
 * @param {Boolean} [throwWithoutSsrContext=true] When `true` (default),
 *  this function will throw if no SSR context is attached to the global state,
 *  set `false` to not throw in such case. The function will still throw if
 *  the GlobalStateProvider (hence the state) is missing.
 * @returns {Object} SSR context.
 */
export function getSsrContext(throwWithoutSsrContext = true) {
  const { ssrContext } = getGlobalState();
  if (!ssrContext && throwWithoutSsrContext) {
    throw new Error('No SSR context found');
  }
  return ssrContext;
}

/**
 * Provides global state store to the wrapped components.
 * @param {React.Node} [children] Provider children.
 * @param {Any} [initialState] Initial state.
 * @param {Object} [ssrContext] Server-side rendering context.
 * @param {Boolean} [stateProxy] Optional. Tells the provider to re-provide
 *  the global state project from a parent context, rather than to create
 *  a new one. Such feature is useful for code-splitting with SSR support.
 * @returns {React.ElementType}
 */
export default function GlobalStateProvider({
  children,
  initialState,
  ssrContext,
  stateProxy,
}) {
  let state;
  if (stateProxy) state = getGlobalState();
  else [state] = useState(new GlobalState(initialState, ssrContext));
  return (
    <context.Provider value={state}>
      {children}
    </context.Provider>
  );
}
