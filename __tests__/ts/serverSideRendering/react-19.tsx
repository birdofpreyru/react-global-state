import mockdate from 'mockdate';
import { type JSXElementConstructor } from 'react';
import { prerenderToNodeStream } from 'react-dom/static';

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
mockdate.set('2024-12-31Z');

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

test('Naive server-side rendering', async () => {
  const { prelude } = await prerenderToNodeStream(
    <GlobalStateProvider initialState={undefined}>
      <Scene />
    </GlobalStateProvider>,
  );
  const dest = new StringDestination();
  prelude.pipe(dest);
  expect(await dest.waitResult()).toMatchSnapshot();
});

/**
 * This is the sample SSR code assembly.
 */
async function serverSideRender(): Promise<string> {
  let prelude: NodeJS.ReadableStream;
  ssrRound = 0;

  const ssrContext = new SsrContext({});

  for (; ssrRound < 10; ssrRound += 1) {
    /* eslint-disable no-await-in-loop */
    ({ prelude } = await prerenderToNodeStream(
      <GlobalStateProvider
        initialState={ssrContext.state}
        ssrContext={ssrContext}
      >
        <Scene />
      </GlobalStateProvider>,
    ));
    if (ssrContext.dirty) {
      await Promise.allSettled(ssrContext.pending);
    } else break;
    /* eslint-disable no-await-in-loop */
  }
  const dest = new StringDestination();
  prelude!.pipe(dest);
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
