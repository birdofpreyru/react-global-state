// A very generic test of basic useAsyncCollection() functionality.

import mockdate from 'mockdate';
import pretty from 'pretty';
import { useState } from 'react';

import { act, mount, timer } from 'jest/utils';

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
  let scene;
  const globalState = new GlobalState();
  await act(async () => {
    scene = mount(<Scene globalState={globalState} />);
    return timer(10);
  });
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
  expect(globalState.state).toMatchSnapshot();

  const button = document.getElementsByTagName('button')[0];
  await act(async () => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return timer(10);
  });
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
  expect(globalState.state).toMatchSnapshot();
});
