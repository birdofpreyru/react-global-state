import { type GetFieldType } from 'lodash';

export type CallbackT = () => void;

// TODO: This probably should be moved to JS Utils lib.
export type TypeLock<
  Unlocked extends 0 | 1,
  LockedT extends never | void,
  UnlockedT,
> = Unlocked extends 0 ? LockedT : UnlockedT;

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
  } catch (error) {
    return false;
  }
}
