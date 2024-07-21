/** @jest-environment jsdom */

// A very generic test of basic useAsyncCollection() functionality.

import mockdate from 'mockdate';
import { useState } from 'react';

import { timer } from '@dr.pogodin/js-utils';

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
  const { data } = useAsyncCollection<ForceT, string>(id.toString(), 'test.path', loader);
  return (
    <div>
      {data}
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

  const button = document.getElementsByTagName('button')[0];
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await act(() => timer(10));
  scene.snapshot();
  expect(globalState.get()).toMatchSnapshot();
});
