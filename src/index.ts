// TODO: This is a temporary polyfill for `Promise.allSettled(..)` method,
// which is supported natively by NodeJS >= v12.9.0. As earlier NodeJS version
// are still in a wide use, this polyfill is added here, and it is to be dropped
// some time later.
if (!Promise.allSettled) {
  Promise.allSettled = (promises: Promise<any>[]) => Promise.all(
    promises.map((p) => (p instanceof Promise ? p.finally(() => null) : p)),
  );
}

export { default as SsrContext } from './SsrContext';

export {
  default as GlobalStateProvider,
  getGlobalState,
  getSsrContext,
} from './GlobalStateProvider';

export {
  type AsyncCollectionLoader,
  default as useAsyncCollection,
} from './useAsyncCollection';

export {
  type AsyncDataEnvelope,
  type AsyncDataLoader,
  default as useAsyncData,
} from './useAsyncData';

export { type Setter, default as useGlobalState } from './useGlobalState';
