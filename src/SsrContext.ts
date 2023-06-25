export default class SsrContext<StateType> {
  dirty: boolean = false;

  pending: Promise<void>[] = [];

  state?: StateType;

  constructor(state?: StateType) {
    this.state = state;
  }
}
