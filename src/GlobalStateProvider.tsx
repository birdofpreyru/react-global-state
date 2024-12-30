import { isFunction } from 'lodash';

import {
  type ReactNode,
  createContext,
  use,
  useRef,
} from 'react';

import GlobalState from './GlobalState';
import SsrContext from './SsrContext';

import { type ValueOrInitializerT } from './utils';

const Context = createContext<GlobalState<unknown> | null>(null);

/**
 * Gets {@link GlobalState} instance from the context. In most cases
 * you should use {@link useGlobalState}, and other hooks to interact with
 * the global state, instead of accessing it directly.
 * @return
 */
export function getGlobalState<
  StateT,
  SsrContextT extends SsrContext<StateT> = SsrContext<StateT>,
>(): GlobalState<StateT, SsrContextT> {
  const globalState = use(Context);
  if (!globalState) throw new Error('Missing GlobalStateProvider');
  return globalState as GlobalState<StateT, SsrContextT>;
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
export function getSsrContext<
  SsrContextT extends SsrContext<unknown>,
>(
  throwWithoutSsrContext = true,
): SsrContextT | undefined {
  const { ssrContext } = getGlobalState<SsrContextT['state'], SsrContextT>();
  if (!ssrContext && throwWithoutSsrContext) {
    throw new Error('No SSR context found');
  }
  return ssrContext;
}

type NewStateProps<StateT, SsrContextT extends SsrContext<StateT>> = {
  initialState: ValueOrInitializerT<StateT>,
  ssrContext?: SsrContextT;
};

type GlobalStateProviderProps<
  StateT,
  SsrContextT extends SsrContext<StateT>,
> = {
  children?: ReactNode;
} & (NewStateProps<StateT, SsrContextT> | {
  stateProxy: true | GlobalState<StateT, SsrContextT>;
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
const GlobalStateProvider = <
  StateT,
  SsrContextT extends SsrContext<StateT> = SsrContext<StateT>,
>({ children, ...rest }: GlobalStateProviderProps<StateT, SsrContextT>) => {
  type GST = GlobalState<StateT, SsrContextT>;
  const localStateRef = useRef<GST>(undefined);
  let state: GST;
  if ('stateProxy' in rest && rest.stateProxy) {
    localStateRef.current = undefined;
    state = rest.stateProxy === true ? getGlobalState() : rest.stateProxy;
  } else {
    if (!localStateRef.current) {
      const { initialState, ssrContext } = rest as NewStateProps<StateT, SsrContextT>;
      localStateRef.current = new GlobalState(
        isFunction(initialState) ? initialState() : initialState,
        ssrContext,
      );
    }
    state = localStateRef.current;
  }
  return <Context value={state}>{children}</Context>;
};

export default GlobalStateProvider;
