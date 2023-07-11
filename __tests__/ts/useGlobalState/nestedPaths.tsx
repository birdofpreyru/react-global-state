/** @jest-environment jsdom */

/**
 * Updates of nested state paths should notify watchers of the wrapping paths.
 */

import pretty from 'pretty';
import { timer } from '@dr.pogodin/js-utils';

import { type DestroyableHtmlElement, act, mount } from 'jest/utils';
import { GlobalStateProvider, useGlobalState } from 'src/index';

/* Test with the state containing only objects. */

type StateT1 = { path?: { nested?: number } };

function ComponentA1() {
  const [state] = useGlobalState<StateT1, 'path'>('path', {});
  return (
    <div>
      {JSON.stringify(state)}
    </div>
  );
}

function ComponentB1() {
  const [state, setState] = useGlobalState<StateT1, 'path.nested'>(
    'path.nested',
    0,
  );
  if (state === undefined) throw Error('Invariant violated');
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
    <GlobalStateProvider<StateT1> initialState={{}}>
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
  await act(() => timer(1));
  expect(pretty(currentScene.innerHTML)).toMatchSnapshot();
  const button = getButton(currentScene);
  await act(async () => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await timer(1);
  });
  expect(pretty(currentScene.innerHTML)).toMatchSnapshot();
});

/* Test with the state containing an array. */

type StateT2 = {
  path?: {
    [key: string]: string;
  }[];
};

function ComponentA2() {
  const [state] = useGlobalState<StateT2, 'path'>(
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
  const P = 'path[1].key1';
  const [state, setState] = useGlobalState<StateT2, typeof P>(
    P,
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
    <GlobalStateProvider<StateT2> initialState={{}}>
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

type StateT3 = {
  path?: string;
};

function ComponentA3() {
  const P = 'path';
  const [state] = useGlobalState<StateT3, typeof P>(P, 'value');
  return (
    <div>
      {JSON.stringify(state)}
    </div>
  );
}

function ComponentB3() {
  const P = 'path[1]';
  const [state, setState] = useGlobalState<StateT3, typeof P>(P);
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
