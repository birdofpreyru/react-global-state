import type { GetFieldType } from 'lodash';

import { cloneDeep } from 'lodash-es';

export type CallbackT = () => void;

// TODO: This (ForceT, LockT, and TypeLock) probably should be moved to JS Utils
// lib.

export declare const force: unique symbol;
export declare const lock: unique symbol;

export type ForceT = typeof force;
export type LockT = typeof lock;

export type TypeLock<
  Unlocked extends ForceT | LockT,

  // TODO: Revise later.
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  LockedT extends never | void,
  UnlockedT,
> = Unlocked extends ForceT ? UnlockedT : LockedT;

/**
 * Given the type of state, `StateT`, and the type of state path, `PathT`,
 * it evaluates the type of value at that path of the state, if it can be
 * evaluated from the path type (it is possible when `PathT` is a string
 * literal type, and `StateT` elements along this path have appropriate
 * types); otherwise it falls back to the specified `UnknownT` type,
 * which should be set either `never` (for input arguments), or `void`
 * (for return types) - `never` and `void` in those places forbid assignments,
 * and are not auto-inferred to more permissible types.
 *
 * BEWARE: When StateT is any the construct resolves to any for any string
 * paths.
 */
export type ValueAtPathT<
  StateT,
  PathT extends null | string | undefined,

  // TODO: Revise later.
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-invalid-void-type
  UnknownT extends never | undefined | void,
> = unknown extends StateT
  ? UnknownT
  : string extends PathT
    ? UnknownT
    : PathT extends null | undefined
      ? StateT
      : GetFieldType<StateT, PathT> extends undefined
        ? UnknownT : GetFieldType<StateT, PathT>;

export type ValueOrInitializerT<ValueT> = ValueT | (() => ValueT);

/**
 * Returns 'true' if debug logging should be performed; 'false' otherwise.
 *
 * BEWARE: The actual safeguards for the debug logging still should read
 *  if (process.env.NODE_ENV !== 'production' && isDebugMode()) {
 *    // Some debug logging
 *  }
 * to ensure that debug code is stripped out by Webpack in production mode.
 *
 * @returns
 * @ignore
 */
export function isDebugMode(): boolean {
  try {
    return process.env.NODE_ENV !== 'production'
      && !!process.env.REACT_GLOBAL_STATE_DEBUG;
  } catch {
    return false;
  }
}

const cloneDeepBailKeys = new Set<string>();

/**
 * Deep-clones given value for logging purposes, or returns the value itself
 * if the previous clone attempt, with the same key, took more than 300ms
 * (to avoid situations when large payload in the global state slows down
 * development versions of the app due to the logging overhead).
 */
export function cloneDeepForLog<T>(value: T, key: string = ''): T {
  if (cloneDeepBailKeys.has(key)) {
    // eslint-disable-next-line no-console
    console.warn(`The logged value won't be clonned (key "${key}").`);
    return value;
  }

  const start = Date.now();
  const res = cloneDeep(value);
  const time = Date.now() - start;
  if (time > 300) {
    // eslint-disable-next-line no-console
    console.warn(`${time}ms spent to clone the logged value (key "${key}").`);
    cloneDeepBailKeys.add(key);
  }

  return res;
}

/**
 * Converts given value to an escaped string. For now, we are good with the most
 * trivial escape logic:
 *  - '%' characters are replaced by '%0' code pair;
 *  - '/' characters are replaced by '%1' code pair.
 */
export function escape(x: number | string): string {
  return typeof x === 'string'
    ? x.replace(/%/g, '%0').replace(/\//g, '%1')
    : x.toString();
}

/**
 * Hashes given string array. For our current needs we are fine to go with
 * the most trivial implementation, which probably should not be called "hash"
 * in the strict sense: we just escape each given string to not include '/'
 * characters, and then we join all those strings using '/' as the separator.
 */
export function hash(items: Array<number | string>): string {
  return items.map(escape).join('/');
}
