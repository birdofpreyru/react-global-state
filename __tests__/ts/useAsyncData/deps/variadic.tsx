/** @jest-environment jsdom */

// Tests the hook supports variadic deps.

import { type FunctionComponent, useState } from 'react';

import { getByTestId } from '@testing-library/dom';

import { act, mount } from 'jest/utils';

import {
  type AsyncDataEnvelopeT,
  newAsyncDataEnvelope,
  withGlobalStateType,
} from 'src';

type StateT = {
  path: AsyncDataEnvelopeT<string[]>;
};

const { GlobalStateProvider, useAsyncData } = withGlobalStateType<StateT>();

const Component: React.FunctionComponent = () => {
  const [deps, setDeps] = useState<string[]>([]);

  const { data } = useAsyncData('path', () => deps, { deps });

  return (
    <div
      data-testid="component"
      onClick={() => {
        setDeps([...deps, deps.length.toString()]);
      }}
      role="presentation"
    >
      {data}
    </div>
  );
};

const Scene: FunctionComponent = () => (
  <GlobalStateProvider initialState={{ path: newAsyncDataEnvelope() }}>
    <Component />
  </GlobalStateProvider>
);

test('base scenario', () => {
  const scene = mount(<Scene />);
  scene.snapshot();

  // As of React 18.3.2, although a warning about variadic useEffect()
  // dependencies is printed into the console, the actual logic is the one
  // we expect... so we have to test there is no warnings.
  jest.spyOn(console, 'error').mockImplementation(() => undefined);

  const component = getByTestId(scene, 'component');
  act(() => {
    component.click();
  });
  scene.snapshot();
  expect(console.error).not.toHaveBeenCalled();
});
