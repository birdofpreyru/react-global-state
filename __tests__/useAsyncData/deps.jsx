/** @jest-environment jsdom */

/**
 * Tests that data reloading happens as expected when `deps` option is used.
 */

import { useState } from 'react';
import mockdate from 'mockdate';
import pretty from 'pretty';

import {
  act,
  mockTimer,
  mount,
  timer,
} from 'jest/utils';

import { GlobalStateProvider, useAsyncData } from 'src';

jest.useFakeTimers();
mockdate.set('2020-04-09Z');

const loader = jest.fn(async () => {
  await timer(1000);
  return loader.value;
});

loader.value = 0;

function Component() {
  const [epoch, setEpoch] = useState(0);
  const envelop = useAsyncData('test-path', loader, {
    deps: [epoch],
  });
  return (
    <div>
      <div>{JSON.stringify(envelop, null, 2)}</div>
      <button
        data-test-id="button"
        onClick={() => {
          loader.value += 1;
          setEpoch(1 + epoch);
        }}
        type="button"
      >
        Update
      </button>
    </div>
  );
}

function Scene() {
  return (
    <GlobalStateProvider>
      <Component />
    </GlobalStateProvider>
  );
}

let scene = null;
let button = null;

async function wait(time) {
  await act(async () => {
    await mockTimer(time);
    mockdate.set(Date.now() + time);
  });
}

beforeEach(async () => {
  loader.value = 0;
  loader.mockClear();
  scene = mount(<Scene />);
  await wait(1500);
  await wait(0);
  button = document.querySelector('[data-test-id=button]');
});

afterEach(() => {
  if (scene) {
    scene.destroy();
    button = null;
    scene = null;
  }
});

test('Scenario I', async () => {
  /* Check of the initial state. */
  expect(pretty(scene.innerHTML)).toMatchSnapshot();

  /* Data are not stale. */
  await wait(10);
  await wait(10);
  expect(pretty(scene.innerHTML)).toMatchSnapshot();

  /* Press of button forces data refresh via "deps" option. */
  button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  await wait(10);
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
});
