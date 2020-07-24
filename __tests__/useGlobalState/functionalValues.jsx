/**
 * Tests that if a function is used as the value, it is not called during
 * state update.
 */
/* eslint-disable react/prop-types */

import React from 'react';

import { act, mount } from 'jest/utils';
import { GlobalStateProvider, useGlobalState } from 'src';

function Wrapper({ children }) {
  return <GlobalStateProvider>{children}</GlobalStateProvider>;
}

function TestComponent01() {
  TestComponent01.pass += 1;
  const [value] = useGlobalState('path', 'value-01');
  expect(value).toBe('value-01');
  return null;
}

TestComponent01.pass = 0;

test('Non-functional initial value', () => {
  act(() => {
    mount(<Wrapper><TestComponent01 /></Wrapper>);
  });
  expect(TestComponent01.pass).toBe(1);
});

function TestComponent02() {
  TestComponent02.pass += 1;
  const [value] = useGlobalState('path', () => 'value-02');
  expect(value).toBe('value-02');
  return null;
}

TestComponent02.pass = 0;

test('Functional initial value', () => {
  act(() => {
    mount(<Wrapper><TestComponent02 /></Wrapper>);
  });
  expect(TestComponent02.pass).toBe(1);
});

function TestComponent03() {
  TestComponent03.pass += 1;
  const [value] = useGlobalState('path', () => TestComponent03.func);
  expect(value === TestComponent03.func).toBe(true);
  return null;
}

TestComponent03.pass = 0;
TestComponent03.func = jest.fn();

test('Functional initial value, returing a function', () => {
  act(() => {
    mount(<Wrapper><TestComponent03 /></Wrapper>);
  });
  expect(TestComponent03.pass).toBe(1);
  expect(TestComponent03.func).not.toHaveBeenCalled();
});

function TestComponent04() {
  TestComponent04.pass += 1;
  const [value, set] = useGlobalState('path', 'value-04');
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
  act(() => {
    mount(<Wrapper><TestComponent04 /></Wrapper>);
  });
});

function TestComponent05() {
  TestComponent05.pass += 1;
  const [value, set] = useGlobalState('path', () => 'value-05');
  if (value.endsWith('05')) set((v) => `${v}-2`);
  switch (TestComponent05.pass) {
    case 1: expect(value).toBe('value-05'); break;
    case 2: expect(value).toBe('value-05-2'); break;
    default: throw Error('Unexpected render pass');
  }
  return null;
}

TestComponent05.pass = 0;

test('Functional update', () => {
  act(() => {
    mount(<Wrapper><TestComponent05 /></Wrapper>);
  });
});

function TestComponent06() {
  TestComponent06.pass += 1;
  const [value, set] = useGlobalState('path', () => TestComponent06.func);
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
  act(() => {
    mount(<Wrapper><TestComponent06 /></Wrapper>);
  });
  expect(TestComponent06.func).not.toHaveBeenCalled();
  expect(TestComponent06.func2).not.toHaveBeenCalled();
});

function TestComponent07() {
  TestComponent07.pass += 1;
  const [value, set] = useGlobalState('path', () => 'value-07');
  if (!TestComponent07.set) TestComponent07.set = set;
  else expect(set === TestComponent07.set).toBe(true);
  if (value.endsWith('07')) set((v) => `${v}-2`);
  else if (value.endsWith('-2')) set((v) => `${v}-3`);
  switch (TestComponent07.pass) {
    case 1: expect(value).toBe('value-07'); break;
    case 2: expect(value).toBe('value-07-2'); break;
    case 3: expect(value).toBe('value-07-2-3'); break;
    default: throw Error('Unexpected render pass');
  }
  return null;
}

TestComponent07.pass = 0;

test('Update function is stable', () => {
  act(() => {
    mount(<Wrapper><TestComponent07 /></Wrapper>);
  });
});
