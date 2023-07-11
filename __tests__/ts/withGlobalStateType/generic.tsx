/** @jest-environment jsdom */

import pretty from 'pretty';
import { type DestroyableHtmlElement, mount } from 'jest/utils';
import { withGlobalStateType } from 'src/index';

type ValueT = 'value-a' | 'value-b';
type StateT = { some: { path: ValueT } };

const GS = withGlobalStateType<StateT>();

it('withGlobalStateType() result matches snapshot', () => {
  expect(GS).toMatchSnapshot();
});

function TestComponent() {
  const [x] = GS.useGlobalState('some.path');
  return <div>{x}</div>;
}

function TestScene() {
  return (
    <GS.GlobalStateProvider initialState={{ some: { path: 'value-b' } }}>
      <TestComponent />
    </GS.GlobalStateProvider>
  );
}

let scene: DestroyableHtmlElement | undefined;

afterEach(() => {
  if (scene) {
    scene.destroy();
    scene = undefined;
  }
});

describe('withGlobalStateType().useGlobalState()', () => {
  scene = mount(<TestScene />);
  expect(pretty(scene.innerHTML)).toMatchSnapshot();
});
