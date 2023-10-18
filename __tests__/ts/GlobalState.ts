/** @jest-environment jsdom */

/**
 * Most of the functionality is already covered by other test cases, thus
 * in this module we only test for several corner-cases.
 */

import { consoleLogs, mockConsoleLog, unMockConsoleLog } from 'jest/utils';

import GlobalState from 'src/GlobalState';
import { SsrContext } from 'src/index';

jest.useFakeTimers();

class NamedSsrContext<StateType> extends SsrContext<StateType> {
  name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }
}

beforeEach(() => {
  jest.resetModules();
  delete process.env.REACT_GLOBAL_STATE_DEBUG;
  unMockConsoleLog();
});

type StateT1 = string | {
  ''?: string;
  key: string;
};

type StateT2 = {
  [key: string]: string;
};

describe('State set & get', () => {
  it('passes basic test', () => {
    mockConsoleLog();
    process.env.REACT_GLOBAL_STATE_DEBUG = '1';
    const state = new GlobalState<StateT1>({ key: 'value' });
    expect(state.get()).toMatchSnapshot();
    state.set<1, string>('', 'value2');
    expect(state.get()).toMatchSnapshot();
    jest.runAllTimers();
    expect(state.get()).toMatchSnapshot();
    state.set(undefined, 'value3');
    jest.runAllTimers();
    expect(state.get()).toMatchSnapshot();
    state.set(null, 'value4');
    jest.runAllTimers();
    expect(state.get()).toMatchSnapshot();
    state.set<1, string>('', 'value5');
    jest.runAllTimers();
    expect(state.get()).toMatchSnapshot();
    expect(consoleLogs).toMatchSnapshot();
  });

  it('.get() respects "initialState" and "initialValue" options', () => {
    const state = new GlobalState<StateT2>({ iKey: 'iValue' });
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
    type StateType = { key: string };
    const ssrContext = new NamedSsrContext<StateType>('SSR Context');
    const state = new GlobalState({ key: 'value' }, ssrContext);
    expect(state.ssrContext).toBe(ssrContext);
    expect(ssrContext).toEqual({
      dirty: false,
      name: 'SSR Context',
      pending: [],
      state: { key: 'value' },
    });
  });

  it('correctly resets upon GlobalState construction', () => {
    type StateType = { [key: string]: unknown } | string[];

    const ssrContext = new NamedSsrContext<StateType>('SSR Context');
    ssrContext.dirty = true;
    ssrContext.pending = [
      Promise.resolve(),
      Promise.resolve(),
      Promise.resolve(),
    ];
    ssrContext.state = { oldKey: 'oldValue' };

    const state = new GlobalState<StateType, NamedSsrContext<StateType>>(['newValue'], ssrContext);
    expect(state.ssrContext).toBe(ssrContext);
    expect(ssrContext).toEqual({
      dirty: false,
      name: 'SSR Context',
      pending: [],
      state: ['newValue'],
    });
  });

  it('forbids to .watch() and .unWatch() the state', () => {
    const state = new GlobalState(undefined, new SsrContext<undefined>());
    expect(() => {
      state.watch(jest.fn());
    }).toThrowErrorMatchingSnapshot();
    expect(() => {
      state.unWatch(jest.fn());
    }).toThrowErrorMatchingSnapshot();
  });
});

describe('.watch() and .unWatch() logic', () => {
  const state = new GlobalState({ test: 0 });

  const watcher1 = jest.fn();
  const watcher2 = jest.fn();
  const watcher3 = jest.fn();

  // These counter and function do a mock update of the state, which causes
  // the GlobalState to call all connected watchers. As they are called async,
  // the touch should be awaited.
  let counter = 0;
  const test = (w1: number, w2: number, w3: number) => {
    state.set('test', ++counter);
    jest.runAllTimers();
    expect(watcher1).toHaveBeenCalledTimes(w1);
    expect(watcher2).toHaveBeenCalledTimes(w2);
    expect(watcher3).toHaveBeenCalledTimes(w3);
  };

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
