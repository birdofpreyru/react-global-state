/** @jest-environment jsdom */

import pretty from 'pretty';
import { act, mount, unmount } from 'jest/utils';
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
    unmount(scene);
    scene = null;
  }
});

test('The scene works as expected', () => {
  act(() => {
    scene = mount(<Scene />);
  });
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
  const button = document.getElementsByTagName('button')[0];
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    jest.runAllTimers();
  });
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    jest.runAllTimers();
  });
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
});
