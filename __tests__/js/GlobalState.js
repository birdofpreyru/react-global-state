/** @jest-environment jsdom */

/* global process, require */

/**
 * Most of the functionality is already covered by other test cases, thus
 * in this module we only test for several corner-cases.
 */

import { consoleLogs, mockConsoleLog, unMockConsoleLog } from 'jest/utils';

jest.useFakeTimers();

let GlobalState;

beforeEach(() => {
  jest.resetModules();
  delete process.env.REACT_GLOBAL_STATE_DEBUG;
  unMockConsoleLog();
  GlobalState = require('src/GlobalState').default;
});

describe('State set & get', () => {
  it('passes basic test', () => {
    mockConsoleLog();
    process.env.REACT_GLOBAL_STATE_DEBUG = true;
    const state = new GlobalState({ key: 'value' });
    expect(state.get()).toMatchSnapshot();
    state.set('', 'value2');
    expect(state.get()).toMatchSnapshot();
    jest.runAllTimers();
    expect(state.get()).toMatchSnapshot();
    state.set(undefined, 'value3');
    jest.runAllTimers();
    expect(state.get()).toMatchSnapshot();
    state.set(null, 'value4');
    jest.runAllTimers();
    expect(state.get()).toMatchSnapshot();
    state.set('', 'value5');
    jest.runAllTimers();
    expect(state.get()).toMatchSnapshot();
    expect(consoleLogs).toMatchSnapshot();
  });

  it('.get() respects "initialState" and "initialValue" options', () => {
    const state = new GlobalState({ iKey: 'iValue' });
    state.set('iKey', 'newValue');
    expect(state.get('iKey')).toBe('newValue');
    expect(state.get('iKey', { initialState: true })).toBe('iValue');
    expect(state.get('aKey', { initialValue: 'a' })).toBe('a');
    expect(state.get('aKey')).toBe('a');
    expect(state.get('bKey', {
      initialState: true,
      initialValue: 'b',
    })).toBe('b');
    expect(state.get('bKey')).toBe('b');
  });
});

describe('ssrContext', () => {
  it('correctly inits upon GlobalState construction', () => {
    const ssrContext = { name: 'SSR Context' };
    const state = new GlobalState({ key: 'value' }, ssrContext);
    expect(state.ssrContext).toBe(ssrContext);
    expect(ssrContext).toStrictEqual({
      dirty: false,
      name: 'SSR Context',
      pending: [],
      state: { key: 'value' },
    });
  });

  it('correctly resets upon GlobalState construction', () => {
    const ssrContext = {
      dirty: true,
      name: 'SSR Context',
      pending: ['A', 'B', 'C'],
      state: { oldKey: 'oldValue' },
    };
    const state = new GlobalState(['newValue'], ssrContext);
    expect(state.ssrContext).toBe(ssrContext);
    expect(ssrContext).toStrictEqual({
      dirty: false,
      name: 'SSR Context',
      pending: [],
      state: ['newValue'],
    });
  });

  it('forbids to .watch() and .unWatch() the state', () => {
    const state = new GlobalState(undefined, {});
    expect(() => {
      state.watch(jest.fn());
    }).toThrowErrorMatchingSnapshot();
    expect(() => {
      state.unWatch(jest.fn());
    }).toThrowErrorMatchingSnapshot();
  });
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
