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

export const DEFAULT_MAXAGE = 5 * MIN_MS; // 5 minutes.

export type AsyncDataLoaderT<DataT>
= (oldData: null | DataT, meta: {
  isAborted: () => boolean;
  oldDataTimestamp: number;
  setAbortCallback: (cb: () => void) => void;
}) => DataT | Promise<DataT | null> | null;

export type AsyncDataReloaderT<DataT>
= (loader?: AsyncDataLoaderT<DataT>) => Promise<void>;

export type AsyncDataEnvelopeT<DataT> = {
  data: null | DataT;
  numRefs: number;
  operationId: string;
  timestamp: number;
};

export type OperationIdT = `${'C' | 'S'}${string}`;

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
export async function load<DataT>(
  path: null | string | undefined,
  loader: AsyncDataLoaderT<DataT>,
  globalState: GlobalState<unknown, SsrContext<unknown>>,
  old?: { data: DataT | null, timestamp: number },

  // TODO: Should this parameter be just a binary flag (client or server),
  // and UUID always generated inside this function? Or do we need it in
  // the caller methods as well, in some cases (see useAsyncCollection()
  // use case as well).
  operationId: OperationIdT = `C${uuid()}`,
): Promise<void> {
  if (process.env.NODE_ENV !== 'production' && isDebugMode()) {
    /* eslint-disable no-console */
    console.log(
      `ReactGlobalState: async data (re-)loading. Path: "${path || ''}"`,
    );
    /* eslint-enable no-console */
  }

  const operationIdPath = path ? `${path}.operationId` : 'operationId';
  {
    const prevOperationId = globalState.get<ForceT, string>(operationIdPath);
    if (prevOperationId) globalState.asyncDataLoadDone(prevOperationId, true);
  }
  globalState.set<ForceT, string>(operationIdPath, operationId);

  let definedOld = old;
  if (!definedOld) {
    // TODO: Can we improve the typing, to avoid ForceT?
    const e = globalState.get<ForceT, AsyncDataEnvelopeT<DataT>>(path);
    definedOld = { data: e.data, timestamp: e.timestamp };
  }

  const dataOrPromise = loader(definedOld.data, {
    isAborted: () => {
      // TODO: Can we improve the typing, to avoid ForceT?
      const opid = globalState.get<ForceT, AsyncDataEnvelopeT<DataT>>(path).operationId;
      return opid !== operationId;
    },
    oldDataTimestamp: definedOld.timestamp,
    setAbortCallback(cb: () => void) {
      const opid = globalState.get<ForceT, AsyncDataEnvelopeT<DataT>>(path).operationId;
      if (opid !== operationId) {
        throw Error(`Operation #${operationId} has completed already`);
      }
      globalState.setAsyncDataAbortCallback(operationId, cb);
    },
  });

  let data: DataT | null;

  try {
    data = dataOrPromise instanceof Promise
      ? await dataOrPromise : dataOrPromise;
  } finally {
    // NOTE: We don't really mean that it hasn't been aborted,
    // the "false" flag rather says we don't need to trigger "on aborted"
    // callback for this operation, if any is registered - just drop it.
    globalState.asyncDataLoadDone(operationId, false);
  }

  const state: AsyncDataEnvelopeT<DataT> = globalState.get<ForceT, AsyncDataEnvelopeT<DataT>>(path);
  if (operationId === state.operationId) {
    if (process.env.NODE_ENV !== 'production' && isDebugMode()) {
      /* eslint-disable no-console */
      console.groupCollapsed(
        `ReactGlobalState: async data (re-)loaded. Path: "${
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
 * state.
 */

export type DataInEnvelopeAtPathT<
  StateT,
  PathT extends null | string | undefined,
> = Exclude<Extract<ValueAtPathT<StateT, PathT, void>, AsyncDataEnvelopeT<unknown>>['data'], null>;

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
        }, `S${uuid()}`),
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
    useEffect(() => { // eslint-disable-line react-hooks/rules-of-hooks
      const state2: AsyncDataEnvelopeT<DataT> = globalState.get<
      ForceT, AsyncDataEnvelopeT<DataT>>(path);

      const { deps } = options;
      if (
        // The hook is called with a list of dependencies, that mismatch
        // dependencies last used to retrieve the data at given path.
        (deps && globalState.hasChangedDependencies(path || '', deps))

        // Data at the path are stale, and are not being loaded.
        || (
          refreshAge < Date.now() - state2.timestamp
          && (!state2.operationId || state2.operationId.charAt(0) === 'S')
        )
      ) {
        if (!deps) globalState.dropDependencies(path || '');
        load(path, loader, globalState, {
          data: state2.data,
          timestamp: state2.timestamp,
        });
      }
    });
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
