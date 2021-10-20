// Auxiliary stuff.

/**
 * Returns 'true' if debug logging should be performed; 'false' otherwise.
 *
 * BEWARE: The actual safeguards for the debug logging still should read
 *  if (process.env.NODE_ENV !== 'production' && isDebugMode()) {
 *    // Some debug logging
 *  }
 * to ensure that debug code is stripped out by Webpack in production mode.
 *
 * @returns {boolean}
 * @ignore
 */
export function isDebugMode() {
  try {
    return process.env.NODE_ENV !== 'production'
      && !!process.env.REACT_GLOBAL_STATE_DEBUG;
  } catch (error) {
    return false;
  }
}

export default null;
