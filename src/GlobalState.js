import _ from 'lodash';

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
  constructor(initialState) {
    this.state = _.cloneDeep(initialState);
    this.pendingNotification = false;
    this.watchers = [];
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
    _.set(this, fullPath(path), value);
    this.pendingNotification = true;
    setTimeout(() => {
      if (this.pendingNotification) {
        this.pendingNotification = false;
        this.watchers.forEach((w) => w());
      }
    });
    return value;
  }

  /**
   * Removes `callback` from watcher array. No operation if `callback` is not
   * in the watchers list.
   * @param {Function} callback
   */
  unWatch(callback) {
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
   */
  watch(callback) {
    const { watchers } = this;
    if (watchers.indexOf(callback) < 0) {
      watchers.push(callback);
    }
  }
}
