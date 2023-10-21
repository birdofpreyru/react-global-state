// This test follows up on a potential issue encountered when working on
// https://github.com/birdofpreyru/react-starter
// Spoiler: The test shows no error, thus it should be an issue in react-utils
// or react-starter.

import { expectError } from 'tsd-lite';

import { type AsyncDataEnvelopeT, withGlobalStateType } from '../../../src';

// i.e. "examples.asyncGlobalData" is not assignable path for useAsyncData(),
// which requires a data envelope on that path.
type BadStateT = {
  examples: {
    asyncGlobalData: number;
  };
};

// This is how it should look like.
type GoodStateT = {
  examples: {
    asyncGlobalData: AsyncDataEnvelopeT<number>;
  };
};

const { useAsyncData: badUseAsyncData } = withGlobalStateType<BadStateT>();

expectError(() => {
  badUseAsyncData(
    'examples.asyncGlobalData',
    async () => 0,
  );
});

// This is a functional variant
const { useAsyncData: goodUseAsyncData } = withGlobalStateType<GoodStateT>();

goodUseAsyncData(
  'examples.asyncGlobalData',
  async () => 0,
);
