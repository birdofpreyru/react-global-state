/** @jest-environment jsdom */

/**
 * Tests `useGlobalState(..)` functionality in the "CounterScene":
 * one component shows a value from the global state, another component
 * implements a button, which updates that state when clicked.
 */

import pretty from 'pretty';

import GlobalState from 'src/GlobalState';
import { type DestroyableHtmlElement, act, mount } from 'jest/utils';
import { GlobalStateProvider, useGlobalState } from 'src/index';

jest.useFakeTimers();

const COUNTER_PATH = 'counter';

type StateT = {
  [COUNTER_PATH]: number;
};

const CounterView: React.FunctionComponent = () => {
  const [count] = useGlobalState<StateT, typeof COUNTER_PATH>(COUNTER_PATH);
  return <div>{count}</div>;
};

const CounterButton: React.FunctionComponent<{
  testButtonId: string;
}> = ({ testButtonId }) => {
  const [
    count,
    setCount,
  ] = useGlobalState<StateT, typeof COUNTER_PATH>('counter');
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
};

/**
 * This is the test scene.
 */
const TestScene: React.FunctionComponent<{
  stateProxy?: boolean | GlobalState<StateT>;
}> = ({ stateProxy }) => (
  <GlobalStateProvider<StateT>
    initialState={{ counter: 0 }}
  >
    <CounterView />
    <CounterButton testButtonId="button-1" />
    {
      stateProxy ? (
        <GlobalStateProvider<StateT> stateProxy={stateProxy}>
          <CounterView />
          <CounterButton testButtonId="button-2" />
        </GlobalStateProvider>
      ) : (
        <GlobalStateProvider<StateT>
          initialState={{ counter: 0 }}
        >
          <CounterView />
          <CounterButton testButtonId="button-2" />
        </GlobalStateProvider>
      )
    }
  </GlobalStateProvider>
);

let scene: DestroyableHtmlElement | undefined;

afterEach(() => {
  if (scene) {
    scene.destroy();
    scene = undefined;
  }
});

test('Throws if GlobalStateProvider is missing', () => {
  const consoleError = console.error;
  console.error = () => null;
  let message;
  try {
    mount(<CounterView />);
  } catch (error) {
    ({ message } = error as Error);
  }
  console.error = consoleError;
  expect(message).toMatchSnapshot();
});

test('The scene works as expected', () => {
  scene = mount(<TestScene />);
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
  let button = document.querySelector('[data-testid=button-1]');
  act(() => {
    button!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    jest.runAllTimers();
  });
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
  button = document.querySelector('[data-testid=button-2]');
  act(() => {
    button!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    jest.runAllTimers();
  });
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
});

test('Test of `stateProxy` prop of the state provider', () => {
  scene = mount(<TestScene stateProxy />);
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
  let button = document.querySelector('[data-testid=button-1]');
  act(() => {
    button!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    jest.runAllTimers();
  });
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
  button = document.querySelector('[data-testid=button-2]');
  act(() => {
    button!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    jest.runAllTimers();
  });
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
});

test('Test of `stateProxy` prop of the state provider II', () => {
  const innerGlobalState = new GlobalState<StateT>({ counter: 0 });
  scene = mount(<TestScene stateProxy={innerGlobalState} />);
  expect(innerGlobalState.get()).toMatchSnapshot();
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
  let button = document.querySelector('[data-testid=button-1]');
  act(() => {
    button!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    jest.runAllTimers();
  });
  expect(innerGlobalState.get()).toMatchSnapshot();
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
  button = document.querySelector('[data-testid=button-2]');
  act(() => {
    button!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    jest.runAllTimers();
  });
  expect(innerGlobalState.get()).toMatchSnapshot();
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
});
