/**
 * Loads and uses item(s) in an async collection.
 */

import { useEffect, useRef } from 'react';
import { v4 as uuid } from 'uuid';

import type GlobalState from './GlobalState';
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
  hash,
  isDebugMode,
} from './utils';

export type AsyncCollectionT<
  DataT = unknown,
  IdT extends number | string = number | string,
> = Record<IdT, AsyncDataEnvelopeT<DataT>>;

export type AsyncCollectionLoaderT<
  DataT,
  IdT extends number | string = number | string,
> =
  (id: IdT, oldData: null | DataT, meta: {
    isAborted: () => boolean;
    oldDataTimestamp: number;
    setAbortCallback: (cb: () => void) => void;
  }) => (DataT | null) | Promise<DataT | null>;

export type AsyncCollectionReloaderT<
  DataT,
  IdT extends number | string = number | string,
>
  = (loader?: AsyncCollectionLoaderT<DataT, IdT>) => void | Promise<void>;

type CollectionItemT<DataT> = {
  data: DataT | null;
  loading: boolean;
  timestamp: number;
};

export type UseAsyncCollectionResT<
  DataT,
  IdT extends number | string = number | string,
> = {
  items: Record<IdT, CollectionItemT<DataT>>;
  loading: boolean;
  reload: AsyncCollectionReloaderT<DataT, IdT>;
  timestamp: number;
};

type HeapT<
  DataT,
  IdT extends number | string,
> = {
  // Note: these heap fields are necessary to make reload() a stable function.
  globalState: GlobalState<unknown>;
  ids: IdT[];
  path: null | string | undefined;
  loader: AsyncCollectionLoaderT<DataT, IdT>;
  reload: AsyncCollectionReloaderT<DataT, IdT>;
  reloadSingle: AsyncDataReloaderT<DataT>;
};

/**
 * GarbageCollector: the piece of logic executed on mounting of
 * an useAsyncCollection() hook, and on update of hook params, to update
 * the state according to the new param values. It increments by 1 `numRefs`
 * counters for the requested collection items.
 */
function gcOnWithhold<IdT extends number | string>(
  ids: IdT[],
  path: null | string | undefined,
  gs: GlobalState<unknown>,
) {
  const collection = { ...gs.get<ForceT, AsyncCollectionT>(path) };

  for (const id of ids) {
    let envelope = collection[id];
    if (envelope) envelope = { ...envelope, numRefs: 1 + envelope.numRefs };
    else envelope = newAsyncDataEnvelope<unknown>(null, { numRefs: 1 });
    collection[id] = envelope;
  }

  gs.set<ForceT, AsyncCollectionT>(path, collection);
}

function idsToStringSet<IdT extends number | string>(ids: IdT[]): Set<string> {
  const res = new Set<string>();
  for (const id of ids) {
    res.add(id.toString());
  }
  return res;
}

/**
 * GarbageCollector: the piece of logic executed on un-mounting of
 * an useAsyncCollection() hook, and on update of hook params, to clean-up
 * after the previous param values. It decrements by 1 `numRefs` counters
 * for previously requested collection items, and also drops from the state
 * stale records.
 */
function gcOnRelease<IdT extends number | string>(
  ids: IdT[],
  path: null | string | undefined,
  gs: GlobalState<unknown>,
  gcAge: number,
) {
  type EnvelopeT = AsyncDataEnvelopeT<unknown>;

  const entries = Object.entries<EnvelopeT | undefined>(
    gs.get<ForceT, AsyncCollectionT>(path),
  );

  const now = Date.now();
  const idSet = idsToStringSet(ids);
  const collection: AsyncCollectionT = {};
  for (const [id, envelope] of entries) {
    if (envelope) {
      const toBeReleased = idSet.has(id);

      let { numRefs } = envelope;
      if (toBeReleased) --numRefs;

      if (gcAge > now - envelope.timestamp || numRefs > 0) {
        collection[id as IdT] = toBeReleased
          ? { ...envelope, numRefs }
          : envelope;
      } else if (process.env.NODE_ENV !== 'production' && isDebugMode()) {
        // eslint-disable-next-line no-console
        console.log(
          `useAsyncCollection(): Garbage collected at the path "${
            path}", ID = ${id}`,
        );
      }
    }
  }

  gs.set<ForceT, AsyncCollectionT>(path, collection);
}

function normalizeIds<IdT extends number | string>(
  idOrIds: IdT | IdT[],
): IdT[] {
  if (Array.isArray(idOrIds)) {
    const res = [...idOrIds];
    res.sort((a, b) => a.toString().localeCompare(b.toString()));
    return res;
  }
  return [idOrIds];
}

/**
 * Inits/updates, and returns the heap.
 */
function useHeap<
  DataT,
  IdT extends number | string,
>(
  ids: IdT[],
  path: null | string | undefined,
  loader: AsyncCollectionLoaderT<DataT, IdT>,
  gs: GlobalState<unknown>,
): HeapT<DataT, IdT> {
  const ref = useRef<HeapT<DataT, IdT>>(undefined);

  let heap = ref.current;

  if (heap) {
    // Update.
    heap.ids = ids;
    heap.path = path;
    heap.loader = loader;
    heap.globalState = gs;
  } else {
    // Initialization.
    const reload = async (
      customLoader?: AsyncCollectionLoaderT<DataT, IdT>,
    ) => {
      const heap2 = ref.current!;

      const localLoader = customLoader ?? heap2.loader;
      // TODO: Revise - not sure all related typing is 100% correct,
      // thus let's keep this runtime assertion.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!localLoader || !heap2.globalState || !heap2.ids) {
        throw Error('Internal error');
      }

      for (const id of heap2.ids) {
        const itemPath = heap2.path ? `${heap2.path}.${id}` : `${id}`;

        const promiseOrVoid = load(
          itemPath,
          // TODO: Revise! Most probably we don't have fully correct loader
          // typing, as it may return either promise or value, and those two
          // cases call for different runtime behavior, which in turns only
          // happens if the outer function on the next line matches the same
          // async / sync signature.
          // eslint-disable-next-line @typescript-eslint/promise-function-async
          (oldData: DataT | null, meta) => localLoader(id, oldData, meta),
          heap2.globalState,
        );

        if (promiseOrVoid instanceof Promise) await promiseOrVoid;
      }
    };
    heap = {
      globalState: gs,
      ids,
      loader,
      path,
      reload,
      // TODO: Revise! Most probably we don't have fully correct loader
      // typing, as it may return either promise or value, and those two
      // cases call for different runtime behavior, which in turns only
      // happens if the outer function on the next line matches the same
      // async / sync signature.
      // eslint-disable-next-line @typescript-eslint/promise-function-async
      reloadSingle: (customLoader) => ref.current!.reload(
        // TODO: Revise! Most probably we don't have fully correct loader
        // typing, as it may return either promise or value, and those two
        // cases call for different runtime behavior, which in turns only
        // happens if the outer function on the next line matches the same
        // async / sync signature.
        // eslint-disable-next-line @typescript-eslint/promise-function-async
        customLoader && ((id, ...args) => customLoader(...args)),
      ),
    };
    ref.current = heap;
  }

  return heap;
}

/**
 * Resolves and stores at the given `path` of the global state elements of
 * an asynchronous data collection.
 */

function useAsyncCollection<
  StateT,
  PathT extends null | string | undefined,
  IdT extends number | string,

  DataT extends DataInEnvelopeAtPathT<StateT, `${PathT}.${IdT}`> = DataInEnvelopeAtPathT<StateT, `${PathT}.${IdT}`>,
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

  DataT extends DataInEnvelopeAtPathT<StateT, `${PathT}.${IdT}`> = DataInEnvelopeAtPathT<StateT, `${PathT}.${IdT}`>,
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

function useAsyncCollection<
  StateT,
  PathT extends null | string | undefined,
  IdT extends number | string,

  DataT extends DataInEnvelopeAtPathT<StateT, `${PathT}.${IdT}`> = DataInEnvelopeAtPathT<StateT, `${PathT}.${IdT}`>,
>(
  id: IdT | IdT[],
  path: PathT,
  loader: AsyncCollectionLoaderT<DataT, IdT>,
  options?: UseAsyncDataOptionsT,
): UseAsyncDataResT<DataT> | UseAsyncCollectionResT<DataT, IdT>;

// TODO: This is largely similar to useAsyncData() logic, just more generic.
// Perhaps, a bunch of logic blocks can be split into stand-alone functions,
// and reused in both hooks.
// eslint-disable-next-line complexity
function useAsyncCollection<
  DataT,
  IdT extends number | string,
>(
  idOrIds: IdT | IdT[],
  path: null | string | undefined,
  loader: AsyncCollectionLoaderT<DataT, IdT>,
  options: UseAsyncDataOptionsT = {},
): UseAsyncDataResT<DataT> | UseAsyncCollectionResT<DataT, IdT> {
  const ids = normalizeIds(idOrIds);
  const maxage: number = options.maxage ?? DEFAULT_MAXAGE;
  const refreshAge: number = options.refreshAge ?? maxage;
  const garbageCollectAge: number = options.garbageCollectAge ?? maxage;

  const globalState = getGlobalState();

  const heap = useHeap(ids, path, loader, globalState);

  // Server-side logic.
  if (globalState.ssrContext && !options.noSSR) {
    const operationId: OperationIdT = `S${uuid()}`;
    for (const id of ids) {
      const itemPath = path ? `${path}.${id}` : `${id}`;
      const state = globalState.get<ForceT, AsyncDataEnvelopeT<DataT>>(
        itemPath,
        {
          initialValue: newAsyncDataEnvelope<DataT>(),
        },
      );
      if (!state.timestamp && !state.operationId) {
        const promiseOrVoid = load(
          itemPath,
          (...args):
            DataT | null | Promise<DataT | null> => loader(id, ...args),
          globalState,
          {
            data: state.data,
            timestamp: state.timestamp,
          },
          operationId,
        );

        if (promiseOrVoid instanceof Promise) {
          globalState.ssrContext.pending.push(promiseOrVoid);
        }
      }
    }

  // Client-side logic.
  } else {
    // Reference-counting & garbage collection.

    const idsHash = hash(ids);

    // TODO: Violation of rules of hooks is fine here,
    // but perhaps it can be refactored to avoid the need for it.
    useEffect(() => { // eslint-disable-line react-hooks/rules-of-hooks
      gcOnWithhold(ids, path, globalState);
      return () => {
        gcOnRelease(ids, path, globalState, garbageCollectAge);
      };

      // `ids` are represented in the dependencies array by `idsHash` value,
      // as useEffect() hook requires a constant size of dependencies array.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      garbageCollectAge,
      globalState,
      idsHash,
      path,
    ]);

    // NOTE: a bunch of Rules of Hooks ignored belows because in our very
    // special case the otherwise wrong behavior is actually what we need.

    // Data loading and refreshing.
    useEffect(() => { // eslint-disable-line react-hooks/rules-of-hooks
      void (async () => {
        for (const id of ids) {
          const itemPath = path ? `${path}.${id}` : `${id}`;

          type EnvT = AsyncDataEnvelopeT<DataT> | undefined;
          const state2: EnvT = globalState.get<ForceT, EnvT>(itemPath);

          const { deps } = options;
          if (
            (deps && globalState.hasChangedDependencies(itemPath, deps))
            || (
              refreshAge < Date.now() - (state2?.timestamp ?? 0)
              && (!state2?.operationId || state2.operationId.startsWith('S'))
            )
          ) {
            if (!deps) globalState.dropDependencies(itemPath);
            await load(
              itemPath,
              // TODO: I guess, the loader is not correctly typed here -
              // it can be synchronous, and in that case the following method
              // should be kept synchronous to not alter the sync logic.
              // eslint-disable-next-line @typescript-eslint/promise-function-async
              (old, ...args) => loader(id, old as DataT, ...args),
              globalState,
              {
                data: state2?.data,
                timestamp: state2?.timestamp ?? 0,
              },
            );
          }
        }
      })();
    });
  }

  const [localState] = useGlobalState<
    ForceT, Record<string, AsyncDataEnvelopeT<DataT>>
  >(path, {});

  if (!Array.isArray(idOrIds)) {
    // TODO: Revise related typings!
    const e = localState[idOrIds as string];
    const timestamp = e?.timestamp ?? 0;
    return {
      data: maxage < Date.now() - timestamp ? null : e?.data ?? null,
      loading: !!e?.operationId,
      reload: heap.reloadSingle,
      timestamp,
    };
  }

  const res: UseAsyncCollectionResT<DataT, IdT> = {
    items: {} as Record<IdT, CollectionItemT<DataT>>,
    loading: false,
    reload: heap.reload,
    timestamp: Number.MAX_VALUE,
  };

  for (const id of ids) {
    // TODO: Revise related typing. Should `localState` have a more specific type?
    const e = localState[id as string];
    const loading = !!e?.operationId;
    const timestamp = e?.timestamp ?? 0;

    res.items[id] = {
      data: maxage < Date.now() - timestamp ? null : e?.data ?? null,
      loading,
      timestamp,
    };
    res.loading ||= loading;
    if (res.timestamp > timestamp) res.timestamp = timestamp;
  }

  return res;
}

export default useAsyncCollection;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
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

  <PathT extends null | string | undefined, IdT extends number | string>(
    id: IdT | IdT[],
    path: PathT,
    loader: AsyncCollectionLoaderT<DataInEnvelopeAtPathT<StateT, `${PathT}.${IdT}`>, IdT>,
    options?: UseAsyncDataOptionsT,
  ): UseAsyncDataResT<DataInEnvelopeAtPathT<StateT, `${PathT}.${IdT}`>>
    | UseAsyncCollectionResT<DataInEnvelopeAtPathT<StateT, `${PathT}.${IdT}`>, IdT>;
}
