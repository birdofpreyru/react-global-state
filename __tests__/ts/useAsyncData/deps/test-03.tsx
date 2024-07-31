/** @jest-environment jsdom */

import mockdate from 'mockdate';

import { useState } from 'react';

import { getByText } from '@testing-library/dom';

import { act, mount } from 'jest/utils';

import {
  type AsyncDataEnvelopeT,
  withGlobalStateType,
} from 'src';

// Tests scenario when the hook uses dependencies and changes its path
// to another path that has non-stale data loaded, but for different
// dependency values. It should cause data reload on the new path in
// this scenario.

type StateT = {
  pathA: AsyncDataEnvelopeT<string>;
  pathB: AsyncDataEnvelopeT<string>;
};

const {
  GlobalState,
  GlobalStateProvider,
  newAsyncDataEnvelope,
  useAsyncData,
} = withGlobalStateType<StateT>();

mockdate.set('2024-07-30');

const Component: React.FunctionComponent = () => {
  const [dep, setDep] = useState('A');
  const [path, setPath] = useState<keyof StateT>('pathA');
  const [step, setStep] = useState(0);

  useAsyncData(path, () => dep, {
    deps: [dep],
  });

  return (
    <div
      onClick={() => {
        switch (step) {
          case 0:
            setPath('pathB');
            setStep(1);
            break;
          case 1:
            setDep('B');
            setStep(2);
            break;
          case 2:
            setPath('pathA');
            setStep(3);
            break;
          default:
            throw Error('Unexpected step');
        }
      }}
      role="presentation"
    >
      Next Step
    </div>
  );
};

type ScenePropsT = {
  gs: InstanceType<typeof GlobalState>;
};

const Scene: React.FunctionComponent<ScenePropsT> = ({ gs }) => (
  <GlobalStateProvider stateProxy={gs}>
    <Component />
  </GlobalStateProvider>
);

test('Base scenario', async () => {
  const gs = new GlobalState({
    pathA: newAsyncDataEnvelope(),
    pathB: newAsyncDataEnvelope(),
  });
  const scene = mount(<Scene gs={gs} />);
  scene.snapshot();

  const button = getByText(scene, 'Next Step');
  act(() => button.click());
  expect(gs.get()).toMatchSnapshot();

  act(() => button.click());
  expect(gs.get()).toMatchSnapshot();

  act(() => button.click());
  expect(gs.get()).toMatchSnapshot();
});
