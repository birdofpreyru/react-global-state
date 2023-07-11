// Writable stream which accumulate Buffer chunks into a string and allows to
// await for it.

import { Writable } from 'stream';

import { Barrier } from '@dr.pogodin/js-utils';

export default class StringDestination extends Writable {
  #barrier = new Barrier<void>();

  #string = '';

  async waitResult() {
    await this.#barrier;
    return this.#string;
  }

  // eslint-disable-next-line no-underscore-dangle
  _final() {
    this.#barrier.resolve();
  }

  // eslint-disable-next-line no-underscore-dangle
  _write(chunk: Buffer | string | any, encoding: string, ready: () => void) {
    this.#string += chunk.toString();
    ready();
  }
}
