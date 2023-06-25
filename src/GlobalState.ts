import {
  cloneDeep,
  get,
  isFunction,
  isObject,
  isNil,
  set,
  toPath,
} from 'lodash';

import SsrContext from './SsrContext';

import { isDebugMode } from './utils';

const ERR_NO_SSR_WATCH = 'GlobalState must not be watched at server side';

type Callback = () => void;

export default class GlobalState<StateType> {
  readonly ssrContext?: SsrContext<StateType>;

  #initialState: StateType;

  // TODO: It is tempting to replace watchers here by
  // Emitter from @dr.pogodin/js-utils, but we need to clone
  // current watchers for emitting later, and this is not something
  // Emitter supports right now.
  #watchers: Callback[] = [];

  #nextNotifierId?: NodeJS.Timeout;

  #currentState: StateType;

  /**
   * Creates a new global state object.
   * @param initialState Intial global state content.
   * @param ssrContext Server-side rendering context.
   */
  constructor(
    initialState: StateType,
    ssrContext?: SsrContext<StateType>,
  ) {
    this.#currentState = initialState;
    this.#initialState = initialState;

    if (ssrContext) {
      /* eslint-disable no-param-reassign */
      ssrContext.dirty = false;
      ssrContext.pending = [];
      ssrContext.state = this.#currentState;
      /* eslint-enable no-param-reassign */

      this.ssrContext = ssrContext as SsrContext<StateType>;
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
  }

  /**
   * Gets current or initial value at the specified "path" of the global state.
   * Allows to get the entire global state, and automatically set default value
   * at the "path".
   * @param path Dot-delimitered state path. Pass it "null",
   *  or "undefined" to refer the entire global state.
   * @param options Additional options.
   * @param options.initialState If "true" the value will be read
   *  from the initial state instead of the current one.
   * @param options.initialValue If the value read from the "path" is
   *  "undefined", this "initialValue" will be returned instead. In such case
   *  "initialValue" will also be written to the "path" of the current global
   *  state (no matter "initialState" flag), if "undefined" is stored there.
   * @return Retrieved value.
   */
  get<ResT>(
    path?: null | string,
    {
      initialState,
      initialValue,
    }: {
      initialState?: boolean;
      initialValue?: ResT | (() => ResT),
    } = {},
  ): ResT {
    const state: StateType = initialState ? this.#initialState : this.#currentState;
    let value: ResT = isNil(path) ? state : get(state, path);
    if (value === undefined && initialValue !== undefined) {
      value = isFunction(initialValue) ? initialValue() : initialValue;
      if (!initialState || this.get(path) === undefined) this.set(path, value);
    }
    return value;
  }

  /**
   * Writes the `value` to given global state `path`.
   * @param path Dot-delimitered state path. If not given, entire
   * global state content is replaced by the `value`.
   * @param value The value.
   * @return Given `value` itself.
   */
  set<V>(path: null | string | undefined, value: V): V {
    if (value !== this.get(path)) {
      if (process.env.NODE_ENV !== 'production' && isDebugMode()) {
        /* eslint-disable no-console */
        console.groupCollapsed(
          `ReactGlobalState update. Path: "${path || ''}"`,
        );
        console.log('New value:', cloneDeep(value));
        /* eslint-enable no-console */
      }

      if (isNil(path)) this.#currentState = (value as unknown) as StateType;
      else {
        const root = { state: this.#currentState };
        let segIdx = 0;
        let pos: any = root;
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

        this.#currentState = root.state;
      }

      if (this.ssrContext) {
        this.ssrContext.dirty = true;
        this.ssrContext.state = this.#currentState;
      } else if (!this.#nextNotifierId) {
        this.#nextNotifierId = setTimeout(() => {
          this.#nextNotifierId = undefined;
          [...this.#watchers].forEach((w) => w());
        });
      }
      if (process.env.NODE_ENV !== 'production' && isDebugMode()) {
        /* eslint-disable no-console */
        console.log('New state:', cloneDeep(this.#currentState));
        console.groupEnd();
        /* eslint-enable no-console */
      }
    }
    return value;
  }

  /**
   * Unsubscribes `callback` from watching state updates; no operation if
   * `callback` is not subscribed to the state updates.
   * @param callback
   * @throws if {@link SsrContext} is attached to the state instance: the state
   * watching functionality is intended for client-side (non-SSR) only.
   */
  unWatch(callback: Callback) {
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
   * @param callback It will be called without any arguments every
   * time the state content changes (note, howhever, separate state updates can
   * be applied to the state at once, and watching callbacks will be called once
   * after such bulk update).
   * @throws if {@link SsrContext} is attached to the state instance: the state
   * watching functionality is intended for client-side (non-SSR) only.
   */
  watch(callback: Callback) {
    if (this.ssrContext) throw new Error(ERR_NO_SSR_WATCH);

    const watchers = this.#watchers;
    if (watchers.indexOf(callback) < 0) {
      watchers.push(callback);
    }
  }
}
