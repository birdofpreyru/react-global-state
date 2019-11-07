/**
 * Base test of the server-side rendering features.
 */

import React from 'react';
import ReactDOM from 'react-dom/server';

import mockdate from 'mockdate';
import pretty from 'pretty';

import {
  act,
  timer,
  mockTimer,
  mount,
  unmount,
} from 'jest/utils';

import { GlobalStateProvider, useAsyncData } from 'src';

jest.useFakeTimers();
mockdate.set('2019-11-07Z');

const loaderA = jest.fn(async () => {
  await timer(1000);
  return 'data';
});

const loaderB = jest.fn(async () => {
  await timer(1000);
  return 'data';
});

function ComponentA() {
  const envelop = useAsyncData('x', loaderA);
  return <div>{JSON.stringify(envelop, null, 2)}</div>;
}

function ComponentB() {
  const envelop = useAsyncData('x', loaderB);
  return <div>{JSON.stringify(envelop, null, 2)}</div>;
}

function Scene() {
  return (
    <div>
      <ComponentA />
      <ComponentB />
    </div>
  );
}

let scene;

beforeEach(() => {
  loaderA.mockClear();
  loaderB.mockClear();
});

afterEach(() => {
  if (scene) {
    unmount(scene);
    scene = null;
  }
});

test('Scene test in the front-end mode', async () => {
  scene = mount((
    <GlobalStateProvider>
      <Scene />
    </GlobalStateProvider>
  ));
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
  await act(async () => {
    await mockTimer(100);
  });
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
  expect(loaderA).toHaveBeenCalledTimes(1);
  expect(loaderB).toHaveBeenCalledTimes(0);
  await act(async () => {
    await mockTimer(1000);
  });
  await act(async () => {
    await mockTimer(0);
  });
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
  expect(loaderA).toHaveBeenCalledTimes(1);
  expect(loaderB).toHaveBeenCalledTimes(0);
});

test('Naive server-side rendering', () => {
  const render = ReactDOM.renderToString((
    <GlobalStateProvider>
      <Scene />
    </GlobalStateProvider>
  ));
  expect(pretty(render)).toMatchSnapshot();
});

/**
 * This is the sample SSR code assembly.
 */
async function serverSideRender() {
  let render;
  serverSideRender.round = 0;
  const ssrContext = { state: {} };
  for (; serverSideRender.round < 10; serverSideRender.round += 1) {
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
  let render = serverSideRender();
  await jest.runAllTimers();
  render = await render;
  expect(serverSideRender.round).toBe(1);
  expect(render).toMatchSnapshot();
});
