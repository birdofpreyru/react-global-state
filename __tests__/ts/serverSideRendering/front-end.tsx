/** @jest-environment jsdom */

// ^^^ although it is strange to do SSR test in JSDom environment,
// some of the tests should be done at the client side.

/**
 * Base test of the server-side rendering features.
 */

import mockdate from 'mockdate';
import pretty from 'pretty';
import { type JSXElementConstructor } from 'react';

import { type DestroyableHtmlElement } from 'jest/utils';

let JU: any;
let LIB: any;

jest.mock('uuid');

jest.useFakeTimers();
mockdate.set('2019-11-07Z');

let loaderA: jest.Mock;
let loaderB: jest.Mock;
let Scene: JSXElementConstructor<unknown>;
let scene: DestroyableHtmlElement | undefined;

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
    scene = undefined;
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
  expect(pretty(scene!.innerHTML)).toMatchSnapshot();
  await JU.act(async () => {
    await JU.mockTimer(100);
  });
  expect(pretty(scene!.innerHTML)).toMatchSnapshot();
  expect(loaderA).toHaveBeenCalledTimes(1);
  expect(loaderB).toHaveBeenCalledTimes(0);
  await JU.act(async () => {
    await JU.mockTimer(1000);
  });
  await JU.act(async () => {
    await JU.mockTimer(0);
  });
  expect(pretty(scene!.innerHTML)).toMatchSnapshot();
  expect(loaderA).toHaveBeenCalledTimes(1);
  expect(loaderB).toHaveBeenCalledTimes(0);
});

describe('Test `getSsrContext()` function', () => {
  function SceneUsingSsrContext(
    { throwWithoutSsrContext }: { throwWithoutSsrContext?: boolean },
  ) {
    const ssrContext = LIB.getSsrContext(throwWithoutSsrContext);
    return (
      <div>
        {JSON.stringify(ssrContext, null, 2)}
      </div>
    );
  }

  SceneUsingSsrContext.defaultProps = {
    throwWithoutSsrContext: true,
  };

  let consoleError: typeof console.error;
  beforeAll(() => {
    consoleError = console.error;
  });

  afterEach(() => {
    console.error = consoleError;
    if (scene) {
      scene.destroy();
      scene = undefined;
    }
  });

  test('Missing GlobalStateProvider', () => {
    LIB = require('src');
    console.error = () => null;
    let message;
    try {
      JU.mount(<SceneUsingSsrContext />);
    } catch (error) {
      ({ message } = error as Error);
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
    expect(pretty(scene!.innerHTML)).toMatchSnapshot();
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
      ({ message } = error as Error);
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
    expect(pretty(scene!.innerHTML)).toMatchSnapshot();
  });
});
