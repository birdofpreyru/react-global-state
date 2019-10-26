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
 * Provides global state store to the wrapped components.
 * @param {Any} initialState Initial state.
 * @return {React.ElementType}
 */
export default function GlobalStateProvider({
  children,
  initialState,
}) {
  const [state] = useState(new GlobalState(initialState));
  return (
    <context.Provider value={state}>
      {children}
    </context.Provider>
  );
}
