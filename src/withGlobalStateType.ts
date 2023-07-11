import {
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

export default function withGlobalStateType<StateT>() {
  // These wrap useGlobalState() with locked-in StateT type.

  function useGlobalStateWrap(): UseGlobalStateResT<StateT>;

  function useGlobalStateWrap<PathT extends null | string | undefined>(
    path: PathT,
    initialValue?: ValueOrInitializerT<ValueAtPathT<StateT, PathT, never>>,
  ): UseGlobalStateResT<ValueAtPathT<StateT, PathT, void>>;

  function useGlobalStateWrap<
    Unlocked extends 0 | 1 = 0,
    ValueT = void,
  >(
    path: null | string | undefined,
    initialValue?: ValueOrInitializerT<TypeLock<Unlocked, never, ValueT>>,
  ): UseGlobalStateResT<TypeLock<Unlocked, void, ValueT>>;

  function useGlobalStateWrap(
    path?: null | string,
    initialValue?: ValueOrInitializerT<unknown>,
  ): UseGlobalStateResT<any> {
    return useGlobalState<1, unknown>(path, initialValue);
  }

  // These overloads & implementation wrap useAsyncData() hook to lock-in its
  // underlying StateT.

  function useAsyncDataWrap<PathT extends null | string | undefined>(
    path: PathT,
    loader: AsyncDataLoaderT<DataInEnvelopeAtPathT<StateT, PathT>>,
    options?: UseAsyncDataOptionsT,
  ): UseAsyncDataResT<DataInEnvelopeAtPathT<StateT, PathT>>;

  function useAsyncDataWrap<
    Unlocked extends 0 | 1 = 0,
    DataT = unknown,
  >(
    path: null | string | undefined,
    loader: AsyncDataLoaderT<TypeLock<Unlocked, void, DataT>>,
    options?: UseAsyncDataOptionsT,
  ): UseAsyncDataResT<TypeLock<Unlocked, never, DataT>>;

  function useAsyncDataWrap<DataT>(
    path: null | string | undefined,
    loader: AsyncDataLoaderT<DataT>,
    options: UseAsyncDataOptionsT = {},
  ): UseAsyncDataResT<DataT> {
    return useAsyncData<1, DataT>(path, loader, options);
  }

  // These overloads & implementation wrap useAsyncCollection() hook to lock-in
  // its underlying StateT.

  function useAsyncCollectionWrap<PathT extends null | string | undefined>(
    id: string,
    path: PathT,
    loader: AsyncCollectionLoaderT<DataInEnvelopeAtPathT<StateT, PathT>>,
    options?: UseAsyncDataOptionsT,
  ): UseAsyncDataResT<DataInEnvelopeAtPathT<StateT, PathT>>;

  function useAsyncCollectionWrap<
    Unlocked extends 0 | 1 = 0,
    DataT = unknown,
  >(
    id: string,
    path: null | string | undefined,
    loader: AsyncCollectionLoaderT<TypeLock<Unlocked, void, DataT>>,
    options?: UseAsyncDataOptionsT,
  ): UseAsyncDataResT<DataT>;

  function useAsyncCollectionWrap<DataT>(
    id: string,
    path: null | string | undefined,
    loader: AsyncCollectionLoaderT<DataT>,
    options: UseAsyncDataOptionsT = {},
  ): UseAsyncDataResT<DataT> {
    return useAsyncCollection<1, DataT>(id, path, loader, options);
  }

  return {
    getGlobalState: getGlobalState<StateT>,
    getSsrContext: getSsrContext<StateT>,
    GlobalStateProvider: GlobalStateProvider<StateT>,
    SsrContext: SsrContext<StateT>,
    useAsyncCollection: useAsyncCollectionWrap,
    useAsyncData: useAsyncDataWrap,
    useGlobalState: useGlobalStateWrap,
  };
}
