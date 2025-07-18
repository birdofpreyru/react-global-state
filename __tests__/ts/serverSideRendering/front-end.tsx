/** @jest-environment jsdom */

// ^^^ although it is strange to do SSR test in JSDom environment,
// some of the tests should be done at the client side.

/**
 * Base test of the server-side rendering features.
 */

import mockdate from 'mockdate';

import {
  type MountedSceneT,
  act,
  mockTimer,
  mount,
  unMockConsoleLog,
} from 'jest/utils';

import { GlobalStateProvider, getSsrContext, SsrContext } from 'src/index';

import Scene, { loaderA, loaderB } from './__assets__/TestScene';

jest.mock('uuid');

jest.useFakeTimers();
mockdate.set('2019-11-07Z');

let scene: MountedSceneT | undefined;

beforeEach(() => {
  delete process.env.REACT_GLOBAL_STATE_DEBUG;
  unMockConsoleLog();
  loaderA.mockClear();
  loaderB.mockClear();
});

afterEach(() => {
  if (scene) {
    scene.destroy();
    scene = undefined;
  }

  // NOTE: Without this clearing some pending async updates from
  // "Scene test in the front-end mode" get fired only after the
  // later timer waiting in SSR test, which messes up the console
  // log snapshot verification.
  jest.clearAllTimers();
});

test('Scene test in the front-end mode', async () => {
  scene = mount((
    <GlobalStateProvider initialState={undefined}>
      <Scene />
    </GlobalStateProvider>
  ));
  scene.snapshot();
  await act(async () => {
    await mockTimer(100);
  });
  scene.snapshot();
  expect(loaderA).toHaveBeenCalledTimes(1);
  expect(loaderB).toHaveBeenCalledTimes(0);
  await act(async () => {
    await mockTimer(1000);
  });
  await act(async () => {
    await mockTimer(0);
  });
  scene.snapshot();
  expect(loaderA).toHaveBeenCalledTimes(1);
  expect(loaderB).toHaveBeenCalledTimes(0);
});

describe('Test `getSsrContext()` function', () => {
  const SceneUsingSsrContext: React.FunctionComponent<{
    throwWithoutSsrContext?: boolean;
  }> = ({
    throwWithoutSsrContext = true,
  }) => {
    const ssrContext = getSsrContext(throwWithoutSsrContext);
    return (
      <div>
        {JSON.stringify(ssrContext, null, 2)}
      </div>
    );
  };

  let consoleError: typeof console.error;

  beforeAll(() => {
    consoleError = console.error;
  });

  afterEach(() => {
    console.error = consoleError;
    if (scene) {
      scene.destroy();
      scene = undefined;
    }
  });

  test('Missing GlobalStateProvider', () => {
    console.error = () => null;
    let message;
    try {
      mount(<SceneUsingSsrContext />);
    } catch (error) {
      ({ message } = error as Error);
    }
    expect(message).toMatchSnapshot();
  });

  test('Get SSR context when exists', () => {
    // TODO: Revise.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    class SceneSsrContext extends SsrContext<any> {
      key: string;

      constructor(value: string) {
        super();
        this.key = value;
      }
    }

    scene = mount((
      <GlobalStateProvider
        initialState={undefined}
        ssrContext={new SceneSsrContext('Dummy SSR Context')}
      >
        <SceneUsingSsrContext />
      </GlobalStateProvider>
    ));
    scene.snapshot();
  });

  test('Get SSR context when does not exist', () => {
    console.error = () => null;
    let message;
    try {
      mount((
        <GlobalStateProvider initialState={undefined}>
          <SceneUsingSsrContext />
        </GlobalStateProvider>
      ));
    } catch (error) {
      ({ message } = error as Error);
    }
    expect(message).toMatchSnapshot();
  });

  test('Get SSR context when does not exist, but no throw is opted in', () => {
    scene = mount((
      <GlobalStateProvider initialState={undefined}>
        <SceneUsingSsrContext throwWithoutSsrContext={false} />
      </GlobalStateProvider>
    ));
    scene.snapshot();
  });
});
