/**
 * Loads and uses async data into the GlobalState path.
 */

import { cloneDeep } from 'lodash';
import { useEffect } from 'react';
import { v4 as uuid } from 'uuid';

import { MIN_MS } from '@dr.pogodin/js-utils';

import AsyncDataEnvelope from './AsyncDataEnvelope';
import { getGlobalState } from './GlobalStateProvider';
import useGlobalState from './useGlobalState';
import { isDebugMode } from './utils';

import GlobalState from './GlobalState';

const DEFAULT_MAXAGE = 5 * MIN_MS; // 5 minutes.

export type AsyncDataLoaderT<DataT> = (oldData: null | DataT) => Promise<DataT>;

export type UseAsyncDataOptionsT = {
  deps?: unknown[];
  garbageCollectAge?: number;
  maxage?: number;
  noSSR?: boolean;
  refreshAge?: number;
};

/**
 * Executes the data loading operation.
 * @param path Data segment path inside the global state.
 * @param loader Data loader.
 * @param globalState The global state instance.
 * @param oldData Optional. Previously fetched data, currently stored in
 *  the state, if already fetched by the caller; otherwise, they will be fetched
 *  by the load() function itself.
 * @param opIdPrefix operationId prefix to use, which should be
 * 'C' at the client-side (default), or 'S' at the server-side (within SSR
 * context).
 * @return Resolves once the operation is done.
 * @ignore
 */
async function load<DataT>(
  path: null | string | undefined,
  loader: AsyncDataLoaderT<DataT>,
  globalState: GlobalState<unknown>,
  oldData: DataT | null,
  opIdPrefix: 'C' | 'S' = 'C',
): Promise<void> {
  if (process.env.NODE_ENV !== 'production' && isDebugMode()) {
    /* eslint-disable no-console */
    console.log(
      `ReactGlobalState: useAsyncData data (re-)loading. Path: "${path || ''}"`,
    );
    /* eslint-enable no-console */
  }
  const operationId = opIdPrefix + uuid();
  const operationIdPath = path ? `${path}.operationId` : 'operationId';
  globalState.set<1, string>(operationIdPath, operationId);
  const data = await loader(
    oldData || (globalState.get(path) as AsyncDataEnvelope<DataT>).data,
  );
  const state: AsyncDataEnvelope<DataT> = globalState.get(path);
  if (operationId === state.operationId) {
    if (process.env.NODE_ENV !== 'production' && isDebugMode()) {
      /* eslint-disable no-console */
      console.groupCollapsed(
        `ReactGlobalState: useAsyncData data (re-)loaded. Path: "${
          path || ''
        }"`,
      );
      console.log('Data:', cloneDeep(data));
      /* eslint-enable no-console */
    }
    globalState.set(path, {
      ...state,
      data,
      operationId: '',
      timestamp: Date.now(),
    });
    if (process.env.NODE_ENV !== 'production' && isDebugMode()) {
      /* eslint-disable no-console */
      console.groupEnd();
      /* eslint-enable no-console */
    }
  }
}

/**
 * Resolves asynchronous data, and stores them at given `path` of global
 * state. When multiple components rely on asynchronous data at the same `path`,
 * the data are resolved once, and reused until their age is within specified
 * bounds. Once the data are stale, the hook allows to refresh them. It also
 * garbage-collects stale data from the global state when the last component
 * relying on them is unmounted.
 * @param path Dot-delimitered state path, where data envelop is
 * stored.
 * @param loader Asynchronous function which resolves (loads)
 * data, which should be stored at the global state `path`. When multiple
 * components
 * use `useAsyncData()` hook for the same `path`, the library assumes that all
 * hook instances are called with the same `loader` (_i.e._ whichever of these
 * loaders is used to resolve async data, the result is acceptable to be reused
 * in all related components).
 * @param options Additional options.
 * @param options.deps An array of dependencies, which trigger
 * data reload when changed. Given dependency changes are watched shallowly
 * (similarly to the standard React's
 * [useEffect()](https://reactjs.org/docs/hooks-reference.html#useeffect)).
 * @param options.noSSR If `true`, this hook won't load data during
 * server-side rendering.
 * @param options.garbageCollectAge The maximum age of data
 * (in milliseconds), after which they are dropped from the state when the last
 * component referencing them via `useAsyncData()` hook unmounts. Defaults to
 * `maxage` option value.
 * @param options.maxage The maximum age of
 * data (in milliseconds) acceptable to the hook's caller. If loaded data are
 * older than this value, `null` is returned instead. Defaults to 5 minutes.
 * @param options.refreshAge The maximum age of data
 * (in milliseconds), after which their refreshment will be triggered when
 * any component referencing them via `useAsyncData()` hook (re-)renders.
 * Defaults to `maxage` value.
 * @return Returns an object with three fields: `data` holds the actual result of
 * last `loader` invokation, if any, and if satisfies `maxage` limit; `loading`
 * is a boolean flag, which is `true` if data are being loaded (the hook is
 * waiting for `loader` function resolution); `timestamp` (in milliseconds)
 * is Unix timestamp of related data currently loaded into the global state.
 *
 * Note that loaded data, if any, are stored at the given `path` of global state
 * along with related meta-information, using slightly different state segment
 * structure (see {@link AsyncDataEnvelopeT}). That segment of the global state
 * can be accessed, and even modified using other hooks,
 * _e.g._ {@link useGlobalState}, but doing so you may interfere with related
 * `useAsyncData()` hooks logic.
 */

export default function useAsyncData<DataT>(
  path: null | string | undefined,
  loader: AsyncDataLoaderT<DataT>,
  options: UseAsyncDataOptionsT = {},
): { data: null | DataT; loading: boolean; timestamp: number } {
  const maxage: number = options.maxage === undefined
    ? DEFAULT_MAXAGE : options.maxage;

  const refreshAge: number = options.refreshAge === undefined
    ? maxage : options.refreshAge;

  const garbageCollectAge: number = options.garbageCollectAge === undefined
    ? maxage : options.garbageCollectAge;

  // Note: here we can't depend on useGlobalState() to init the initial value,
  // because that way we'll have issues with SSR (see details below).
  const globalState = getGlobalState();
  const state = globalState.get<1, AsyncDataEnvelope<DataT>>(path, {
    initialValue: {
      data: null,
      numRefs: 0,
      operationId: '',
      timestamp: 0,
    },
  });

  if (globalState.ssrContext && !options.noSSR) {
    if (!state.timestamp && !state.operationId) {
      globalState.ssrContext.pending.push(
        load(path, loader, globalState, state.data, 'S'),
      );
    }
  } else {
    // This takes care about the client-side reference counting, and garbage
    // collection.
    //
    // Note: the Rules of Hook below are violated by conditional call to a hook,
    // but as the condition is actually server-side or client-side environment,
    // it is effectively non-conditional at the runtime.
    //
    // TODO: Though, maybe there is a way to refactor it into a cleaner code.
    // The same applies to other useEffect() hooks below.
    useEffect(() => { // eslint-disable-line react-hooks/rules-of-hooks
      const numRefsPath = path ? `${path}.numRefs` : 'numRefs';
      const numRefs = globalState.get<1, number>(numRefsPath);
      globalState.set<1, number>(numRefsPath, numRefs + 1);
      return () => {
        const state2: AsyncDataEnvelope<DataT> = globalState.get(path);
        if (
          state2.numRefs === 1
          && garbageCollectAge < Date.now() - state2.timestamp
        ) {
          if (process.env.NODE_ENV !== 'production' && isDebugMode()) {
            /* eslint-disable no-console */
            console.log(
              `ReactGlobalState - useAsyncData garbage collected at path ${
                path || ''
              }`,
            );
            /* eslint-enable no-console */
          }
          globalState.set(path, {
            ...state2,
            data: null,
            numRefs: 0,
            timestamp: 0,
          });
        } else globalState.set<1, number>(numRefsPath, state2.numRefs - 1);
      };
    }, [garbageCollectAge, globalState, path]);

    // Note: a bunch of Rules of Hooks ignored belows because in our very
    // special case the otherwise wrong behavior is actually what we need.

    // Data loading and refreshing.
    let loadTriggered = false;
    useEffect(() => { // eslint-disable-line react-hooks/rules-of-hooks
      const state2: AsyncDataEnvelope<DataT> = globalState.get(path);
      if (refreshAge < Date.now() - state2.timestamp
      && (!state2.operationId || state2.operationId.charAt(0) === 'S')) {
        load(path, loader, globalState, state2.data);
        loadTriggered = true; // eslint-disable-line react-hooks/exhaustive-deps
      }
    });

    const deps = options.deps || [];
    useEffect(() => { // eslint-disable-line react-hooks/rules-of-hooks
      if (!loadTriggered && deps.length) load(path, loader, globalState, null);
    }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  }

  const [localState] = useGlobalState<1, AsyncDataEnvelope<DataT>>(path, {
    data: null,
    numRefs: 0,
    operationId: '',
    timestamp: 0,
  });

  return {
    data: maxage < Date.now() - localState.timestamp ? null : localState.data,
    loading: Boolean(localState.operationId),
    timestamp: localState.timestamp,
  };
}
