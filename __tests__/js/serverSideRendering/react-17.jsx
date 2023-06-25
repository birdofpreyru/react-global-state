import mockdate from 'mockdate';
import pretty from 'pretty';

import { consoleLogs, mockConsoleLog, unMockConsoleLog } from 'jest/utils';

let LIB;
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
  LIB = require('src');
  const render = ReactDOM.renderToString((
    <LIB.GlobalStateProvider>
      <Scene />
    </LIB.GlobalStateProvider>
  ));
  expect(pretty(render)).toMatchSnapshot();
});

/**
 * This is the sample SSR code assembly.
 */
async function serverSideRender() {
  LIB = require('src');
  let render;
  serverSideRender.round = 0;
  const ssrContext = { state: {} };
  for (; serverSideRender.round < 10; serverSideRender.round += 1) {
    /* eslint-disable no-await-in-loop */
    render = ReactDOM.renderToString((
      <LIB.GlobalStateProvider
        initialState={ssrContext.state}
        ssrContext={ssrContext}
      >
        <Scene />
      </LIB.GlobalStateProvider>
    ));
    if (ssrContext.dirty) {
      await Promise.allSettled(ssrContext.pending);
    } else break;
    /* eslint-disable no-await-in-loop */
  }
  return render;
}

test('Smart server-sider rendering', async () => {
  process.env.REACT_GLOBAL_STATE_DEBUG = true;
  LIB = require('src');
  mockConsoleLog();
  let render = serverSideRender();
  await jest.runAllTimers();
  render = await render;
  expect(serverSideRender.round).toBe(1);
  expect(render).toMatchSnapshot();
  expect(consoleLogs).toMatchSnapshot();
});
