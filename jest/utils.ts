/**
 * Jest test utils.
 */

import { cloneDeep } from 'lodash';
import mockdate from 'mockdate';
import { type ReactNode, act } from 'react';
import { type Root, createRoot } from 'react-dom/client';

export { act };

(global as { [key: string]: unknown }).IS_REACT_ACT_ENVIRONMENT = true;

/**
 * Generates a mock UUID.
 * @param seed
 * @return
 */
export function getMockUuid(seed = 0) {
  const x = seed.toString(16).padStart(32, '0');
  return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`;
}

export const consoleLogs: unknown[] = [];

const originalConsole = console.log;

export async function mockConsoleLog() {
  console.log = (...args) => consoleLogs.push(cloneDeep(args));
  console.groupCollapsed = console.log;
  consoleLogs.splice(0);
}

export async function unMockConsoleLog() {
  console.log = originalConsole;
}

/**
 * Advances mock timers, and mock date by the specified time.
 * @param time Time step [ms].
 * @returns Wait for this to "jump after" any async code which should
 *  be executed because of the mock time movement.
 */
export async function mockTimer(time: number) {
  mockdate.set(time + Date.now());
  jest.advanceTimersByTime(time);
}

export type MountedSceneT = HTMLElement & {
  destroy: () => void;
  snapshot: () => void;
};

/**
 * Mounts `Scene` to the DOM, and returns the root scene element.
 */
export function mount(scene: ReactNode): MountedSceneT {
  let root: Root;

  const rootElement = document.createElement('div');

  const res: MountedSceneT = (rootElement as unknown) as MountedSceneT;

  res.destroy = () => {
    act(() => root.unmount());
    res.remove();
  };

  res.snapshot = () => expect(res).toMatchSnapshot();

  document.body.appendChild(rootElement);
  act(() => {
    root = createRoot(rootElement);
    root.render(scene);
  });
  return res;
}

/**
 * Advances mock timers by the specified time, and waits for any DOM updates
 * to complete.
 * @param time [miliseconds]
 * @return Wait for this.
 */
export function wait(time: number) {
  return act(() => mockTimer(time));
}

export function timer(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}
