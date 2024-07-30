/** @jest-environment jsdom */

// This test is essentially the same basic test as for "generic-a",
// but using an array of IDs rather than a single one.

import mockdate from 'mockdate';
import { useState } from 'react';

import { timer } from '@dr.pogodin/js-utils';
import { getByText } from '@testing-library/dom';

import { act, mount } from 'jest/utils';

import GlobalState from 'src/GlobalState';

import {
  type AsyncDataEnvelopeT,
  type ForceT,
  GlobalStateProvider,
  useAsyncCollection,
} from 'src';

mockdate.set('2021-05-08Z');

type DataT = {
  test: {
    path: AsyncDataEnvelopeT<string>[];
  };
};

function newZeroState(): DataT {
  return { test: { path: [] } };
}

async function loader(id: string) {
  return `Value for ID ${id}`;
}

const Component: React.FunctionComponent = () => {
  const [id, setId] = useState(0);
  const { collection } = useAsyncCollection<ForceT, string>([id], 'test.path', loader);
  return (
    <div>
      {collection[id]?.data}
      <button
        onClick={() => setId(id + 1)}
        type="button"
      >
        Bump the value
      </button>
    </div>
  );
};

const Scene: React.FunctionComponent<{
  globalState: GlobalState<DataT>;
}> = ({ globalState }) => (
  <GlobalStateProvider stateProxy={globalState}>
    <Component />
  </GlobalStateProvider>
);

it('works as expected', async () => {
  const globalState = new GlobalState(newZeroState());
  const scene = mount(<Scene globalState={globalState} />);
  await act(() => timer(10));
  scene.snapshot();
  expect(globalState.get()).toMatchSnapshot();

  act(() => getByText(scene, 'Bump the value').click());
  await act(() => timer(10));
  scene.snapshot();
  expect(globalState.get()).toMatchSnapshot();
});
