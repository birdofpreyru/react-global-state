/** @jest-environment jsdom */

/**
 * Updates of nested state paths should notify watchers of the wrapping paths.
 */

import pretty from 'pretty';
import { timer } from '@dr.pogodin/js-utils';

import { type DestroyableHtmlElement, act, mount } from 'jest/utils';
import { GlobalStateProvider, useGlobalState } from 'src/index';

/* Test with the state containing only objects. */

function ComponentA1() {
  const [state] = useGlobalState('path', {});
  return (
    <div>
      {JSON.stringify(state)}
    </div>
  );
}

function ComponentB1() {
  const [state, setState] = useGlobalState('path.nested', 0);
  return (
    <div>
      <button
        id="button"
        onClick={() => setState(1 + state)}
        type="button"
      >
        {state}
      </button>
    </div>
  );
}

function Scene1() {
  return (
    <GlobalStateProvider initialState={undefined}>
      <ComponentA1 />
      <ComponentB1 />
    </GlobalStateProvider>
  );
}

let currentScene: DestroyableHtmlElement | undefined;

function getButton(scene: DestroyableHtmlElement): Element {
  const button = scene.querySelector('#button');
  if (!button) throw Error('Failed to find the button');
  return button;
}

afterEach(() => {
  if (currentScene) {
    currentScene.destroy();
    currentScene = undefined;
  }
});

test('Test with objects', async () => {
  currentScene = mount(<Scene1 />);
  await act(() => timer(0));
  expect(pretty(currentScene.innerHTML)).toMatchSnapshot();
  const button = getButton(currentScene);
  await act(async () => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await timer(0);
  });
  expect(pretty(currentScene.innerHTML)).toMatchSnapshot();
});

/* Test with the state containing an array. */

function ComponentA2() {
  const [state] = useGlobalState(
    'path',
    [
      { key0: 'value0' },
      { key1: 'value1' },
      { key2: 'value2' },
    ],
  );
  return (
    <div>
      {JSON.stringify(state)}
    </div>
  );
}

function ComponentB2() {
  const [state, setState] = useGlobalState<string | undefined>(
    'path[1].key1',
    undefined,
  );
  return (
    <div>
      <button
        id="button"
        onClick={() => setState('value1-new')}
        type="button"
      >
        {state}
      </button>
    </div>
  );
}

function Scene2() {
  return (
    <GlobalStateProvider initialState={undefined}>
      <ComponentA2 />
      <ComponentB2 />
    </GlobalStateProvider>
  );
}

test('Test with arrays', async () => {
  currentScene = mount(<Scene2 />);
  await act(() => timer(1));
  expect(pretty(currentScene.innerHTML)).toMatchSnapshot();
  const button = getButton(currentScene);
  await act(async () => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await timer(1);
  });
  expect(pretty(currentScene.innerHTML)).toMatchSnapshot();
});

/* Test with strings in the path. */

function ComponentA3() {
  const [state] = useGlobalState(
    'path',
    'value',
  );
  return (
    <div>
      {JSON.stringify(state)}
    </div>
  );
}

function ComponentB3() {
  const [state, setState] = useGlobalState<string | undefined>(
    'path[1]',
    undefined,
  );
  return (
    <div>
      <button
        id="button"
        onClick={() => setState('test')}
        type="button"
      >
        {state}
      </button>
    </div>
  );
}

function Scene3() {
  return (
    <GlobalStateProvider initialState={undefined}>
      <ComponentA3 />
      <ComponentB3 />
    </GlobalStateProvider>
  );
}

test('Test with strings', async () => {
  currentScene = mount(<Scene3 />);
  await act(() => timer(1));
  expect(pretty(currentScene.innerHTML)).toMatchSnapshot();
  const button = getButton(currentScene);
  await act(async () => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await timer(1);
  });
  expect(pretty(currentScene.innerHTML)).toMatchSnapshot();
});
