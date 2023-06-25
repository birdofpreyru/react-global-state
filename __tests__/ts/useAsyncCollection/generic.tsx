/** @jest-environment jsdom */

// A very generic test of basic useAsyncCollection() functionality.

import mockdate from 'mockdate';
import pretty from 'pretty';
import { useState } from 'react';

import { timer } from '@dr.pogodin/js-utils';

import { act, mount } from 'jest/utils';

import GlobalState from 'src/GlobalState';

import {
  type AsyncDataEnvelope,
  GlobalStateProvider,
  useAsyncCollection,
} from 'src/index';

mockdate.set('2021-05-08Z');

type DataT = {
  test: {
    path: AsyncDataEnvelope<string>[];
  };
};

function newZeroState(): DataT {
  return { test: { path: [] } };
}

async function loader(id: string) {
  return `Value for ID ${id}`;
}

function Component() {
  const [id, setId] = useState(0);
  const { data } = useAsyncCollection(id.toString(), 'test.path', loader);
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
}

function Scene({ globalState }: { globalState: GlobalState<DataT> }) {
  return (
    <GlobalStateProvider stateProxy={globalState}>
      <Component />
    </GlobalStateProvider>
  );
}

it('works as expected', async () => {
  const globalState = new GlobalState(newZeroState());
  const scene = mount(<Scene globalState={globalState} />);
  await act(() => timer(10));
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
  expect(globalState.get()).toMatchSnapshot();

  const button = document.getElementsByTagName('button')[0];
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await act(() => timer(10));
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
  expect(globalState.get()).toMatchSnapshot();
});
