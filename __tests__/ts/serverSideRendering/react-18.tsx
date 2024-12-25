import mockdate from 'mockdate';
import { type JSXElementConstructor } from 'react';
import ReactDOM from 'react-dom/server';

import {
  type MountedSceneT,
  consoleLogs,
  mockConsoleLog,
  unMockConsoleLog,
} from 'jest/utils';

import { GlobalStateProvider, SsrContext } from 'src/index';

import StringDestination from './__assets__/StringDestination';

jest.mock('uuid');
jest.useFakeTimers();
mockdate.set('2019-11-07Z');

let loaderA;
let loaderB;
let Scene: JSXElementConstructor<unknown>;
let scene: MountedSceneT | undefined;
let ssrRound: number;

beforeEach(() => {
  delete process.env.REACT_GLOBAL_STATE_DEBUG;
  unMockConsoleLog();
  ({ default: Scene, loaderA, loaderB } = require('./__assets__/TestScene'));
  loaderA.mockClear();
  loaderB.mockClear();
  ssrRound = 0;
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

test('Naive server-side rendering', (done) => {
  const stream = ReactDOM.renderToPipeableStream(
    <GlobalStateProvider initialState={undefined}>
      <Scene />
    </GlobalStateProvider>,
    {
      async onAllReady() {
        const dest = new StringDestination();
        stream.pipe(dest);
        expect(await dest.waitResult()).toMatchSnapshot();
        done();
      },
    },
  );
  jest.runAllTimers();
});

async function renderPass<T>(
  ssrContext: SsrContext<T>,
): Promise<ReactDOM.PipeableStream> {
  return new Promise((resolve) => {
    const stream = ReactDOM.renderToPipeableStream(
      <GlobalStateProvider
        initialState={ssrContext.state}
        ssrContext={ssrContext}
      >
        <Scene />
      </GlobalStateProvider>,
      { onAllReady: () => resolve(stream) },
    );
    jest.runAllTimers();
  });
}

/**
 * This is the sample SSR code assembly.
 */
async function serverSideRender(): Promise<string> {
  let stream: ReactDOM.PipeableStream;
  ssrRound = 0;

  const ssrContext = new SsrContext({});

  for (; ssrRound < 10; ssrRound += 1) {
    /* eslint-disable no-await-in-loop */
    stream = await renderPass(ssrContext);
    if (ssrContext.dirty) {
      await Promise.allSettled(ssrContext.pending);
    } else break;
    /* eslint-disable no-await-in-loop */
  }
  const dest = new StringDestination();
  stream!.pipe(dest);
  return dest.waitResult();
}

test('Smart server-sider rendering', async () => {
  process.env.REACT_GLOBAL_STATE_DEBUG = '1';
  mockConsoleLog();
  const render = serverSideRender();
  await jest.runAllTimers();
  await jest.runAllTimers();
  const renderString = await render;
  expect(ssrRound).toBe(1);
  expect(renderString).toMatchSnapshot();
  expect(consoleLogs).toMatchSnapshot();
});
