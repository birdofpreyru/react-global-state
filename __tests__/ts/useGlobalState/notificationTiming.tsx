/** @jest-environment jsdom */

/**
 * Tests that state notifications are delivered to dependent components
 * in an async manner.
 */

import pretty from 'pretty';

import { type DestroyableHtmlElement, act, mount } from 'jest/utils';

import { GlobalStateProvider, useGlobalState } from 'src/index';

jest.useFakeTimers();

type StateT = string;

const ComponentA: React.FunctionComponent = () => {
  const P = null;
  const [value, setValue] = useGlobalState<StateT, typeof P>(P, '');
  if (value === 'B') setTimeout(() => setValue('A'));
  return <div>{value}</div>;
};

const ComponentB: React.FunctionComponent = () => {
  const P = null;
  const [value, setValue] = useGlobalState<StateT, typeof P>(P, '');
  if (value !== 'C') {
    setTimeout(() => {
      setValue('B');
      setValue('C');
    });
  }
  return <div>{value}</div>;
};

const Scene: React.FunctionComponent = () => (
  <GlobalStateProvider initialState={undefined}>
    <ComponentA />
    <ComponentB />
  </GlobalStateProvider>
);

let scene: DestroyableHtmlElement | null = null;

afterAll(() => {
  if (scene) {
    scene.destroy();
    scene = null;
  }
});

test('Scene works as expected', () => {
  scene = mount(<Scene />);
  act(() => jest.runAllTimers());
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
});
