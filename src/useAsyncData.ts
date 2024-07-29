/**
 * Loads and uses async data into the GlobalState path.
 */

import { useEffect, useRef } from 'react';
import { v4 as uuid } from 'uuid';

import { MIN_MS } from '@dr.pogodin/js-utils';

import { getGlobalState } from './GlobalStateProvider';
import useGlobalState from './useGlobalState';

import {
  type ForceT,
  type LockT,
  type TypeLock,
  type ValueAtPathT,
  cloneDeepForLog,
  isDebugMode,
} from './utils';

import GlobalState from './GlobalState';
import SsrContext from './SsrContext';

const DEFAULT_MAXAGE = 5 * MIN_MS; // 5 minutes.

export type AsyncDataLoaderT<DataT>
= (oldData: null | DataT, meta: {
  isAborted: () => boolean;
  oldDataTimestamp: number;
}) => DataT | Promise<DataT | null> | null;

export type AsyncDataReloaderT<DataT>
= (loader?: AsyncDataLoaderT<DataT>) => Promise<void>;

export type AsyncDataEnvelopeT<DataT> = {
  data: null | DataT;
  numRefs: number;
  operationId: string;
  timestamp: number;
};

export function newAsyncDataEnvelope<DataT>(
  initialData: DataT | null = null,
  { numRefs = 0, timestamp = 0 } = {},
): AsyncDataEnvelopeT<DataT> {
  return {
    data: initialData,
    numRefs,
    operationId: '',
    timestamp,
  };
}

export type UseAsyncDataOptionsT = {
  deps?: unknown[];
  garbageCollectAge?: number;
  maxage?: number;
  noSSR?: boolean;
  refreshAge?: number;
};

export type UseAsyncDataResT<DataT> = {
  data: DataT | null;
  loading: boolean;
  reload: AsyncDataReloaderT<DataT>;
  timestamp: number;
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
  globalState: GlobalState<unknown, SsrContext<unknown>>,
  oldArg?: { data: DataT | null, timestamp: number },
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
  globalState.set<ForceT, string>(operationIdPath, operationId);

  let old = oldArg;
  if (!old) {
    // TODO: Can we improve the typing, to avoid ForceT?
    const e = globalState.get<ForceT, AsyncDataEnvelopeT<DataT>>(path);
    old = { data: e.data, timestamp: e.timestamp };
  }

  const dataOrPromise = loader(old.data, {
    isAborted: () => {
      // TODO: Can we improve the typing, to avoid ForceT?
      const opid = globalState.get<ForceT, AsyncDataEnvelopeT<DataT>>(path).operationId;
      return opid !== operationId;
    },
    oldDataTimestamp: old.timestamp,
  });

  const data: DataT | null = dataOrPromise instanceof Promise
    ? await dataOrPromise : dataOrPromise;

  const state: AsyncDataEnvelopeT<DataT> = globalState.get<ForceT, AsyncDataEnvelopeT<DataT>>(path);
  if (operationId === state.operationId) {
    if (process.env.NODE_ENV !== 'production' && isDebugMode()) {
      /* eslint-disable no-console */
      console.groupCollapsed(
        `ReactGlobalState: useAsyncData data (re-)loaded. Path: "${
          path || ''
        }"`,
      );
      console.log('Data:', cloneDeepForLog(data, path ?? ''));
      /* eslint-enable no-console */
    }
    globalState.set<ForceT, AsyncDataEnvelopeT<DataT>>(path, {
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

export type DataInEnvelopeAtPathT<StateT, PathT extends null | string | undefined>
= ValueAtPathT<StateT, PathT, never> extends AsyncDataEnvelopeT<unknown>
  ? Exclude<ValueAtPathT<StateT, PathT, never>['data'], null>
  : void;

type HeapT<DataT> = {
  // Note: these heap fields are necessary to make reload() a stable function.
  globalState?: GlobalState<unknown>;
  path?: null | string;
  loader?: AsyncDataLoaderT<DataT>;
  reload?: AsyncDataReloaderT<DataT>;
};

function useAsyncData<
  StateT,
  PathT extends null | string | undefined,

  DataT extends DataInEnvelopeAtPathT<StateT, PathT> =
  DataInEnvelopeAtPathT<StateT, PathT>,
>(
  path: PathT,
  loader: AsyncDataLoaderT<DataT>,
  options?: UseAsyncDataOptionsT,
): UseAsyncDataResT<DataT>;

function useAsyncData<
  Forced extends ForceT | LockT = LockT,
  DataT = void,
>(
  path: null | string | undefined,
  loader: AsyncDataLoaderT<TypeLock<Forced, void, DataT>>,
  options?: UseAsyncDataOptionsT,
): UseAsyncDataResT<TypeLock<Forced, void, DataT>>;

function useAsyncData<DataT>(
  path: null | string | undefined,
  loader: AsyncDataLoaderT<DataT>,
  options: UseAsyncDataOptionsT = {},
): UseAsyncDataResT<DataT> {
  const maxage: number = options.maxage ?? DEFAULT_MAXAGE;
  const refreshAge: number = options.refreshAge ?? maxage;
  const garbageCollectAge: number = options.garbageCollectAge ?? maxage;

  // Note: here we can't depend on useGlobalState() to init the initial value,
  // because that way we'll have issues with SSR (see details below).
  const globalState = getGlobalState();
  const state = globalState.get<ForceT, AsyncDataEnvelopeT<DataT>>(path, {
    initialValue: newAsyncDataEnvelope<DataT>(),
  });

  const { current: heap } = useRef<HeapT<DataT>>({});
  heap.globalState = globalState;
  heap.path = path;
  heap.loader = loader;

  if (!heap.reload) {
    heap.reload = (customLoader?: AsyncDataLoaderT<DataT>) => {
      const localLoader = customLoader || heap.loader;
      if (!localLoader || !heap.globalState) throw Error('Internal error');
      return load(heap.path, localLoader, heap.globalState);
    };
  }

  if (globalState.ssrContext && !options.noSSR) {
    if (!state.timestamp && !state.operationId) {
      globalState.ssrContext.pending.push(
        load(path, loader, globalState, {
          data: state.data,
          timestamp: state.timestamp,
        }, 'S'),
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
      const numRefs = globalState.get<ForceT, number>(numRefsPath);
      globalState.set<ForceT, number>(numRefsPath, numRefs + 1);
      return () => {
        const state2: AsyncDataEnvelopeT<DataT> = globalState.get<
        ForceT, AsyncDataEnvelopeT<DataT>>(
          path,
        );
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
          globalState.dropDependencies(path || '');
          globalState.set<ForceT, AsyncDataEnvelopeT<DataT>>(path, {
            ...state2,
            data: null,
            numRefs: 0,
            timestamp: 0,
          });
        } else globalState.set<ForceT, number>(numRefsPath, state2.numRefs - 1);
      };
    }, [garbageCollectAge, globalState, path]);

    // Note: a bunch of Rules of Hooks ignored belows because in our very
    // special case the otherwise wrong behavior is actually what we need.

    // Data loading and refreshing.
    let loadTriggered = false;
    useEffect(() => { // eslint-disable-line react-hooks/rules-of-hooks
      const state2: AsyncDataEnvelopeT<DataT> = globalState.get<
      ForceT, AsyncDataEnvelopeT<DataT>>(path);

      if (refreshAge < Date.now() - state2.timestamp
      && (!state2.operationId || state2.operationId.charAt(0) === 'S')) {
        load(path, loader, globalState, {
          data: state2.data,
          timestamp: state2.timestamp,
        });
        loadTriggered = true; // eslint-disable-line react-hooks/exhaustive-deps
      }
    });

    useEffect(() => { // eslint-disable-line react-hooks/rules-of-hooks
      const { deps } = options;
      if (deps && globalState.hasChangedDependencies(path || '', deps) && !loadTriggered) {
        load(path, loader, globalState);
      }

    // Here we need to default to empty array, so that this hook is re-evaluated
    // only when dependencies specified in options change, and it should not be
    // re-evaluated at all if no `deps` option is used.
    }, options.deps || []); // eslint-disable-line react-hooks/exhaustive-deps
  }

  const [localState] = useGlobalState<ForceT, AsyncDataEnvelopeT<DataT>>(
    path,
    newAsyncDataEnvelope<DataT>(),
  );

  return {
    data: maxage < Date.now() - localState.timestamp ? null : localState.data,
    loading: Boolean(localState.operationId),
    reload: heap.reload,
    timestamp: localState.timestamp,
  };
}

export { useAsyncData };

export interface UseAsyncDataI<StateT> {
  <PathT extends null | string | undefined>(
    path: PathT,
    loader: AsyncDataLoaderT<DataInEnvelopeAtPathT<StateT, PathT>>,
    options?: UseAsyncDataOptionsT,
  ): UseAsyncDataResT<DataInEnvelopeAtPathT<StateT, PathT>>;

  <Forced extends ForceT | LockT = LockT, DataT = unknown>(
    path: null | string | undefined,
    loader: AsyncDataLoaderT<TypeLock<Forced, void, DataT>>,
    options?: UseAsyncDataOptionsT,
  ): UseAsyncDataResT<TypeLock<Forced, void, DataT>>;
}
