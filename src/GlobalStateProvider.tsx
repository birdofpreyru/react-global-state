import {
  type ReactNode,
  createContext,
  use,
  useState,
} from 'react';

import GlobalState from './GlobalState';
import type SsrContext from './SsrContext';

import type { ValueOrInitializerT } from './utils';

const Context = createContext<GlobalState<unknown> | null>(null);

/**
 * Returns the GlobalState object from the context. In most cases you should use
 * other hooks, like useGlobalState(), etc. to interact with the global state,
 * instead of accessing the GlobalState object directly.
 */
export function useGlobalStateObject<
  StateT,
  SsrContextT extends SsrContext<StateT> = SsrContext<StateT>,
>(): GlobalState<StateT, SsrContextT> {
  const globalState = use(Context);
  if (!globalState) throw new Error('Missing GlobalStateProvider');
  return globalState as GlobalState<StateT, SsrContextT>;
}

/**
 * Returns SSR context.
 * @param throwWithoutSsrContext - If _true_ (default), this hook will throw
 *  if no SSR context is attached to the global state; set _false_ to not throw
 *  in such case. In either case this hook will throw if the <GlobalStateProvider>
 *  (hence the global state) is missing.
 * @returns SSR context.
 * @throws
 *  - If current component has no parent <GlobalStateProvider> in the rendered
 *    React tree.
 *  - If `throwWithoutSsrContext` is _true_ (default), and there is no SSR
 *    context attached to the global state provided by <GlobalStateProvider>.
 */
export function useSsrContext<
  SsrContextT extends SsrContext<unknown>,
>(
  throwWithoutSsrContext = true,
): SsrContextT | undefined {
  const { ssrContext } = useGlobalStateObject<SsrContextT['state'], SsrContextT>();
  if (!ssrContext && throwWithoutSsrContext) {
    throw new Error('No SSR context found');
  }
  return ssrContext;
}

type NewStateProps<StateT, SsrContextT extends SsrContext<StateT>> = {
  initialState: ValueOrInitializerT<StateT>;
  ssrContext?: SsrContextT;
};

type GlobalStateProviderProps<
  StateT,
  SsrContextT extends SsrContext<StateT>,
> = (NewStateProps<StateT, SsrContextT> | {
  stateProxy: GlobalState<StateT, SsrContextT> | true;
}) & {
  children?: ReactNode;
};

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
const GlobalStateProvider = <
  StateT,
  SsrContextT extends SsrContext<StateT> = SsrContext<StateT>,
>(
  { children, ...rest }: GlobalStateProviderProps<StateT, SsrContextT>,
): ReactNode => {
  type GST = GlobalState<StateT, SsrContextT>;

  const [localState, setLocalState] = useState<GST>();

  let state: GST;

  // Below we cast `rest.stateProxy` as "boolean" for safe backward
  // compatibility with plain JavaScript (as TypeScript typings only
  // permit "true" or GlobalState value; while legacy codebase may
  // pass in a boolean value here, occasionally equal "false").
  if ('stateProxy' in rest && (rest.stateProxy as boolean)) {
    if (localState) setLocalState(undefined);

    if (rest.stateProxy === true) {
      const gs = use(Context);
      if (!gs) throw Error('Missing GlobalStateProvider');
      state = gs as GlobalState<StateT, SsrContextT>;
    } else state = rest.stateProxy;
  } else if (localState) {
    state = localState;
  } else {
    const {
      initialState,
      ssrContext,
    } = rest as NewStateProps<StateT, SsrContextT>;

    state = new GlobalState(
      typeof initialState === 'function' ? (initialState as () => StateT)() : initialState,
      ssrContext,
    );

    setLocalState(state);
  }

  return <Context value={state}>{children}</Context>;
};

export default GlobalStateProvider;
