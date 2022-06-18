/** @jest-environment jsdom */

// These tests cover useGlobalState behavior when its "path" argument value
// changes.

import { act, mount, timer } from 'jest/utils';
import pretty from 'pretty';
import { useState } from 'react';
import { GlobalStateProvider, useGlobalState } from 'src';
import GlobalState from 'src/GlobalState';

function Component() {
  const [path, setPath] = useState('pathA');
  const [value, setValue] = useGlobalState(path, `Default at ${path}`);
  return (
    <div>
      {path}: {value}
      <button
        id="changePath"
        onClick={() => setPath('pathB')}
        type="button"
      >
        Change Path
      </button>
      <button
        id="changeValue"
        onClick={() => setValue(`New value at ${path}`)}
        type="button"
      >
        Change Value
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
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
  expect(globalState.state).toMatchSnapshot();

  let button = document.querySelector('#changePath');
  await act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return timer(10);
  });
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
  expect(globalState.state).toMatchSnapshot();

  button = document.querySelector('#changeValue');
  await act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return timer(10);
  });
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
  expect(globalState.state).toMatchSnapshot();
});
