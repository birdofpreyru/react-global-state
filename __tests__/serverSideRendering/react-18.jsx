import mockdate from 'mockdate';
import pretty from 'pretty';

import StringDestination from './__assets__/StringDestination';

let JU;
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

test('Naive server-side rendering', (done) => {
  LIB = require('src');
  const stream = ReactDOM.renderToPipeableStream(
    <LIB.GlobalStateProvider>
      <Scene />
    </LIB.GlobalStateProvider>,
    {
      async onAllReady() {
        const dest = new StringDestination();
        stream.pipe(dest);
        expect(pretty(await dest.waitResult())).toMatchSnapshot();
        done();
      },
    },
  );
  jest.runAllTimers();
});

async function renderPass(ssrContext) {
  return new Promise((resolve) => {
    const stream = ReactDOM.renderToPipeableStream(
      <LIB.GlobalStateProvider
        initialState={ssrContext.state}
        ssrContext={ssrContext}
      >
        <Scene />
      </LIB.GlobalStateProvider>,
      { onAllReady: () => resolve(stream) },
    );
    jest.runAllTimers();
  });
}

/**
 * This is the sample SSR code assembly.
 */
async function serverSideRender() {
  LIB = require('src');
  let stream;
  serverSideRender.round = 0;
  const ssrContext = { state: {} };
  for (; serverSideRender.round < 10; serverSideRender.round += 1) {
    /* eslint-disable no-await-in-loop */
    stream = await renderPass(ssrContext);
    if (ssrContext.dirty) {
      await Promise.allSettled(ssrContext.pending);
    } else break;
    /* eslint-disable no-await-in-loop */
  }
  const dest = new StringDestination();
  stream.pipe(dest);
  return dest.waitResult();
}

test('Smart server-sider rendering', async () => {
  process.env.REACT_GLOBAL_STATE_DEBUG = true;
  LIB = require('src');
  JU.mockConsoleLog();
  let render = serverSideRender();
  await jest.runAllTimers();
  render = await render;
  expect(serverSideRender.round).toBe(1);
  expect(render).toMatchSnapshot();
  expect(console.log.logs).toMatchSnapshot();
});
