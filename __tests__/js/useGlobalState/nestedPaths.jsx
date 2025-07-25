/** @jest-environment jsdom */

/* global MouseEvent */

/**
 * Updates of nested state paths should notify watchers of the wrapping paths.
 */

import { timer } from '@dr.pogodin/js-utils';
import { act, mount } from 'jest/utils';
import { GlobalStateProvider, useGlobalState } from 'src';

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
    <GlobalStateProvider>
      <ComponentA1 />
      <ComponentB1 />
    </GlobalStateProvider>
  );
}

let scene;

afterEach(() => {
  if (scene) {
    scene.destroy();
    scene = null;
  }
});

it('Test with objects', async () => {
  scene = mount(<Scene1 />);
  await act(() => timer(1));
  scene.snapshot();
  const button = scene.querySelector('#button');
  await act(async () => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await timer(1);
  });
  scene.snapshot();
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
  const [state, setState] = useGlobalState(
    'path[1].key1',
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
    <GlobalStateProvider>
      <ComponentA2 />
      <ComponentB2 />
    </GlobalStateProvider>
  );
}

it('Test with arrays', async () => {
  scene = mount(<Scene2 />);
  await act(() => timer(1));
  scene.snapshot();
  const button = scene.querySelector('#button');
  await act(async () => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await timer(1);
  });
  scene.snapshot();
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
  const [state, setState] = useGlobalState(
    'path[1]',
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
    <GlobalStateProvider>
      <ComponentA3 />
      <ComponentB3 />
    </GlobalStateProvider>
  );
}

it('Test with strings', async () => {
  scene = mount(<Scene3 />);
  await act(() => timer(1));
  scene.snapshot();
  const button = scene.querySelector('#button');
  await act(async () => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await timer(1);
  });
  scene.snapshot();
});
