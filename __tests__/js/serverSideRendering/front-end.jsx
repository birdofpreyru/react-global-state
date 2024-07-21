/** @jest-environment jsdom */

// ^^^ although it is strange to do SSR test in JSDom environment,
// some of the tests should be done at the client side.

/**
 * Base test of the server-side rendering features.
 */

import mockdate from 'mockdate';

let JU;
let LIB;

jest.mock('uuid');

jest.useFakeTimers();
mockdate.set('2019-11-07Z');

let loaderA;
let loaderB;
let Scene;
let scene;

beforeEach(() => {
  jest.resetModules();
  delete process.env.REACT_GLOBAL_STATE_DEBUG;
  JU = require('jest/utils');
  JU.unMockConsoleLog();
  ({ default: Scene, loaderA, loaderB } = require('./__assets__/TestScene'));
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
  LIB = require('src');
  scene = JU.mount((
    <LIB.GlobalStateProvider>
      <Scene />
    </LIB.GlobalStateProvider>
  ));
  scene.snapshot();
  await JU.act(async () => {
    await JU.mockTimer(100);
  });
  scene.snapshot();
  expect(loaderA).toHaveBeenCalledTimes(1);
  expect(loaderB).toHaveBeenCalledTimes(0);
  await JU.act(async () => {
    await JU.mockTimer(1000);
  });
  await JU.act(async () => {
    await JU.mockTimer(0);
  });
  scene.snapshot();
  expect(loaderA).toHaveBeenCalledTimes(1);
  expect(loaderB).toHaveBeenCalledTimes(0);
});

describe('Test `getSsrContext()` function', () => {
  function SceneUsingSsrContext({ throwWithoutSsrContext }) {
    const ssrContext = LIB.getSsrContext(throwWithoutSsrContext);
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
    LIB = require('src');
    console.error = () => null;
    let message;
    try {
      JU.mount(<SceneUsingSsrContext />);
    } catch (error) {
      ({ message } = error);
    }
    expect(message).toMatchSnapshot();
  });

  test('Get SSR context when exists', () => {
    LIB = require('src');
    scene = JU.mount((
      <LIB.GlobalStateProvider ssrContext={{ key: 'Dummy SSR Context' }}>
        <SceneUsingSsrContext />
      </LIB.GlobalStateProvider>
    ));
    scene.snapshot();
  });

  test('Get SSR context when does not exist', () => {
    LIB = require('src');
    console.error = () => null;
    let message;
    try {
      JU.mount((
        <LIB.GlobalStateProvider>
          <SceneUsingSsrContext />
        </LIB.GlobalStateProvider>
      ));
    } catch (error) {
      ({ message } = error);
    }
    expect(message).toMatchSnapshot();
  });

  test('Get SSR context when does not exist, but no throw is opted in', () => {
    LIB = require('src');
    scene = JU.mount((
      <LIB.GlobalStateProvider>
        <SceneUsingSsrContext throwWithoutSsrContext={false} />
      </LIB.GlobalStateProvider>
    ));
    scene.snapshot();
  });
});
