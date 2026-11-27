/** @jest-environment jsdom */

// These tests cover useGlobalState behavior when its "path" argument value
// changes.

import { type FunctionComponent, useState } from 'react';

import { timer } from '@dr.pogodin/js-utils';
import { expect, it } from '@jest/globals';

import GlobalState from 'build/GlobalState.js';
import { GlobalStateProvider, useGlobalState } from 'build/index.js';
import { act, mount } from 'jest/utils.js';

type StateT = {
  pathA?: string;
  pathB?: string;
};

const Component: FunctionComponent = () => {
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
        onClick={() => {
          setPath('pathB');
        }}
        type="button"
      >
        Change Path
      </button>
      <button
        id="changeValue"
        onClick={() => {
          setValue(`New value at ${path}`);
        }}
        type="button"
      >
        Change Value
      </button>
    </div>
  );
};

const Scene: FunctionComponent<{
  globalState: GlobalState<object | undefined>;
}> = ({ globalState }) => (
  <GlobalStateProvider initialState={undefined} stateProxy={globalState}>
    <Component />
  </GlobalStateProvider>
);

it('works as expected', async () => {
  const globalState = new GlobalState<object | undefined>({});
  const scene = mount(<Scene globalState={globalState} />);
  scene.snapshot();
  expect(globalState.get()).toMatchSnapshot();

  let button = document.querySelector('#changePath');
  await act(async () => {
    if (!button) throw Error('Missing button');
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return timer(10);
  });
  scene.snapshot();
  expect(globalState.get()).toMatchSnapshot();

  button = document.querySelector('#changeValue');
  await act(async () => {
    if (!button) throw Error('Missing button');
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return timer(10);
  });
  scene.snapshot();
  expect(globalState.get()).toMatchSnapshot();
});
