// Auxiliary stuff.

/**
 * @global
 * @const REACT_GLOBAL_STATE_DEBUG
 * @desc `REACT_GLOBAL_STATE_DEBUG` is an environment variable you can set
 * to any truthy value for Node (or, in case of client-side bundle, inject
 * using Webpack's
 * [EnvironmentPlugin](https://webpack.js.org/plugins/environment-plugin/))
 * to enable debug logging by `react-global-state` library. In either case,
 * the logging is enabled in non-production code only, which is tested by
 * `process.env.NODE_ENV` value being distinct from `production`.
 */

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
