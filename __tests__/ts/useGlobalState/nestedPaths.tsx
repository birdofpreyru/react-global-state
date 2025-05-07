/** @jest-environment jsdom */

/**
 * Updates of nested state paths should notify watchers of the wrapping paths.
 */

import { timer } from '@dr.pogodin/js-utils';

import { type MountedSceneT, act, mount } from 'jest/utils';
import { GlobalStateProvider, useGlobalState } from 'src/index';

/* Test with the state containing only objects. */

type StateT1 = { path?: { nested?: number } };

const ComponentA1: React.FunctionComponent = () => {
  const [state] = useGlobalState<StateT1, 'path'>('path', {});
  return (
    <div>
      {JSON.stringify(state)}
    </div>
  );
};

const ComponentB1: React.FunctionComponent = () => {
  const [state, setState] = useGlobalState<StateT1, 'path.nested'>(
    'path.nested',
    0,
  );

  return (
    <div>
      <button
        id="button"
        onClick={() => {
          setState(1 + state);
        }}
        type="button"
      >
        {state}
      </button>
    </div>
  );
};

const Scene1: React.FunctionComponent = () => (
  <GlobalStateProvider<StateT1> initialState={{}}>
    <ComponentA1 />
    <ComponentB1 />
  </GlobalStateProvider>
);

let scene: MountedSceneT | undefined;

function getButton(mountedScene: MountedSceneT): Element {
  const button = mountedScene.querySelector('#button');
  if (!button) throw Error('Failed to find the button');
  return button;
}

afterEach(() => {
  if (scene) {
    scene.destroy();
    scene = undefined;
  }
});

// TODO: Correct name later.
// eslint-disable-next-line jest/valid-title
test('Test with objects', async () => {
  scene = mount(<Scene1 />);
  await act(async () => timer(1));
  scene.snapshot();
  const button = getButton(scene);
  await act(async () => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await timer(1);
  });
  scene.snapshot();
});

/* Test with the state containing an array. */

type StateT2 = {
  path?: Array<Record<string, string>>;
};

const ComponentA2: React.FunctionComponent = () => {
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
};

const ComponentB2: React.FunctionComponent = () => {
  const P = 'path[1].key1';
  const [state, setState] = useGlobalState<StateT2, typeof P>(
    P,
    undefined,
  );
  return (
    <div>
      <button
        id="button"
        onClick={() => {
          setState('value1-new');
        }}
        type="button"
      >
        {state}
      </button>
    </div>
  );
};

const Scene2: React.FunctionComponent = () => (
  <GlobalStateProvider<StateT2> initialState={{}}>
    <ComponentA2 />
    <ComponentB2 />
  </GlobalStateProvider>
);

// TODO: Correct name later.
// eslint-disable-next-line jest/valid-title
test('Test with arrays', async () => {
  scene = mount(<Scene2 />);
  await act(async () => timer(1));
  scene.snapshot();
  const button = getButton(scene);
  await act(async () => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await timer(1);
  });
  scene.snapshot();
});

/* Test with strings in the path. */

type StateT3 = {
  path?: string;
};

const ComponentA3: React.FunctionComponent = () => {
  const P = 'path';
  const [state] = useGlobalState<StateT3, typeof P>(P, 'value');
  return (
    <div>
      {JSON.stringify(state)}
    </div>
  );
};

const ComponentB3: React.FunctionComponent = () => {
  const P = 'path[1]';
  const [state, setState] = useGlobalState<StateT3, typeof P>(P);
  return (
    <div>
      <button
        id="button"
        onClick={() => {
          setState('test');
        }}
        type="button"
      >
        {state}
      </button>
    </div>
  );
};

const Scene3: React.FunctionComponent = () => (
  <GlobalStateProvider initialState={undefined}>
    <ComponentA3 />
    <ComponentB3 />
  </GlobalStateProvider>
);

// TODO: Correct name later.
// eslint-disable-next-line jest/valid-title
test('Test with strings', async () => {
  scene = mount(<Scene3 />);
  await act(async () => timer(1));
  scene.snapshot();
  const button = getButton(scene);
  await act(async () => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await timer(1);
  });
  scene.snapshot();
});
