// TODO: This is a temporary polyfill for `Promise.allSettled(..)` method,
// which is supported natively by NodeJS >= v12.9.0. As earlier NodeJS version
// are still in a wide use, this polyfill is added here, and it is to be dropped
// some time later.
if (!Promise.allSettled) {
  Promise.allSettled = (promises) => Promise.all(
    promises.map((p) => (p instanceof Promise ? p.finally(() => null) : p)),
  );
}

export {
  default as GlobalStateProvider,
  getGlobalState,
  getSsrContext,
} from './GlobalStateProvider';

export { default as useAsyncCollection } from './useAsyncCollection';
export { default as useAsyncData } from './useAsyncData';
export { default as useGlobalState } from './useGlobalState';
