/** @jest-environment jsdom */

// ^^^ although it is strange to do SSR test in JSDom environment, the current
// test organization requires it to verify results of SSR at client side.

/**
 * Base test of the server-side rendering features.
 */

import mockdate from 'mockdate';
import pretty from 'pretty';

let JU;
let LIB;
let ReactDOM;

jest.mock('uuid');

jest.useFakeTimers();
mockdate.set('2019-11-07Z');

// TODO: Are we missing something here? Right now the test components A and B,
// look identical along with their loaders. Were they intended to be slightly
// different to test different SSR corner cases?

const loaderA = jest.fn(async () => {
  await JU.timer(1000);
  return 'data';
});

const loaderB = jest.fn(async () => {
  await JU.timer(1000);
  return 'data';
});

function ComponentA() {
  const envelop = LIB.useAsyncData('x', loaderA);
  return <div>{JSON.stringify(envelop, null, 2)}</div>;
}

function ComponentB() {
  const envelop = LIB.useAsyncData('x', loaderB);
  return <div>{JSON.stringify(envelop, null, 2)}</div>;
}

function Scene() {
  const [globalValue] = LIB.useGlobalState('value.path', 'defaultValue');
  return (
    <div>
      <h1>{globalValue}</h1>
      <ComponentA />
      <ComponentB />
    </div>
  );
}

let scene;

beforeEach(() => {
  jest.resetModules();
  delete process.env.REACT_GLOBAL_STATE_DEBUG;
  ReactDOM = require('react-dom/server');
  JU = require('jest/utils');
  JU.unMockConsoleLog();
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
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
  await JU.act(async () => {
    await JU.mockTimer(100);
  });
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
  expect(loaderA).toHaveBeenCalledTimes(1);
  expect(loaderB).toHaveBeenCalledTimes(0);
  await JU.act(async () => {
    await JU.mockTimer(1000);
  });
  await JU.act(async () => {
    await JU.mockTimer(0);
  });
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
  expect(loaderA).toHaveBeenCalledTimes(1);
  expect(loaderB).toHaveBeenCalledTimes(0);
});

describe('React 17 style (renderToString())', () => {
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
    JU.mockConsoleLog();
    let render = serverSideRender();
    await jest.runAllTimers();
    render = await render;
    expect(serverSideRender.round).toBe(1);
    expect(render).toMatchSnapshot();
    expect(console.log.logs).toMatchSnapshot();
  });
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
    expect(pretty(scene.innerHTML)).toMatchSnapshot();
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
    expect(pretty(scene.innerHTML)).toMatchSnapshot();
  });
});
