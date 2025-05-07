export default class SsrContext<StateT> {
  dirty: boolean = false;

  pending: Array<Promise<void>> = [];

  constructor(public state?: StateT) { }
}
