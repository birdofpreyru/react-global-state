/** @jest-environment jsdom */

import { useState } from 'react';

import { SEC_MS, timer } from '@dr.pogodin/js-utils';
import { expect, jest, test } from '@jest/globals';
import { getByTestId } from '@testing-library/dom';

import { act, mount } from 'jest/utils';

import { type AsyncDataEnvelopeT, newAsyncDataEnvelope, withGlobalStateType } from 'src';

jest.useFakeTimers();

type StateT = {
  path: AsyncDataEnvelopeT<number>;
};

const {
  GlobalState,
  GlobalStateProvider,
  useAsyncData,
} = withGlobalStateType<StateT>();

const abortSignals = new Map<number, AbortSignal>();

const Component: React.FunctionComponent = () => {
  const [x, setX] = useState<number>(0);
  const { data } = useAsyncData(
    'path',
    async (old, { abortSignal }) => {
      abortSignals.set(x, abortSignal);
      await timer(SEC_MS);
      return x;
    },
    { deps: [x] },
  );
  return (
    <div
      data-testid="component"
      onClick={() => {
        setX(x + 1);
      }}
      role="presentation"
    >
      {data}
    </div>
  );
};

type ScenePropsT = {
  gs: InstanceType<typeof GlobalState>;
};

const Scene: React.FunctionComponent<ScenePropsT> = ({ gs }) => (
  <GlobalStateProvider stateProxy={gs}>
    <Component />
  </GlobalStateProvider>
);

test('base scenario', async () => {
  const gs = new GlobalState({ path: newAsyncDataEnvelope() });
  const scene = mount(<Scene gs={gs} />);

  // The value in the global state is "null", the 0 value data loading is
  // pending for 1 second.
  expect(gs.numAsyncDataAbortCallbacks).toBe(1);
  expect(abortSignals.get(0)!.aborted).toBe(false);
  scene.snapshot();

  await act(async () => jest.advanceTimersByTimeAsync(2 * SEC_MS));
  await act(async () => jest.advanceTimersByTimeAsync(0.01 * SEC_MS));

  // The value in the global state is 1 now. The load was successful,
  // thus not aborted.
  expect(gs.numAsyncDataAbortCallbacks).toBe(0);
  expect(abortSignals.get(0)!.aborted).toBe(false);
  scene.snapshot();

  const component = getByTestId(scene, 'component');

  await act(async () => {
    component.click();
    return jest.advanceTimersByTimeAsync(0.5 * SEC_MS);
  });
  await act(async () => jest.advanceTimersByTimeAsync(0.01 * SEC_MS));

  // By this point the data has not been reloaded yet - the value is still 0.
  expect(gs.numAsyncDataAbortCallbacks).toBe(1);
  expect(abortSignals.get(1)!.aborted).toBe(false);
  scene.snapshot();

  // This bumps the `x` value, causing the next data reload, to the value 2,
  // aborting the pending operation for the value 1.
  await act(async () => {
    component.click();
    return jest.advanceTimersByTimeAsync(0.1 * SEC_MS);
  });
  await act(async () => jest.advanceTimersByTimeAsync(0.01 * SEC_MS));

  // At this point the operation for value 1 has been aborted, but the operation
  // for value #2 is still pending.
  expect(gs.numAsyncDataAbortCallbacks).toBe(1);
  expect(abortSignals.get(1)!.aborted).toBe(true);
  expect(abortSignals.get(2)!.aborted).toBe(false);
  scene.snapshot();

  await act(async () => jest.advanceTimersByTimeAsync(SEC_MS));
  await act(async () => jest.advanceTimersByTimeAsync(0.01 * SEC_MS));

  // Now the pending operation has completed, the final value in the global
  // state is 2.
  expect(gs.numAsyncDataAbortCallbacks).toBe(0);
  expect(abortSignals.get(2)!.aborted).toBe(false);
  scene.snapshot();
});
