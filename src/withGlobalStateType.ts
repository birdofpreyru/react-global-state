import {
  type ForceT,
  type TypeLock,
  type ValueAtPathT,
  type ValueOrInitializerT,
} from './utils';

import GlobalStateProvider, {
  getGlobalState,
  getSsrContext,
} from './GlobalStateProvider';

import SsrContext from './SsrContext';

import useGlobalState, {
  type UseGlobalStateResT,
} from './useGlobalState';

import useAsyncCollection, {
  type AsyncCollectionLoaderT,
} from './useAsyncCollection';

import useAsyncData, {
  type AsyncDataLoaderT,
  type DataInEnvelopeAtPathT,
  type UseAsyncDataOptionsT,
  type UseAsyncDataResT,
} from './useAsyncData';

interface NarrowedUseGlobalStateI<StateT> {
  (): UseGlobalStateResT<StateT>;

  <PathT extends null | string | undefined>(
    path: PathT,
    initialValue?: ValueOrInitializerT<ValueAtPathT<StateT, PathT, never>>,
  ): UseGlobalStateResT<ValueAtPathT<StateT, PathT, void>>;

  <Forced extends ForceT | false = false, ValueT = unknown>(
    path: null | string | undefined,
    initialValue?: ValueOrInitializerT<TypeLock<Forced, never, ValueT>>,
  ): UseGlobalStateResT<TypeLock<Forced, void, ValueT>>;
}

interface NarrowedUseAsyncDataI<StateT> {
  <PathT extends null | string | undefined>(
    path: PathT,
    loader: AsyncDataLoaderT<DataInEnvelopeAtPathT<StateT, PathT>>,
    options?: UseAsyncDataOptionsT,
  ): UseAsyncDataResT<DataInEnvelopeAtPathT<StateT, PathT>>;

  <Forced extends ForceT | false = false, DataT = unknown>(
    path: null | string | undefined,
    loader: AsyncDataLoaderT<TypeLock<Forced, void, DataT>>,
    options?: UseAsyncDataOptionsT,
  ): UseAsyncDataResT<TypeLock<Forced, never, DataT>>;
}

interface NarrowedUseAsyncCollectionI<StateT> {
  <PathT extends null | string | undefined>(
    id: string,
    path: PathT,
    loader: AsyncCollectionLoaderT<DataInEnvelopeAtPathT<StateT, PathT>>,
    options?: UseAsyncDataOptionsT,
  ): UseAsyncDataResT<DataInEnvelopeAtPathT<StateT, PathT>>;

  <Forced extends ForceT | false = false, DataT = unknown>(
    id: string,
    path: null | string | undefined,
    loader: AsyncCollectionLoaderT<TypeLock<Forced, void, DataT>>,
    options?: UseAsyncDataOptionsT,
  ): UseAsyncDataResT<DataT>;
}

type WithGlobalStateTypeResT<
  StateT,
  SsrContextT extends SsrContext<StateT> = SsrContext<StateT>,
> = {
  getGlobalState: typeof getGlobalState<StateT, SsrContextT>,
  getSsrContext: typeof getSsrContext<SsrContextT>,
  GlobalStateProvider: typeof GlobalStateProvider<StateT, SsrContextT>,
  // SsrContext: SsrContext<StateT>,
  useAsyncCollection: NarrowedUseAsyncCollectionI<StateT>,
  useAsyncData: NarrowedUseAsyncDataI<StateT>,
  useGlobalState: NarrowedUseGlobalStateI<StateT>,
};

export default function withGlobalStateType<
  StateT,
  SsrContextT extends SsrContext<StateT> = SsrContext<StateT>,
>(): WithGlobalStateTypeResT<StateT, SsrContextT> {
  // These wrap useGlobalState() with locked-in StateT type.

  function useGlobalStateWrap(): UseGlobalStateResT<StateT>;

  function useGlobalStateWrap<PathT extends null | string | undefined>(
    path: PathT,
    initialValue?: ValueOrInitializerT<ValueAtPathT<StateT, PathT, never>>,
  ): UseGlobalStateResT<ValueAtPathT<StateT, PathT, void>>;

  function useGlobalStateWrap<Forced extends ForceT | false = false, ValueT = unknown>(
    path: null | string | undefined,
    initialValue?: ValueOrInitializerT<TypeLock<Forced, never, ValueT>>,
  ): UseGlobalStateResT<TypeLock<Forced, void, ValueT>>;

  function useGlobalStateWrap(
    path?: null | string,
    initialValue?: ValueOrInitializerT<unknown>,
  ): UseGlobalStateResT<any> {
    return useGlobalState<ForceT, unknown>(path, initialValue);
  }

  // These overloads & implementation wrap useAsyncData() hook to lock-in its
  // underlying StateT.

  function useAsyncDataWrap<PathT extends null | string | undefined>(
    path: PathT,
    loader: AsyncDataLoaderT<DataInEnvelopeAtPathT<StateT, PathT>>,
    options?: UseAsyncDataOptionsT,
  ): UseAsyncDataResT<DataInEnvelopeAtPathT<StateT, PathT>>;

  function useAsyncDataWrap<Forced extends ForceT | false = false, DataT = unknown>(
    path: null | string | undefined,
    loader: AsyncDataLoaderT<TypeLock<Forced, void, DataT>>,
    options?: UseAsyncDataOptionsT,
  ): UseAsyncDataResT<TypeLock<Forced, never, DataT>>;

  function useAsyncDataWrap<DataT>(
    path: null | string | undefined,
    loader: AsyncDataLoaderT<DataT>,
    options: UseAsyncDataOptionsT = {},
  ): UseAsyncDataResT<DataT> {
    return useAsyncData<ForceT, DataT>(path, loader, options);
  }

  // These overloads & implementation wrap useAsyncCollection() hook to lock-in
  // its underlying StateT.

  function useAsyncCollectionWrap<PathT extends null | string | undefined>(
    id: string,
    path: PathT,
    loader: AsyncCollectionLoaderT<DataInEnvelopeAtPathT<StateT, PathT>>,
    options?: UseAsyncDataOptionsT,
  ): UseAsyncDataResT<DataInEnvelopeAtPathT<StateT, PathT>>;

  function useAsyncCollectionWrap<Forced extends ForceT | false = false, DataT = unknown>(
    id: string,
    path: null | string | undefined,
    loader: AsyncCollectionLoaderT<TypeLock<Forced, void, DataT>>,
    options?: UseAsyncDataOptionsT,
  ): UseAsyncDataResT<DataT>;

  function useAsyncCollectionWrap<DataT>(
    id: string,
    path: null | string | undefined,
    loader: AsyncCollectionLoaderT<DataT>,
    options: UseAsyncDataOptionsT = {},
  ): UseAsyncDataResT<DataT> {
    return useAsyncCollection<ForceT, DataT>(id, path, loader, options);
  }

  return {
    getGlobalState: getGlobalState<StateT, SsrContextT>,
    getSsrContext: getSsrContext<SsrContextT>,
    GlobalStateProvider: GlobalStateProvider<StateT, SsrContextT>,
    // SsrContext, /* CustomSsrContext || SsrContext, */
    useAsyncCollection: useAsyncCollectionWrap,
    useAsyncData: useAsyncDataWrap,
    useGlobalState: useGlobalStateWrap,
  };
}
