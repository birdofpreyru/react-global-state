/** @jest-environment jsdom */

/**
 * Tests `useAsyncData(..)` on a sample scene: two components depend on loading
 * the same data into the same state segment.
 */

import mockdate from 'mockdate';
import pretty from 'pretty';

let JU;
let LIB;
let React;

jest.useFakeTimers();
mockdate.set('2019-10-28Z');

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
  const [value, setValue] = React.useState(0);
  return (
    <LIB.GlobalStateProvider>
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
    </LIB.GlobalStateProvider>
  );
}

let scene = null;
let button = null;

/**
 * Emulates button click in the currently mounted test scene.
 * @return {Promise}
 */
async function clickButton() {
  const event = new MouseEvent('click', { bubbles: true });
  return JU.act(() => {
    button.dispatchEvent(event);
    return JU.mockTimer(10);
  });
}

function initTestScene() {
  LIB = require('src');
  scene = JU.mount(<Scene />);
  button = document.querySelector('[data-testid=button]');
}

beforeEach(() => {
  jest.resetModules();
  JU = require('jest/utils');
  React = require('react');
  loaderA.mockClear();
  loaderB.mockClear();
});

afterEach(() => {
  if (scene) {
    scene.destroy();
    scene = null;
    button = null;
  }
});

/* A single component relying on async data is mounted, waits till data are
 * loaded, then dismounted. The data are expected to load, and be kept in the
 * state. */
test('Scenario I', async () => {
  process.env.REACT_GLOBAL_STATE_DEBUG = true;
  JU.mockConsoleLog();
  initTestScene();

  /* Empty scene. */
  expect(pretty(scene.innerHTML)).toMatchSnapshot();

  /* Mounts ComponentA, checks the loading started. */
  await JU.act(async () => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await JU.mockTimer(1);
  });
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
  expect(loaderA).toHaveBeenCalledTimes(1);
  expect(loaderB).toHaveBeenCalledTimes(0);

  /* Checks the loading is completed 1 second later. */
  await JU.act(async () => {
    await JU.mockTimer(1000);
  });
  await JU.act(async () => {
    await JU.mockTimer(0);
  });
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
  expect(loaderA).toHaveBeenCalledTimes(1);
  expect(loaderB).toHaveBeenCalledTimes(0);

  /* A series of component (un-)mounts in a rapid succession, checks
   * it causes no data re-loads, and the final state is the same as
   * before: ComponentA mounted. */
  for (let i = 0; i < 4; i += 1) {
    /* eslint-disable no-await-in-loop, no-loop-func */
    await clickButton();
    expect(pretty(scene.innerHTML)).toMatchSnapshot();
    expect(loaderA).toHaveBeenCalledTimes(1);
    expect(loaderB).toHaveBeenCalledTimes(0);
    /* eslint-enable no-await-in-loop */
  }

  /**
   * Waits 6 secs to stale loaded data, then mounts ComponentB.
   * Checks a data re-loading started by ComponentA, as in the final state
   * both components are mounted, and ComponentA is rendered first.
   */
  await JU.wait(6 * 60 * 1000);
  await clickButton();
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
  expect(loaderA).toHaveBeenCalledTimes(2);
  expect(loaderB).toHaveBeenCalledTimes(0);

  /* Checks the data loading is completed 1 sec later, and both components
   * are mounted. */
  await JU.wait(1000);
  await JU.wait(0);
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
  expect(loaderA).toHaveBeenCalledTimes(2);
  expect(loaderB).toHaveBeenCalledTimes(0);

  /* Waits 6 secs to stale data, and unmounts ComponentA. Checks the data
   * are re-loaded by ComponentB, which is still mounted. */
  await JU.wait(6 * 60 * 1000);
  await clickButton();
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
  expect(loaderA).toHaveBeenCalledTimes(2);
  expect(loaderB).toHaveBeenCalledTimes(1);

  /* Waits 1 sec, unmounts ComponentB, checks the data are loaded. */
  await JU.wait(1000);
  await clickButton();
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
  expect(loaderA).toHaveBeenCalledTimes(2);
  expect(loaderB).toHaveBeenCalledTimes(1);

  expect(console.log.logs).toMatchSnapshot();
});
