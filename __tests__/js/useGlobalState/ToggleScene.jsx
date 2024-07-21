/** @jest-environment jsdom */

import { act, mount } from 'jest/utils';
import { GlobalStateProvider, useGlobalState } from 'src';

jest.useFakeTimers();

function Component() {
  const [value, setValue] = useGlobalState('path', false);
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
}

function Scene() {
  return (
    <GlobalStateProvider>
      <Component />
    </GlobalStateProvider>
  );
}

let scene = null;
afterEach(() => {
  if (scene) {
    scene.destroy();
    scene = null;
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
