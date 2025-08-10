export default class SsrContext<StateT> {
  dirty: boolean = false;

  pending: Array<Promise<unknown>> = [];

  constructor(public state?: StateT) { }
}
