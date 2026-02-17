import { FiniteStateMachine } from '@core/fsm';

export type GameStateStatus = 'idle' | 'spinning' | 'evaluating' | 'showingWin';

export interface GameStateData {
  readonly balance: number;
  readonly bet: number;
  readonly currentState: GameStateStatus;
}

export interface GameStateObserver {
  onBalanceChange?(newBalance: number): void;
  onBetChange?(newBet: number): void;
  onStateChange?(newState: GameStateStatus): void;
}

export class GameState {
  private balance: number;
  private bet: number;
  private fsm: FiniteStateMachine<GameStateStatus>;
  private readonly observers: Set<GameStateObserver>;

  constructor(initialBalance: number, initialBet: number) {
    this.balance = initialBalance;
    this.bet = initialBet;
    this.observers = new Set();

    this.fsm = new FiniteStateMachine<GameStateStatus>('idle', {
      idle: ['spinning'],
      spinning: ['evaluating'],
      evaluating: ['showingWin', 'idle'],
      showingWin: ['idle'],
    });

    this.fsm.subscribe({
      onStateChange: (_from, to) => {
        this.notifyStateChange(to);
      },
    });
  }

  public getState(): GameStateStatus {
    return this.fsm.getState();
  }

  public setState(newState: GameStateStatus): boolean {
    return this.fsm.transitionTo(newState);
  }

  public canTransitionTo(state: GameStateStatus): boolean {
    return this.fsm.canTransitionTo(state);
  }

  public getBalance(): number {
    return this.balance;
  }

  public updateBalance(amount: number): void {
    this.balance += amount;
    this.notifyBalanceChange(this.balance);
  }

  public increaseBalance(amount: number): void {
    if (amount < 0) {
      throw new Error('Amount must be positive');
    }
    this.updateBalance(amount);
  }

  public decreaseBalance(amount: number): void {
    if (amount < 0) {
      throw new Error('Amount must be positive');
    }
    if (this.balance < amount) {
      throw new Error('Insufficient balance');
    }
    this.updateBalance(-amount);
  }

  public setBalance(newBalance: number): void {
    if (newBalance < 0) {
      throw new Error('Balance cannot be negative');
    }
    this.balance = newBalance;
    this.notifyBalanceChange(this.balance);
  }

  public getBet(): number {
    return this.bet;
  }

  public setBet(newBet: number): void {
    if (newBet <= 0) {
      throw new Error('Bet must be greater than zero');
    }
    if (newBet > this.balance) {
      throw new Error('Bet cannot exceed balance');
    }
    this.bet = newBet;
    this.notifyBetChange(this.bet);
  }

  public canPlaceBet(): boolean {
    return this.fsm.getState() === 'idle' && this.balance >= this.bet;
  }

  public deductBet(): void {
    if (!this.canPlaceBet()) {
      throw new Error('Cannot place bet in current state');
    }
    this.updateBalance(-this.bet);
  }

  public getData(): GameStateData {
    return {
      balance: this.balance,
      bet: this.bet,
      currentState: this.fsm.getState(),
    };
  }

  public subscribe(observer: GameStateObserver): void {
    this.observers.add(observer);
  }

  public unsubscribe(observer: GameStateObserver): void {
    this.observers.delete(observer);
  }

  private notifyBalanceChange(newBalance: number): void {
    for (const observer of this.observers) {
      observer.onBalanceChange?.(newBalance);
    }
  }

  private notifyBetChange(newBet: number): void {
    for (const observer of this.observers) {
      observer.onBetChange?.(newBet);
    }
  }

  private notifyStateChange(newState: GameStateStatus): void {
    for (const observer of this.observers) {
      observer.onStateChange?.(newState);
    }
  }
}
