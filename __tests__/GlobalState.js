/** @jest-environment jsdom */

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

describe('.watch() and .unWatch() logic', () => {
  let state;

  const watcher1 = jest.fn();
  const watcher2 = jest.fn();
  const watcher3 = jest.fn();

  // These counter and function do a mock update of the state, which causes
  // the GlobalState to call all connected watchers. As they are called async,
  // the touch should be awaited.
  let counter = 0;
  const test = (w1, w2, w3) => {
    state.set('test', ++counter);
    jest.runAllTimers();
    expect(watcher1).toHaveBeenCalledTimes(w1);
    expect(watcher2).toHaveBeenCalledTimes(w2);
    expect(watcher3).toHaveBeenCalledTimes(w3);
  };

  beforeAll(() => {
    const GlobalState = require('src/GlobalState').default;
    state = new GlobalState();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('subscribes watcher1', () => {
    state.watch(watcher1);
    test(1, 0, 0);
  });

  it('does not subscribe watcher1 multiple times', () => {
    state.watch(watcher1);
    test(1, 0, 0);
  });

  it('subscribes watcher2', () => {
    state.watch(watcher2);
    test(1, 1, 0);
  });

  it('does nothing on attempt to unsubscribe unknown watcher', () => {
    state.unWatch(watcher3);
    test(1, 1, 0);
  });

  it('subscribes watcher3', () => {
    state.watch(watcher3);
    test(1, 1, 1);
  });

  it('unsubscribes watcher1', () => {
    state.unWatch(watcher1);
    test(0, 1, 1);
  });

  it('re-subscribes watcher1', () => {
    state.watch(watcher1);
    test(1, 1, 1);
  });

  it('unsubscribes watcher1 again', () => {
    state.unWatch(watcher1);
    test(0, 1, 1);
  });
});
