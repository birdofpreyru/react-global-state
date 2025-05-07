/** @jest-environment jsdom */

import { type MountedSceneT, mount } from 'jest/utils';

import { withGlobalStateType } from 'src/index';

type ValueT = 'value-a' | 'value-b';
type StateT = { some: { path: ValueT } };

const Gs = withGlobalStateType<StateT>();

const TestComponent: React.FunctionComponent = () => {
  const [x] = Gs.useGlobalState('some.path');
  return <div>{x}</div>;
};

const TestScene: React.FunctionComponent = () => (
  <Gs.GlobalStateProvider initialState={{ some: { path: 'value-b' } }}>
    <TestComponent />
  </Gs.GlobalStateProvider>
);

let scene: MountedSceneT | undefined;

afterEach(() => {
  if (scene) {
    scene.destroy();
    scene = undefined;
  }
});

it('withGlobalStateType() result matches snapshot', () => {
  expect(Gs).toMatchSnapshot();
});

describe('withGlobalStateType().useGlobalState()', () => {
  scene = mount(<TestScene />);
  scene.snapshot();
});
