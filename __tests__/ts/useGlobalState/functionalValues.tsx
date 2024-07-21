/** @jest-environment jsdom */

/**
 * Tests that if a function is used as the value, it is not called during
 * state update.
 */

import { type ReactNode, useEffect } from 'react';

import { mount } from 'jest/utils';
import { type SetterT, GlobalStateProvider, useGlobalState } from 'src/index';

const PATH = 'path';

type ValueT = jest.Mock | number | string | undefined;

type StateT = { [PATH]?: ValueT };
type State2T = { key: number };

const Wrapper: React.FunctionComponent<{
  children: ReactNode;
}> = ({ children }) => (
  <GlobalStateProvider<StateT> initialState={{}}>
    {children}
  </GlobalStateProvider>
);

let pass01 = 0;

const TestComponent01: React.FunctionComponent = () => {
  pass01 += 1;
  const [value] = useGlobalState<StateT, typeof PATH>(PATH, 'value-01');
  expect(value).toBe('value-01');
  return null;
};

test('Non-functional initial value', () => {
  mount(<Wrapper><TestComponent01 /></Wrapper>);
  expect(pass01).toBe(1);
});

let pass02 = 0;

const TestComponent02: React.FunctionComponent = () => {
  pass02 += 1;
  const [value] = useGlobalState<StateT, typeof PATH>(PATH, () => 'value-02');
  expect(value).toBe('value-02');
  return null;
};

test('Functional initial value', () => {
  mount(<Wrapper><TestComponent02 /></Wrapper>);
  expect(pass02).toBe(1);
});

let pass03 = 0;
const func03 = jest.fn();

const TestComponent03: React.FunctionComponent = () => {
  pass03 += 1;
  const [value] = useGlobalState<StateT, typeof PATH>(
    PATH,
    () => func03,
  );
  expect(value === func03).toBe(true);
  return null;
};

test('Functional initial value, returing a function', () => {
  mount(<Wrapper><TestComponent03 /></Wrapper>);
  expect(pass03).toBe(1);
  expect(func03).not.toHaveBeenCalled();
});

let pass04 = 0;

const TestComponent04: React.FunctionComponent = () => {
  pass04 += 1;
  const [value, set] = useGlobalState<StateT, typeof PATH>(PATH, 'value-04');
  setTimeout(() => set('value-04-2'));
  switch (pass04) {
    case 1: expect(value).toBe('value-04'); break;
    case 2: expect(value).toBe('value-04-2'); break;
    default: throw Error('Unexpected render pass');
  }
  return null;
};

test('Setting a non-functional value', () => {
  mount(<Wrapper><TestComponent04 /></Wrapper>);
});

let pass05 = 0;

const TestComponent05: React.FunctionComponent = () => {
  pass05 += 1;
  const [value, set] = useGlobalState<StateT, typeof PATH>(
    PATH,
    () => 'value-05',
  );
  if (typeof value === 'string' && value.endsWith('05')) {
    set((v: ValueT) => `${v}-2`);
  }
  switch (pass05) {
    case 1: expect(value).toBe('value-05'); break;
    case 2: expect(value).toBe('value-05-2'); break;
    default: throw Error('Unexpected render pass');
  }
  return null;
};

test('Functional update', () => {
  mount(<Wrapper><TestComponent05 /></Wrapper>);
});

// When functional state update is done a few times within the same render,
// each subsequent one should get the current (previously updated) state,
// and not the very original one.

const TestComponent05b: React.FunctionComponent = () => {
  const [, set] = useGlobalState<State2T, 'key'>('key', 0);
  set((x) => Math.min(1, x + 1));
  set((x) => {
    expect(x).toBe(1);
    return x;
  });
  return null;
};

test('Functional update - sequential updates within the same render', () => {
  mount(<Wrapper><TestComponent05b /></Wrapper>);
});

let pass06 = 0;
const func06a = jest.fn();
const func06b = jest.fn();

const TestComponent06: React.FunctionComponent = () => {
  pass06 += 1;
  const [value, set] = useGlobalState<StateT, typeof PATH>(
    'path',
    () => func06a,
  );
  setTimeout(() => set(() => func06b));
  switch (pass06) {
    case 1: expect(value === func06a).toBe(true); break;
    case 2: expect(value === func06b).toBe(true); break;
    default: throw Error('Unexpected render pass');
  }
  return null;
};

test('Functional update to a function value', () => {
  mount(<Wrapper><TestComponent06 /></Wrapper>);
  expect(func06a).not.toHaveBeenCalled();
  expect(func06b).not.toHaveBeenCalled();
});

let t07Set: SetterT<Exclude<ValueT, undefined>>;

let pass07 = 0;

const TestComponent07: React.FunctionComponent = () => {
  pass07 += 1;
  const [value, set] = useGlobalState<StateT, typeof PATH>(
    PATH,
    () => 'value-07',
  );
  if (!t07Set) t07Set = set;
  else expect(set === t07Set).toBe(true);

  // NOTE: Without useEffect(), doing these state updates directly inside
  // the render, we gonna end up with an infinite update loop, and error
  // warnings from React.
  useEffect(() => {
    if (typeof value === 'string' && value.endsWith('07')) {
      set((v: ValueT) => `${v}-2`);
    } else if (typeof value === 'string' && value.endsWith('-2')) {
      set((v: ValueT) => `${v}-3`);
    }
    switch (pass07) {
      case 1: expect(value).toBe('value-07'); break;
      case 2: expect(value).toBe('value-07-2'); break;
      case 3: expect(value).toBe('value-07-2-3'); break;
      default: throw Error('Unexpected render pass');
    }
  });

  return null;
};

test('Update function is stable', () => {
  mount(<Wrapper><TestComponent07 /></Wrapper>);
});
