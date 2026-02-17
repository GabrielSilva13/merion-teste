import type { SpinResult } from '@domain/types';
import type { FakeSlotApi } from '@infrastructure/fake-slot-api';
import { GameState } from './game-state';
import type { GameStateStatus } from './game-state';

export interface GameControllerConfig {
  readonly api: FakeSlotApi;
  readonly initialBalance: number;
  readonly initialBet: number;
}

export class GameController {
  private readonly api: FakeSlotApi;
  private readonly state: GameState;

  constructor(config: GameControllerConfig) {
    this.api = config.api;
    this.state = new GameState(config.initialBalance, config.initialBet);
  }

  public async spin(): Promise<SpinResult | null> {
    if (this.state.getState() !== 'idle') {
      console.warn('Spin already in progress');
      return null;
    }

    if (this.state.getState() !== 'idle') return null;


    if (!this.state.canPlaceBet()) {
      console.warn('Insufficient balance for bet');
      return null;
    }

    try {
      const transitioned = this.state.setState('spinning');
      if (!transitioned) {
        return null;
      }

      const bet = this.state.getBet();
      this.state.decreaseBalance(bet);

      const result = await this.api.spin(bet);

      const evaluateTransition = this.state.setState('evaluating');
      if (!evaluateTransition) {
        console.warn('Failed to transition to evaluating');
      }

      if (result.totalWin > 0) {
        this.state.increaseBalance(result.totalWin);

        const winTransition = this.state.setState('showingWin');
        if (!winTransition) {
          console.warn('Failed to transition to showingWin');
        }
      } else {
        const idleTransition = this.state.setState('idle');
        if (!idleTransition) {
          console.warn('Failed to transition to idle');
        }
      }

      this.clampBetToBalance();

      return result;
    } catch (error) {
      console.error('Spin error:', error);
      this.state.setState('idle');
      return null;
    }
  }

  public finishWinPresentation(): void {
    if (this.state.getState() === 'showingWin') {
      this.state.setState('idle');
    }
  }

  public getBalance(): number {
    return this.state.getBalance();
  }

  public getBet(): number {
    return this.state.getBet();
  }

  public setBet(amount: number): void {
    this.state.setBet(amount);
  }

  public getStatus(): GameStateStatus {
    return this.state.getState();
  }

  public getState(): GameState {
    return this.state;
  }

  public canSpin(): boolean {
    return (
      this.state.getState() === 'idle' &&
      this.state.canPlaceBet()
    );
  }

  private clampBetToBalance(): void {
    const balance = this.state.getBalance();
    const bet = this.state.getBet();
    if (bet > balance && balance > 0) {
      this.state.setBet(Math.max(10, Math.floor(balance / 10) * 10));
    }
  }
}
