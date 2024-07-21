/** @jest-environment jsdom */

import { type MountedSceneT, mount } from 'jest/utils';

import { withGlobalStateType } from 'src/index';

type ValueT = 'value-a' | 'value-b';
type StateT = { some: { path: ValueT } };

const GS = withGlobalStateType<StateT>();

it('withGlobalStateType() result matches snapshot', () => {
  expect(GS).toMatchSnapshot();
});

const TestComponent: React.FunctionComponent = () => {
  const [x] = GS.useGlobalState('some.path');
  return <div>{x}</div>;
};

const TestScene: React.FunctionComponent = () => (
  <GS.GlobalStateProvider initialState={{ some: { path: 'value-b' } }}>
    <TestComponent />
  </GS.GlobalStateProvider>
);

let scene: MountedSceneT | undefined;

afterEach(() => {
  if (scene) {
    scene.destroy();
    scene = undefined;
  }
});

describe('withGlobalStateType().useGlobalState()', () => {
  scene = mount(<TestScene />);
  scene.snapshot();
});
