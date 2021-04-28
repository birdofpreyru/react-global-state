import _ from 'lodash';
import { isDebugMode } from './utils';

const ERR_NO_SSR_WATCH = 'GlobalState must not be watched at server side';

/**
 * Transform state path into the full path inside GlobalState object.
 * @param {string} statePath
 * @return {string}
 * @ignore
 */
function fullPath(statePath) {
  return _.isNil(statePath) ? 'state' : `state.${statePath}`;
}

export default class GlobalState {
  /**
   * @class GlobalState
   * @classdesc Represents global state objects.
   * @desc Creates a new global state object.
   * @param {any} [initialState] Intial global state content.
   * @param {SsrContext} [ssrContext] Server-side rendering context.
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
   * @instance
   * @memberof GlobalState
   * @desc Gets the value at given `path` of global state. If `path` is null or
   * undefined, the entire state object is returned.
   * @param {string} [path] Dot-delimitered state path. If not given, entire
   * global state content is returned.
   * @return {any}
   */
  get(path) {
    return _.get(this, fullPath(path));
  }

  /**
   * @instance
   * @memberof GlobalState
   * @desc Writes the `value` to given global state `path`.
   * @param {string} [path] Dot-delimitered state path. If not given, entire
   * global state content is replaced by the `value`.
   * @param {any} value The value.
   * @return {any} Given `value` itself.
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

      // TODO: With such naive use of _.set, the state is mutated in place,
      // which may cause tons of unexpected side effects for dependants.
      // It will be better to partially clone the state, so that any existing
      // references are not mutated, while the full deep clonning is also
      // avoided.
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
   * @instance
   * @memberof GlobalState
   * @desc Unsubscribes `callback` from watching state updates; no operation if
   * `callback` is not subscribed to the state updates.
   * @param {function} callback
   * @throws if {@link SsrContext} is attached to the state instance: the state
   * watching functionality is intended for client-side (non-SSR) only.
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
   * @instance
   * @memberof GlobalState
   * @desc Subscribes `callback` to watch state updates; no operation if
   * `callback` is already subscribed to this state instance.
   * @param {function} callback It will be called without any arguments every
   * time the state content changes (note, howhever, separate state updates can
   * be applied to the state at once, and watching callbacks will be called once
   * after such bulk update).
   * @throws if {@link SsrContext} is attached to the state instance: the state
   * watching functionality is intended for client-side (non-SSR) only.
   */
  watch(callback) {
    if (this.ssrContext) throw new Error(ERR_NO_SSR_WATCH);
    const { watchers } = this;
    if (watchers.indexOf(callback) < 0) {
      watchers.push(callback);
    }
  }
}
