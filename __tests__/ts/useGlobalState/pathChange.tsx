/** @jest-environment jsdom */

// These tests cover useGlobalState behavior when its "path" argument value
// changes.

import { timer } from '@dr.pogodin/js-utils';

import { act, mount } from 'jest/utils';

import { useState } from 'react';
import { GlobalStateProvider, useGlobalState } from 'src/index';
import GlobalState from 'src/GlobalState';

type StateT = {
  pathA?: string;
  pathB?: string;
};

const Component: React.FunctionComponent = () => {
  const [path, setPath] = useState<keyof StateT>('pathA');
  const [value, setValue] = useGlobalState<StateT, typeof path>(
    path,
    `Default at ${path}`,
  );
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
};

const Scene: React.FunctionComponent<{
  globalState: GlobalState<unknown>;
}> = ({ globalState }) => (
  <GlobalStateProvider initialState={undefined} stateProxy={globalState}>
    <Component />
  </GlobalStateProvider>
);

it('works as expected', async () => {
  const globalState = new GlobalState({});
  const scene = mount(<Scene globalState={globalState} />);
  scene.snapshot();
  expect(globalState.get()).toMatchSnapshot();

  let button = document.querySelector('#changePath');
  await act(() => {
    button!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return timer(10);
  });
  scene.snapshot();
  expect(globalState.get()).toMatchSnapshot();

  button = document.querySelector('#changeValue');
  await act(() => {
    button!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return timer(10);
  });
  scene.snapshot();
  expect(globalState.get()).toMatchSnapshot();
});
