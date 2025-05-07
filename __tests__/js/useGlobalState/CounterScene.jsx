/** @jest-environment jsdom */

/* global console, document, MouseEvent */

/**
 * Tests `useGlobalState(..)` functionality in the "CounterScene":
 * one component shows a value from the global state, another component
 * implements a button, which updates that state when clicked.
 */

import GlobalState from '../../../src/GlobalState';
import { act, mount } from 'jest/utils';
import { GlobalStateProvider, useGlobalState } from 'src';

jest.useFakeTimers();

function CounterView() {
  const [count] = useGlobalState('counter', 0);
  return <div>{count}</div>;
}

function CounterButton({ testButtonId }) {
  const [count, setCount] = useGlobalState('counter', 0);
  return (
    <div>
      <button
        data-testid={testButtonId}
        onClick={() => setCount(1 + count)}
        type="button"
      >
        Bump!
      </button>
    </div>
  );
}

/**
 * This is the test scene.
 */
function TestScene({ stateProxy }) {
  return (
    <GlobalStateProvider>
      <CounterView />
      <CounterButton testButtonId="button-1" />
      <GlobalStateProvider stateProxy={stateProxy}>
        <CounterView />
        <CounterButton testButtonId="button-2" />
      </GlobalStateProvider>
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

test('Throws if GlobalStateProvider is missing', () => {
  const consoleError = console.error;
  console.error = () => null;
  let message;
  try {
    mount(<CounterView />);
  } catch (error) {
    ({ message } = error);
  }
  console.error = consoleError;
  expect(message).toMatchSnapshot();
});

test('The scene works as expected', () => {
  scene = mount(<TestScene />);
  scene.snapshot();
  let button = document.querySelector('[data-testid=button-1]');
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    jest.runAllTimers();
  });
  scene.snapshot();
  button = document.querySelector('[data-testid=button-2]');
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    jest.runAllTimers();
  });
  scene.snapshot();
});

it('Test of `stateProxy` prop of the state provider', () => {
  scene = mount(<TestScene stateProxy />);
  scene.snapshot();
  let button = document.querySelector('[data-testid=button-1]');
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    jest.runAllTimers();
  });
  scene.snapshot();
  button = document.querySelector('[data-testid=button-2]');
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    jest.runAllTimers();
  });
  scene.snapshot();
});

it('Test of `stateProxy` prop of the state provider II', () => {
  const innerGlobalState = new GlobalState();
  scene = mount(<TestScene stateProxy={innerGlobalState} />);
  expect(innerGlobalState.get()).toMatchSnapshot();
  scene.snapshot();
  let button = document.querySelector('[data-testid=button-1]');
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    jest.runAllTimers();
  });
  expect(innerGlobalState.get()).toMatchSnapshot();
  scene.snapshot();
  button = document.querySelector('[data-testid=button-2]');
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    jest.runAllTimers();
  });
  expect(innerGlobalState.get()).toMatchSnapshot();
  scene.snapshot();
});
