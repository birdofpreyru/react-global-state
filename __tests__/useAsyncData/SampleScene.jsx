/**
 * Tests `useAsyncData(..)` on a sample scene: two components depend on loading
 * the same data into the same state segment.
 */

import { useState } from 'react';

import mockdate from 'mockdate';
import pretty from 'pretty';

import {
  act,
  mockConsoleLog,
  mockTimer,
  mount,
  timer,
  unmount,
} from 'jest/utils';
import { GlobalStateProvider, useAsyncData } from 'src';

jest.useFakeTimers();
mockdate.set('2019-10-28Z');

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
  const [value, setValue] = useState(0);
  return (
    <GlobalStateProvider>
      { value % 4 === 1 || value % 4 === 2 ? <ComponentA /> : null }
      { value % 4 === 2 || value % 4 === 3 ? <ComponentB /> : null }
      <div>
        <button
          data-testid="button"
          onClick={() => setValue(1 + value)}
          type="button"
        >
          Move
        </button>
      </div>
    </GlobalStateProvider>
  );
}

let scene = null;
let button = null;

beforeEach(() => {
  loaderA.mockClear();
  loaderB.mockClear();
  scene = mount(<Scene />);
  button = document.querySelector('[data-testid=button]');
});

afterEach(() => {
  if (scene) {
    unmount(scene);
    scene = null;
    button = null;
  }
});

/* A single component relying on async data is mounted, waits till data are
 * loaded, then dismounted. The data are expected to load, and be kept in the
 * state. */
test('Scenario I', async () => {
  process.env.REACT_GLOBAL_STATE_DEBUG = true;
  mockConsoleLog();

  /* Empty scene. */
  expect(pretty(scene.innerHTML)).toMatchSnapshot();

  /* Mounts ComponentA, and checks the loading is started. */
  await act(async () => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await mockTimer(0);
  });
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
  expect(loaderA).toHaveBeenCalledTimes(1);
  expect(loaderB).toHaveBeenCalledTimes(0);

  /* Checks the loading is completed. */
  await act(async () => {
    await mockTimer(1000);
  });
  await act(async () => {
    await mockTimer(0);
  });
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
  expect(loaderA).toHaveBeenCalledTimes(1);
  expect(loaderB).toHaveBeenCalledTimes(0);

  /* Mounts/unmounts components rapidly, checks data are not reloaded. */
  for (let i = 0; i < 4; i += 1) {
    /* eslint-disable no-await-in-loop, no-loop-func */
    await act(async () => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await mockTimer(10);
    });
    expect(pretty(scene.innerHTML)).toMatchSnapshot();
    expect(loaderA).toHaveBeenCalledTimes(1);
    expect(loaderB).toHaveBeenCalledTimes(0);
    /* eslint-enable no-await-in-loop */
  }

  /* Data are reloaded if stale when a new dependant component is mount. */
  await act(async () => {
    await mockTimer(6 * 60 * 1000);
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await mockTimer(10);
  });
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
  expect(loaderA).toHaveBeenCalledTimes(1);
  expect(loaderB).toHaveBeenCalledTimes(1);

  /* Checks the loading is completed. */
  await act(async () => {
    await mockTimer(1000);
  });
  await act(async () => {
    await mockTimer(0);
  });
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
  expect(loaderA).toHaveBeenCalledTimes(1);
  expect(loaderB).toHaveBeenCalledTimes(1);

  await mockTimer(6 * 60 * 1000);
  for (let i = 0; i < 2; i += 1) {
    /* eslint-disable no-await-in-loop, no-loop-func */
    await act(async () => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await mockTimer(10);
    });
    expect(pretty(scene.innerHTML)).toMatchSnapshot();
    expect(loaderA).toHaveBeenCalledTimes(1);
    expect(loaderB).toHaveBeenCalledTimes(1);
    /* eslint-enable no-await-in-loop */
  }

  expect(console.log.logs).toMatchSnapshot();
});
