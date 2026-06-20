/** @jest-environment jsdom */

// ^^^ although it is strange to do SSR test in JSDom environment,
// some of the tests should be done at the client side.

/* global console, process */

/**
 * Base test of the server-side rendering features.
 */

import {
  act,
  mockTimer,
  mount,
  unMockConsoleLog,
} from 'jest/utils';

import mockdate from 'mockdate';

import { GlobalStateProvider, useSsrContext } from 'src/index';

import Scene, { loaderA, loaderB } from './__assets__/TestScene';

jest.useFakeTimers();
mockdate.set('2019-11-07Z');

let scene;

beforeEach(() => {
  delete process.env.REACT_GLOBAL_STATE_DEBUG;
  unMockConsoleLog();
  loaderA.mockClear();
  loaderB.mockClear();
});

afterEach(() => {
  if (scene) {
    scene.destroy();
    scene = null;
  }

  // NOTE: Without this clearing some pending async updates from
  // "Scene test in the front-end mode" get fired only after the
  // later timer waiting in SSR test, which messes up the console
  // log snapshot verification.
  jest.clearAllTimers();
});

test('Scene test in the front-end mode', async () => {
  scene = mount((
    <GlobalStateProvider>
      <Scene />
    </GlobalStateProvider>
  ));
  scene.snapshot();
  await act(async () => {
    await mockTimer(100);
  });
  scene.snapshot();
  expect(loaderA).toHaveBeenCalledTimes(1);
  expect(loaderB).not.toHaveBeenCalled();
  await act(async () => {
    await mockTimer(1000);
  });
  await act(async () => {
    await mockTimer(0);
  });
  scene.snapshot();
  expect(loaderA).toHaveBeenCalledTimes(1);
  expect(loaderB).not.toHaveBeenCalled();
});

describe('Test `useSsrContext()` function', () => {
  function SceneUsingSsrContext({ throwWithoutSsrContext }) {
    const ssrContext = useSsrContext(throwWithoutSsrContext);
    return (
      <div>
        {JSON.stringify(ssrContext, null, 2)}
      </div>
    );
  }

  let consoleError;

  beforeAll(() => {
    consoleError = console.error;
  });

  afterEach(() => {
    console.error = consoleError;
    if (scene) {
      scene.destroy();
      scene = null;
    }
  });

  test('Missing GlobalStateProvider', () => {
    console.error = () => null;
    let message;
    try {
      mount(<SceneUsingSsrContext />);
    } catch (error) {
      ({ message } = error);
    }
    expect(message).toMatchSnapshot();
  });

  test('Get SSR context when exists', () => {
    scene = mount((
      <GlobalStateProvider ssrContext={{ key: 'Dummy SSR Context' }}>
        <SceneUsingSsrContext />
      </GlobalStateProvider>
    ));
    scene.snapshot();
  });

  test('Get SSR context when does not exist', () => {
    console.error = () => null;
    let message;
    try {
      mount((
        <GlobalStateProvider>
          <SceneUsingSsrContext />
        </GlobalStateProvider>
      ));
    } catch (error) {
      ({ message } = error);
    }
    expect(message).toMatchSnapshot();
  });

  test('Get SSR context when does not exist, but no throw is opted in', () => {
    scene = mount((
      <GlobalStateProvider>
        <SceneUsingSsrContext throwWithoutSsrContext={false} />
      </GlobalStateProvider>
    ));
    scene.snapshot();
  });
});
