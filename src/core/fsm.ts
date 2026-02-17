export type StateTransition<TState extends string> = {
  readonly from: TState;
  readonly to: TState;
};

export type TransitionConfig<TState extends string> = {
  readonly [K in TState]?: readonly TState[];
};

export interface FSMObserver<TState extends string> {
  onStateChange(from: TState, to: TState): void;
}

export class FiniteStateMachine<TState extends string> {
  private currentState: TState;
  private readonly transitions: TransitionConfig<TState>;
  private readonly observers: Set<FSMObserver<TState>>;

  constructor(initialState: TState, transitions: TransitionConfig<TState>) {
    this.currentState = initialState;
    this.transitions = transitions;
    this.observers = new Set();
  }

  public getState(): TState {
    return this.currentState;
  }

  public canTransitionTo(targetState: TState): boolean {
    const allowedStates = this.transitions[this.currentState];
    if (!allowedStates) {
      return false;
    }
    return allowedStates.includes(targetState);
  }

  public transitionTo(targetState: TState): boolean {
    if (!this.canTransitionTo(targetState)) {
      throw new Error(`Invalid transition: ${this.currentState} -> ${targetState}`);
    }

    const previousState = this.currentState;
    this.currentState = targetState;
    this.notifyObservers(previousState, targetState);
    return true;
  }

  public forceTransition(targetState: TState): void {
    const previousState = this.currentState;
    this.currentState = targetState;
    this.notifyObservers(previousState, targetState);
  }

  public subscribe(observer: FSMObserver<TState>): void {
    this.observers.add(observer);
  }

  public unsubscribe(observer: FSMObserver<TState>): void {
    this.observers.delete(observer);
  }

  private notifyObservers(from: TState, to: TState): void {
    for (const observer of this.observers) {
      observer.onStateChange(from, to);
    }
  }
}
