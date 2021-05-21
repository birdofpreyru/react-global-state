import React from "react";

interface IAsyncDataEnvelope<DataT> {
  data: null|DataT,
  loading: boolean,
  timestamp: number,
}

interface ISsrContext<StateT> {
  dirty: boolean;
  pending: Array<Promise<any>>;
  state: StateT;
}

interface IGlobalState<StateT> {
  constructor: new (
    initialState: StateT,
    ssrContext: ISsrContext<StateT>,
  ) => IGlobalState<StateT>;

  get<T>(path?: string): T;
  set<T>(path: string|undefined, value: T): T;
  unWatch(callback: () => void);
  watch(callback: () => void);
}

type GlobalStateProviderProps<StateT> = {
  children?: React.ReactNode;
  initialState?: StateT;
  ssrContext?: ISsrContext<StateT>;
  stateProxy?: true|IGlobalState<StateT>;
};

export function GlobalStateProvider<StateT>(
  props: GlobalStateProviderProps<StateT>
): JSX.Element;

export function getSsrContext<StateT>(throwWithoutSsrContext: boolean):
  ISsrContext<StateT>|undefined;

export function getGlobalState<StateT>(): IGlobalState<StateT>;

export function useGlobalState<T>(
  path: string|undefined,
  initialValue: T | (() => T),
): [
  value: T,
  setValue: (value: T | ((value: T) => T)) => void,
];

type UseAsyncOptionsType = {
  deps?: Array<any>,
  noSSR?: boolean,
  garbageCollectAge?: number,
  maxage?: number,
  refreshAge?: number,
};

export function useAsyncData<DataT>(
  path: string|undefined,
  loader: (prevData: DataT|null) => DataT | Promise<DataT>,
  options?: UseAsyncOptionsType,
): IAsyncDataEnvelope<DataT>

export function useAsyncCollection<DataT>(
  id: string,
  path: string|undefined,
  loader: (id: string, prevData: DataT|null) => DataT | Promise<DataT>,
  options?: UseAsyncOptionsType,
): IAsyncDataEnvelope<DataT>
