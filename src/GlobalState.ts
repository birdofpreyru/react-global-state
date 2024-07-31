import {
  get,
  isFunction,
  isObject,
  isNil,
  set,
  toPath,
} from 'lodash';

import SsrContext from './SsrContext';

import {
  type CallbackT,
  type ForceT,
  type LockT,
  type TypeLock,
  type ValueAtPathT,
  type ValueOrInitializerT,
  cloneDeepForLog,
  isDebugMode,
} from './utils';

const ERR_NO_SSR_WATCH = 'GlobalState must not be watched at server side';

type GetOptsT<T> = {
  initialState?: boolean;
  initialValue?: ValueOrInitializerT<T>;
};

export default class GlobalState<
  StateT,
  SsrContextT extends SsrContext<StateT> = SsrContext<StateT>,
> {
  readonly ssrContext?: SsrContextT;

  #dependencies: { [key: string]: Readonly<any[]> } = {};

  #initialState: StateT;

  // TODO: It is tempting to replace watchers here by
  // Emitter from @dr.pogodin/js-utils, but we need to clone
  // current watchers for emitting later, and this is not something
  // Emitter supports right now.
  #watchers: CallbackT[] = [];

  #nextNotifierId?: NodeJS.Timeout;

  #currentState: StateT;

  /**
   * Creates a new global state object.
   * @param initialState Intial global state content.
   * @param ssrContext Server-side rendering context.
   */
  constructor(
    initialState: StateT,
    ssrContext?: SsrContextT,
  ) {
    this.#currentState = initialState;
    this.#initialState = initialState;

    if (ssrContext) {
      /* eslint-disable no-param-reassign */
      ssrContext.dirty = false;
      ssrContext.pending = [];
      ssrContext.state = this.#currentState;
      /* eslint-enable no-param-reassign */

      this.ssrContext = ssrContext;
    }

    if (process.env.NODE_ENV !== 'production' && isDebugMode()) {
      /* eslint-disable no-console */
      let msg = 'New ReactGlobalState created';
      if (ssrContext) msg += ' (SSR mode)';
      console.groupCollapsed(msg);
      console.log('Initial state:', cloneDeepForLog(initialState));
      console.groupEnd();
      /* eslint-enable no-console */
    }
  }

  /**
   * Drops the record of dependencies, if any, for the given path.
   */
  dropDependencies(path: string) {
    delete this.#dependencies[path];
  }

  /**
   * Checks if given `deps` are different from previously recorded ones for
   * the given `path`. If they are, `deps` are recorded as the new deps for
   * the `path`, and also the array is frozen, to prevent it from being
   * modified.
   */
  hasChangedDependencies(path: string, deps: any[]): boolean {
    const prevDeps = this.#dependencies[path];
    let changed = !prevDeps || prevDeps.length !== deps.length;
    for (let i = 0; !changed && i < deps.length; ++i) {
      changed = prevDeps![i] !== deps[i];
    }
    this.#dependencies[path] = Object.freeze(deps);
    return changed;
  }

  /**
   * Gets entire state, the same way as .get(null, opts) would do.
   * @param opts.initialState
   * @param opts.initialValue
   */
  getEntireState(opts?: GetOptsT<StateT>): StateT {
    let state = opts?.initialState ? this.#initialState : this.#currentState;
    if (state !== undefined || opts?.initialValue === undefined) return state;

    const iv = opts.initialValue;
    state = isFunction(iv) ? iv() : iv;
    if (this.#currentState === undefined) this.setEntireState(state);
    return state;
  }

  /**
   * Notifies all connected state watchers that a state update has happened.
   */
  private notifyStateUpdate(path: null | string | undefined, value: unknown) {
    if (process.env.NODE_ENV !== 'production' && isDebugMode()) {
      /* eslint-disable no-console */
      const p = typeof path === 'string'
        ? `"${path}"` : 'none (entire state update)';
      console.groupCollapsed(`ReactGlobalState update. Path: ${p}`);
      console.log('New value:', cloneDeepForLog(value, path ?? ''));
      console.log('New state:', cloneDeepForLog(this.#currentState));
      console.groupEnd();
      /* eslint-enable no-console */
    }

    if (this.ssrContext) {
      this.ssrContext.dirty = true;
      this.ssrContext.state = this.#currentState;
    } else if (!this.#nextNotifierId) {
      this.#nextNotifierId = setTimeout(() => {
        this.#nextNotifierId = undefined;
        const watchers = [...this.#watchers];
        for (let i = 0; i < watchers.length; ++i) {
          watchers[i]!();
        }
      });
    }
  }

  /**
   * Sets entire state, the same way as .set(null, value) would do.
   * @param value
   */
  setEntireState(value: StateT): StateT {
    if (this.#currentState !== value) {
      this.#currentState = value;
      this.notifyStateUpdate(null, value);
    }
    return value;
  }

  /**
   * Gets current or initial value at the specified "path" of the global state.
   * @param path Dot-delimitered state path.
   * @param options Additional options.
   * @param options.initialState If "true" the value will be read
   *  from the initial state instead of the current one.
   * @param options.initialValue If the value read from the "path" is
   *  "undefined", this "initialValue" will be returned instead. In such case
   *  "initialValue" will also be written to the "path" of the current global
   *  state (no matter "initialState" flag), if "undefined" is stored there.
   * @return Retrieved value.
   */

  // .get() without arguments just falls back to .getEntireState().
  get(): StateT;

  // This variant attempts to automatically resolve and check the type of value
  // at the given path, as precise as the actual state and path types permit.
  // If the automatic path resolution is not possible, the ValueT fallsback
  // to `never` (or to `undefined` in some cases), effectively forbidding
  // to use this .get() variant.
  get<
    PathT extends null | string | undefined,
    ValueArgT extends ValueAtPathT<StateT, PathT, never>,
    ValueResT extends ValueAtPathT<StateT, PathT, void>,
  >(path: PathT, opts?: GetOptsT<ValueArgT>): ValueResT;

  // This variant is not callable by default (without generic arguments),
  // otherwise it allows to set the correct ValueT directly.
  get<Forced extends ForceT | LockT = LockT, ValueT = void>(
    path?: null | string,
    opts?: GetOptsT<TypeLock<Forced, never, ValueT>>,
  ): TypeLock<Forced, void, ValueT>;

  get<ValueT>(path?: null | string, opts?: GetOptsT<ValueT>): ValueT {
    if (isNil(path)) {
      const res = this.getEntireState((opts as unknown) as GetOptsT<StateT>);
      return (res as unknown) as ValueT;
    }

    const state = opts?.initialState ? this.#initialState : this.#currentState;

    let res = get(state, path);
    if (res !== undefined || opts?.initialValue === undefined) return res;

    const iv = opts.initialValue;
    res = isFunction(iv) ? iv() : iv;

    if (!opts?.initialState || this.get(path) === undefined) {
      this.set<ForceT, unknown>(path, res);
    }

    return res;
  }

  /**
   * Writes the `value` to given global state `path`.
   * @param path Dot-delimitered state path. If not given, entire
   * global state content is replaced by the `value`.
   * @param value The value.
   * @return Given `value` itself.
   */

  // This variant attempts automatic value type resolution & checking.
  set<
    PathT extends null | string | undefined,
    ValueArgT extends ValueAtPathT<StateT, PathT, never>,
    ValueResT extends ValueAtPathT<StateT, PathT, void>,
  >(path: PathT, value: ValueArgT): ValueResT;

  // This variant is disabled by default, otherwise allows to give
  // expected value type explicitly.
  set<Forced extends ForceT | LockT = LockT, ValueT = never>(
    path: null | string | undefined,
    value: TypeLock<Forced, never, ValueT>,
  ): TypeLock<Forced, void, ValueT>;

  set(path: null | string | undefined, value: unknown): unknown {
    if (isNil(path)) return this.setEntireState(value as StateT);

    if (value !== this.get(path)) {
      const root = { state: this.#currentState };
      let segIdx = 0;
      let pos: any = root;
      const pathSegments = toPath(`state.${path}`);
      for (; segIdx < pathSegments.length - 1; segIdx += 1) {
        const seg = pathSegments[segIdx]!;
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
        pos[pathSegments[segIdx]!] = value;
      }

      this.#currentState = root.state;

      this.notifyStateUpdate(path, value);
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
  unWatch(callback: CallbackT) {
    if (this.ssrContext) throw new Error(ERR_NO_SSR_WATCH);

    const watchers = this.#watchers;
    const pos = watchers.indexOf(callback);
    if (pos >= 0) {
      watchers[pos] = watchers[watchers.length - 1]!;
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
  watch(callback: CallbackT) {
    if (this.ssrContext) throw new Error(ERR_NO_SSR_WATCH);

    const watchers = this.#watchers;
    if (watchers.indexOf(callback) < 0) {
      watchers.push(callback);
    }
  }
}
