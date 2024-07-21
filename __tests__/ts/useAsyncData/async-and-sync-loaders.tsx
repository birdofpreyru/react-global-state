/** @jest-environment jsdom */

// In this test we check that useAsyncData() with a sync loader updates
// the global state segment synchronously, while with an async loader it does it
// asynchronously, passing through the loading state.

import { timer } from '@dr.pogodin/js-utils';

import { act, mount } from 'jest/utils';

import {
  type AsyncDataEnvelopeT,
  type AsyncDataReloaderT,
  type ForceT,
  GlobalState,
  GlobalStateProvider,
  newAsyncDataEnvelope,
  useAsyncData,
} from 'src';

type StateT = {
  async: AsyncDataEnvelopeT<string>;
  sync: AsyncDataEnvelopeT<string>;
};

let aReload: AsyncDataReloaderT<string> | undefined;
let sReload: AsyncDataReloaderT<string> | undefined;

const AsyncComponent: React.FunctionComponent = () => {
  const x = useAsyncData<ForceT, string>('async', async () => {
    await timer(100);
    return 'ok';
  });
  if (aReload) expect(aReload).toBe(x.reload);
  else aReload = x.reload;
  return null;
};

const SyncComponent: React.FunctionComponent = () => {
  const x = useAsyncData<ForceT, string>('sync', () => 'ok');
  if (sReload) expect(sReload).toBe(x.reload);
  else sReload = x.reload;
  return null;
};

test('useAsyncData() behavior with async and sync loaders', async () => {
  const gs = new GlobalState<StateT>({
    async: newAsyncDataEnvelope(),
    sync: newAsyncDataEnvelope(),
  });

  expect(gs.getEntireState()).toEqual({
    async: {
      data: null,
      numRefs: 0,
      operationId: '',
      timestamp: 0,
    },
    sync: {
      data: null,
      numRefs: 0,
      operationId: '',
      timestamp: 0,
    },
  });

  mount(
    <GlobalStateProvider stateProxy={gs}>
      <AsyncComponent />
      <SyncComponent />
    </GlobalStateProvider>,
  );

  {
    const x = gs.getEntireState();
    expect(x.async.data).toBe(null);
    expect(x.async.numRefs).toBe(1);
    expect(x.async.operationId).toBeTruthy();
    expect(x.async.timestamp).toBe(0);
    expect(x.sync.data).toBe('ok');
    expect(x.sync.numRefs).toBe(1);
    expect(x.sync.operationId).toBe('');
    expect(Number.isInteger(x.sync.timestamp)).toBe(true);
  }

  await act(() => timer(200));

  {
    const x = gs.getEntireState();
    expect(x.async.data).toBe('ok');
    expect(x.async.numRefs).toBe(1);
    expect(x.async.operationId).toBe('');
    expect(Number.isInteger(x.async.timestamp)).toBe(true);
    expect(x.sync.data).toBe('ok');
    expect(x.sync.numRefs).toBe(1);
    expect(x.sync.operationId).toBe('');
    expect(Number.isInteger(x.sync.timestamp)).toBe(true);
  }
});
