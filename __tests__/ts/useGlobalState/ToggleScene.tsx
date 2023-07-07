/** @jest-environment jsdom */

import pretty from 'pretty';
import { type DestroyableHtmlElement, act, mount } from 'jest/utils';
import { GlobalStateProvider, useGlobalState } from 'src/index';

jest.useFakeTimers();

const PATH = 'path';

type StateT = { [PATH]: boolean };

function Component() {
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
}

function Scene() {
  return (
    <GlobalStateProvider<StateT> initialState={{ path: false }}>
      <Component />
    </GlobalStateProvider>
  );
}

let scene: DestroyableHtmlElement | undefined;

afterEach(() => {
  if (scene) {
    scene.destroy();
    scene = undefined;
  }
});

test('The scene works as expected', () => {
  scene = mount(<Scene />);
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
