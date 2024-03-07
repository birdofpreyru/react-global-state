/** @jest-environment jsdom */

// This test checks that when up-to-date async data are present in the state,
// mounting the useAsyncData() hook related to those data does not trigger
// unnecessary reload.

import pretty from 'pretty';

import {
  type DestroyableHtmlElement,
  act,
  mount,
  timer,
} from 'jest/utils';

import {
  type AsyncDataEnvelopeT,
  newAsyncDataEnvelope,
  withGlobalStateType,
} from 'src';

type StateT = {
  key: AsyncDataEnvelopeT<string>;
};

const { GlobalStateProvider, useAsyncData } = withGlobalStateType<StateT>();

const loader = jest.fn(() => 'bad');

function Component() {
  const e = useAsyncData('key', loader);
  return <div>{e.data}</div>;
}

function Scene() {
  return (
    <GlobalStateProvider
      initialState={{
        key: newAsyncDataEnvelope('ok', {
          timestamp: Date.now(),
        }),
      }}
    >
      <Component />
    </GlobalStateProvider>
  );
}

let scene: DestroyableHtmlElement | undefined;

beforeEach(async () => {
  loader.mockClear();
  scene = mount(<Scene />);
  await act(() => timer(10));
});

it('does not reload data', () => {
  expect(loader).not.toHaveBeenCalled();
  expect(pretty(scene!.innerHTML)).toMatchSnapshot();
});
