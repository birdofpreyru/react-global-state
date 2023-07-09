export default class SsrContext<StateT> {
  dirty: boolean = false;

  pending: Promise<void>[] = [];

  state?: StateT;

  constructor(state?: StateT) {
    this.state = state;
  }
}
