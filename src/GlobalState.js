import _ from 'lodash';
import { isDebugMode } from './utils';

const ERR_NO_SSR_WATCH = 'GlobalState must not be watched at server side';

/**
 * Transform state path into the full path inside GlobalState object.
 * @param {String} statePath
 */
function fullPath(statePath) {
  return _.isNil(statePath) ? 'state' : `state.${statePath}`;
}

/**
 * The GlobalState object powers data stores.
 */
export default class GlobalState {
  /**
   * Creates a new global state object.
   * @param {Any} [initialState] Intial global state.
   * @param {Object} [ssrContext] Optional. Mutated. Server-side rendering
   *  context.
   */
  constructor(initialState, ssrContext) {
    /* eslint-disable no-param-reassign */
    this.state = _.cloneDeep(initialState);
    this.nextNotifierId = null;
    this.watchers = [];

    if (ssrContext) {
      ssrContext.dirty = false;
      ssrContext.pending = [];
      ssrContext.state = this.state;
      this.ssrContext = ssrContext;
    }

    if (process.env.NODE_ENV !== 'production' && isDebugMode()) {
      /* eslint-disable no-console */
      let msg = 'New ReactGlobalState created';
      if (ssrContext) msg += ' (SSR mode)';
      console.groupCollapsed(msg);
      console.log('Initial state:', _.cloneDeep(initialState));
      console.groupEnd();
      /* eslint-enable no-console */
    }
    /* eslint-enable no-param-reassign */
  }

  /**
   * Gets value from the `path`. If `path` is null or undefined, the entire
   * state object is returned.
   * @param {String} path
   * @return {Any}
   */
  get(path) {
    return _.get(this, fullPath(path));
  }

  /**
   * Sets `value` at the specified state `path`. If `path` is null or undefined,
   * the value is set as the entire state object.
   *
   * TODO: With such naive use of _.set, the state is mutated in place, which
   * may cause tons of unexpected side effects for dependants. It will be better
   * to partially clone the state, so that any existing references are not
   * mutated, while the full deep clonning is also avoided.
   *
   * @param {String} path
   * @param {Any} value
   * @return {Any} value
   */
  set(path, value) {
    const p = fullPath(path);
    if (value !== _.get(this, p)) {
      if (process.env.NODE_ENV !== 'production' && isDebugMode()) {
        /* eslint-disable no-console */
        console.groupCollapsed(
          `ReactGlobalState update. Path: "${path || ''}"`,
        );
        console.log('New value:', _.cloneDeep(value));
        /* eslint-enable no-console */
      }
      let pos = this;
      const pathSegments = _.toPath(p);
      for (let i = 0; i < pathSegments.length - 1; i += 1) {
        const seg = pathSegments[i];
        const next = pos[seg];
        if (_.isArray(next)) pos[seg] = [...next];
        else if (_.isObject(next)) pos[seg] = { ...next };
        else break;
        pos = pos[seg];
      }
      _.set(this, p, value);
      if (this.ssrContext) {
        this.ssrContext.dirty = true;
        this.ssrContext.state = this.state;
      } else if (!this.nextNotifierId) {
        this.nextNotifierId = setTimeout(() => {
          this.nextNotifierId = null;
          [...this.watchers].forEach((w) => w());
        });
      }
      if (process.env.NODE_ENV !== 'production' && isDebugMode()) {
        /* eslint-disable no-console */
        console.log('New state:', _.cloneDeep(this.state));
        console.groupEnd();
        /* eslint-enable no-console */
      }
    }
    return value;
  }

  /**
   * Removes `callback` from watcher array. No operation if `callback` is not
   * in the watchers list.
   * @param {Function} callback
   * @throws if `ssrContext` is given: the state watching functionality is
   *  intended for client-side only.
   */
  unWatch(callback) {
    if (this.ssrContext) throw new Error(ERR_NO_SSR_WATCH);
    const { watchers } = this;
    const pos = watchers.indexOf(callback);
    if (pos >= 0) {
      watchers[pos] = watchers[watchers.length - 1];
      watchers.pop();
    }
  }

  /**
   * Subscribes `callback` to state updates. No operation if `callback` is
   * in the watchers list already.
   * @param {Function} callback
   * @throws if `ssrContext` is given: the state watching functionality is
   *  intended for client-side only.
   */
  watch(callback) {
    if (this.ssrContext) throw new Error(ERR_NO_SSR_WATCH);
    const { watchers } = this;
    if (watchers.indexOf(callback) < 0) {
      watchers.push(callback);
    }
  }
}
