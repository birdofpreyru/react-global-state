/**
 * Jest test utils.
 */

import _ from 'lodash';
import mockdate from 'mockdate';
import { render, unmountComponentAtNode } from 'react-dom';

export { act } from 'react-dom/test-utils';

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
  console.log = (...args) => console.log.logs.push(_.cloneDeep(args));
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
 * @return {HTMLElement}
 */
export function mount(scene) {
  const res = document.createElement('div');
  document.body.appendChild(res);
  render(scene, res);
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
 * Unmounts `scene` from the DOM.
 * @param {HTMLElement} scene
 */
export function unmount(scene) {
  unmountComponentAtNode(scene);
  scene.remove();
}
