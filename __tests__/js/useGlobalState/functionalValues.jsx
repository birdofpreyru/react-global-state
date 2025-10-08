/** @jest-environment jsdom */

/* global setTimeout */

/**
 * Tests that if a function is used as the value, it is not called during
 * state update.
 */

import { useEffect } from 'react';
import { mount } from 'jest/utils';
import { GlobalStateProvider, useGlobalState } from 'src';

let renderPass;

beforeEach(() => {
  renderPass = 0;
});

function Wrapper({ children }) {
  return <GlobalStateProvider>{children}</GlobalStateProvider>;
}

function TestComponent01() {
  ++renderPass;
  const [value] = useGlobalState('path', 'value-01');
  expect(value).toBe('value-01');
  return null;
}

test('Non-functional initial value', () => {
  mount(<Wrapper><TestComponent01 /></Wrapper>);
  expect(renderPass).toBe(1);
});

function TestComponent02() {
  ++renderPass;
  const [value] = useGlobalState('path', () => 'value-02');
  expect(value).toBe('value-02');
  return null;
}

test('Functional initial value', () => {
  mount(<Wrapper><TestComponent02 /></Wrapper>);
  expect(renderPass).toBe(1);
});

function TestComponent03() {
  ++renderPass;
  const [value] = useGlobalState('path', () => TestComponent03.func);
  expect(value).toBe(TestComponent03.func);
  return null;
}

const tc03func = jest.fn();

test('Functional initial value, returing a function', () => {
  mount(<Wrapper><TestComponent03 /></Wrapper>);
  expect(renderPass).toBe(1);
  expect(tc03func).not.toHaveBeenCalled();
});

function TestComponent04() {
  ++renderPass;
  const [value, set] = useGlobalState('path', 'value-04');
  setTimeout(() => set('value-04-2'));
  switch (renderPass) {
    case 1:
      expect(value).toBe('value-04');
      break;
    case 2:
      expect(value).toBe('value-04-2');
      break;
    default: throw Error('Unexpected render pass');
  }
  return null;
}

test('Setting a non-functional value', () => {
  mount(<Wrapper><TestComponent04 /></Wrapper>);
});

function TestComponent05() {
  ++renderPass;
  const [value, set] = useGlobalState('path', () => 'value-05');
  if (value.endsWith('05')) set((v) => `${v}-2`);
  switch (renderPass) {
    case 1:
      expect(value).toBe('value-05');
      break;
    case 2:
      expect(value).toBe('value-05-2');
      break;
    default: throw Error('Unexpected render pass');
  }
  return null;
}

test('Functional update', () => {
  mount(<Wrapper><TestComponent05 /></Wrapper>);
});

const tc06func = jest.fn();
const tc06func2 = jest.fn();

function TestComponent06() {
  ++renderPass;
  const [value, set] = useGlobalState('path', () => tc06func);
  setTimeout(() => set(() => tc06func2));
  switch (renderPass) {
    case 1:
      expect(value).toBe(tc06func);
      break;
    case 2:
      expect(value).toBe(tc06func2);
      break;
    default: throw Error('Unexpected render pass');
  }
  return null;
}

test('Functional update to a function value', () => {
  mount(<Wrapper><TestComponent06 /></Wrapper>);
  expect(tc06func).not.toHaveBeenCalled();
  expect(tc06func2).not.toHaveBeenCalled();
});

function TestComponent07() {
  ++renderPass;
  const [value, set] = useGlobalState('path', () => 'value-07');
  if (TestComponent07.set) expect(set).toBe(TestComponent07.set);
  else TestComponent07.set = set;

  // NOTE: Without useEffect(), doing these state updates directly inside
  // the render, we gonna end up with an infinite update loop, and error
  // warnings from React.
  useEffect(() => {
    if (value.endsWith('07')) set((v) => `${v}-2`);
    else if (value.endsWith('-2')) set((v) => `${v}-3`);
    switch (renderPass) {
      case 1:
        expect(value).toBe('value-07');
        break;
      case 2:
        expect(value).toBe('value-07-2');
        break;
      case 3:
        expect(value).toBe('value-07-2-3');
        break;
      default: throw Error('Unexpected render pass');
    }
  }, [value, set]);

  return null;
}

test('Update function is stable', () => {
  mount(<Wrapper><TestComponent07 /></Wrapper>);
});
