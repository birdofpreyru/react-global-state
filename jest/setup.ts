import { getMockUuid } from './utils';

let state = 0;
globalThis.crypto.randomUUID = () => getMockUuid(++state);
