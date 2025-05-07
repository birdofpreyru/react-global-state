/* global process, require */

import mockdate from 'mockdate';

import { consoleLogs, mockConsoleLog, unMockConsoleLog } from 'jest/utils';

let Lib;
let ReactDOM;

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
  ReactDOM = require('react-dom/server');
  unMockConsoleLog();
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

test('Naive server-side rendering', () => {
  Lib = require('src');
  const render = ReactDOM.renderToString((
    <Lib.GlobalStateProvider>
      <Scene />
    </Lib.GlobalStateProvider>
  ));
  expect(render).toMatchSnapshot();
});

/**
 * This is the sample SSR code assembly.
 */
async function serverSideRender() {
  Lib = require('src');
  let render;
  serverSideRender.round = 0;
  const ssrContext = { state: {} };
  for (; serverSideRender.round < 10; serverSideRender.round += 1) {
    render = ReactDOM.renderToString((
      <Lib.GlobalStateProvider
        initialState={ssrContext.state}
        ssrContext={ssrContext}
      >
        <Scene />
      </Lib.GlobalStateProvider>
    ));
    if (ssrContext.dirty) {
      await Promise.allSettled(ssrContext.pending);
    } else break;
  }
  return render;
}

test('Smart server-sider rendering', async () => {
  process.env.REACT_GLOBAL_STATE_DEBUG = true;
  Lib = require('src');
  mockConsoleLog();
  let render = serverSideRender();
  await jest.runAllTimers();
  render = await render;
  expect(serverSideRender.round).toBe(1);
  expect(render).toMatchSnapshot();
  expect(consoleLogs).toMatchSnapshot();
});
