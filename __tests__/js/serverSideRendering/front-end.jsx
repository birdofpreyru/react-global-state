/** @jest-environment jsdom */

// ^^^ although it is strange to do SSR test in JSDom environment,
// some of the tests should be done at the client side.

/* global console, process, require */

/**
 * Base test of the server-side rendering features.
 */

import mockdate from 'mockdate';

let JU;
let Lib;

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
  Lib = require('src');
  scene = JU.mount((
    <Lib.GlobalStateProvider>
      <Scene />
    </Lib.GlobalStateProvider>
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
    const ssrContext = Lib.getSsrContext(throwWithoutSsrContext);
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
    Lib = require('src');
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
    Lib = require('src');
    scene = JU.mount((
      <Lib.GlobalStateProvider ssrContext={{ key: 'Dummy SSR Context' }}>
        <SceneUsingSsrContext />
      </Lib.GlobalStateProvider>
    ));
    scene.snapshot();
  });

  test('Get SSR context when does not exist', () => {
    Lib = require('src');
    console.error = () => null;
    let message;
    try {
      JU.mount((
        <Lib.GlobalStateProvider>
          <SceneUsingSsrContext />
        </Lib.GlobalStateProvider>
      ));
    } catch (error) {
      ({ message } = error);
    }
    expect(message).toMatchSnapshot();
  });

  test('Get SSR context when does not exist, but no throw is opted in', () => {
    Lib = require('src');
    scene = JU.mount((
      <Lib.GlobalStateProvider>
        <SceneUsingSsrContext throwWithoutSsrContext={false} />
      </Lib.GlobalStateProvider>
    ));
    scene.snapshot();
  });
});
