/** @jest-environment jsdom */

import { type FunctionComponent, useState } from 'react';

import { getByTestId } from '@testing-library/react';

import { act, mount } from 'jest/utils';

import { getGlobalState, GlobalState, GlobalStateProvider } from 'src';

type GlobalStateT = InstanceType<typeof GlobalState<number>>;

let componentGS: GlobalStateT | undefined;
let sceneGS: GlobalStateT = new GlobalState(0);

jest.useFakeTimers();

const Component: FunctionComponent<{
  read: boolean;
}> = ({ read }) => {
  if (read) componentGS = getGlobalState();
  return <div>Test Component</div>;
};

const Scene: FunctionComponent = () => {
  const [gs, setGS] = useState<GlobalStateT>(sceneGS);
  const [read, setRead] = useState<boolean>(false);

  return (
    <GlobalStateProvider stateProxy={gs}>
      <Component read={read} />
      <button
        data-testid="toggle-gs"
        onClick={() => {
          sceneGS = new GlobalState(sceneGS.get() + 1);
          setGS(sceneGS);
        }}
        type="button"
      >
        GS
      </button>
      <button
        data-testid="toggle-read"
        onClick={() => setRead(!read)}
        type="button"
      >
        READ
      </button>
    </GlobalStateProvider>
  );
};

test('base scenario', () => {
  const scene = mount(<Scene />);
  expect(sceneGS.get()).toBe(0);
  expect(componentGS).toBe(undefined);

  act(() => getByTestId(scene, 'toggle-read').click());
  expect(componentGS).toBe(sceneGS);
  expect(componentGS?.get()).toBe(0);

  const oldGS = sceneGS;
  act(() => getByTestId(scene, 'toggle-gs').click());
  act(() => jest.runAllTimers());
  expect(sceneGS).not.toBe(oldGS);
  expect(sceneGS.get()).toBe(1);
  expect(componentGS).toBe(sceneGS);
});
