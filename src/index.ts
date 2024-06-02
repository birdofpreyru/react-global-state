import GlobalState from './GlobalState';

import GlobalStateProvider, {
  getGlobalState,
  getSsrContext,
} from './GlobalStateProvider';

import SsrContext from './SsrContext';

import useAsyncCollection, {
  type UseAsyncCollectionI,
} from './useAsyncCollection';

import {
  type UseAsyncDataI,
  newAsyncDataEnvelope,
  useAsyncData,
} from './useAsyncData';

import useGlobalState, { type UseGlobalStateI } from './useGlobalState';

export type { AsyncCollectionLoaderT } from './useAsyncCollection';

export * from './useAsyncData';

export type { SetterT, UseGlobalStateResT } from './useGlobalState';

export type { ForceT, ValueOrInitializerT } from './utils';

export {
  getGlobalState,
  getSsrContext,
  GlobalState,
  GlobalStateProvider,
  SsrContext,
  useAsyncCollection,
  useGlobalState,
};

interface API<
  StateT,
  SsrContextT extends SsrContext<StateT> = SsrContext<StateT>,
> {
  getGlobalState: typeof getGlobalState<StateT, SsrContextT>;
  getSsrContext: typeof getSsrContext<SsrContextT>,
  GlobalState: typeof GlobalState<StateT, SsrContextT>,
  GlobalStateProvider: typeof GlobalStateProvider<StateT, SsrContextT>,
  newAsyncDataEnvelope: typeof newAsyncDataEnvelope,
  SsrContext: typeof SsrContext<StateT>,
  useAsyncCollection: UseAsyncCollectionI<StateT>,
  useAsyncData: UseAsyncDataI<StateT>,
  useGlobalState: UseGlobalStateI<StateT>,
}

const api = {
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

export function withGlobalStateType<
  StateT,
  SsrContextT extends SsrContext<StateT> = SsrContext<StateT>,
>() {
  return api as API<StateT, SsrContextT>;
}
