/**
 * Tests that state notifications are delivered to dependent components
 * in an async manner.
 */

import React from 'react';

import pretty from 'pretty';

import { act, mount, unmount } from 'jest/utils';
import { GlobalStateProvider, useGlobalState } from 'src';

jest.useFakeTimers();

function ComponentA() {
  const [value, setValue] = useGlobalState();
  if (value === 'B') setTimeout(() => setValue('A'));
  return <div>{value}</div>;
}

function ComponentB() {
  const [value, setValue] = useGlobalState();
  if (value !== 'C') {
    setTimeout(() => {
      setValue('B');
      setValue('C');
    });
  }
  return <div>{value}</div>;
}

function Scene() {
  return (
    <GlobalStateProvider>
      <ComponentA />
      <ComponentB />
    </GlobalStateProvider>
  );
}

let scene = null;
afterAll(() => {
  if (scene) {
    unmount(scene);
    scene = null;
  }
});

test('Scene works as expected', () => {
  act(() => {
    scene = mount(<Scene />);
  });
  // expect(pretty(scene.innerHTML)).toMatchSnapshot();
  act(() => jest.runAllTimers());
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
});
