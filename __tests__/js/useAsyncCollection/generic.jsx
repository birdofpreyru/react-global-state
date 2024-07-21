/** @jest-environment jsdom */

// A very generic test of basic useAsyncCollection() functionality.

import mockdate from 'mockdate';
import { useState } from 'react';

import { timer } from '@dr.pogodin/js-utils';

import { act, mount } from 'jest/utils';

import GlobalState from 'src/GlobalState';
import { GlobalStateProvider, useAsyncCollection } from 'src';

mockdate.set('2021-05-08Z');

function loader(id) {
  return `Value for ID ${id}`;
}

function Component() {
  const [id, setId] = useState(0);
  const { data } = useAsyncCollection(id, 'test.path', loader);
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

function Scene({ globalState }) {
  return (
    <GlobalStateProvider stateProxy={globalState}>
      <Component />
    </GlobalStateProvider>
  );
}

it('works as expected', async () => {
  const globalState = new GlobalState();
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
