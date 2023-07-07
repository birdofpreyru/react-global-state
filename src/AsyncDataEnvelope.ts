export default class AsyncDataEnvelope<DataT> {
  data: null | DataT = null;

  numRefs: number = 0;

  operationId: string = '';

  timestamp: number = 0;
}
