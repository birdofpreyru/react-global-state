import { expect, test } from 'tstyche';

import {
  type UseGlobalStateResT,
  useGlobalState,
  withGlobalStateType,
} from '../../../src';

type StateT = { key?: string };

const WGS = withGlobalStateType<StateT>();

test('with non-undefined "initialValue"', () => {
  expect(useGlobalState<StateT, 'key'>('key', 'initial'))
    .type.toBe<UseGlobalStateResT<string>>();
  expect(WGS.useGlobalState<'key'>('key', 'initial'))
    .type.toBe<UseGlobalStateResT<string>>();
});

test('with possibly undefined "initialValue"', () => {
  // eslint-disable-next-line no-unassigned-vars
  let initialValue: string | undefined;
  expect(useGlobalState<StateT, 'key'>('key', initialValue))
    .type.toBe<UseGlobalStateResT<string | undefined>>();
  expect(WGS.useGlobalState<'key'>('key', initialValue))
    .type.toBe<UseGlobalStateResT<string | undefined>>();
});

test('with "initialValue" being a function with non-undefined result', () => {
  const initialValue = () => 'initial';
  expect(useGlobalState<StateT, 'key'>('key', initialValue))
    .type.toBe<UseGlobalStateResT<string>>();
  expect(WGS.useGlobalState<'key'>('key', initialValue))
    .type.toBe<UseGlobalStateResT<string>>();
});

test('with "initialValue" being a function with possibly undefined result', () => {
  const initialValue: () => string | undefined = () => 'initial';
  expect(useGlobalState<StateT, 'key'>('key', initialValue))
    .type.toBe<UseGlobalStateResT<string | undefined>>();
  expect(WGS.useGlobalState<'key'>('key', initialValue))
    .type.toBe<UseGlobalStateResT<string | undefined>>();
});
