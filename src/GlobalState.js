import {
  cloneDeep,
  get,
  isObject,
  isNil,
  set,
  toPath,
} from 'lodash';

import { isDebugMode } from './utils';

const ERR_NO_SSR_WATCH = 'GlobalState must not be watched at server side';

export default class GlobalState {
  #nextNotifierId = null;

  #state;

  #watchers = [];

  /**
   * Creates a new global state object.
   * @param {any} [initialState] Intial global state content.
   * @param {SsrContext} [ssrContext] Server-side rendering context.
   */
  constructor(initialState, ssrContext) {
    /* eslint-disable no-param-reassign */
    this.#state = initialState;

    if (ssrContext) {
      ssrContext.dirty = false;
      ssrContext.pending = [];
      ssrContext.state = this.#state;
      this.ssrContext = ssrContext;
    }

    if (process.env.NODE_ENV !== 'production' && isDebugMode()) {
      /* eslint-disable no-console */
      let msg = 'New ReactGlobalState created';
      if (ssrContext) msg += ' (SSR mode)';
      console.groupCollapsed(msg);
      console.log('Initial state:', cloneDeep(initialState));
      console.groupEnd();
      /* eslint-enable no-console */
    }
    /* eslint-enable no-param-reassign */
  }

  /**
   * Gets the value at given `path` of global state. If `path` is null or
   * undefined, the entire state object is returned.
   * @param {string} [path] Dot-delimitered state path. If not given, entire
   * global state content is returned.
   * @return {any}
   */
  get(path) {
    return isNil(path) ? this.#state : get(this.#state, path);
  }

  /**
   * Writes the `value` to given global state `path`.
   * @param {string} [path] Dot-delimitered state path. If not given, entire
   * global state content is replaced by the `value`.
   * @param {any} value The value.
   * @return {any} Given `value` itself.
   */
  set(path, value) {
    if (value !== this.get(path)) {
      if (process.env.NODE_ENV !== 'production' && isDebugMode()) {
        /* eslint-disable no-console */
        console.groupCollapsed(
          `ReactGlobalState update. Path: "${path || ''}"`,
        );
        console.log('New value:', cloneDeep(value));
        /* eslint-enable no-console */
      }

      if (isNil(path)) this.#state = value;
      else {
        const root = { state: this.#state };
        let segIdx = 0;
        let pos = root;
        const pathSegments = toPath(`state.${path}`);
        for (; segIdx < pathSegments.length - 1; segIdx += 1) {
          const seg = pathSegments[segIdx];
          const next = pos[seg];
          if (Array.isArray(next)) pos[seg] = [...next];
          else if (isObject(next)) pos[seg] = { ...next };
          else {
            // We arrived to a state sub-segment, where the remaining part of
            // the update path does not exist yet. We rely on lodash's set()
            // function to create the remaining path, and set the value.
            set(pos, pathSegments.slice(segIdx), value);
            break;
          }
          pos = pos[seg];
        }

        if (segIdx === pathSegments.length - 1) {
          pos[pathSegments[segIdx]] = value;
        }

        this.#state = root.state;
      }

      if (this.ssrContext) {
        this.ssrContext.dirty = true;
        this.ssrContext.state = this.#state;
      } else if (!this.#nextNotifierId) {
        this.#nextNotifierId = setTimeout(() => {
          this.#nextNotifierId = null;
          [...this.#watchers].forEach((w) => w());
        });
      }
      if (process.env.NODE_ENV !== 'production' && isDebugMode()) {
        /* eslint-disable no-console */
        console.log('New state:', cloneDeep(this.#state));
        console.groupEnd();
        /* eslint-enable no-console */
      }
    }
    return value;
  }

  /**
   * Unsubscribes `callback` from watching state updates; no operation if
   * `callback` is not subscribed to the state updates.
   * @param {function} callback
   * @throws if {@link SsrContext} is attached to the state instance: the state
   * watching functionality is intended for client-side (non-SSR) only.
   */
  unWatch(callback) {
    if (this.ssrContext) throw new Error(ERR_NO_SSR_WATCH);

    const watchers = this.#watchers;
    const pos = watchers.indexOf(callback);
    if (pos >= 0) {
      watchers[pos] = watchers[watchers.length - 1];
      watchers.pop();
    }
  }

  /**
   * Subscribes `callback` to watch state updates; no operation if
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

    const watchers = this.#watchers;
    if (watchers.indexOf(callback) < 0) {
      watchers.push(callback);
    }
  }
}
