// Writable stream which accumulate Buffer chunks into a string and allows to
// await for it.

import { Writable } from 'stream';

export default class StringDestination extends Writable {
  #barrier;

  #string = '';

  constructor(...args) {
    super(...args);
    let ready;
    this.#barrier = new Promise((resolve) => {
      ready = resolve;
    });
    this.#barrier.ready = ready;
  }

  async waitResult() {
    await this.#barrier;
    return this.#string;
  }

  // eslint-disable-next-line no-underscore-dangle
  _final() {
    this.#barrier.ready();
  }

  // eslint-disable-next-line no-underscore-dangle
  _write(chunk, encoding, ready) {
    this.#string += chunk.toString();
    ready();
  }
}
