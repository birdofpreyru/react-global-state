// Writable stream which accumulate Buffer chunks into a string and allows to
// await for it.

import { Writable } from 'node:stream';

import { Barrier } from '@dr.pogodin/js-utils';

export default class StringDestination extends Writable {
  #barrier = new Barrier<void>();

  #string = '';

  async waitResult(): Promise<string> {
    await this.#barrier;
    return this.#string;
  }

  _final(): void {
    void this.#barrier.resolve();
  }

  _write(
    chunk: Buffer | string,
    encoding: string,
    ready: () => void,
  ): void {
    this.#string += chunk.toString();
    ready();
  }
}
