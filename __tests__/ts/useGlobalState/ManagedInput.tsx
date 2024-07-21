/** @jest-environment jsdom */

// Tests a text input element managed using the global state. If everything
// works properly, editing the input value should not reset the input cursor
// position to the value end (which happens if the value update arrives to
// the input element only in subsequent render cycle, see the issue
// https://github.com/birdofpreyru/react-global-state/issues/22).

import pretty from 'pretty';
import { type DestroyableHtmlElement, act, mount } from 'jest/utils';
import { GlobalStateProvider, useGlobalState } from 'src';

jest.useFakeTimers();

type StateT = {
  value: string;
};

const Input: React.FunctionComponent = () => {
  const [value, setValue] = useGlobalState<StateT, 'value'>('value');
  return (
    <input
      onChange={(e) => {
        setValue(e.target.value);
      }}
      value={value}
    />
  );
};

const TestScene: React.FunctionComponent = () => (
  <GlobalStateProvider<StateT> initialState={{ value: '12345' }}>
    <Input />
  </GlobalStateProvider>
);

let scene: DestroyableHtmlElement | undefined;

it('works as expected', () => {
  scene = mount(<TestScene />);
  const input = document.querySelector('input')!;
  expect(input.selectionStart).toBe(5);
  input.selectionStart = 2;
  expect(input.selectionStart).toBe(2);

  // NOTE: This turns out to be very cumbersome to emulate user input in Jest
  // tests for React, and I don't have much time to deeply inverstigate it.
  // The code below is based on the following Medium article:
  // https://hustle.bizongo.in/simulate-react-on-change-on-controlled-components-baa336920e04
  // and it does server our purpose here: if the issue we are testing against
  // is not present, the target value and selection position remain the same
  // after act() completion, however if the issue is present the value after
  // act() remains '12345', and the selection position is reset to the end (5).
  act(() => {
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value',
    )?.set!;
    setter.call(input, '12A345');
    input.selectionStart = 3;
    expect(input.selectionStart).toBe(3);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  expect(input.selectionStart).toBe(3);
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
});
