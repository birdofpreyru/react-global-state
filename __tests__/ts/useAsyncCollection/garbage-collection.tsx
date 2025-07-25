/** @jest-environment jsdom */

import { useState } from 'react';

import { getByText } from '@testing-library/react';

import { act, mount, timer } from 'jest/utils';

import { type AsyncDataEnvelopeT, withGlobalStateType } from 'src';

jest.useFakeTimers();

type StateT = {
  collection: Record<string, AsyncDataEnvelopeT<string>>;
};

const {
  GlobalState,
  GlobalStateProvider,
  useAsyncCollection,
} = withGlobalStateType<StateT>();

const Component: React.FunctionComponent = () => {
  useAsyncCollection(['a'], 'collection', async (id) => {
    await timer(1000);
    return `${id}/value`;
  });
  return null;
};

const Scene: React.FunctionComponent<{
  gs: InstanceType<typeof GlobalState>;
}> = ({ gs }) => {
  const [mounted, setMounted] = useState(true);
  return (
    <GlobalStateProvider stateProxy={gs}>
      {mounted ? <Component /> : null}
      <button
        onClick={() => {
          setMounted(false);
        }}
        type="button"
      >
        unmount-button
      </button>
    </GlobalStateProvider>
  );
};

test('#1', async () => {
  const gs = new GlobalState({ collection: {} });
  const scene = mount(<Scene gs={gs} />);
  expect(gs.get()).toMatchSnapshot();

  act(() => {
    getByText(scene, 'unmount-button').click();
  });
  expect(gs.get()).toMatchSnapshot();

  await act(async () => jest.advanceTimersByTimeAsync(1500));
  expect(gs.get()).toMatchSnapshot();
  scene.destroy();
});
