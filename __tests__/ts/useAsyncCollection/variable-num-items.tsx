/** @jest-environment jsdom */

// Tests the loading of variable number of collection items over the hook
// instance lifetime, and related garbage-collecting.

import mockdate from 'mockdate';
import { useState } from 'react';

import { getByText } from '@testing-library/react';

import { act, mount } from 'jest/utils';

import { type AsyncDataEnvelopeT, withGlobalStateType } from 'src';

jest.useFakeTimers();
mockdate.set('2024-08-11Z');

type StateT = {
  collection: Record<string, AsyncDataEnvelopeT<string>>;
};

const {
  GlobalState,
  GlobalStateProvider,
  useAsyncCollection,
} = withGlobalStateType<StateT>();

const Component: React.FunctionComponent = () => {
  const [ids, setIds] = useState<string[]>([]);
  useAsyncCollection(ids, 'collection', (id) => `${id}-value`);
  return (
    <div>
      <button
        onClick={() => {
          switch (ids.length) {
            case 0:
              setIds(['a']);
              break;
            case 1:
              setIds(['b', 'a']);
              break;
            default:
              setIds(['b']);
          }
        }}
        type="button"
      >
        next
      </button>
    </div>
  );
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
        unmount
      </button>
    </GlobalStateProvider>
  );
};

it('works as expected', async () => {
  const gs = new GlobalState({ collection: {} });
  const scene = mount(<Scene gs={gs} />);
  await act(async () => jest.runAllTimersAsync());
  scene.snapshot();
  expect(gs.get()).toMatchSnapshot();

  const nextButton = getByText(scene, 'next');

  await act(async () => {
    nextButton.click();
    return jest.runAllTimersAsync();
  });
  expect(gs.get()).toMatchSnapshot();

  await act(async () => {
    mockdate.set(Date.now() + 1000);
    nextButton.click();
    return jest.runAllTimersAsync();
  });
  expect(gs.get()).toMatchSnapshot();

  await act(async () => {
    mockdate.set(Date.now() + 1000);
    nextButton.click();
    return jest.runAllTimersAsync();
  });
  expect(gs.get()).toMatchSnapshot();

  await act(async () => {
    mockdate.set(Date.now() + 10 * 60 * 1000);
    getByText(scene, 'unmount').click();
    return jest.runAllTimersAsync();
  });
  expect(gs.get()).toMatchSnapshot();
});
