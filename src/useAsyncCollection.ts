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
  hash,
  isDebugMode,
} from './utils';

export type AsyncCollectionT<
  DataT = unknown,
  IdT extends number | string = number | string,
> = { [id in IdT]?: AsyncDataEnvelopeT<DataT> };

export type AsyncCollectionLoaderT<
  DataT,
  IdT extends number | string = number | string,
> =
  (id: IdT, oldData: null | DataT, meta: {
    isAborted: () => boolean;
    oldDataTimestamp: number;
    setAbortCallback: (cb: () => void) => void;
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

  for (let i = 0; i < ids.length; ++i) {
    const id = ids[i]!;
    let envelope = collection[id];
    if (envelope) envelope = { ...envelope, numRefs: 1 + envelope.numRefs };
    else envelope = newAsyncDataEnvelope<unknown>(null, { numRefs: 1 });
    collection[id] = envelope;
  }

  gs.set<ForceT, AsyncCollectionT>(path, collection);
}

function idsToStringSet<IdT extends number | string>(ids: IdT[]): Set<string> {
  const res = new Set<string>();
  for (let i = 0; i < ids.length; ++i) {
    res.add(ids[i]!.toString());
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
  for (let i = 0; i < entries.length; ++i) {
    const [id, envelope] = entries[i]!;

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
    res.sort();
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
  const ref = useRef<HeapT<DataT, IdT>>();

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

      const localLoader = customLoader || heap2.loader;
      if (!localLoader || !heap2.globalState || !heap2.ids) {
        throw Error('Internal error');
      }

      for (let i = 0; i < heap2.ids.length; ++i) {
        const id = heap2.ids[i]!;
        const itemPath = heap2.path ? `${heap2.path}.${id}` : `${id}`;

        // eslint-disable-next-line no-await-in-loop
        await load(
          itemPath,
          (oldData: DataT | null, meta) => localLoader(id, oldData, meta),
          heap2.globalState,
        );
      }
    };
    heap = {
      globalState: gs,
      ids,
      path,
      loader,
      reload,
      reloadSingle: (customLoader) => ref.current!.reload(
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
  const ids = normalizeIds(idOrIds);
  const maxage: number = options.maxage ?? DEFAULT_MAXAGE;
  const refreshAge: number = options.refreshAge ?? maxage;
  const garbageCollectAge: number = options.garbageCollectAge ?? maxage;

  const globalState = getGlobalState();

  const heap = useHeap(ids, path, loader, globalState);

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

    const idsHash = hash(ids);

    // TODO: Violation of rules of hooks is fine here,
    // but perhaps it can be refactored to avoid the need for it.
    useEffect(() => { // eslint-disable-line react-hooks/rules-of-hooks
      gcOnWithhold(ids, path, globalState);
      return () => gcOnRelease(ids, path, globalState, garbageCollectAge);

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
            // eslint-disable-next-line no-await-in-loop
            await load(itemPath, (...args) => loader(id, ...args), globalState, {
              data: state2.data,
              timestamp: state2.timestamp,
            });
          }
        }
      })();
    });
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
      reload: heap.reloadSingle!,
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
