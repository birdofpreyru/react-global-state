/** @jest-environment jsdom */

import { afterEach, jest, test } from '@jest/globals';
import { getByTestId } from '@testing-library/dom';

import { GlobalStateProvider, useGlobalState } from 'build/index.js';
import { type MountedSceneT, act, mount } from 'jest/utils.js';

jest.useFakeTimers();

const PATH = 'path';

type StateT = { [PATH]: boolean };

const Component: React.FunctionComponent = () => {
  const [value, setValue] = useGlobalState<StateT, typeof PATH>('path');
  return (
    <div>
      <button
        data-testid="button"
        onClick={() => {
          setValue(!value);
        }}
        type="button"
      >
        {value.toString()}
      </button>
    </div>
  );
};

const Scene: React.FunctionComponent = () => (
  <GlobalStateProvider<StateT> initialState={{ path: false }}>
    <Component />
  </GlobalStateProvider>
);

let scene: MountedSceneT | undefined;

afterEach(() => {
  if (scene) {
    scene.destroy();
    scene = undefined;
  }
});

test('The scene works as expected', () => {
  scene = mount(<Scene />);
  scene.snapshot();
  const button = getByTestId(scene, 'button');
  act(() => {
    button.click();
    jest.runAllTimers();
  });
  scene.snapshot();
  act(() => {
    button.click();
    jest.runAllTimers();
  });
  scene.snapshot();
});
