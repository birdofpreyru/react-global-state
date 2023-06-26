import { isDebugMode } from 'src/utils';

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
      get: () => { throw Error('Test error'); },
    });
    process.env.REACT_GLOBAL_STATE_DEBUG = '1';
    expect(isDebugMode()).toBe(false);
    delete process.env.REACT_GLOBAL_STATE_DEBUG;
    expect(isDebugMode()).toBe(false);
  });
});
