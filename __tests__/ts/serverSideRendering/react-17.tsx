import mockdate from 'mockdate';
import type { ComponentType } from 'react';
import ReactDOM from 'react-dom/server';

import {
  type MountedSceneT,
  consoleLogs,
  mockConsoleLog,
  unMockConsoleLog,
} from 'jest/utils';

import { GlobalStateProvider, SsrContext } from 'src/index';

jest.mock('uuid');

jest.useFakeTimers();
mockdate.set('2019-11-07Z');

let loaderA;
let loaderB;
let Scene: ComponentType;
let scene: MountedSceneT | undefined;
let ssrRound: number;

beforeEach(() => {
  ssrRound = 0;
  delete process.env.REACT_GLOBAL_STATE_DEBUG;
  unMockConsoleLog();
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

test('Naive server-side rendering', () => {
  const render = ReactDOM.renderToString((
    <GlobalStateProvider initialState={undefined}>
      <Scene />
    </GlobalStateProvider>
  ));
  expect(render).toMatchSnapshot();
});

/**
 * This is the sample SSR code assembly.
 */
async function serverSideRender(): Promise<string> {
  let render = '';
  ssrRound = 0;

  const ssrContext = new SsrContext({});

  for (; ssrRound < 10; ssrRound += 1) {
    /* eslint-disable no-await-in-loop */
    render = ReactDOM.renderToString((
      <GlobalStateProvider
        initialState={ssrContext.state}
        ssrContext={ssrContext}
      >
        <Scene />
      </GlobalStateProvider>
    ));
    if (ssrContext.dirty) {
      await Promise.allSettled(ssrContext.pending);
    } else break;
    /* eslint-disable no-await-in-loop */
  }
  return render;
}

test('Smart server-sider rendering', async () => {
  process.env.REACT_GLOBAL_STATE_DEBUG = '1';
  mockConsoleLog();
  const render = serverSideRender();
  await jest.runAllTimers();
  const renderString = await render;
  expect(ssrRound).toBe(1);
  expect(renderString).toMatchSnapshot();
  expect(consoleLogs).toMatchSnapshot();
});
