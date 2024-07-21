/** @jest-environment jsdom */

// Tests that multiple hooks using `deps` with the same values should not each
// re-trigger a data loading (i.e. `deps` are tracked per the global state path,
// and not per hook instance).

import mockdate from 'mockdate';

import { timer } from '@dr.pogodin/js-utils';

import {
  type MountedSceneT,
  act,
  mockTimer,
  mount,
} from 'jest/utils';

import { type AsyncDataEnvelopeT, withGlobalStateType } from 'src';

jest.useFakeTimers();
mockdate.set('2023-11-19');

type StateT = {
  test: AsyncDataEnvelopeT<string>;
};

const {
  GlobalStateProvider,
  newAsyncDataEnvelope,
  useAsyncData,
} = withGlobalStateType<StateT>();

const loader = jest.fn(async () => {
  await timer(1000);
  return 'value';
});

const Component: React.FunctionComponent = () => {
  const envelope = useAsyncData('test', loader, {
    deps: ['dependency-value'],
  });
  return <div>{envelope.data}</div>;
};

const Scene: React.FunctionComponent = () => (
  <GlobalStateProvider
    initialState={{
      test: newAsyncDataEnvelope(),
    }}
  >
    <Component />
    <Component />
  </GlobalStateProvider>
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let scene: MountedSceneT | undefined;

// TODO: Move it to jest/utils?
async function wait(time: number) {
  await act(async () => {
    await mockTimer(time);
    mockdate.set(Date.now() + time);
  });
}

beforeEach(async () => {
  loader.mockClear();
  scene = mount(<Scene />);
  await wait(1500);
});

test('The loading happens just once', () => {
  expect(loader).toHaveBeenCalledTimes(1);
});
