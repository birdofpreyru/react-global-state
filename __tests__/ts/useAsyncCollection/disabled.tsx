/** @jest-environment jsdom */

import type { FunctionComponent } from 'react';

import { mount } from 'jest/utils';

import {
  type AsyncDataEnvelopeT,
  newAsyncDataEnvelope,
  type UseAsyncDataResT,
  withGlobalStateType,
} from 'src';

type StateT = {
  collection: Record<string, AsyncDataEnvelopeT<string>>;
};

const {
  GlobalStateProvider,
  useAsyncCollection,
} = withGlobalStateType<StateT>();

const loader = jest.fn((id: string) => `res-${id}`);

let res: UseAsyncDataResT<string> | undefined;

function captureRes(value: UseAsyncDataResT<string>) {
  res = value;
}

const Component: FunctionComponent = () => {
  captureRes(useAsyncCollection('', 'collection', loader, { disabled: true }));
  return null;
};

const Scene: FunctionComponent = () => (
  <GlobalStateProvider
    initialState={{
      collection: { key: newAsyncDataEnvelope('value') },
    }}
  >
    <Component />
  </GlobalStateProvider>
);

test('useAsyncCollection(): "disabled" option works', () => {
  mount(<Scene />);
  expect(loader).not.toHaveBeenCalled();
  expect(res).toMatchSnapshot();
});
