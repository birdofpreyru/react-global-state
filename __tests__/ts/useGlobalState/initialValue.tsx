/** @jest-environment jsdom */

// Tests of effects of "initialValue" argument.

import { getByText } from '@testing-library/dom';

import { act, mount } from 'jest/utils';

import { withGlobalStateType } from 'src';

type StateT = { key?: string };

const {
  GlobalState,
  GlobalStateProvider,
  useGlobalState,
} = withGlobalStateType<StateT>();

const Component: React.FunctionComponent = () => {
  const [value, setValue] = useGlobalState('key', 'initial');
  return (
    <div>
      {value}
      <button
        onClick={() => {
          setValue('value');
        }}
        type="button"
      >
        Set Value
      </button>
      <button
        // NOTE: TS forbids setting `undefined` value, because at the runtime
        // "initial" value will override it at the next render. We want to test
        // that runtime behavior, thus expecting that error here.
        onClick={() => {
          // @ts-expect-error "for test purposes"
          setValue(undefined);
        }}
        type="button"
      >
        Reset
      </button>
    </div>
  );
};

const Scene: React.FunctionComponent<{
  gs: InstanceType<typeof GlobalState>;
}> = ({ gs }) => (
  <GlobalStateProvider stateProxy={gs}>
    <Component />
  </GlobalStateProvider>
);

test('base behavior', () => {
  const gs = new GlobalState({});
  const scene = mount(<Scene gs={gs} />);
  expect(gs.get()).toStrictEqual({ key: 'initial' });
  scene.snapshot();

  act(() => {
    getByText(scene, 'Set Value').click();
  });
  expect(gs.get()).toStrictEqual({ key: 'value' });
  scene.snapshot();

  act(() => {
    getByText(scene, 'Reset').click();
  });
  expect(gs.get()).toStrictEqual({ key: 'initial' });
  scene.snapshot();
});
