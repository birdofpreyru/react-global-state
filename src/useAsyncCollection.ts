/**
 * Loads and uses item(s) in an async collection.
 */

import { useEffect, useRef } from 'react';
import { v4 as uuid } from 'uuid';

import GlobalState from './GlobalState';
import { getGlobalState } from './GlobalStateProvider';

import {
  type AsyncDataEnvelopeT,
  type AsyncDataReloaderT,
  type DataInEnvelopeAtPathT,
  type OperationIdT,
  type UseAsyncDataOptionsT,
  type UseAsyncDataResT,
  DEFAULT_MAXAGE,
  load,
  newAsyncDataEnvelope,
} from './useAsyncData';

import useGlobalState from './useGlobalState';

import {
  type ForceT,
  type LockT,
  type TypeLock,
  isDebugMode,
} from './utils';

export type AsyncCollectionLoaderT<
  DataT,
  IdT extends number | string = number | string,
> =
  (id: IdT, oldData: null | DataT, meta: {
    isAborted: () => boolean;
    oldDataTimestamp: number;
  }) => DataT | Promise<DataT | null> | null;

export type AsyncCollectionReloaderT<
  DataT,
  IdT extends number | string = number | string,
>
  = (loader?: AsyncCollectionLoaderT<DataT, IdT>) => Promise<void>;

type CollectionItemT<DataT> = {
  data: DataT | null;
  loading: boolean;
  timestamp: number;
};

export type UseAsyncCollectionResT<
  DataT,
  IdT extends number | string = number | string,
> = {
  items: {
    [id in IdT]: CollectionItemT<DataT>;
  }
  loading: boolean;
  reload: AsyncCollectionReloaderT<DataT, IdT>;
  timestamp: number;
};

type HeapT<
  DataT,
  IdT extends number | string,
> = {
  // Note: these heap fields are necessary to make reload() a stable function.
  globalState?: GlobalState<unknown>;
  ids?: IdT[];
  path?: null | string;
  loader?: AsyncCollectionLoaderT<DataT, IdT>;
  reload?: AsyncCollectionReloaderT<DataT, IdT>;
  reloadD?: AsyncDataReloaderT<DataT>;
};

/**
 * Resolves and stores at the given `path` of the global state elements of
 * an asynchronous data collection.
 */

function useAsyncCollection<
  StateT,
  PathT extends null | string | undefined,
  IdT extends number | string,

  DataT extends DataInEnvelopeAtPathT<StateT, `${PathT}.${IdT}`> =
  DataInEnvelopeAtPathT<StateT, `${PathT}.${IdT}`>,
>(
  id: IdT,
  path: PathT,
  loader: AsyncCollectionLoaderT<DataT, IdT>,
  options?: UseAsyncDataOptionsT,
): UseAsyncDataResT<DataT>;

function useAsyncCollection<
  Forced extends ForceT | LockT = LockT,
  DataT = unknown,
  IdT extends number | string = number | string,
>(
  id: IdT,
  path: null | string | undefined,
  loader: AsyncCollectionLoaderT<TypeLock<Forced, void, DataT>, IdT>,
  options?: UseAsyncDataOptionsT,
): UseAsyncDataResT<TypeLock<Forced, void, DataT>>;

function useAsyncCollection<
  StateT,
  PathT extends null | string | undefined,
  IdT extends number | string,

  DataT extends DataInEnvelopeAtPathT<StateT, `${PathT}.${IdT}`> =
  DataInEnvelopeAtPathT<StateT, `${PathT}.${IdT}`>,
>(
  id: IdT[],
  path: PathT,
  loader: AsyncCollectionLoaderT<DataT, IdT>,
  options?: UseAsyncDataOptionsT,
): UseAsyncCollectionResT<DataT, IdT>;

function useAsyncCollection<
  Forced extends ForceT | LockT = LockT,
  DataT = unknown,
  IdT extends number | string = number | string,
>(
  id: IdT[],
  path: null | string | undefined,
  loader: AsyncCollectionLoaderT<TypeLock<Forced, void, DataT>, IdT>,
  options?: UseAsyncDataOptionsT,
): UseAsyncCollectionResT<DataT, IdT>;

// TODO: This is largely similar to useAsyncData() logic, just more generic.
// Perhaps, a bunch of logic blocks can be split into stand-alone functions,
// and reused in both hooks.
function useAsyncCollection<
  DataT,
  IdT extends number | string,
>(
  idOrIds: IdT | IdT[],
  path: null | string | undefined,
  loader: AsyncCollectionLoaderT<DataT, IdT>,
  options: UseAsyncDataOptionsT = {},
): UseAsyncDataResT<DataT> | UseAsyncCollectionResT<DataT, IdT> {
  const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];

  const maxage: number = options.maxage ?? DEFAULT_MAXAGE;
  const refreshAge: number = options.refreshAge ?? maxage;
  const garbageCollectAge: number = options.garbageCollectAge ?? maxage;

  // To avoid unnecessary work if consumer passes down the same IDs
  // in an unstable order.
  // TODO: Should we also filter out any duplicates? Or just assume consumer
  // knows what he is doing, and won't place duplicates into IDs array?e
  ids.sort();

  const globalState = getGlobalState();

  const { current: heap } = useRef<HeapT<DataT, IdT>>({});

  heap.globalState = globalState;
  heap.ids = ids;
  heap.path = path;
  heap.loader = loader;

  if (!heap.reload) {
    heap.reload = async (customLoader?: AsyncCollectionLoaderT<DataT, IdT>) => {
      const localLoader = customLoader || heap.loader;
      if (!localLoader || !heap.globalState || !heap.ids) {
        throw Error('Internal error');
      }

      for (let i = 0; i < heap.ids.length; ++i) {
        const id = heap.ids[i]!;
        const itemPath = heap.path ? `${heap.path}.${id}` : `${id}`;

        // eslint-disable-next-line no-await-in-loop
        await load(
          itemPath,
          (oldData: DataT | null, meta) => localLoader(id, oldData, meta),
          heap.globalState,
        );
      }
    };
  }

  if (!Array.isArray(idOrIds)) {
    heap.reloadD = (customLoader) => heap.reload!(
      customLoader && ((id, ...args) => customLoader(...args)),
    );
  }

  // Server-side logic.
  if (globalState.ssrContext && !options.noSSR) {
    const operationId: OperationIdT = `S${uuid()}`;
    for (let i = 0; i < ids.length; ++i) {
      const id = ids[i]!;
      const itemPath = path ? `${path}.${id}` : `${id}`;
      const state = globalState.get<ForceT, AsyncDataEnvelopeT<DataT>>(itemPath, {
        initialValue: newAsyncDataEnvelope<DataT>(),
      });
      if (!state.timestamp && !state.operationId) {
        globalState.ssrContext.pending.push(
          load(itemPath, (...args) => loader(id, ...args), globalState, {
            data: state.data,
            timestamp: state.timestamp,
          }, operationId),
        );
      }
    }

  // Client-side logic.
  } else {
    // Reference-counting & garbage collection.

    // TODO: Violation of rules of hooks is fine here,
    // but perhaps it can be refactored to avoid the need for it.
    useEffect(() => { // eslint-disable-line react-hooks/rules-of-hooks
      for (let i = 0; i < ids.length; ++i) {
        const id = ids[i];
        const itemPath = path ? `${path}.${id}` : `${id}`;
        const state = globalState.get<ForceT, AsyncDataEnvelopeT<DataT>>(
          itemPath,
          { initialValue: newAsyncDataEnvelope() },
        );

        const numRefsPath = itemPath ? `${itemPath}.numRefs` : 'numRefs';
        globalState.set<ForceT, number>(numRefsPath, state.numRefs + 1);
      }

      return () => {
        for (let i = 0; i < ids.length; ++i) {
          const id = ids[i];
          const itemPath = path ? `${path}.${id}` : `${id}`;
          const state2: AsyncDataEnvelopeT<DataT> = globalState.get<
          ForceT, AsyncDataEnvelopeT<DataT>
          >(itemPath);
          if (
            state2.numRefs === 1
            && garbageCollectAge < Date.now() - state2.timestamp
          ) {
            if (process.env.NODE_ENV !== 'production' && isDebugMode()) {
              /* eslint-disable no-console */
              console.log(
                `ReactGlobalState - useAsyncCollection garbage collected at path ${
                  itemPath || ''
                }`,
              );
              /* eslint-enable no-console */
            }
            globalState.dropDependencies(itemPath || '');
            globalState.set<ForceT, AsyncDataEnvelopeT<DataT>>(itemPath, {
              ...state2,
              data: null,
              numRefs: 0,
              timestamp: 0,
            });
          } else {
            const numRefsPath = itemPath ? `${itemPath}.numRefs` : 'numRefs';
            globalState.set<ForceT, number>(numRefsPath, state2.numRefs - 1);
          }
        }
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [garbageCollectAge, globalState, path, ...ids]);

    // NOTE: a bunch of Rules of Hooks ignored belows because in our very
    // special case the otherwise wrong behavior is actually what we need.

    // Data loading and refreshing.
    const loadTriggeredForIds = new Set<IdT>();
    useEffect(() => { // eslint-disable-line react-hooks/rules-of-hooks
      (async () => {
        for (let i = 0; i < ids.length; ++i) {
          const id = ids[i]!;
          const itemPath = path ? `${path}.${id}` : `${id}`;
          const state2: AsyncDataEnvelopeT<DataT> = globalState.get<
          ForceT, AsyncDataEnvelopeT<DataT>>(itemPath);

          const { deps } = options;
          if (
            (deps && globalState.hasChangedDependencies(itemPath, deps))
            || (
              refreshAge < Date.now() - state2.timestamp
              && (!state2.operationId || state2.operationId.charAt(0) === 'S')
            )
          ) {
            if (!deps) globalState.dropDependencies(itemPath);
            loadTriggeredForIds.add(id);
            // eslint-disable-next-line no-await-in-loop
            await load(itemPath, (...args) => loader(id, ...args), globalState, {
              data: state2.data,
              timestamp: state2.timestamp,
            });
          }
        }
      })();
    });

    useEffect(() => { // eslint-disable-line react-hooks/rules-of-hooks
      (async () => {
        const { deps } = options;
        for (let i = 0; i < ids.length; ++i) {
          const id = ids[i]!;
          const itemPath = path ? `${path}.${id}` : `${id}`;
          if (
            deps
            && globalState.hasChangedDependencies(itemPath || '', deps)
            && !loadTriggeredForIds.has(id)
          ) {
            // eslint-disable-next-line no-await-in-loop
            await load(
              itemPath,
              (oldData: null | DataT, meta) => loader(id, oldData, meta),
              globalState,
            );
          }
        }
      })();

    // Here we need to default to empty array, so that this hook is re-evaluated
    // only when dependencies specified in options change, and it should not be
    // re-evaluated at all if no `deps` option is used.
    }, options.deps || []); // eslint-disable-line react-hooks/exhaustive-deps
  }

  const [localState] = useGlobalState<
  ForceT, { [id: string]: AsyncDataEnvelopeT<DataT> }
  >(path, {});

  if (!Array.isArray(idOrIds)) {
    const e = localState[idOrIds];
    const timestamp = e?.timestamp ?? 0;
    return {
      data: maxage < Date.now() - timestamp ? null : (e?.data ?? null),
      loading: !!e?.operationId,
      reload: heap.reloadD!,
      timestamp,
    };
  }

  const res: UseAsyncCollectionResT<DataT, IdT> = {
    items: {} as Record<IdT, CollectionItemT<DataT>>,
    loading: false,
    reload: heap.reload,
    timestamp: Number.MAX_VALUE,
  };

  for (let i = 0; i < ids.length; ++i) {
    const id = ids[i]!;
    const e = localState[id];
    const loading = !!e?.operationId;
    const timestamp = e?.timestamp ?? 0;

    res.items[id] = {
      data: maxage < Date.now() - timestamp ? null : (e?.data ?? null),
      loading,
      timestamp,
    };
    res.loading ||= loading;
    if (res.timestamp > timestamp) res.timestamp = timestamp;
  }

  return res;
}

export default useAsyncCollection;

export interface UseAsyncCollectionI<StateT> {
  <PathT extends null | string | undefined, IdT extends number | string>(
    id: IdT,
    path: PathT,
    loader: AsyncCollectionLoaderT<DataInEnvelopeAtPathT<StateT, `${PathT}.${IdT}`>, IdT>,
    options?: UseAsyncDataOptionsT,
  ): UseAsyncDataResT<DataInEnvelopeAtPathT<StateT, `${PathT}.${IdT}`>>;

  <
    Forced extends ForceT | LockT = LockT,
    DataT = unknown,
    IdT extends number | string = number | string,
  >(
    id: IdT,
    path: null | string | undefined,
    loader: AsyncCollectionLoaderT<TypeLock<Forced, void, DataT>, IdT>,
    options?: UseAsyncDataOptionsT,
  ): UseAsyncDataResT<TypeLock<Forced, void, DataT>>;

  <PathT extends null | string | undefined, IdT extends number | string>(
    id: IdT[],
    path: PathT,
    loader: AsyncCollectionLoaderT<DataInEnvelopeAtPathT<StateT, `${PathT}.${IdT}`>, IdT>,
    options?: UseAsyncDataOptionsT,
  ): UseAsyncCollectionResT<DataInEnvelopeAtPathT<StateT, `${PathT}.${IdT}`>, IdT>;

  <
    Forced extends ForceT | LockT = LockT,
    DataT = unknown,
    IdT extends number | string = number | string,
  >(
    id: IdT[],
    path: null | string | undefined,
    loader: AsyncCollectionLoaderT<TypeLock<Forced, void, DataT>, IdT>,
    options?: UseAsyncDataOptionsT,
  ): UseAsyncCollectionResT<DataT, IdT>;
}
