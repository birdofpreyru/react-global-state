import { escape, hash, isDebugMode } from 'src/utils';

describe('isDebugMode()', () => {
  let origEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    origEnv = process.env;
  });

  beforeEach(() => {
    process.env = { ...origEnv };
  });

  afterAll(() => {
    process.env = origEnv;
  });

  test('production environment', () => {
    process.env.NODE_ENV = 'production';
    process.env.REACT_GLOBAL_STATE_DEBUG = '1';
    expect(isDebugMode()).toBe(false);
    delete process.env.REACT_GLOBAL_STATE_DEBUG;
    expect(isDebugMode()).toBe(false);
  });

  test('non-production environment', () => {
    process.env.NODE_ENV = 'development';
    process.env.REACT_GLOBAL_STATE_DEBUG = '1';
    expect(isDebugMode()).toBe(true);
    delete process.env.REACT_GLOBAL_STATE_DEBUG;
    expect(isDebugMode()).toBe(false);
  });

  test('non-node environment', () => {
    Object.defineProperty(process.env, 'NODE_ENV', {
      get: () => {
        throw Error('Test error');
      },
    });
    process.env.REACT_GLOBAL_STATE_DEBUG = '1';
    expect(isDebugMode()).toBe(false);
    delete process.env.REACT_GLOBAL_STATE_DEBUG;
    expect(isDebugMode()).toBe(false);
  });
});

test('escape()', () => {
  expect(escape('a%%/b%c//d')).toBe('a%0%0%1b%0c%1%1d');
});

test('hash()', () => {
  expect(hash(['a%/1', 'b/2', 'c%3', 'd//4'])).toBe('a%0%11/b%12/c%03/d%1%14');
  expect(hash(['/1', 2, '3/', 4.12])).toBe('%11/2/3%1/4.12');
});
