/**
 * Tests `useGlobalState(..)` functionality in the "CounterScene":
 * one component shows a value from the global state, another component
 * implements a button, which updates that state when clicked.
 */
/* eslint-disable react/prop-types */

import React from 'react';

import pretty from 'pretty';

import { act, mount, unmount } from 'jest/utils';
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

function TestScene() {
  return (
    <GlobalStateProvider>
      <CounterView />
      <CounterButton testButtonId="button-1" />
      <GlobalStateProvider>
        <CounterView />
        <CounterButton testButtonId="button-2" />
      </GlobalStateProvider>
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
  act(() => {
    scene = mount(<TestScene />);
  });
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
  let button = document.querySelector('[data-testid=button-1]');
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    jest.runAllTimers();
  });
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
  button = document.querySelector('[data-testid=button-2]');
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    jest.runAllTimers();
  });
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
});