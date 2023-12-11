/** @jest-environment jsdom */

/**
 * Tests that if a function is used as the value, it is not called during
 * state update.
 */

import { type ReactNode, useEffect } from 'react';

import { mount } from 'jest/utils';
import { type SetterT, GlobalStateProvider, useGlobalState } from 'src/index';

const PATH = 'path';

type ValueT = jest.Mock | string | undefined;

type StateT = { [PATH]?: ValueT };

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <GlobalStateProvider<StateT> initialState={{}}>
      {children}
    </GlobalStateProvider>
  );
}

function TestComponent01() {
  TestComponent01.pass += 1;
  const [value] = useGlobalState<StateT, typeof PATH>(PATH, 'value-01');
  expect(value).toBe('value-01');
  return null;
}

TestComponent01.pass = 0;

test('Non-functional initial value', () => {
  mount(<Wrapper><TestComponent01 /></Wrapper>);
  expect(TestComponent01.pass).toBe(1);
});

function TestComponent02() {
  TestComponent02.pass += 1;
  const [value] = useGlobalState<StateT, typeof PATH>(PATH, () => 'value-02');
  expect(value).toBe('value-02');
  return null;
}

TestComponent02.pass = 0;

test('Functional initial value', () => {
  mount(<Wrapper><TestComponent02 /></Wrapper>);
  expect(TestComponent02.pass).toBe(1);
});

function TestComponent03() {
  TestComponent03.pass += 1;
  const [value] = useGlobalState<StateT, typeof PATH>(
    PATH,
    () => TestComponent03.func,
  );
  expect(value === TestComponent03.func).toBe(true);
  return null;
}

TestComponent03.pass = 0;
TestComponent03.func = jest.fn();

test('Functional initial value, returing a function', () => {
  mount(<Wrapper><TestComponent03 /></Wrapper>);
  expect(TestComponent03.pass).toBe(1);
  expect(TestComponent03.func).not.toHaveBeenCalled();
});

function TestComponent04() {
  TestComponent04.pass += 1;
  const [value, set] = useGlobalState<StateT, typeof PATH>(PATH, 'value-04');
  setTimeout(() => set('value-04-2'));
  switch (TestComponent04.pass) {
    case 1: expect(value).toBe('value-04'); break;
    case 2: expect(value).toBe('value-04-2'); break;
    default: throw Error('Unexpected render pass');
  }
  return null;
}

TestComponent04.pass = 0;

test('Setting a non-functional value', () => {
  mount(<Wrapper><TestComponent04 /></Wrapper>);
});

function TestComponent05() {
  TestComponent05.pass += 1;
  const [value, set] = useGlobalState<StateT, typeof PATH>(
    PATH,
    () => 'value-05',
  );
  if (typeof value === 'string' && value.endsWith('05')) {
    set((v: ValueT) => `${v}-2`);
  }
  switch (TestComponent05.pass) {
    case 1: expect(value).toBe('value-05'); break;
    case 2: expect(value).toBe('value-05-2'); break;
    default: throw Error('Unexpected render pass');
  }
  return null;
}

TestComponent05.pass = 0;

test('Functional update', () => {
  mount(<Wrapper><TestComponent05 /></Wrapper>);
});

function TestComponent06() {
  TestComponent06.pass += 1;
  const [value, set] = useGlobalState<StateT, typeof PATH>(
    'path',
    () => TestComponent06.func,
  );
  setTimeout(() => set(() => TestComponent06.func2));
  switch (TestComponent06.pass) {
    case 1: expect(value === TestComponent06.func).toBe(true); break;
    case 2: expect(value === TestComponent06.func2).toBe(true); break;
    default: throw Error('Unexpected render pass');
  }
  return null;
}

TestComponent06.pass = 0;
TestComponent06.func = jest.fn();
TestComponent06.func2 = jest.fn();

test('Functional update to a function value', () => {
  mount(<Wrapper><TestComponent06 /></Wrapper>);
  expect(TestComponent06.func).not.toHaveBeenCalled();
  expect(TestComponent06.func2).not.toHaveBeenCalled();
});

let t07Set: SetterT<ValueT>;

function TestComponent07() {
  TestComponent07.pass += 1;
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
    switch (TestComponent07.pass) {
      case 1: expect(value).toBe('value-07'); break;
      case 2: expect(value).toBe('value-07-2'); break;
      case 3: expect(value).toBe('value-07-2-3'); break;
      default: throw Error('Unexpected render pass');
    }
  });

  return null;
}

TestComponent07.pass = 0;

test('Update function is stable', () => {
  mount(<Wrapper><TestComponent07 /></Wrapper>);
});
