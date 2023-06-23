/**
 * Jest test utils.
 */

import { cloneDeep } from 'lodash';
import mockdate from 'mockdate';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';

export { act };

global.IS_REACT_ACT_ENVIRONMENT = true;

/**
 * Generates a mock UUID.
 * @param {Number} seed
 * @return {String}
 */
export function getMockUuid(seed = 0) {
  const x = seed.toString(16).padStart(32, '0');
  return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`;
}

const originalConsole = console.log;

export async function mockConsoleLog() {
  console.log = (...args) => console.log.logs.push(cloneDeep(args));
  console.groupCollapsed = console.log;
  console.log.clear = () => {
    console.log.logs = [];
  };
  console.log.clear();
}

export async function unMockConsoleLog() {
  console.log = originalConsole;
}

/**
 * Advances mock timers, and mock date by the specified time.
 * @param {Number} time Time step [ms].
 * @returns {Promise} Wait for this to "jump after" any async code which should
 *  be executed because of the mock time movement.
 */
export async function mockTimer(time) {
  mockdate.set(time + Date.now());
  jest.advanceTimersByTime(time);
}

/**
 * Mounts `Scene` to the DOM, and returns the root scene element.
 * @param {React.ReactNode} scene
 * @return {HTMLElement} Created container DOM element with unmount
 *  function attached.
 */
export function mount(scene) {
  let root;
  const res = document.createElement('div');
  document.body.appendChild(res);
  res.destroy = () => {
    act(() => root.unmount());
    res.remove();
  };
  act(() => {
    root = createRoot(res);
    root.render(scene);
  });
  return res;
}

/**
 * Waits for `time`.
 * @param {Number} time Time [ms].
 * @returns {Promise} Resolves once `time` have passed.
 */
export async function timer(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

/**
 * Advances mock timers by the specified time, and waits for any DOM updates
 * to complete.
 * @param {number} time [miliseconds]
 * @return {Promise} Wait for this.
 */
export function wait(time) {
  return act(() => mockTimer(time));
}
