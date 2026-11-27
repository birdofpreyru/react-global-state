import { getMockUuid } from './utils.js';

let state = 0;
globalThis.crypto.randomUUID = () => getMockUuid(++state);
