import { timer } from '@dr.pogodin/js-utils';
import { type ForceT, useAsyncData, useGlobalState } from 'src/index';

// TODO: Are we missing something here? Right now the test components A and B,
// look identical along with their loaders. Were they intended to be slightly
// different to test different SSR corner cases?

export const loaderA = jest.fn(async () => {
  await timer(1000);
  return 'data';
});

export const loaderB = jest.fn(async () => {
  await timer(1000);
  return 'data';
});

function ComponentA() {
  const envelop = useAsyncData<ForceT, string>('x', loaderA);
  return <div>{JSON.stringify(envelop, null, 2)}</div>;
}

function ComponentB() {
  const envelop = useAsyncData<ForceT, string>('x', loaderB);
  return <div>{JSON.stringify(envelop, null, 2)}</div>;
}

export default function Scene() {
  const [globalValue] = useGlobalState<ForceT, string>('value.path', 'defaultValue');
  return (
    <div>
      <h1>{globalValue}</h1>
      <ComponentA />
      <ComponentB />
    </div>
  );
}
