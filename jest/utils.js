/**
 * Jest test utils.
 */

import mockdate from 'mockdate';
import { render, unmountComponentAtNode } from 'react-dom';

export { act } from 'react-dom/test-utils';

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
