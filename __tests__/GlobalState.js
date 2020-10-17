/**
 * Most of the functionality is already covered by other test cases, thus
 * in this module we only test for several corner-cases.
 */

import { mockConsoleLog, unMockConsoleLog } from 'jest/utils';

jest.useFakeTimers();

beforeEach(() => {
  jest.resetModules();
  delete process.env.REACT_GLOBAL_STATE_DEBUG;
  unMockConsoleLog();
});

test('State set & get', () => {
  mockConsoleLog();
  process.env.REACT_GLOBAL_STATE_DEBUG = true;
  const GlobalState = require('src/GlobalState').default;
  const state = new GlobalState({ key: 'value' });
  expect(state).toMatchSnapshot();
  state.set('', 'value2');
  expect(state).toMatchSnapshot();
  jest.runAllTimers();
  expect(state).toMatchSnapshot();
  state.set(undefined, 'value3');
  jest.runAllTimers();
  expect(state).toMatchSnapshot();
  state.set(null, 'value4');
  jest.runAllTimers();
  expect(state).toMatchSnapshot();
  state.set('', 'value5');
  jest.runAllTimers();
  expect(state).toMatchSnapshot();
  expect(console.log.logs).toMatchSnapshot();
});

test('Watch & unWatch logic', () => {
  mockConsoleLog();
  process.env.REACT_GLOBAL_STATE_DEBUG = true;
  const GlobalState = require('src/GlobalState').default;
  const state = new GlobalState();
  const watcher1 = () => null;
  const watcher2 = () => null;
  const watcher3 = () => null;
  state.watch(watcher1);
  expect(state.watchers).toEqual([watcher1]);
  state.watch(watcher1);
  expect(state.watchers).toEqual([watcher1]);
  state.watch(watcher2);
  expect(state.watchers).toEqual([watcher1, watcher2]);
  state.unWatch(watcher3);
  expect(state.watchers).toEqual([watcher1, watcher2]);
  state.watch(watcher3);
  expect(state.watchers).toEqual([watcher1, watcher2, watcher3]);
  state.unWatch(watcher1);
  expect(state.watchers).toEqual([watcher3, watcher2]);
  state.watch(watcher1);
  expect(state.watchers).toEqual([watcher3, watcher2, watcher1]);
  state.unWatch(watcher1);
  expect(state.watchers).toEqual([watcher3, watcher2]);
  expect(console.log.logs).toMatchSnapshot();
});
