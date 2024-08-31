/** @jest-environment jsdom */

import { useState } from 'react';

import { SEC_MS, timer } from '@dr.pogodin/js-utils';

import { act, mount } from 'jest/utils';

import { type AsyncDataEnvelopeT, newAsyncDataEnvelope, withGlobalStateType } from 'src';
import { getByTestId } from '@testing-library/dom';

jest.useFakeTimers();

type StateT = {
  path: AsyncDataEnvelopeT<number>;
};

const {
  GlobalState,
  GlobalStateProvider,
  useAsyncData,
} = withGlobalStateType<StateT>();

const isAbortedMap: Record<number, () => boolean> = {};
const onAbort = jest.fn();

const Component: React.FunctionComponent = () => {
  const [x, setX] = useState<number>(0);
  const { data } = useAsyncData(
    'path',
    async (old, { isAborted, setAbortCallback }) => {
      isAbortedMap[x] = isAborted;
      setAbortCallback(() => onAbort(x));
      await timer(SEC_MS);
      return x;
    },
    { deps: [x] },
  );
  return (
    <div
      data-testid="component"
      onClick={() => setX(x + 1)}
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
  expect(isAbortedMap[0]?.()).toBe(false);
  expect(onAbort).not.toHaveBeenCalled();
  scene.snapshot();

  await act(() => jest.advanceTimersByTimeAsync(2 * SEC_MS));
  await act(() => jest.advanceTimersByTimeAsync(0.01 * SEC_MS));

  // The value in the global state is 1 now. isAborted() returns "true"
  // just because the operation has completed.
  expect(gs.numAsyncDataAbortCallbacks).toBe(0);
  expect(isAbortedMap[0]?.()).toBe(true);
  expect(onAbort).not.toHaveBeenCalled();
  scene.snapshot();

  const component = getByTestId(scene, 'component');

  await act(() => {
    component.click();
    return jest.advanceTimersByTimeAsync(0.5 * SEC_MS);
  });
  await act(() => jest.advanceTimersByTimeAsync(0.01 * SEC_MS));

  // By this point the data has not been reloaded yet - the value is still 0.
  expect(gs.numAsyncDataAbortCallbacks).toBe(1);
  expect(isAbortedMap[1]?.()).toBe(false);
  expect(onAbort).not.toHaveBeenCalled();
  scene.snapshot();

  // This bumps the `x` value, causing the next data reload, to the value 2,
  // aborting the pending operation for the value 1.
  await act(() => {
    component.click();
    return jest.advanceTimersByTimeAsync(0.1 * SEC_MS);
  });
  await act(() => jest.advanceTimersByTimeAsync(0.01 * SEC_MS));

  // At this point the operation for value 1 has been aborted, but the operation
  // for value #2 is still pending.
  expect(gs.numAsyncDataAbortCallbacks).toBe(1);
  expect(isAbortedMap[1]?.()).toBe(true);
  expect(isAbortedMap[2]?.()).toBe(false);
  expect(onAbort).toHaveBeenCalledTimes(1);
  expect(onAbort).toHaveBeenLastCalledWith(1);
  scene.snapshot();

  await act(() => jest.advanceTimersByTimeAsync(SEC_MS));
  await act(() => jest.advanceTimersByTimeAsync(0.01 * SEC_MS));

  // Now the pending operation has completed, the final value in the global
  // state is 2.
  expect(gs.numAsyncDataAbortCallbacks).toBe(0);
  expect(isAbortedMap[2]?.()).toBe(true);
  expect(onAbort).toHaveBeenCalledTimes(1);
  expect(onAbort).toHaveBeenLastCalledWith(1);
  scene.snapshot();
});
