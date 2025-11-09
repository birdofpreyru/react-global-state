import GlobalState from './GlobalState';

import GlobalStateProvider, {
  getGlobalState,
  getSsrContext,
} from './GlobalStateProvider';

import SsrContext from './SsrContext';

import useAsyncCollection, {
  type UseAsyncCollectionI,
  type UseAsyncCollectionResT,
} from './useAsyncCollection';

import {
  type AsyncDataEnvelopeT,
  type AsyncDataLoaderT,
  type AsyncDataReloaderT,
  type UseAsyncDataI,
  type UseAsyncDataOptionsT,
  type UseAsyncDataResT,
  newAsyncDataEnvelope,
  useAsyncData,
} from './useAsyncData';

import useGlobalState, { type UseGlobalStateI } from './useGlobalState';

export type {
  AsyncCollectionLoaderT,
  AsyncCollectionReloaderT,
  AsyncCollectionT,
} from './useAsyncCollection';

export type { SetterT, UseGlobalStateResT } from './useGlobalState';

export type { ForceT, ValueOrInitializerT } from './utils';

export {
  type AsyncDataEnvelopeT,
  type AsyncDataLoaderT,
  type AsyncDataReloaderT,
  type UseAsyncCollectionI,
  type UseAsyncCollectionResT,
  type UseAsyncDataI,
  type UseAsyncDataOptionsT,
  type UseAsyncDataResT,
  type UseGlobalStateI,
  getGlobalState,
  getSsrContext,
  GlobalState,
  GlobalStateProvider,
  newAsyncDataEnvelope,
  SsrContext,
  useAsyncCollection,
  useAsyncData,
  useGlobalState,
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface API<
  StateT,
  SsrContextT extends SsrContext<StateT> = SsrContext<StateT>,
> {
  getGlobalState: typeof getGlobalState<StateT, SsrContextT>;
  getSsrContext: typeof getSsrContext<SsrContextT>;
  GlobalState: typeof GlobalState<StateT, SsrContextT>;
  GlobalStateProvider: typeof GlobalStateProvider<StateT, SsrContextT>;
  newAsyncDataEnvelope: typeof newAsyncDataEnvelope;
  SsrContext: typeof SsrContext<StateT>;
  useAsyncCollection: UseAsyncCollectionI<StateT>;
  useAsyncData: UseAsyncDataI<StateT>;
  useGlobalState: UseGlobalStateI<StateT>;
}

const api = {
  // TODO: I am puzzled, why ESLint eforces this sorting order as alphabetical?
  // Perhaps, we should tune something in its config settings, as it seems to mix
  // some extra sorting logic, which I am not sure I like.
  GlobalState,
  GlobalStateProvider,
  SsrContext,
  getGlobalState,
  getSsrContext,
  newAsyncDataEnvelope,
  useAsyncCollection,
  useAsyncData,
  useGlobalState,
};

export function withGlobalStateType<
  StateT,
  SsrContextT extends SsrContext<StateT> = SsrContext<StateT>,
>(): API<StateT, SsrContextT> {
  return api as API<StateT, SsrContextT>;
}
