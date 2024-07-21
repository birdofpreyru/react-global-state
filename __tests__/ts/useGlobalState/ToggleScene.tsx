/** @jest-environment jsdom */

import { type MountedSceneT, act, mount } from 'jest/utils';
import { GlobalStateProvider, useGlobalState } from 'src/index';

jest.useFakeTimers();

const PATH = 'path';

type StateT = { [PATH]: boolean };

const Component: React.FunctionComponent = () => {
  const [value, setValue] = useGlobalState<StateT, typeof PATH>('path');
  return (
    <div>
      <button
        onClick={() => setValue(!value)}
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
  const button = document.getElementsByTagName('button')[0];
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    jest.runAllTimers();
  });
  scene.snapshot();
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    jest.runAllTimers();
  });
  scene.snapshot();
});
